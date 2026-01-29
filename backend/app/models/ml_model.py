from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import numpy as np

class ComplaintClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.model = MultinomialNB()
        self.is_trained = False
        self._train_dummy_model()
        
    def _train_dummy_model(self):
        """
        Train a dummy model on initialization so the system words out of the box.
        """
        # Small dataset for demonstration
        # 0: Electricity, 1: Water
        texts = [
            # Electricity samples
            "power outage in my area", 
            "electricity cut since morning", 
            "transformer burst and fire", 
            "no light in street", 
            "voltage fluctuation damaging appliances",
            "electric pole fallen",
            "meter requirement",
            "bill issue electricity",
            "wire sparking",
            
            # Water samples
            "water pipe leaking", 
            "no water supply", 
            "dirty water coming from tap", 
            "sewage overflow in street", 
            "low water pressure",
            "water meter broken",
            "pipeline burst",
            "contaminated water",
            "water tanker required"
        ]
        
        labels = [
            "Electricity", "Electricity", "Electricity", "Electricity", "Electricity", "Electricity", "Electricity", "Electricity", "Electricity",
            "Water", "Water", "Water", "Water", "Water", "Water", "Water", "Water", "Water"
        ]
        
        try:
            X = self.vectorizer.fit_transform(texts)
            self.model.fit(X, labels)
            self.is_trained = True
        except Exception as e:
            print(f"Error training dummy model: {e}")
            
    def predict(self, text: str) -> dict:
        if not self.is_trained:
            return {"category": "Unknown", "confidence": 0.0}
            
        # Vectorize input
        X = self.vectorizer.transform([text])
        
        # Predict
        prediction = self.model.predict(X)[0]
        
        # Get probability/confidence
        proba = self.model.predict_proba(X)
        confidence = np.max(proba)
        
        return {
            "category": prediction,
            "confidence": float(confidence)
        }

# Singleton instance
classifier = ComplaintClassifier()
