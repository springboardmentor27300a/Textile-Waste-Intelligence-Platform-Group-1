from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from passlib.context import CryptContext
from jose import JWTError, jwt

from sqlalchemy.orm import Session

from backend.config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

from backend.database import get_db
from backend.models import User


# ==================================================
# Password Hashing
# ==================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ==================================================
# Hash Password
# ==================================================

def hash_password(password: str):
    return pwd_context.hash(password)


# ==================================================
# Verify Password
# ==================================================

def verify_password(
    plain_password: str,
    hashed_password: str
):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# ==================================================
# Create JWT Access Token
# ==================================================

def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


# ==================================================
# JWT Authentication
# ==================================================

security = HTTPBearer()


# ==================================================
# Get Current Logged-in User
# ==================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={
            "WWW-Authenticate": "Bearer"
        }
    )

    # Get JWT token from Authorization header
    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")

        if not email:
            raise credentials_exception

    except JWTError:

        raise credentials_exception


    # Find user in Neon PostgreSQL
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


    if not user:

        raise credentials_exception


    return user