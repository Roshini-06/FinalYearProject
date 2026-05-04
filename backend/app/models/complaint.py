from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base

class ComplaintStatus(str, enum.Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"

class ComplaintPriority(str, enum.Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String)  # Water, Electricity, etc.
    priority = Column(String)  # High, Medium, Low
    location = Column(String, nullable=False)
    status = Column(String, default=ComplaintStatus.PENDING)
    user_email = Column(String) # Store user email directly as requested
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="complaints")
