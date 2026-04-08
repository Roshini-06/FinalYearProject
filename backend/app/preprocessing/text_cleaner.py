import re

def clean_text(text: str) -> str:
    """
    Preprocess the text:
    1. Lowercase
    2. Remove special characters but keep common punctuation that might indicate urgency like !
    3. Strip whitespace
    """
    text = text.lower()
    # Remove most special characters, keep alphanumeric and basic punctuation
    text = re.sub(r'[^a-z0-9\s\.\!\?]', '', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()
