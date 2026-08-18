from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import ProfileUpdate

router = APIRouter()


# ===================================
# Get Current User Profile
# ===================================
@router.get("/me")
def get_profile(
    current_user: User = Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "organization": current_user.organization,
        "auth_provider": current_user.auth_provider
    }


# ===================================
# Update Profile
# ===================================
@router.put("/update")
def update_profile(
    profile: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    current_user.full_name = profile.full_name
    current_user.organization = profile.organization

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role,
            "organization": current_user.organization,
            "auth_provider": current_user.auth_provider
        }
    }