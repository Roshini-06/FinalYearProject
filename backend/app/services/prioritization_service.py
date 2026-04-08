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
            result = self.classifier(text)[0]
            # Map BERT labels to High/Medium/Low based on your fine-tuning
            # For now, we return a mock based on keywords if model is not ready
            return "High" if result['score'] > 0.8 else "Medium"

        # Fallback keyword logic
        text_lower = text.lower()
        if any(w in text_lower for w in ["emergency", "danger", "burst", "shock", "fire", "immediate"]):
            return "High"
        elif any(w in text_lower for w in ["completely", "no power", "no water", "broken"]):
            return "Medium"
        return "Low"

prioritization_service = PrioritizationService()
