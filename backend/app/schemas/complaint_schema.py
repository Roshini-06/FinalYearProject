from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class ComplaintBase(BaseModel):
    subject: str
    description: str
    location: str

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintCheckRequest(BaseModel):
    subject: str
    description: str
    location: str
    category: Optional[str] = None  # Optional: pre-classified category

class ExistingComplaintInfo(BaseModel):
    id: int
    category: Optional[str]
    status: str
    location: str
    similarity_score: float

class DuplicateCheckResponse(BaseModel):
    status: str   # "blocked" or "allowed"
    message: str
    existing_complaint: Optional[ExistingComplaintInfo] = None

class ComplaintStatusUpdate(BaseModel):
    status: str

class ComplaintResponse(ComplaintBase):
    id: int
    user_id: int
    user_email: Optional[str] = None
    category: Optional[str]
    priority: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
