from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ComplaintBase(BaseModel):
    subject: str
    description: str

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintResponse(ComplaintBase):
    id: int
    user_id: int
    category: Optional[str]
    priority: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
