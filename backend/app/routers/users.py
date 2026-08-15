from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import require_roles

router = APIRouter(prefix="/api/users", tags=["Users (Admin)"])


@router.get("/", response_model=List[schemas.UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(models.UserRole.ADMINISTRATOR)),
):
    """Admin-only: list all registered users. Demonstrates role-based access control."""
    return db.query(models.User).all()
