from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import (
    Notification,
    TextileInventory,
    InventorySustainabilityAnalysis
)


class NotificationService:

    # ==========================================
    # Create Notification
    # ==========================================

    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        title: str,
        message: str,
        notification_type: str,
        priority: str = "medium"
    ):

        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            is_read=False
        )

        db.add(notification)
        db.commit()
        db.refresh(notification)

        return notification


    # ==========================================
    # Get User Notifications
    # ==========================================

    @staticmethod
    def get_user_notifications(
        db: Session,
        user_id: int
    ):

        return (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id
            )
            .order_by(
                Notification.created_at.desc()
            )
            .all()
        )


    # ==========================================
    # Get Unread Notifications
    # ==========================================

    @staticmethod
    def get_unread_notifications(
        db: Session,
        user_id: int
    ):

        return (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_read == False
            )
            .order_by(
                Notification.created_at.desc()
            )
            .all()
        )


    # ==========================================
    # Mark Notification as Read
    # ==========================================

    @staticmethod
    def mark_as_read(
        db: Session,
        notification_id: int,
        user_id: int
    ):

        notification = (
            db.query(Notification)
            .filter(
                Notification.id == notification_id,
                Notification.user_id == user_id
            )
            .first()
        )

        if notification:

            notification.is_read = True

            db.commit()
            db.refresh(notification)

        return notification


    # ==========================================
    # Mark All Notifications as Read
    # ==========================================

    @staticmethod
    def mark_all_as_read(
        db: Session,
        user_id: int
    ):

        notifications = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_read == False
            )
            .all()
        )

        for notification in notifications:

            notification.is_read = True

        db.commit()

        return len(notifications)


    # ==========================================
    # Check Waste Collection Alerts
    # ==========================================

    @staticmethod
    def check_waste_collection_alerts(
        db: Session,
        user_id: int
    ):

        today = date.today()

        inventories = (
            db.query(TextileInventory)
            .filter(
                TextileInventory.collection_date <= today
            )
            .all()
        )

        created_notifications = []

        for inventory in inventories:

            # Prevent duplicate notification
            existing = (
                db.query(Notification)
                .filter(
                    Notification.user_id == user_id,
                    Notification.notification_type
                    == "waste_collection"
                )
                .filter(
                    Notification.message.contains(
                        inventory.waste_batch_id
                    )
                )
                .first()
            )

            if existing:
                continue

            notification = (
                NotificationService.create_notification(

                    db=db,

                    user_id=user_id,

                    title="Waste Collection Alert",

                    message=(
                        f"Batch "
                        f"{inventory.waste_batch_id} "
                        f"is due for waste collection. "
                        f"Material: "
                        f"{inventory.fabric_type}, "
                        f"Quantity: "
                        f"{inventory.quantity} kg."
                    ),

                    notification_type=(
                        "waste_collection"
                    ),

                    priority="high"
                )
            )

            created_notifications.append(
                notification
            )

        return created_notifications


    # ==========================================
    # Sustainability Milestone Alert
    # ==========================================

    @staticmethod
    def check_sustainability_milestone(
        db: Session,
        user_id: int
    ):

        total_co2_saved = (
            db.query(
                func.sum(
                    InventorySustainabilityAnalysis.co2_saved
                )
            )
            .scalar()
        ) or 0

        milestone = 500

        if total_co2_saved < milestone:

            return None

        # Prevent duplicate milestone notification
        existing = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.notification_type
                == "sustainability_milestone"
            )
            .filter(
                Notification.message.contains(
                    "500 kg"
                )
            )
            .first()
        )

        if existing:

            return existing

        notification = (
            NotificationService.create_notification(

                db=db,

                user_id=user_id,

                title="Sustainability Milestone Achieved",

                message=(
                    f"The platform has achieved "
                    f"{round(total_co2_saved, 2)} kg "
                    f"of estimated CO₂ savings, "
                    f"reaching the 500 kg "
                    f"sustainability milestone."
                ),

                notification_type=(
                    "sustainability_milestone"
                ),

                priority="medium"
            )
        )

        return notification

    # ==========================================
    # Inventory Warning Alerts
    # ==========================================

    @staticmethod
    def check_inventory_warnings(
        db: Session,
        user_id: int
    ):

        inventories = (
            db.query(TextileInventory)
            .all()
        )

        created_notifications = []

        for inventory in inventories:

            warning_message = None
            priority = "medium"

            # ------------------------------------------
            # Damaged / Poor Condition
            # ------------------------------------------

            condition = (
                inventory.condition or ""
            ).strip().lower()

            if condition in [
                "damaged",
                "poor"
            ]:

                warning_message = (
                    f"Batch {inventory.waste_batch_id} "
                    f"is marked as {inventory.condition}. "
                    f"Immediate assessment is recommended. "
                    f"Material: {inventory.fabric_type}, "
                    f"Quantity: {inventory.quantity} kg."
                )

                priority = "high"

            # ------------------------------------------
            # Large Inventory Quantity
            # ------------------------------------------

            elif inventory.quantity >= 250:

                warning_message = (
                    f"Batch {inventory.waste_batch_id} "
                    f"contains a large quantity of "
                    f"{inventory.quantity} kg. "
                    f"Processing or collection planning "
                    f"is recommended."
                )

                priority = "medium"

            # ------------------------------------------
            # No Warning
            # ------------------------------------------

            if warning_message is None:
                continue

            # ------------------------------------------
            # Prevent Duplicate Warning
            # ------------------------------------------

            existing = (
                db.query(Notification)
                .filter(
                    Notification.user_id == user_id,
                    Notification.notification_type
                    == "inventory_warning"
                )
                .filter(
                    Notification.message.contains(
                        inventory.waste_batch_id
                    )
                )
                .first()
            )

            if existing:
                continue

            notification = (
                NotificationService.create_notification(

                    db=db,

                    user_id=user_id,

                    title="Inventory Warning",

                    message=warning_message,

                    notification_type=(
                        "inventory_warning"
                    ),

                    priority=priority
                )
            )

            created_notifications.append(
                notification
            )

        return created_notifications