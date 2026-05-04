from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import io
import pandas as pd
from app.db.database import get_db
from app.models.complaint import Complaint
from app.models.user import User
from app.schemas.complaint_schema import ComplaintCreate, ComplaintResponse, ComplaintStatusUpdate, ComplaintCheck
from app.api.deps import get_current_user, get_current_active_admin
from app.services.classification_service import classification_service
from app.services.prioritization_service import prioritization_service
from app.services.duplicate_check_service import duplicate_check_service

router = APIRouter()

@router.post("/check-duplicate")
async def check_duplicate(
    complaint_in: ComplaintCheck,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Complaint))
    existing_complaints = result.scalars().all()
    return await duplicate_check_service.check_for_duplicate(complaint_in, existing_complaints)

@router.post("/", response_model=ComplaintResponse)
async def create_complaint(
    complaint_in: ComplaintCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Final check for duplicate before saving
    result = await db.execute(select(Complaint))
    existing_complaints = result.scalars().all()
    dup_result = await duplicate_check_service.check_for_duplicate(complaint_in, existing_complaints)
    if dup_result["status"] == "duplicate":
        raise HTTPException(status_code=400, detail=dup_result["message"])

    # Enforce uniqueness: One active complaint per user
    result = await db.execute(select(Complaint).where(Complaint.user_id == current_user.id))
    existing_complaint = result.scalar_one_or_none()
    if existing_complaint and existing_complaint.status != "Resolved":
        raise HTTPException(
            status_code=400,
            detail="You already have an active complaint. Please wait for it to be resolved."
        )

    # AI Processing
    category = await classification_service.classify_complaint(complaint_in.description)
    priority = await prioritization_service.prioritize_complaint(complaint_in.description)

    db_complaint = Complaint(
        user_id=current_user.id,
        subject=complaint_in.subject,
        description=complaint_in.description,
        location=complaint_in.location,
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

@router.patch("/{complaint_id}/status", response_model=ComplaintResponse)
async def update_complaint_status(
    complaint_id: int,
    status_update: ComplaintStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_active_admin)
):
    result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
    db_complaint = result.scalar_one_or_none()
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    db_complaint.status = status_update.status
    await db.commit()
    await db.refresh(db_complaint)
    return db_complaint

@router.post("/upload-csv")
async def upload_csv_complaints(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid file format. Please upload a .csv file."
        )

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        if 'complaint_text' not in df.columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CSV must contain a 'complaint_text' column."
            )
            
        df = df.dropna(subset=['complaint_text'])
        df = df[df['complaint_text'].astype(str).str.strip() != '']
        
        if df.empty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid complaint data found in the CSV."
            )

        predictions = []
        for text in df['complaint_text']:
            text_str = str(text)
            # Use real AI services from your backend
            category = await classification_service.classify_complaint(text_str)
            priority = await prioritization_service.prioritize_complaint(text_str)
            
            predictions.append({
                "complaint_text": text_str,
                "predicted_category": category,
                "priority_level": priority,
                "confidence_score": 0.95 # Mock score for now
            })
        
        preview_df = df.head(5).fillna("")
        preview = preview_df.to_dict(orient="records")
        
        return {
            "message": "CSV processed successfully",
            "total_processed": len(predictions),
            "preview": preview,
            "results": predictions
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing CSV: {str(e)}"
        )
