from datetime import datetime
from typing import Iterable, Optional

from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.user import User


class NotificationService:
    """
    Central notification service.

    Every event can notify:
    1. All administrators
    2. The user who performed the action
    3. Related operational roles

    Duplicate recipients are automatically removed.
    """

    # =========================================================
    # ROLE NORMALIZATION
    # =========================================================

    @staticmethod
    def normalize_role(role: Optional[str]) -> str:
        if not role:
            return ""

        return (
            str(role)
            .strip()
            .lower()
            .replace("-", "_")
            .replace(" ", "_")
        )

    # =========================================================
    # FIND RECIPIENTS
    # =========================================================

    @staticmethod
    def get_recipients(
        db: Session,
        actor: Optional[User],
        related_roles: Iterable[str],
    ) -> list[User]:

        allowed_roles = {
            "administrator",
            "admin",
        }

        for role in related_roles:
            normalized = (
                NotificationService.normalize_role(role)
            )

            if normalized:
                allowed_roles.add(normalized)

        users = db.query(User).all()

        recipients: dict[int, User] = {}

        for user in users:

            role = (
                NotificationService.normalize_role(
                    user.role
                )
            )

            # Administrator always receives it.
            if role in {
                "administrator",
                "admin",
            }:
                recipients[user.id] = user
                continue

            # Related role receives it.
            if role in allowed_roles:
                recipients[user.id] = user

        # Actor ALWAYS receives their own notification.
        if actor and actor.id:
            recipients[actor.id] = actor

        return list(recipients.values())

    # =========================================================
    # CREATE NOTIFICATIONS
    # =========================================================

    @staticmethod
    def notify(
        db: Session,
        *,
        actor: Optional[User],
        related_roles: Iterable[str],
        category: str,
        action: str,
        title: str,
        actor_message: str,
        recipient_message: str,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
    ) -> list[Notification]:

        recipients = NotificationService.get_recipients(
            db=db,
            actor=actor,
            related_roles=related_roles,
        )

        actor_id = actor.id if actor else None

        notifications: list[Notification] = []

        try:

            for recipient in recipients:

                if actor and recipient.id == actor.id:
                    message = actor_message
                else:
                    message = recipient_message

                notification = Notification(
                    recipient_id=recipient.id,
                    actor_id=actor_id,
                    category=category,
                    notification_type=action,
                    title=title,
                    message=message,
                    entity_type=entity_type,
                    entity_id=entity_id,
                    is_read=False,
                    created_at=datetime.utcnow(),
                )

                db.add(notification)

                notifications.append(
                    notification
                )

            db.commit()

            for notification in notifications:
                db.refresh(notification)

            return notifications

        except Exception:
            db.rollback()
            raise

    # =========================================================
    # INVENTORY CREATED
    # =========================================================

    @staticmethod
    def inventory_created(
        db: Session,
        inventory,
        actor: User,
    ):

        actor_name = (
            actor.full_name
            or actor.email
            or "A user"
        )

        return NotificationService.notify(
            db=db,
            actor=actor,

            related_roles=[
                "manager",
                "manufacturer",
                "recycler",
            ],

            category="Inventory",
            action="created",

            title="New Inventory Added",

            actor_message=(
                f"You added inventory batch "
                f"{inventory.batch_id}."
            ),

            recipient_message=(
                f"{actor_name} added inventory batch "
                f"{inventory.batch_id}."
            ),

            entity_type="inventory",

            # Inventory model uses `id`.
            entity_id=inventory.id,
        )

    # =========================================================
    # INVENTORY UPDATED
    # =========================================================

    @staticmethod
    def inventory_updated(
        db: Session,
        inventory,
        actor: User,
    ):

        actor_name = (
            actor.full_name
            or actor.email
            or "A user"
        )

        return NotificationService.notify(
            db=db,
            actor=actor,

            related_roles=[
                "manager",
                "manufacturer",
                "recycler",
            ],

            category="Inventory",
            action="updated",

            title="Inventory Updated",

            actor_message=(
                f"You updated inventory batch "
                f"{inventory.batch_id}."
            ),

            recipient_message=(
                f"{actor_name} updated inventory batch "
                f"{inventory.batch_id}."
            ),

            entity_type="inventory",
            entity_id=inventory.id,
        )

    # =========================================================
    # INVENTORY DELETED
    # =========================================================

    @staticmethod
    def inventory_deleted(
        db: Session,
        batch_id: str,
        inventory_id: int,
        actor: User,
    ):

        actor_name = (
            actor.full_name
            or actor.email
            or "A user"
        )

        return NotificationService.notify(
            db=db,
            actor=actor,

            related_roles=[
                "manager",
                "manufacturer",
                "recycler",
            ],

            category="Inventory",
            action="deleted",

            title="Inventory Deleted",

            actor_message=(
                f"You deleted inventory batch "
                f"{batch_id}."
            ),

            recipient_message=(
                f"{actor_name} deleted inventory batch "
                f"{batch_id}."
            ),

            entity_type="inventory",
            entity_id=inventory_id,
        )

    # =========================================================
    # GET USER NOTIFICATIONS
    # =========================================================

    @staticmethod
    def get_for_user(
        db: Session,
        user_id: int,
        category: Optional[str] = None,
        unread_only: bool = False,
    ):

        query = (
            db.query(Notification)
            .filter(
                Notification.recipient_id == user_id
            )
        )

        if (
            category
            and category.strip().lower() != "all"
        ):
            query = query.filter(
                Notification.category == category
            )

        if unread_only:
            query = query.filter(
                Notification.is_read.is_(False)
            )

        return (
            query
            .order_by(
                Notification.created_at.desc()
            )
            .all()
        )

    # =========================================================
    # STATISTICS
    # =========================================================

    @staticmethod
    def stats(
        db: Session,
        user_id: int,
    ) -> dict:

        query = (
            db.query(Notification)
            .filter(
                Notification.recipient_id == user_id
            )
        )

        total = query.count()

        unread = (
            query
            .filter(
                Notification.is_read.is_(False)
            )
            .count()
        )

        today_start = datetime.utcnow().replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        today = (
            query
            .filter(
                Notification.created_at >= today_start
            )
            .count()
        )

        alerts = (
            query
            .filter(
                Notification.notification_type.in_(
                    [
                        "alert",
                        "warning",
                        "error",
                    ]
                )
            )
            .count()
        )

        return {
            "total": total,
            "unread": unread,
            "today": today,
            "alerts": alerts,
        }

    # =========================================================
    # MARK ONE READ
    # =========================================================

    @staticmethod
    def mark_read(
        db: Session,
        notification_id: int,
        user_id: int,
    ):

        notification = (
            db.query(Notification)
            .filter(
                Notification.id == notification_id,
                Notification.recipient_id == user_id,
            )
            .first()
        )

        if notification is None:
            return None

        notification.is_read = True

        db.commit()
        db.refresh(notification)

        return notification

    # =========================================================
    # MARK ALL READ
    # =========================================================

    @staticmethod
    def mark_all_read(
        db: Session,
        user_id: int,
    ):

        count = (
            db.query(Notification)
            .filter(
                Notification.recipient_id == user_id,
                Notification.is_read.is_(False),
            )
            .update(
                {
                    Notification.is_read: True
                },
                synchronize_session=False,
            )
        )

        db.commit()

        return {
            "message": "All notifications marked as read.",
            "updated": count,
        }

    # =========================================================
    # DELETE
    # =========================================================

    @staticmethod
    def delete(
        db: Session,
        notification_id: int,
        user_id: int,
    ):

        notification = (
            db.query(Notification)
            .filter(
                Notification.id == notification_id,
                Notification.recipient_id == user_id,
            )
            .first()
        )

        if notification is None:
            return False

        db.delete(notification)

        db.commit()

        return True