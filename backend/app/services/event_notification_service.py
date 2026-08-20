from app.models.user import User

from app.services.notification_service import (
    NotificationService,
)


class EventNotificationService:

    # =========================================================
    # COLLECTION CREATED
    # =========================================================

    @staticmethod
    def collection_created(
        db,
        collection,
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

            category="Collections",
            action="created",

            title="New Collection Created",

            actor_message=(
                f"You created collection "
                f"{collection.collection_code}."
            ),

            recipient_message=(
                f"{actor_name} created collection "
                f"{collection.collection_code}."
            ),

            entity_type="collection",
            entity_id=collection.id,
        )

    # =========================================================
    # COLLECTION UPDATED
    # =========================================================

    @staticmethod
    def collection_updated(
        db,
        collection,
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

            category="Collections",
            action="updated",

            title="Collection Updated",

            actor_message=(
                f"You updated collection "
                f"{collection.collection_code}."
            ),

            recipient_message=(
                f"{actor_name} updated collection "
                f"{collection.collection_code}."
            ),

            entity_type="collection",
            entity_id=collection.id,
        )

    # =========================================================
    # COLLECTION DELETED
    # =========================================================

    @staticmethod
    def collection_deleted(
        db,
        collection_code: str,
        collection_id: int,
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

            category="Collections",
            action="deleted",

            title="Collection Deleted",

            actor_message=(
                f"You deleted collection "
                f"{collection_code}."
            ),

            recipient_message=(
                f"{actor_name} deleted collection "
                f"{collection_code}."
            ),

            entity_type="collection",
            entity_id=collection_id,
        )

    # =========================================================
    # WASTE SOURCE CREATED
    # =========================================================

    @staticmethod
    def waste_source_created(
        db,
        source,
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

            title="New Waste Source Added",

            actor_message=(
                f"You added waste source "
                f"{source.source_code}."
            ),

            recipient_message=(
                f"{actor_name} added waste source "
                f"{source.source_code}."
            ),

            entity_type="waste_source",
            entity_id=source.id,
        )

    # =========================================================
    # WASTE SOURCE UPDATED
    # =========================================================

    @staticmethod
    def waste_source_updated(
        db,
        source,
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

            title="Waste Source Updated",

            actor_message=(
                f"You updated waste source "
                f"{source.source_code}."
            ),

            recipient_message=(
                f"{actor_name} updated waste source "
                f"{source.source_code}."
            ),

            entity_type="waste_source",
            entity_id=source.id,
        )

    # =========================================================
    # WASTE SOURCE DELETED
    # =========================================================

    @staticmethod
    def waste_source_deleted(
        db,
        source_code: str,
        source_id: int,
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

            title="Waste Source Deleted",

            actor_message=(
                f"You deleted waste source "
                f"{source_code}."
            ),

            recipient_message=(
                f"{actor_name} deleted waste source "
                f"{source_code}."
            ),

            entity_type="waste_source",
            entity_id=source_id,
        )