from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import User, Role
from app.core.dependencies import AdminUser


router = APIRouter(
    prefix="/api/users",
    tags=["User Management"],
)


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserRoleUpdate(BaseModel):
    role_name: str


@router.get("")
def list_users(
    current_user: AdminUser,
):
    db: Session = SessionLocal()

    try:
        users = db.scalars(
            select(User)
            .order_by(User.created_at.desc())
        ).all()

        return [
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "phone": user.phone,
                "organization_id": user.organization_id,
                "role_id": user.role_id,
                "role": user.role.name if user.role else None,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
                "created_at": user.created_at,
                "last_login_at": user.last_login_at,
            }
            for user in users
        ]
    finally:
        db.close()


@router.patch("/{user_id}/status")
def update_user_status(
    user_id: int,
    payload: UserStatusUpdate,
    current_user: AdminUser,
):
    db: Session = SessionLocal()

    try:
        user = db.get(User, user_id)

        if user is None:
            raise HTTPException(
                status_code=404,
                detail="User not found.",
            )

        if user.id == current_user.id and not payload.is_active:
            raise HTTPException(
                status_code=400,
                detail="Administrator cannot deactivate their own account.",
            )

        user.is_active = payload.is_active
        db.commit()
        db.refresh(user)

        return {
            "message": "User status updated successfully.",
            "user_id": user.id,
            "is_active": user.is_active,
        }
    finally:
        db.close()


@router.patch("/{user_id}/role")
def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    current_user: AdminUser,
):
    db: Session = SessionLocal()

    try:
        user = db.get(User, user_id)

        if user is None:
            raise HTTPException(
                status_code=404,
                detail="User not found.",
            )

        role_name = payload.role_name.strip().upper()

        role = db.scalar(
            select(Role).where(Role.name == role_name)
        )

        if role is None:
            raise HTTPException(
                status_code=400,
                detail=f"Role '{role_name}' does not exist.",
            )

        user.role_id = role.id

        db.commit()
        db.refresh(user)

        return {
            "message": "User role updated successfully.",
            "user_id": user.id,
            "role": role.name,
        }
    finally:
        db.close()
