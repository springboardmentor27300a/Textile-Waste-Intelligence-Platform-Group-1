from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User

from app.schemas.notification import (
    NotificationResponse,
    NotificationStats,
)

from app.services.notification_service import (
    NotificationService,
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


# =========================================================
# GET NOTIFICATIONS
# =========================================================

@router.get(
    "/",
    response_model=list[NotificationResponse],
)
def get_notifications(
    category: Optional[str] = None,
    unread_only: bool = False,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    return NotificationService.get_for_user(
        db=db,
        user_id=current_user.id,
        category=category,
        unread_only=unread_only,
    )


# =========================================================
# GET STATISTICS
# =========================================================

@router.get(
    "/stats",
    response_model=NotificationStats,
)
def get_notification_stats(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    return NotificationService.stats(
        db=db,
        user_id=current_user.id,
    )


# =========================================================
# MARK ONE READ
# =========================================================

@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
)
def mark_notification_read(

    notification_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    notification = (
        NotificationService.mark_read(
            db=db,
            notification_id=notification_id,
            user_id=current_user.id,
        )
    )

    if notification is None:

        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    return notification


# =========================================================
# MARK ALL READ
# =========================================================

@router.patch("/read-all")
def mark_all_notifications_read(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    return NotificationService.mark_all_read(
        db=db,
        user_id=current_user.id,
    )


# =========================================================
# DELETE
# =========================================================

@router.delete("/{notification_id}")
def delete_notification(

    notification_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    deleted = NotificationService.delete(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id,
    )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    return {
        "message": (
            "Notification deleted successfully."
        )
    }