from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.core.security import decode_access_token

security = HTTPBearer(auto_error=True)

ROLE_ALIASES = {
    "operator": "manufacturer",
}

VALID_ROLES = {
    "administrator",
    "manager",
    "manufacturer",
    "recycler",
}


def normalize_role(role: str | None) -> str | None:
    if not role:
        return None

    return ROLE_ALIASES.get(role, role)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials

    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token.",
        )

    email = payload.get("sub")

    if not email:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token.",
        )

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found.",
        )

    # Backward compatibility for the old "operator" role.
    # Persist the normalized role so old accounts immediately work.
    normalized = normalize_role(user.role)

    if normalized and normalized != user.role:
        user.role = normalized

        db.commit()
        db.refresh(user)

    if user.role not in VALID_ROLES:
        raise HTTPException(
            status_code=403,
            detail="User role is not configured for this platform.",
        )

    return user


def require_roles(*allowed_roles):
    normalized_allowed = {
        normalize_role(role)
        for role in allowed_roles
    }

    def role_checker(
        current_user: User = Depends(get_current_user),
    ):
        if current_user.role not in normalized_allowed:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to perform this action.",
            )

        return current_user

    return role_checker