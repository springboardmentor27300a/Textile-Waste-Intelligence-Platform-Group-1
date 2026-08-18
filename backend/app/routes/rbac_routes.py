from fastapi import APIRouter, Depends
from app.dependencies import (
    get_current_user,
    RoleChecker
)
from app.models import User

router = APIRouter()

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role
    }


# =====================================================
# Administrator Only
# =====================================================
@router.get("/admin")
def admin_dashboard(
    current_user: User = Depends(
        RoleChecker(["admin"])
    )
):
    return {
        "message": "Welcome Administrator",
        "user": current_user.full_name
    }


# =====================================================
# Manufacturer Only
# =====================================================
@router.get("/manufacturer")
def manufacturer_dashboard(
    current_user: User = Depends(
        RoleChecker(["manufacturer"])
    )
):
    return {
        "message": "Welcome Manufacturer",
        "user": current_user.full_name
    }


# =====================================================
# Sustainability Manager Only
# =====================================================
@router.get("/sustainability")
def sustainability_dashboard(
    current_user: User = Depends(
        RoleChecker(["sustainability_manager"])
    )
):
    return {
        "message": "Welcome Sustainability Manager",
        "user": current_user.full_name
    }


# =====================================================
# Recycling Facility Operator Only
# =====================================================
@router.get("/recycling")
def recycling_dashboard(
    current_user: User = Depends(
        RoleChecker(["recycling_operator"])
    )
):
    return {
        "message": "Welcome Recycling Operator",
        "user": current_user.full_name
    }