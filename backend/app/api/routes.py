from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.schemas.complaint import ComplaintInput, ComplaintResponse
from app.models.ml_model import classifier
from app.utils.priority_logic import determine_priority
from app.preprocessing.text_cleaner import clean_text
import random

router = APIRouter()

# In-memory storage for demonstration purposes
# In a real app, this would be a database
complaints_db = []

@router.post("/predict", response_model=ComplaintResponse)
async def predict_complaint(complaint: ComplaintInput):
    if not complaint.text:
        raise HTTPException(status_code=400, detail="Text is required")
        
    clean_input = clean_text(complaint.text)
    
    # 1. AI Classification
    ml_result = classifier.predict(clean_input)
    category = ml_result["category"]
    confidence = ml_result["confidence"]
    
    # 2. Priority Logic
    priority = determine_priority(clean_input, category)
    
    # 3. Store in "DB"
    complaint_entry = {
        "id": 1000 + len(complaints_db) + 1,
        "text": complaint.text,
        "category": category,
        "priority": priority,
        "timestamp": "so-now"
    }
    complaints_db.append(complaint_entry)
    
    return {
        "id": complaint_entry["id"],
        "category": category,
        "priority": priority,
        "confidence": confidence,
        "message": "Complaint classified and registered successfully"
    }

@router.get("/complaints")
async def get_complaints():
    return complaints_db
