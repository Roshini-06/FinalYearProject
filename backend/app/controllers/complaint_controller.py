from fastapi import HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.models.complaint import Complaint, ComplaintStatus
from app.models.user import User
from app.schemas.complaint_schema import ComplaintCreate, ComplaintStatusUpdate, ComplaintCheckRequest
from app.services.classification_service import classification_service, validate_complaint_content
from app.services.prioritization_service import prioritization_service
from app.services.duplicate_check_service import duplicate_check_service
from app.services.email_service import EmailService
from app.core.websocket import manager
from app.api.deps import get_db
import logging

logger = logging.getLogger(__name__)


class ComplaintController:

    @staticmethod
    async def check_duplicate(check_in: ComplaintCheckRequest, db: AsyncSession) -> dict:
        """
        Public duplicate check endpoint.
        Step 1: Get AI category if not provided
        Step 2: Fetch all active (non-resolved) complaints
        Step 3: Run DuplicateCheckService
        """
        # Try to get category from AI if not supplied
        category = check_in.category
        if not category:
            try:
                category = await classification_service.classify_complaint(check_in.description)
            except Exception:
                category = None

        # Only check against non-resolved complaints
        result = await db.execute(
            select(Complaint).where(Complaint.status != ComplaintStatus.RESOLVED)
        )
        active_complaints = result.scalars().all()

        dup_result = await duplicate_check_service.check_for_duplicate(
            new_subject=check_in.subject,
            new_description=check_in.description,
            new_location=check_in.location,
            new_category=category,
            existing_complaints=active_complaints
        )
        return dup_result

    @staticmethod
    async def create_complaint(complaint_in: ComplaintCreate, db: AsyncSession, current_user: User, background_tasks: BackgroundTasks):
        """
        Full complaint creation flow:
        1. Content quality validation
        2. AI Classification
        3. Duplicate check (category + location + semantic similarity)
        4. Prioritization
        5. Save to DB
        6. Email Notification
        """
        # 1. Validate complaint content quality FIRST
        is_valid, reason = validate_complaint_content(complaint_in.description)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=reason
            )

        # 2. AI Classification
        try:
            category = await classification_service.classify_complaint(complaint_in.description)
        except Exception as e:
            logger.error(f"Classification failed: {e}")
            category = "General"

        # 3. Duplicate check — cross-user, category-aware
        result = await db.execute(
            select(Complaint).where(Complaint.status != ComplaintStatus.RESOLVED)
        )
        active_complaints = result.scalars().all()

        dup_result = await duplicate_check_service.check_for_duplicate(
            new_subject=complaint_in.subject,
            new_description=complaint_in.description,
            new_location=complaint_in.location,
            new_category=category,
            existing_complaints=active_complaints
        )

        if dup_result["status"] == "blocked":
            logger.info(f"Blocked duplicate submission by {current_user.email}: {dup_result['message']}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=dup_result["message"]
            )

        # 3. Prioritization
        try:
            priority = await prioritization_service.prioritize_complaint(complaint_in.description)
        except Exception as e:
            logger.error(f"Prioritization failed: {e}")
            priority = "Medium"

        # 4. Save to Database
        db_complaint = Complaint(
            user_id=current_user.id,
            subject=complaint_in.subject,
            description=complaint_in.description,
            location=complaint_in.location,
            category=category,
            priority=priority,
            user_email=current_user.email
        )
        db.add(db_complaint)
        try:
            await db.commit()
            await db.refresh(db_complaint)
            logger.info(f"Complaint #{db_complaint.id} created by {current_user.email} | Category: {category} | Priority: {priority}")

            # 5. Send Email Notification via Background Task
            background_tasks.add_task(EmailService.send_complaint_confirmation, current_user.email)

            # 6. Real-time Admin Alert if High Priority
            if priority == "High":
                alert_msg = {
                    "type": "NEW_COMPLAINT_PRIORITY",
                    "complaint_id": db_complaint.id,
                    "priority": priority,
                    "subject": db_complaint.subject,
                    "user": current_user.email
                }
                await manager.broadcast_to_admins(alert_msg)
                # Send email to admin as well
                await EmailService.send_admin_priority_alert("admin@gmail.com", db_complaint.id, priority)

            return db_complaint
        except Exception as e:
            await db.rollback()
            logger.error(f"DB error creating complaint: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not save complaint. Try again."
            )

    @staticmethod
    async def get_my_complaints(db: AsyncSession, current_user: User):
        result = await db.execute(
            select(Complaint).where(Complaint.user_id == current_user.id).order_by(Complaint.created_at.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def get_all_complaints(db: AsyncSession):
        result = await db.execute(select(Complaint).order_by(Complaint.created_at.desc()))
        return result.scalars().all()

    @staticmethod
    async def update_status(complaint_id: int, status_update: ComplaintStatusUpdate, db: AsyncSession, background_tasks: BackgroundTasks):
        result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
        db_complaint = result.scalar_one_or_none()
        if not db_complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")

        db_complaint.status = status_update.status
        await db.commit()
        await db.refresh(db_complaint)
        
        # Notify User via WebSocket
        user_msg = {
            "type": "STATUS_UPDATE",
            "complaint_id": complaint_id,
            "new_status": status_update.status
        }
        await db.refresh(db_complaint, ["user"]) # Ensure user is loaded
        user_email = db_complaint.user.email
        await manager.send_personal_message(user_msg, user_email)
        
        # Notify User via Email (Background Task)
        background_tasks.add_task(EmailService.send_status_update_notification, user_email, complaint_id, status_update.status)

        logger.info(f"Complaint #{complaint_id} status updated to '{status_update.status}'")
        return db_complaint
