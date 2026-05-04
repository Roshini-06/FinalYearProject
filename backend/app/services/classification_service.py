import joblib
import os
import re
from app.services.preprocessing_service import preprocessing_service

# This system ONLY handles Water and Electricity complaints
ELECTRICITY_KEYWORDS = [
    "light", "lights", "streetlight", "lamp", "transformer", "electricity",
    "power cut", "power outage", "voltage", "wire", "wiring", "pole", "shock",
    "bulb", "electric", "power supply", "generator", "circuit", "fuse", "switchboard"
]

WATER_KEYWORDS = [
    "water", "pipe", "pipeline", "leak", "leakage", "drain", "drainage",
    "sewage", "sewer", "plumbing", "tap", "drinking", "motor", "flood",
    "overflow", "blocked drain", "waterlogging", "supply", "contaminated"
]

INSUFFICIENT_MESSAGE = (
    "This platform only accepts complaints related to ⚡ Electricity or 💧 Water issues. "
    "Your complaint does not appear to be about either. "
    "Please describe a water supply problem (e.g. pipe leak, no water) or "
    "an electricity problem (e.g. power outage, broken streetlight) to proceed."
)

# Words that signal the complaint is too vague
VAGUE_ONLY_WORDS = {
    "problem", "issue", "help", "please", "thing", "stuff", "bad",
    "good", "nice", "ok", "okay", "test", "hello", "hi", "nothing"
}


def validate_complaint_content(text: str) -> tuple[bool, str]:
    """
    Returns (is_valid, reason_if_invalid).
    Only Water and Electricity complaints are accepted.
    """
    stripped = text.strip()

    # 1. Too short
    if len(stripped) < 20:
        return False, "Your complaint is too short. Please provide more details (at least 20 characters)."

    # 2. Too few meaningful words
    words = re.findall(r'\b\w+\b', stripped.lower())
    meaningful_words = [w for w in words if len(w) > 2 and w not in VAGUE_ONLY_WORDS]
    if len(meaningful_words) < 4:
        return False, "Your complaint lacks sufficient detail. Please describe the issue clearly."

    # 3. Must relate to Water OR Electricity ONLY
    text_lower = stripped.lower()

    has_water = any(kw in text_lower for kw in WATER_KEYWORDS)
    has_electricity = any(kw in text_lower for kw in ELECTRICITY_KEYWORDS)

    if not has_water and not has_electricity:
        return False, INSUFFICIENT_MESSAGE

    return True, ""


class ClassificationService:
    def __init__(self):
        self.model_path = "app/models/logistic_model.pkl"
        self.vectorizer_path = "app/models/tfidf_vectorizer.pkl"
        self.model = None
        self.vectorizer = None
        self._load_models()

    def _load_models(self):
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.vectorizer_path):
                if os.path.getsize(self.model_path) > 0 and os.path.getsize(self.vectorizer_path) > 0:
                    self.model = joblib.load(self.model_path)
                    self.vectorizer = joblib.load(self.vectorizer_path)
                    print(f"Successfully loaded models from {self.model_path} and {self.vectorizer_path}")
                else:
                    print("Found empty model files. Using fallback logic.")
            else:
                print("Model files missing. Using fallback logic.")
        except Exception as e:
            print(f"Error loading models: {e}. Using fallback logic.")

    async def classify_complaint(self, text: str) -> str:
        """Classifies text into Water or Electricity only."""
        text_lower = text.lower()

        elec_score = sum(1 for kw in ELECTRICITY_KEYWORDS if kw in text_lower)
        water_score = sum(1 for kw in WATER_KEYWORDS if kw in text_lower)

        # Clear keyword winner
        if elec_score > water_score:
            return "Electricity"
        elif water_score > elec_score:
            return "Water"

        # Tie or zero — use ML model to break tie
        if self.model and self.vectorizer:
            cleaned_text = preprocessing_service.clean_text(text)
            X = self.vectorizer.transform([cleaned_text])
            probas = self.model.predict_proba(X)[0]
            max_prob = max(probas)
            if max_prob >= 0.55:
                return self.model.classes_[probas.argmax()]

        # Final fallback — whichever had any score
        if elec_score > 0:
            return "Electricity"
        if water_score > 0:
            return "Water"

        # Default to Water as safer fallback (will not reach here after validation)
        return "Water"


classification_service = ClassificationService()
