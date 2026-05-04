from fastapi import APIRouter, Depends, BackgroundTasks, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import io
import pandas as pd
from app.services.classification_service import classification_service
from app.services.prioritization_service import prioritization_service
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

from fastapi.encoders import jsonable_encoder

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
        
        # Try different encodings
        try:
            df = pd.read_csv(io.BytesIO(contents))
        except UnicodeDecodeError:
            try:
                df = pd.read_csv(io.BytesIO(contents), encoding='latin1')
            except Exception:
                df = pd.read_csv(io.BytesIO(contents), encoding='utf-16')
        
        # Clean the dataframe column names and data
        df.columns = [str(c).strip().lower() for c in df.columns]
        
        if 'complaint_text' not in df.columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"CSV must contain a 'complaint_text' column. Found: {list(df.columns)}"
            )
            
        df = df.dropna(subset=['complaint_text'])
        df['complaint_text'] = df['complaint_text'].astype(str).str.strip()
        df = df[df['complaint_text'] != '']
        
        if df.empty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid complaint data found in the CSV."
            )

        predictions = []
        for text in df['complaint_text']:
            try:
                category = await classification_service.classify_complaint(text)
                priority = await prioritization_service.prioritize_complaint(text)
                
                predictions.append({
                    "complaint_text": text,
                    "predicted_category": category,
                    "priority_level": priority,
                    "confidence_score": 0.95
                })
            except Exception as inner_e:
                print(f"Error classifying row: {inner_e}")
                continue
        
        # Safe preview conversion
        preview_data = df.head(5).fillna("").to_dict(orient="records")
        
        return jsonable_encoder({
            "message": "CSV processed successfully",
            "total_processed": len(predictions),
            "preview": preview_data,
            "results": predictions
        })

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing CSV: {str(e)}"
        )
