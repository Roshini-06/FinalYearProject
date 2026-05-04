from transformers import pipeline
import os

class PrioritizationService:
    def __init__(self):
        self.model_name = "bert-base-uncased"
        self.classifier = None
        # self._load_model() # Disabled by default to avoid heavy download during dev

    def _load_model(self):
        # This will download the model on first run
        self.classifier = pipeline("text-classification", model=self.model_name)

    async def prioritize_complaint(self, text: str) -> str:
        # If model is loaded, use it
        if self.classifier:
            try:
                result = self.classifier(text)[0]
                # Map BERT labels to High/Medium/Low based on your fine-tuning
                return "High" if result['score'] > 0.8 else "Medium"
            except Exception:
                pass

        # Enhanced fallback keyword logic
        text_lower = text.lower()
        
        # High Priority: Immediate danger, total service loss, or life-threatening issues
        high_priority_keywords = [
            "emergency", "danger", "burst", "shock", "fire", "immediate", 
            "live wire", "sparking", "hazardous", "critical", "flooding", "life",
            "explosion", "falling pole", "exposed cable", "electric shock", 
            "short circuit", "hospital", "medical", "oxygen", "disabled", 
            "vulnerable", "toxic", "contamination", "poisonous", "urgent",
            "outage", "no power", "no water", "frequent", "blackout", "completely"
        ]
        
        # Medium Priority: Significant inconvenience, frequent issues, or health/sanitation concerns
        medium_priority_keywords = [
            "broken", "daily", "inconvenience", "intermittent",
            "voltage fluctuation", "leakage", "blockage", "low pressure",
            "unusable", "smell", "foul", "clogged", "sewerage overflow",
            "partial", "fluctuation", "damage", "faulty", "not working"
        ]
        
        if any(w in text_lower for w in high_priority_keywords):
            return "High"
        
        if any(w in text_lower for w in medium_priority_keywords):
            return "Medium"
            
        # Low Priority: Minor issues, maintenance requests, or general inquiries
        return "Low"

prioritization_service = PrioritizationService()
