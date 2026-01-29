from pydantic import BaseModel
from typing import Optional

class ComplaintInput(BaseModel):
    text: str

class ComplaintResponse(BaseModel):
    id: Optional[int] = None
    category: str
    priority: str
    confidence: float
    message: str
