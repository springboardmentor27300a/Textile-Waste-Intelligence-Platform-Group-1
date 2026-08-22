from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..deps import require_roles

router = APIRouter(prefix="/api/users", tags=["User Management"])


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(require_roles(models.UserRole.ADMIN, models.UserRole.RECYCLING_OPERATOR, models.UserRole.SUSTAINABILITY_MANAGER, models.UserRole.MANUFACTURER))):
    return current_user


@router.get("", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db), current_user: models.User = Depends(require_roles(models.UserRole.ADMIN))):
    return db.query(models.User).order_by(models.User.created_at.desc()).all()



@router.patch("/{user_id}/status", response_model=schemas.UserOut)
def toggle_user_status(user_id: str, is_active: bool, db: Session = Depends(get_db), current_user: models.User = Depends(require_roles(models.UserRole.ADMIN))):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.is_active = is_active
    db.commit(); db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(require_roles(models.UserRole.ADMIN))):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You can't delete your own account while signed in.")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    batch_count = db.query(models.WasteBatch).filter(models.WasteBatch.registered_by == user_id).count()
    if batch_count > 0:
        raise HTTPException(status_code=400, detail=f"This user registered {batch_count} waste batch(es). Deactivate the account instead of deleting it, so those records keep their history.")
    db.delete(user); db.commit()
    return None
