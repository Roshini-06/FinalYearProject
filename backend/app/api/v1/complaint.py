from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.db.database import get_db
from app.models.complaint import Complaint
from app.models.user import User
from app.schemas.complaint_schema import ComplaintCreate, ComplaintResponse
from app.api.deps import get_current_user, get_current_active_admin
from app.services.classification_service import classification_service
from app.services.prioritization_service import prioritization_service

router = APIRouter()

@router.post("/", response_model=ComplaintResponse)
async def create_complaint(
    complaint_in: ComplaintCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Enforce uniqueness: One complaint per registered email
    result = await db.execute(select(Complaint).where(Complaint.user_id == current_user.id))
    existing_complaint = result.scalar_one_or_none()
    if existing_complaint:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted a complaint. Only one complaint allowed per user."
        )

    # AI Processing
    category = await classification_service.classify_complaint(complaint_in.description)
    priority = await prioritization_service.prioritize_complaint(complaint_in.description)

    db_complaint = Complaint(
        user_id=current_user.id,
        subject=complaint_in.subject,
        description=complaint_in.description,
        category=category,
        priority=priority
    )
    db.add(db_complaint)
    await db.commit()
    await db.refresh(db_complaint)
    return db_complaint

@router.get("/me", response_model=ComplaintResponse)
async def get_my_complaint(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Complaint).where(Complaint.user_id == current_user.id))
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="No complaint found for this user")
    return complaint

@router.get("/all", response_model=List[ComplaintResponse])
async def get_all_complaints(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_active_admin)
):
    result = await db.execute(select(Complaint))
    return result.scalars().all()
