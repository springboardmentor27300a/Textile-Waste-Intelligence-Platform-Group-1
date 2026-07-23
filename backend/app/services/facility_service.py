from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Facility, User
from app.schemas.facility import FacilityCreate, FacilityUpdate


class OrganizationRequiredError(Exception):
    pass


class FacilityNotFoundError(Exception):
    pass


class FacilityCodeAlreadyExistsError(Exception):
    pass


def _require_organization(user: User) -> int:
    if user.organization_id is None:
        raise OrganizationRequiredError(
            "Complete organization onboarding before managing facilities."
        )

    return user.organization_id


def create_facility_for_user(
    db: Session,
    user: User,
    data: FacilityCreate,
) -> Facility:
    organization_id = _require_organization(user)

    existing = db.scalar(
        select(Facility).where(
            Facility.facility_code == data.facility_code
        )
    )

    if existing is not None:
        raise FacilityCodeAlreadyExistsError(
            "Facility code already exists."
        )

    facility = Facility(
        organization_id=organization_id,
        **data.model_dump(),
    )

    try:
        db.add(facility)
        db.commit()
        db.refresh(facility)

    except IntegrityError as exc:
        db.rollback()
        raise FacilityCodeAlreadyExistsError(
            "Facility code already exists."
        ) from exc

    return facility


def get_user_facilities(
    db: Session,
    user: User,
) -> list[Facility]:
    organization_id = _require_organization(user)

    statement = (
        select(Facility)
        .where(
            Facility.organization_id == organization_id
        )
        .order_by(Facility.created_at.desc())
    )

    return list(db.scalars(statement).all())


def get_user_facility(
    db: Session,
    user: User,
    facility_id: int,
) -> Facility:
    organization_id = _require_organization(user)

    facility = db.scalar(
        select(Facility).where(
            Facility.id == facility_id,
            Facility.organization_id == organization_id,
        )
    )

    if facility is None:
        raise FacilityNotFoundError(
            "Facility not found."
        )

    return facility


def update_user_facility(
    db: Session,
    user: User,
    facility_id: int,
    data: FacilityUpdate,
) -> Facility:
    facility = get_user_facility(
        db=db,
        user=user,
        facility_id=facility_id,
    )

    updates = data.model_dump(
        exclude_unset=True
    )

    for field, value in updates.items():
        setattr(facility, field, value)

    db.commit()
    db.refresh(facility)

    return facility