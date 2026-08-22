from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, require_roles

router = APIRouter(prefix="/api/notifications", tags=["Notifications & Alerts"])


@router.get("", response_model=List[schemas.NotificationOut])
def list_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Fetch notifications relevant to the current user (user-specific or broadcast).
    """
    notifications = (
        db.query(models.Notification)
        .filter(
            (models.Notification.user_id == current_user.id)
            | (models.Notification.user_id.is_(None))
        )
        .order_by(models.Notification.created_at.desc())
        .all()
    )
    return notifications


@router.patch("/{notification_id}/read", response_model=schemas.NotificationOut)
def mark_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    notification = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found.")
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


@router.post("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db.query(models.Notification).filter(
        (models.Notification.user_id == current_user.id)
        | (models.Notification.user_id.is_(None))
    ).update({"is_read": True}, synchronize_session=False)
    db.commit()
    return {"message": "All notifications marked as read."}
