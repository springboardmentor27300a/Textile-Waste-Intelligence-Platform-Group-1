from sqlalchemy.orm import Session

from app.models import Organization, User
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
)


class OrganizationAlreadyAssignedError(Exception):
    """Raised when a user already belongs to an organization."""


class OrganizationNotFoundError(Exception):
    """Raised when the user's organization cannot be found."""


def get_user_organization(
    db: Session,
    user: User,
) -> Organization | None:
    """
    Return the organization assigned to the current user.
    """

    if user.organization_id is None:
        return None

    return db.get(
        Organization,
        user.organization_id,
    )


def create_organization_for_user(
    db: Session,
    user: User,
    data: OrganizationCreate,
) -> Organization:
    """
    Create an organization and assign the current user
    to it in the same database transaction.
    """

    if user.organization_id is not None:
        raise OrganizationAlreadyAssignedError(
            "User already belongs to an organization."
        )

    organization = Organization(
        **data.model_dump()
    )

    db.add(organization)

    try:
        db.flush()

        user.organization_id = organization.id

        db.commit()

        db.refresh(organization)
        db.refresh(user)

    except Exception:
        db.rollback()
        raise

    return organization


def update_user_organization(
    db: Session,
    user: User,
    data: OrganizationUpdate,
) -> Organization:
    """
    Update the organization belonging to the current user.
    """

    organization = get_user_organization(
        db=db,
        user=user,
    )

    if organization is None:
        raise OrganizationNotFoundError(
            "Organization not found."
        )

    updates = data.model_dump(
        exclude_unset=True
    )

    for field, value in updates.items():
        setattr(
            organization,
            field,
            value,
        )

    try:
        db.commit()
        db.refresh(organization)

    except Exception:
        db.rollback()
        raise

    return organization