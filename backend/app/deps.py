from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models import Role, User
from .security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sign in again — that session is no longer valid.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if not payload or not payload.get("sub"):
        raise credentials_error
    user = db.query(User).filter(User.email == payload["sub"]).first()
    if not user or not user.is_active:
        raise credentials_error
    return user


def require_roles(*roles: Role):
    allowed = set(roles)

    def guard(user: User = Depends(current_user)) -> User:
        if user.role is not Role.admin and user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your role doesn't have access to this area.",
            )
        return user

    return guard
