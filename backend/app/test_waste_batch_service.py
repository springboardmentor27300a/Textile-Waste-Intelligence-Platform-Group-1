from datetime import date

from sqlalchemy import select

from app.database import SessionLocal
from app.models import Facility, User, WasteBatch
from app.schemas.waste_batch import (
    BatchStatusUpdate,
    WasteBatchCreate,
    WasteBatchUpdate,
)
from app.services.waste_batch_service import (
    InvalidStatusTransitionError,
    create_waste_batch,
    get_batch_status_history,
    update_batch_status,
    update_waste_batch,
)


def run_test():
    db = SessionLocal()

    try:
        user = db.scalar(
            select(User).where(
                User.email == "arpan@example.com"
            )
        )

        if user is None:
            raise RuntimeError(
                "Primary test user arpan@example.com was not found."
            )

        if user.organization_id is None:
            raise RuntimeError(
                "Primary test user has no organization."
            )

        facility = db.scalar(
            select(Facility).where(
                Facility.organization_id == user.organization_id,
                Facility.is_active.is_(True),
            )
        )

        if facility is None:
            raise RuntimeError(
                "No active facility exists for the primary organization."
            )

        data = WasteBatchCreate(
            facility_id=facility.id,
            source="CUTTING_WASTE",
            quantity_kg="125.50",
            declared_material="Cotton",
            color="Blue",
            condition="CLEAN",
            collection_date=date.today(),
            notes="Temporary service integration test.",
        )

        batch = create_waste_batch(
            db,
            user,
            data,
        )

        batch_id = batch.id
        batch_code = batch.batch_code

        print("=" * 48)
        print("WASTE BATCH SERVICE TEST")
        print("=" * 48)

        print("Created batch :", batch_code)
        print("Status        :", batch.processing_status)
        print("Quantity      :", batch.quantity_kg)
        print("Facility ID   :", batch.facility_id)

        history = get_batch_status_history(
            db,
            user,
            batch_id,
        )

        assert len(history) == 1
        assert history[0].old_status is None
        assert history[0].new_status == "REGISTERED"

        print("Initial history: PASS")

        updated = update_waste_batch(
            db,
            user,
            batch_id,
            WasteBatchUpdate(
                quantity_kg="150.25",
                notes="Updated during service test.",
            ),
        )

        assert float(updated.quantity_kg) == 150.25

        print("Batch update   : PASS")

        updated = update_batch_status(
            db,
            user,
            batch_id,
            BatchStatusUpdate(
                status="IMAGE_UPLOADED",
                remarks="Image received during integration test.",
            ),
        )

        assert updated.processing_status == "IMAGE_UPLOADED"

        print("Valid transition: PASS")

        try:
            update_batch_status(
                db,
                user,
                batch_id,
                BatchStatusUpdate(
                    status="COMPLETED",
                    remarks="This transition must fail.",
                ),
            )

            raise AssertionError(
                "Invalid status transition was accepted."
            )

        except InvalidStatusTransitionError:
            db.rollback()
            print("Invalid transition: PASS")

        # Reload after rollback.
        batch = db.get(WasteBatch, batch_id)

        print("=" * 48)
        print("SERVICE FOUNDATION TEST PASSED")
        print("=" * 48)
        print("Batch code     :", batch_code)
        print("=" * 48)

    finally:
        db.close()


if __name__ == "__main__":
    run_test()