from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import current_user
from ..models import Notification, User
from ..schemas import NotificationOut

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
def list_notifications(unread_only: bool = False, db: Session = Depends(get_db),
                       user: User = Depends(current_user)):
    query = db.query(Notification).filter(
        (Notification.user_id == user.id) | (Notification.user_id.is_(None)))
    if unread_only:
        query = query.filter(Notification.read.is_(False))
    return query.order_by(Notification.created_at.desc()).limit(50).all()


@router.post("/{notification_id}/read", response_model=NotificationOut)
def mark_read(notification_id: int, db: Session = Depends(get_db),
              user: User = Depends(current_user)):
    note = db.get(Notification, notification_id)
    if not note or (note.user_id not in (None, user.id)):
        raise HTTPException(status_code=404, detail="No notification with that id.")
    note.read = True
    db.commit()
    db.refresh(note)
    return note
