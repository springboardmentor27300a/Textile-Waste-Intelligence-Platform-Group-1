from fastapi import APIRouter

from app.core.dependencies import (
    AdminUser,
    AnalyticsUser,
    ManufacturerUser,
    WasteOperationsUser,
)


router = APIRouter(
    prefix="/api/rbac-test",
    tags=["RBAC Test"],
)


@router.get("/authenticated")
def authenticated_test(
    current_user: WasteOperationsUser,
):
    return {
        "message": "Waste operations access granted.",
        "user_id": current_user.id,
        "role": current_user.role.name,
    }


@router.get("/manufacturer")
def manufacturer_test(
    current_user: ManufacturerUser,
):
    return {
        "message": "Manufacturer access granted.",
        "user_id": current_user.id,
        "role": current_user.role.name,
    }


@router.get("/analytics")
def analytics_test(
    current_user: AnalyticsUser,
):
    return {
        "message": "Analytics access granted.",
        "user_id": current_user.id,
        "role": current_user.role.name,
    }


@router.get("/admin")
def admin_test(
    current_user: AdminUser,
):
    return {
        "message": "Administrator access granted.",
        "user_id": current_user.id,
        "role": current_user.role.name,
    }