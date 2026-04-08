import joblib
import os
from app.services.preprocessing_service import preprocessing_service

class ClassificationService:
    def __init__(self):
        self.model_path = "app/models/logistic_model.pkl"
        self.vectorizer_path = "app/models/tfidf_vectorizer.pkl"
        self.model = None
        self.vectorizer = None
        self._load_models()

    def _load_models(self):
        if os.path.exists(self.model_path) and os.path.exists(self.vectorizer_path):
            self.model = joblib.load(self.model_path)
            self.vectorizer = joblib.load(self.vectorizer_path)

    async def classify_complaint(self, text: str) -> str:
        cleaned_text = preprocessing_service.clean_text(text)
        
        if self.model and self.vectorizer:
            X = self.vectorizer.transform([cleaned_text])
            prediction = self.model.predict(X)[0]
            return prediction
        
        # Fallback logic for demo
        text_lower = cleaned_text.lower()
        if any(w in text_lower for w in ["water", "pipe", "leak", "tap"]):
            return "Water"
        if any(w in text_lower for w in ["elec", "power", "bolt", "light", "wire"]):
            return "Electricity"
        return "General"

classification_service = ClassificationService()
