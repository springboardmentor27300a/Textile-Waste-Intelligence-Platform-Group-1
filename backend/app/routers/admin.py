from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas import UserOut, UserRoleUpdate, UserStatusUpdate
from app.services.auth_service import require_admin

router = APIRouter(
    prefix="/api/admin/users",
    tags=["admin"],
    dependencies=[Depends(require_admin)]
)

@router.get("", response_model=List[UserOut])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all platform users. Admin only."""
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.put("/{user_id}/role", response_model=UserOut)
def update_user_role(user_id: int, role_update: UserRoleUpdate, db: Session = Depends(get_db)):
    """Change a user's role. Admin only."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.role = role_update.role
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/status", response_model=UserOut)
def update_user_status(user_id: int, status_update: UserStatusUpdate, db: Session = Depends(get_db)):
    """Activate or deactivate a user. Admin only."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.is_active = status_update.is_active
    db.commit()
    db.refresh(user)
    return user
