# from datetime import datetime, timezone
from datetime import date, datetime, timezone

# from sqlalchemy import func, select
from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.orm import Session

from app.models import (
    BatchStatusHistory,
    Facility,
    WasteBatch,
)
from app.schemas.waste_batch import (
    BatchStatusUpdate,
    WasteBatchCreate,
    WasteBatchUpdate,
)


# ---------------------------------------------------------
# Exceptions
# ---------------------------------------------------------

class OrganizationRequiredError(Exception):
    pass


class FacilityNotFoundError(Exception):
    pass


class WasteBatchNotFoundError(Exception):
    pass


class InvalidStatusTransitionError(Exception):
    pass


# ---------------------------------------------------------
# Batch lifecycle
# ---------------------------------------------------------

STATUS_TRANSITIONS = {
    "REGISTERED": {
        "IMAGE_UPLOADED",
        "REJECTED",
    },
    "IMAGE_UPLOADED": {
        "ANALYSIS_PENDING",
        "REJECTED",
    },
    "ANALYSIS_PENDING": {
        "ANALYZED",
        "REJECTED",
    },
    "ANALYZED": {
        "REVIEWED",
        "REJECTED",
    },
    "REVIEWED": {
        "RECOMMENDATION_READY",
        "REJECTED",
    },
    "RECOMMENDATION_READY": {
        "COMPLETED",
        "REJECTED",
    },
    "COMPLETED": set(),
    "REJECTED": set(),
}


# ---------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------

def _require_organization(current_user) -> int:
    if current_user.organization_id is None:
        raise OrganizationRequiredError(
            "Complete organization onboarding before managing waste batches."
        )

    return current_user.organization_id


def _validate_facility(
    db: Session,
    facility_id: int | None,
    organization_id: int,
) -> Facility | None:

    if facility_id is None:
        return None

    facility = db.scalar(
        select(Facility).where(
            Facility.id == facility_id,
            Facility.organization_id == organization_id,
            Facility.is_active.is_(True),
        )
    )

    if facility is None:
        raise FacilityNotFoundError("Facility not found.")

    return facility


def _get_owned_batch(
    db: Session,
    batch_id: int,
    organization_id: int,
) -> WasteBatch:

    batch = db.scalar(
        select(WasteBatch).where(
            WasteBatch.id == batch_id,
            WasteBatch.organization_id == organization_id,
        )
    )

    if batch is None:
        raise WasteBatchNotFoundError("Waste batch not found.")

    return batch


# ---------------------------------------------------------
# Batch code generation
# ---------------------------------------------------------

def generate_batch_code(db: Session) -> str:
    year = datetime.now(timezone.utc).year
    prefix = f"TW-{year}-"

    latest_code = db.scalar(
        select(func.max(WasteBatch.batch_code)).where(
            WasteBatch.batch_code.like(f"{prefix}%")
        )
    )

    if latest_code:
        try:
            sequence = int(latest_code.rsplit("-", 1)[1]) + 1
        except (ValueError, IndexError):
            sequence = 1
    else:
        sequence = 1

    return f"{prefix}{sequence:06d}"


# ---------------------------------------------------------
# Create
# ---------------------------------------------------------

def create_waste_batch(
    db: Session,
    current_user,
    data: WasteBatchCreate,
) -> WasteBatch:

    organization_id = _require_organization(current_user)

    _validate_facility(
        db,
        data.facility_id,
        organization_id,
    )

    batch = WasteBatch(
        batch_code=generate_batch_code(db),
        organization_id=organization_id,
        facility_id=data.facility_id,
        created_by=current_user.id,
        source=data.source,
        quantity_kg=data.quantity_kg,
        declared_material=data.declared_material,
        color=data.color,
        condition=data.condition,
        collection_date=data.collection_date,
        processing_status="REGISTERED",
        notes=data.notes,
        is_archived=False,
    )

    db.add(batch)
    db.flush()

    history = BatchStatusHistory(
        batch_id=batch.id,
        changed_by=current_user.id,
        old_status=None,
        new_status="REGISTERED",
        remarks="Waste batch registered.",
    )

    db.add(history)

    db.commit()
    db.refresh(batch)

    return batch


# ---------------------------------------------------------
# Read
# ---------------------------------------------------------

def get_waste_batch(
    db: Session,
    current_user,
    batch_id: int,
) -> WasteBatch:

    organization_id = _require_organization(current_user)

    return _get_owned_batch(
        db,
        batch_id,
        organization_id,
    )


# def list_waste_batches(
#     db: Session,
#     current_user,
# ) -> list[WasteBatch]:

#     organization_id = _require_organization(current_user)

#     statement = (
#         select(WasteBatch)
#         .where(
#             WasteBatch.organization_id == organization_id,
#         )
#         .order_by(WasteBatch.created_at.desc())
#     )

#     return list(db.scalars(statement).all())

def list_waste_batches(
    db: Session,
    current_user,
    *,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    status: str | None = None,
    facility_id: int | None = None,
    source: str | None = None,
    material: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    is_archived: bool = False,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> dict:

    organization_id = _require_organization(current_user)

    filters = [
        WasteBatch.organization_id == organization_id,
        WasteBatch.is_archived.is_(is_archived),
    ]

    # Search across useful inventory fields
    if search and search.strip():
        term = f"%{search.strip()}%"

        filters.append(
            or_(
                WasteBatch.batch_code.ilike(term),
                WasteBatch.source.ilike(term),
                WasteBatch.declared_material.ilike(term),
                WasteBatch.color.ilike(term),
                WasteBatch.condition.ilike(term),
                cast(WasteBatch.quantity_kg, String).ilike(term),
            )
        )

    if status:
        filters.append(
            WasteBatch.processing_status == status.strip().upper()
        )

    if facility_id is not None:
        filters.append(
            WasteBatch.facility_id == facility_id
        )

    if source:
        filters.append(
            WasteBatch.source.ilike(source.strip())
        )

    if material:
        filters.append(
            WasteBatch.declared_material.ilike(
                f"%{material.strip()}%"
            )
        )

    if date_from is not None:
        filters.append(
            WasteBatch.collection_date >= date_from
        )

    if date_to is not None:
        filters.append(
            WasteBatch.collection_date <= date_to
        )

    # Count before pagination
    count_statement = (
        select(func.count())
        .select_from(WasteBatch)
        .where(*filters)
    )

    total_items = db.scalar(count_statement) or 0

    # Whitelist sortable fields.
    sort_columns = {
        "created_at": WasteBatch.created_at,
        "collection_date": WasteBatch.collection_date,
        "quantity_kg": WasteBatch.quantity_kg,
        "batch_code": WasteBatch.batch_code,
        "status": WasteBatch.processing_status,
        "material": WasteBatch.declared_material,
    }

    sort_column = sort_columns.get(
        sort_by,
        WasteBatch.created_at,
    )

    if sort_order.lower() == "asc":
        ordering = sort_column.asc()
    else:
        ordering = sort_column.desc()

    offset = (page - 1) * page_size

    statement = (
        select(WasteBatch)
        .where(*filters)
        .order_by(ordering, WasteBatch.id.desc())
        .offset(offset)
        .limit(page_size)
    )

    items = list(
        db.scalars(statement).all()
    )

    total_pages = (
        (total_items + page_size - 1) // page_size
        if total_items > 0
        else 0
    )

    return {
        "items": items,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
        },
    }


# ---------------------------------------------------------
# Update
# ---------------------------------------------------------

def update_waste_batch(
    db: Session,
    current_user,
    batch_id: int,
    data: WasteBatchUpdate,
) -> WasteBatch:

    organization_id = _require_organization(current_user)

    batch = _get_owned_batch(
        db,
        batch_id,
        organization_id,
    )

    updates = data.model_dump(exclude_unset=True)

    if "facility_id" in updates:
        _validate_facility(
            db,
            updates["facility_id"],
            organization_id,
        )

    for field, value in updates.items():
        setattr(batch, field, value)

    db.commit()
    db.refresh(batch)

    return batch


# ---------------------------------------------------------
# Status management
# ---------------------------------------------------------

def update_batch_status(
    db: Session,
    current_user,
    batch_id: int,
    data: BatchStatusUpdate,
) -> WasteBatch:

    organization_id = _require_organization(current_user)

    batch = _get_owned_batch(
        db,
        batch_id,
        organization_id,
    )

    old_status = batch.processing_status
    new_status = data.status.strip().upper()

    if new_status not in STATUS_TRANSITIONS:
        raise InvalidStatusTransitionError(
            f"Unknown batch status: {new_status}."
        )

    allowed_next_statuses = STATUS_TRANSITIONS.get(
        old_status,
        set(),
    )

    if new_status not in allowed_next_statuses:
        raise InvalidStatusTransitionError(
            f"Cannot change batch status from "
            f"{old_status} to {new_status}."
        )

    batch.processing_status = new_status

    history = BatchStatusHistory(
        batch_id=batch.id,
        changed_by=current_user.id,
        old_status=old_status,
        new_status=new_status,
        remarks=data.remarks,
    )

    db.add(history)

    db.commit()
    db.refresh(batch)

    return batch


def get_batch_status_history(
    db: Session,
    current_user,
    batch_id: int,
) -> list[BatchStatusHistory]:

    organization_id = _require_organization(current_user)

    batch = _get_owned_batch(
        db,
        batch_id,
        organization_id,
    )

    statement = (
        select(BatchStatusHistory)
        .where(
            BatchStatusHistory.batch_id == batch.id,
        )
        .order_by(
            BatchStatusHistory.changed_at.asc(),
            BatchStatusHistory.id.asc(),
        )
    )

    return list(db.scalars(statement).all())