def determine_priority(text: str, category: str) -> str:
    """
    Rule-based priority determination based on keywords.
    """
    text = text.lower()
    
    # Keyword Lists
    high_keywords = [
        'danger', 'spark', 'fire', 'shock', 'emergency', 'leak', 'burst', 
        'outage', 'hazard', 'explode', 'smoke', 'urgent', 'critical', 'medical'
    ]
    
    medium_keywords = [
        'low voltage', 'dim', 'pressure', 'dirty', 'smell', 'fluctuation', 
        'breakdown', 'intermittent', 'slow'
    ]
    
    # Check for High priority
    for word in high_keywords:
        if word in text:
            return "High"
            
    # Check for Medium priority
    for word in medium_keywords:
        if word in text:
            return "Medium"
            
    # Default to Low
    return "Low"
