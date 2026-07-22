from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models import Role, User
from app.schemas.auth import RegisterRequest


DEFAULT_REGISTRATION_ROLE = "MANUFACTURER"


class EmailAlreadyRegisteredError(Exception):
    """Raised when an account already exists for an email address."""


class DefaultRoleNotFoundError(Exception):
    """Raised when the default registration role is missing."""


def normalize_email(email: str) -> str:
    """
    Normalize an email address before storing or searching.
    """
    return email.strip().lower()


def get_user_by_email(
    db: Session,
    email: str,
) -> User | None:
    """
    Find a user by normalized email address.
    """
    normalized_email = normalize_email(email)

    return db.scalar(
        select(User).where(User.email == normalized_email)
    )


def register_user(
    db: Session,
    registration: RegisterRequest,
) -> User:
    """
    Create a new user using the controlled default role.
    """

    email = normalize_email(str(registration.email))

    existing_user = get_user_by_email(
        db=db,
        email=email,
    )

    if existing_user is not None:
        raise EmailAlreadyRegisteredError(
            "An account with this email already exists."
        )

    role = db.scalar(
        select(Role).where(
            Role.name == DEFAULT_REGISTRATION_ROLE
        )
    )

    if role is None:
        raise DefaultRoleNotFoundError(
            f"Required role '{DEFAULT_REGISTRATION_ROLE}' "
            "does not exist."
        )

    user = User(
        organization_id=None,
        role_id=role.id,
        full_name=registration.full_name.strip(),
        email=email,
        password_hash=hash_password(
            registration.password
        ),
        phone=(
            registration.phone.strip()
            if registration.phone
            else None
        ),
        is_active=True,
        is_verified=False,
    )

    db.add(user)

    try:
        db.commit()
        db.refresh(user)

    except Exception:
        db.rollback()
        raise

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User | None:
    """
    Authenticate a user using email and password.
    """

    user = get_user_by_email(
        db=db,
        email=email,
    )

    if user is None:
        return None

    if not user.is_active:
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    user.last_login_at = datetime.now(timezone.utc)

    try:
        db.commit()
        db.refresh(user)

    except Exception:
        db.rollback()
        raise

    return user