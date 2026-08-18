from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List

from app.database import get_db
from app.models.user import User, UserRole
from app.models.notification import Notification
from app.schemas import NotificationOut, NotificationCreate
from app.services.auth_service import get_current_user, require_admin
from app.services.notification_service import NotificationService

router = APIRouter(
    prefix="/api/notifications",
    tags=["notifications"]
)

@router.get("", response_model=List[NotificationOut])
def get_my_notifications(
    skip: int = 0, 
    limit: int = 50, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Get all notifications for the current user (either targeted directly or by role)."""
    notifications = db.query(Notification).filter(
        or_(
            Notification.user_id == current_user.id,
            Notification.role_target == current_user.role
        )
    ).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return notifications


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Get the count of unread notifications for the current user."""
    count = db.query(Notification).filter(
        or_(
            Notification.user_id == current_user.id,
            Notification.role_target == current_user.role
        ),
        Notification.is_read == False
    ).count()
    return {"unread_count": count}


@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_as_read(
    notification_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Mark a specific notification as read."""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    # Check ownership/access
    if notification.user_id and notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if notification.role_target and notification.role_target != current_user.role:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


@router.post("/broadcast", response_model=NotificationOut, dependencies=[Depends(require_admin)])
def broadcast_notification(
    data: NotificationCreate, 
    db: Session = Depends(get_db)
):
    """Admin only: Create a manual notification (platform announcement or role-specific)."""
    new_notif = Notification(
        title=data.title,
        message=data.message,
        type=data.type,
        role_target=data.role_target,
        user_id=data.user_id
    )
    db.add(new_notif)
    db.commit()
    db.refresh(new_notif)
    return new_notif


@router.post("/triggers/run", dependencies=[Depends(require_admin)])
def run_triggers(db: Session = Depends(get_db)):
    """Admin only: Manually run the trigger evaluator to generate system alerts."""
    result = NotificationService.run_all_triggers(db)
    return result
