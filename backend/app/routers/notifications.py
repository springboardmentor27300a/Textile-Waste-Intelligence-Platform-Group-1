from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Notification
from app.core.dependencies import CurrentUser


router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"],
)


@router.get("")
def list_notifications(
    current_user: CurrentUser,
):
    db: Session = SessionLocal()

    try:
        notifications = db.scalars(
            select(Notification)
            .where(Notification.user_id == current_user.id)
            .order_by(Notification.created_at.desc())
        ).all()

        return [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "notification_type": n.notification_type,
                "is_read": n.is_read,
                "created_at": n.created_at,
                "read_at": n.read_at,
            }
            for n in notifications
        ]
    finally:
        db.close()


@router.patch("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: CurrentUser,
):
    db: Session = SessionLocal()

    try:
        notification = db.scalar(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.user_id == current_user.id,
            )
        )

        if notification is None:
            raise HTTPException(
                status_code=404,
                detail="Notification not found.",
            )

        notification.is_read = True
        notification.read_at = datetime.now(timezone.utc)

        db.commit()

        return {
            "message": "Notification marked as read.",
            "notification_id": notification.id,
        }
    finally:
        db.close()


@router.patch("/read-all")
def mark_all_notifications_read(
    current_user: CurrentUser,
):
    db: Session = SessionLocal()

    try:
        notifications = db.scalars(
            select(Notification).where(
                Notification.user_id == current_user.id,
                Notification.is_read.is_(False),
            )
        ).all()

        now = datetime.now(timezone.utc)

        for notification in notifications:
            notification.is_read = True
            notification.read_at = now

        db.commit()

        return {
            "message": "All notifications marked as read.",
            "updated": len(notifications),
        }
    finally:
        db.close()
