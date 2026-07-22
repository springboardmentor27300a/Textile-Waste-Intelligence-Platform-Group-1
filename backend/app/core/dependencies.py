from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database import get_db
from app.models import User


bearer_scheme = HTTPBearer(
    auto_error=False
)


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
    db: Session = Depends(get_db),
) -> User:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise credentials_exception

    if credentials.scheme.lower() != "bearer":
        raise credentials_exception

    try:
        payload = decode_access_token(
            credentials.credentials
        )

        if payload.get("type") != "access":
            raise credentials_exception

        subject = payload.get("sub")

        if subject is None:
            raise credentials_exception

        user_id = int(subject)

    except (
        jwt.InvalidTokenError,
        ValueError,
        TypeError,
    ) as exc:
        raise credentials_exception from exc

    user = db.get(
        User,
        user_id,
    )

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    return user


CurrentUser = Annotated[
    User,
    Depends(get_current_user),
]


from collections.abc import Callable


def require_roles(
    *allowed_roles: str,
) -> Callable:
    """
    Create a reusable dependency that permits only
    users whose current database role is allowed.
    """

    def role_checker(
        current_user: CurrentUser,
    ) -> User:

        if current_user.role is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User role is not configured.",
            )

        if current_user.role.name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )

        return current_user

    return role_checker

AdminUser = Annotated[
    User,
    Depends(
        require_roles("ADMIN")
    ),
]


OperatorUser = Annotated[
    User,
    Depends(
        require_roles("OPERATOR")
    ),
]


ManufacturerUser = Annotated[
    User,
    Depends(
        require_roles("MANUFACTURER")
    ),
]


SustainabilityManagerUser = Annotated[
    User,
    Depends(
        require_roles("SUSTAINABILITY_MANAGER")
    ),
]

WasteOperationsUser = Annotated[
    User,
    Depends(
        require_roles(
            "ADMIN",
            "OPERATOR",
            "MANUFACTURER",
        )
    ),
]


AnalyticsUser = Annotated[
    User,
    Depends(
        require_roles(
            "ADMIN",
            "SUSTAINABILITY_MANAGER",
        )
    ),
]


ManagementUser = Annotated[
    User,
    Depends(
        require_roles(
            "ADMIN",
            "SUSTAINABILITY_MANAGER",
        )
    ),
]