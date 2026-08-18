from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session


import os

from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends

from google.oauth2 import id_token
from google.auth.transport import requests

from app.database import get_db
from app.models import User
from app.schemas import (
    UserRegister,
    UserLogin,
    GoogleLogin,
    GoogleRegister,
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from app.auth import (
    hash_password,
    verify_password,
    create_access_token
)



router = APIRouter()


@router.post("/register")
def register_user(user: UserRegister, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = hash_password(user.password)

    # Create user object
    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hashed_password,
        role=user.role,
        organization=user.organization
    )

    # Save into database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully"
    }


@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):

    # Find user by email
    db_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if db_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    if not db_user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Your account has been deactivated. Please contact an administrator."
        )
    # Verify password
    if not verify_password(
        user.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Generate JWT Token
    access_token = create_access_token(
        data={
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "full_name": db_user.full_name,
            "email": db_user.email,
            "role": db_user.role,
            "organization": db_user.organization
}
    }

@router.post("/token")
def login_for_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    db_user = (
        db.query(User)
        .filter(User.email == form_data.username)
        .first()
    )

    if db_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    if not db_user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Your account has been deactivated. Please contact an administrator."
        )

    if not verify_password(
        form_data.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/google")
def google_auth(
    google_user: GoogleLogin,
    db: Session = Depends(get_db)
):
    try:

        # Verify Google Token
        idinfo = id_token.verify_oauth2_token(
            google_user.token,
            requests.Request(),
            os.getenv("GOOGLE_CLIENT_ID")
        )

        email = idinfo["email"]
        full_name = idinfo.get("name", "")

        # Check if user already exists
        db_user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        # Existing User → Login
        if db_user:

            if not db_user.is_active:
                raise HTTPException(
                    status_code=403,
                    detail="Your account has been deactivated. Please contact an administrator."
                )

            access_token = create_access_token(
                data={
                    "sub": db_user.email,
                    "role": db_user.role
                }
            )

            return {
                "new_user": False,
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": db_user.id,
                    "full_name": db_user.full_name,
                    "email": db_user.email,
                    "role": db_user.role,
                    "organization": db_user.organization
                }
            }

        # New User → Don't create yet
        return {
            "new_user": True,
            "full_name": full_name,
            "email": email
        }

    except Exception as e:

        raise HTTPException(
            status_code=401,
            detail=f"Google authentication failed: {str(e)}"
        )

@router.post("/google/register")
def google_register(
    google_user: GoogleRegister,
    db: Session = Depends(get_db)
):

    try:

        # Verify Google Token
        idinfo = id_token.verify_oauth2_token(
            google_user.token,
            requests.Request(),
            os.getenv("GOOGLE_CLIENT_ID")
        )

        email = idinfo["email"]
        full_name = idinfo.get("name", "")

        # Check if user already exists
        existing_user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="User already exists."
            )

        # Create New User
        new_user = User(
            full_name=full_name,
            email=email,
            password=None,
            role=google_user.role,
            organization=google_user.organization,
            auth_provider="google"
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Generate JWT
        access_token = create_access_token(
            data={
                "sub": new_user.email,
                "role": new_user.role
            }
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": new_user.id,
                "full_name": new_user.full_name,
                "email": new_user.email,
                "role": new_user.role,
                "organization": new_user.organization
            }
        }

    except HTTPException:
        raise

    except Exception as e:
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"Google Registration Failed: {str(e)}"
        )

# ==================================================
# Forgot Password
# ==================================================

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if user is None:

        raise HTTPException(
            status_code=404,
            detail="Email not registered."
        )

    return {
        "message": "Email verified successfully."
    }


# ==================================================
# Reset Password
# ==================================================

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    user.password = hash_password(
        request.new_password
    )

    db.commit()

    return {
        "message": "Password updated successfully."
    }