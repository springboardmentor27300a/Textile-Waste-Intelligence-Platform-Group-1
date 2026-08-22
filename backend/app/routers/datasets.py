from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, require_roles

router = APIRouter(prefix="/api/datasets", tags=["Dataset Integration"])


@router.get("", response_model=list[schemas.DatasetOut])
def list_datasets(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Dataset).order_by(models.Dataset.created_at.asc()).all()


@router.patch("/{dataset_id}/status", response_model=schemas.DatasetOut)
def update_dataset_status(dataset_id: str, status: models.DatasetStatus, record_count: int | None = None, local_path: str | None = None,
                           db: Session = Depends(get_db), current_user: models.User = Depends(require_roles(models.UserRole.ADMIN))):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    dataset.status = status
    if record_count is not None: dataset.record_count = record_count
    if local_path is not None: dataset.local_path = local_path
    db.commit(); db.refresh(dataset)
    return dataset
