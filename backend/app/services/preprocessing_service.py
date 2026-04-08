import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
import re

# Download necessary NLTK data
nltk.download('stopwords')

class PreprocessingService:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.stemmer = PorterStemmer()

    def clean_text(self, text: str) -> str:
        # Lowercase
        text = text.lower()
        # Remove special characters and numbers
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        # Tokenize and remove stopwords
        words = text.split()
        words = [w for w in words if w not in self.stop_words]
        # Stemming
        words = [self.stemmer.stem(w) for w in words]
        return " ".join(words)

preprocessing_service = PreprocessingService()
