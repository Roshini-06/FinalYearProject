from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.db.database import get_db
from app.models.user import User, UserRole
from app.models.complaint import Complaint
from app.schemas.user_schema import UserLogin, Token
from app.schemas.complaint_schema import ComplaintResponse
from app.core.security import create_access_token, verify_password, get_password_hash
from app.api.deps import get_current_admin

router = APIRouter()

@router.post("/login", response_model=Token)
async def admin_login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Independent manual login for ADMIN account.
    Validates against the 'users' table specifically for role='admin'.
    """
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalar_one_or_none()
    
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized. Admin access only.",
        )
        
    if not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin credentials",
        )
    
    # Create JWT with role='admin'
    access_token = create_access_token(subject=user.email, role=UserRole.ADMIN)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "email": user.email,
        "role": user.role
    }

@router.get("/complaints", response_model=List[ComplaintResponse])
async def get_all_complaints_admin(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Admin-only endpoint to fetch all complaints across all users.
    """
    result = await db.execute(
        select(Complaint).order_by(Complaint.created_at.desc())
    )
    return result.scalars().all()
