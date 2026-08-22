from typing import Iterable, Optional
from fastapi import Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .database import get_db
from .security import decode_access_token
from . import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(
    token_header: Optional[str] = Depends(oauth2_scheme),
    token_query: Optional[str] = Query(default=None, alias="token"),
    db: Session = Depends(get_db)
) -> models.User:
    token = token_header or token_query
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_error
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise credentials_error
    user = db.query(models.User).filter(models.User.id == payload["sub"]).first()
    if not user or not user.is_active:
        raise credentials_error
    return user



def require_roles(*roles: Iterable[models.UserRole]):
    def dependency(current_user: models.User = Depends(get_current_user)) -> models.User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )
        return current_user
    return dependency
