from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timedelta
from app.db.database import Base

class AdminOTP(Base):
    __tablename__ = "admin_otps"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    otp_code = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    def is_expired(self):
        return datetime.utcnow() > self.expires_at

    def can_retry(self):
        return self.attempts < 3
