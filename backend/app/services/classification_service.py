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
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.vectorizer_path):
                # Check for empty files
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
        cleaned_text = preprocessing_service.clean_text(text)
        text_lower = text.lower()
        
        # 1. Strong Keyword Heuristics (Overrules ML model confusion)
        electricity_keywords = ["light", "transformer", "electricity", "power cut", "power outage", "voltage", "wire", "pole", "shock", "bulb"]
        water_keywords = ["water", "pipe", "leak", "drain", "sewage", "plumbing", "tap", "drinking", "motor"]
        
        elec_score = sum(1 for w in electricity_keywords if w in text_lower)
        water_score = sum(1 for w in water_keywords if w in text_lower)
        
        # Absolute overrides
        if elec_score > water_score:
            return "Electricity"
        elif water_score > elec_score:
            return "Water"
            
        # 2. AI Model for nuanced sentences
        if self.model and self.vectorizer:
            X = self.vectorizer.transform([cleaned_text])
            prediction = self.model.predict(X)[0]
            return prediction
        
        # 3. Final Fallback
        return "General"

classification_service = ClassificationService()
