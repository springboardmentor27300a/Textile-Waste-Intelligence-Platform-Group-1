from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications & Alerts"])


def _ensure_default_notifications(db: Session, user_id: int):
    """Seed initial demonstration alerts for Module 11 if user has no notifications yet."""
    existing_count = db.query(models.Notification).filter(models.Notification.user_id == user_id).count()
    if existing_count == 0:
        samples = [
            models.Notification(
                title="High-Recyclability Cotton Batch Identified",
                message="Batch #COT-2026-001 has achieved a 94.5 Circularity Score. Recommended for immediate mechanical recycling.",
                category=models.NotificationCategory.RECYCLING_OPPORTUNITY,
                priority="high",
                user_id=user_id,
            ),
            models.Notification(
                title="Sustainability Milestone Achieved",
                message="Your platform facility has successfully saved over 1,500 kg of CO₂ emissions this month!",
                category=models.NotificationCategory.SUSTAINABILITY_MILESTONE,
                priority="normal",
                user_id=user_id,
            ),
            models.Notification(
                title="Low Inventory Warning: Polyester Feedstock",
                message="Polyester waste inventory is below optimal threshold. Consider scheduling collection batch intake.",
                category=models.NotificationCategory.INVENTORY_WARNING,
                priority="warning",
                user_id=user_id,
            ),
            models.Notification(
                title="New Waste Collection Schedule Posted",
                message="Weekly regional textile waste collection schedule has been updated for recycling operators.",
                category=models.NotificationCategory.WASTE_COLLECTION,
                priority="normal",
                user_id=user_id,
            ),
        ]
        db.add_all(samples)
        db.commit()


@router.get("/", response_model=List[schemas.NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _ensure_default_notifications(db, current_user.id)
    return (
        db.query(models.Notification)
        .filter(models.Notification.user_id == current_user.id)
        .order_by(models.Notification.created_at.desc())
        .all()
    )


@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = (
        db.query(models.Notification)
        .filter(models.Notification.id == notification_id, models.Notification.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Notification not found")
    item.is_read = 1
    db.commit()
    return {"status": "success", "message": "Notification marked as read"}
