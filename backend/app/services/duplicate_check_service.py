import re
from typing import List, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.models.complaint import Complaint, ComplaintStatus
import logging

logger = logging.getLogger(__name__)

class DuplicateCheckService:
    def __init__(self, similarity_threshold: float = 0.70):
        self.similarity_threshold = similarity_threshold

    def normalize_location(self, location: str) -> str:
        """Normalize: lowercase, remove all non-alphanumeric chars, sort tokens."""
        loc = location.lower().strip()
        loc = re.sub(r'[^a-z0-9\s]', '', loc)
        # Sort tokens so "Block A" == "A Block"
        tokens = sorted(loc.split())
        return ''.join(tokens)

    def locations_match(self, loc1: str, loc2: str) -> bool:
        return self.normalize_location(loc1) == self.normalize_location(loc2)

    def categories_match(self, cat1: str, cat2: str) -> bool:
        """Case-insensitive category comparison."""
        return (cat1 or '').strip().lower() == (cat2 or '').strip().lower()

    def calculate_text_similarity(self, text1: str, text2: str) -> float:
        """TF-IDF cosine similarity between two complaint texts."""
        if not text1 or not text2:
            return 0.0
        try:
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf = vectorizer.fit_transform([text1, text2])
            return float(cosine_similarity(tfidf)[0][1])
        except Exception as e:
            logger.warning(f"Similarity calculation error: {e}")
            return 0.0

    async def check_for_duplicate(
        self,
        new_subject: str,
        new_description: str,
        new_location: str,
        new_category: Optional[str],
        existing_complaints: List[Complaint]
    ) -> dict:
        """
        Multi-step duplicate detection:
        Step 1: Filter by category (if AI category is known)
        Step 2: Filter by location (normalized)
        Step 3: Check status (skip Resolved)
        Step 4: Semantic text similarity check (>= threshold)
        """
        new_text = f"{new_subject} {new_description}".strip()

        for existing in existing_complaints:
            # Step 3: Skip resolved complaints
            if existing.status == ComplaintStatus.RESOLVED:
                continue

            # Step 1: Category filter (only if we have a category to compare)
            if new_category and existing.category:
                if not self.categories_match(new_category, existing.category):
                    continue

            # Step 2: Location match
            if not self.locations_match(new_location, existing.location or ''):
                continue

            # Step 4: Semantic similarity
            existing_text = f"{existing.subject} {existing.description}".strip()
            similarity = self.calculate_text_similarity(new_text, existing_text)
            logger.info(
                f"Duplicate check: location='{new_location}' matches existing ID={existing.id}. "
                f"Similarity={similarity:.3f} (threshold={self.similarity_threshold})"
            )

            if similarity >= self.similarity_threshold:
                return {
                    "status": "blocked",
                    "message": f"⚠️ A similar {existing.category or 'complaint'} issue is already reported in your area and is currently '{existing.status}'. "
                               f"Our team is working on it. Please wait for resolution before submitting again.",
                    "existing_complaint": {
                        "id": existing.id,
                        "category": existing.category,
                        "status": existing.status,
                        "location": existing.location,
                        "similarity_score": round(similarity, 3)
                    }
                }

        return {
            "status": "allowed",
            "message": "No duplicate found. Complaint can be submitted."
        }


duplicate_check_service = DuplicateCheckService()
