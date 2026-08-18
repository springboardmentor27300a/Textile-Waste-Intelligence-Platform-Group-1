from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.services.notification_service import NotificationService


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# ==========================================
# Get All Notifications
# ==========================================

@router.get("/")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return NotificationService.get_user_notifications(
        db=db,
        user_id=current_user.id
    )


# ==========================================
# Get Unread Notifications
# ==========================================

@router.get("/unread")
def get_unread_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return NotificationService.get_unread_notifications(
        db=db,
        user_id=current_user.id
    )


# ==========================================
# Create Notification
# ==========================================

@router.post("/")
def create_notification(
    title: str,
    message: str,
    notification_type: str,
    priority: str = "medium",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notification = NotificationService.create_notification(
        db=db,
        user_id=current_user.id,
        title=title,
        message=message,
        notification_type=notification_type,
        priority=priority
    )

    return notification


# ==========================================
# Mark Notification as Read
# ==========================================

@router.put("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notification = NotificationService.mark_as_read(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id
    )

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found."
        )

    return notification


# ==========================================
# Mark All Notifications as Read
# ==========================================

@router.put("/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    count = NotificationService.mark_all_as_read(
        db=db,
        user_id=current_user.id
    )

    return {
        "message": "All notifications marked as read.",
        "updated_count": count
    }


# ==========================================
# Check Waste Collection Alerts
# ==========================================

@router.post("/check-collection")
def check_collection_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notifications = (
        NotificationService.check_waste_collection_alerts(
            db=db,
            user_id=current_user.id
        )
    )

    return {
        "message": "Waste collection alerts checked.",
        "created_count": len(notifications),
        "notifications": notifications
    }

# ==========================================
# Check Sustainability Milestone
# ==========================================

@router.post("/check-sustainability")
def check_sustainability_milestone(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notification = (
        NotificationService.check_sustainability_milestone(
            db=db,
            user_id=current_user.id
        )
    )

    if notification is None:

        return {
            "message": (
                "Sustainability milestone "
                "has not been reached yet."
            ),
            "milestone_reached": False
        }

    return {
        "message": (
            "Sustainability milestone "
            "checked successfully."
        ),
        "milestone_reached": True,
        "notification": notification
    }

# ==========================================
# Check Inventory Warnings
# ==========================================

@router.post("/check-inventory-warnings")
def check_inventory_warnings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notifications = (
        NotificationService.check_inventory_warnings(
            db=db,
            user_id=current_user.id
        )
    )

    return {
        "message": "Inventory warnings checked.",
        "created_count": len(notifications),
        "notifications": notifications
    }

# ==========================================
# Platform Announcement
# ==========================================

@router.post("/announcement")
def create_platform_announcement(
    title: str,
    message: str,
    priority: str = "medium",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # ------------------------------------------
    # Admin-only access
    # ------------------------------------------

    if current_user.role != "admin":

        raise HTTPException(
            status_code=403,
            detail="Only administrators can create platform announcements."
        )

    # ------------------------------------------
    # Get active users
    # ------------------------------------------

    users = (
        db.query(User)
        .filter(
            User.is_active == True
        )
        .all()
    )

    created_notifications = []

    # ------------------------------------------
    # Create notification for each user
    # ------------------------------------------

    for user in users:

        notification = (
            NotificationService.create_notification(

                db=db,

                user_id=user.id,

                title=title,

                message=message,

                notification_type=(
                    "platform_announcement"
                ),

                priority=priority
            )
        )

        created_notifications.append(
            notification
        )

    return {
        "message": "Platform announcement sent successfully.",
        "created_count": len(created_notifications)
    }