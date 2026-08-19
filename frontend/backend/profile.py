from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User
from backend.schemas import ProfileUpdate, UserResponse
from backend.security import get_current_user


router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


# ==================================================
# Get Current Profile
# ==================================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_profile(
    current_user: User = Depends(get_current_user)
):

    return current_user


# ==================================================
# Update Current Profile
# ==================================================

@router.put(
    "/update",
    response_model=UserResponse
)
def update_profile(
    profile: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # Check whether the new email belongs to another user
    # --------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(
            User.email == profile.email,
            User.id != current_user.id
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered by another user"
        )


    # --------------------------------------------------
    # Update profile fields
    # --------------------------------------------------

    current_user.full_name = profile.full_name

    current_user.email = profile.email

    current_user.phone = profile.phone

    current_user.company = profile.company

    current_user.location = profile.location


    # --------------------------------------------------
    # Save to Neon PostgreSQL
    # --------------------------------------------------

    db.commit()

    db.refresh(current_user)


    return current_user