from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.database import get_db
from app.schemas.complaint_schema import (
    ComplaintCreate, ComplaintResponse, ComplaintStatusUpdate,
    ComplaintCheckRequest, DuplicateCheckResponse
)
from app.controllers.complaint_controller import ComplaintController
from app.api.deps import get_current_user, get_current_admin
from app.models.user import User

router = APIRouter()

@router.post("/check-duplicate", response_model=DuplicateCheckResponse)
async def check_duplicate(
    check_in: ComplaintCheckRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Public endpoint (no auth needed) to pre-check for duplicate complaints.
    Frontend calls this while user is typing to show real-time feedback.
    """
    return await ComplaintController.check_duplicate(check_in, db)

@router.post("/", response_model=ComplaintResponse)
async def create_complaint(
    complaint_in: ComplaintCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ComplaintController.create_complaint(complaint_in, db, current_user, background_tasks)

@router.get("/my", response_model=List[ComplaintResponse])
async def get_my_complaints(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ComplaintController.get_my_complaints(db, current_user)

@router.get("/all", response_model=List[ComplaintResponse])
async def get_all_complaints(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    return await ComplaintController.get_all_complaints(db)

@router.patch("/{complaint_id}/status", response_model=ComplaintResponse)
async def update_complaint_status(
    complaint_id: int,
    status_update: ComplaintStatusUpdate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    return await ComplaintController.update_status(complaint_id, status_update, db, background_tasks)
