from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, require_roles

router = APIRouter(prefix="/api/inventory", tags=["Textile Inventory"])

CAN_REGISTER = (models.UserRole.ADMIN, models.UserRole.RECYCLING_OPERATOR, models.UserRole.MANUFACTURER)
CAN_EDIT = (models.UserRole.ADMIN, models.UserRole.RECYCLING_OPERATOR)


def _next_batch_code(db: Session) -> str:
    year = datetime.utcnow().year
    prefix = f"WB-{year}-"
    count = db.query(func.count(models.WasteBatch.id)).filter(models.WasteBatch.batch_code.like(f"{prefix}%")).scalar()
    return f"{prefix}{(count + 1):06d}"


@router.post("", response_model=schemas.WasteBatchOut, status_code=201)
def register_batch(payload: schemas.WasteBatchCreate, db: Session = Depends(get_db), current_user: models.User = Depends(require_roles(*CAN_REGISTER))):
    batch = models.WasteBatch(batch_code=_next_batch_code(db), registered_by=current_user.id, **payload.model_dump())
    db.add(batch); db.commit(); db.refresh(batch)
    return batch


@router.get("", response_model=list[schemas.WasteBatchOut])
def list_batches(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user),
    fabric_type: Optional[models.FabricType] = None, category: Optional[models.WasteCategory] = None,
    status: Optional[models.BatchStatus] = None, source_type: Optional[str] = None, mine: bool = False,
    search: Optional[str] = Query(default=None),
):
    q = db.query(models.WasteBatch)
    if mine: q = q.filter(models.WasteBatch.registered_by == current_user.id)
    if fabric_type: q = q.filter(models.WasteBatch.fabric_type == fabric_type)
    if category: q = q.filter(models.WasteBatch.category == category)
    if status: q = q.filter(models.WasteBatch.status == status)
    if source_type: q = q.filter(models.WasteBatch.source_type == source_type)
    if search:
        like = f"%{search}%"
        q = q.filter((models.WasteBatch.batch_code.ilike(like)) | (models.WasteBatch.source.ilike(like)))
    return q.order_by(models.WasteBatch.created_at.desc()).all()


@router.get("/summary", response_model=schemas.InventorySummary)
@router.get("/reports/summary", response_model=schemas.InventorySummary)
def inventory_summary(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):

    batches = db.query(models.WasteBatch).all()

    def bucket(attr):
        result = {}
        for b in batches:
            key = getattr(b, attr).value
            result[key] = result.get(key, 0) + 1
        return result

    return schemas.InventorySummary(
        total_batches=len(batches), total_quantity_kg=round(sum(b.quantity_kg for b in batches), 2),
        by_fabric_type=bucket("fabric_type"), by_category=bucket("category"),
        by_status=bucket("status"), by_condition=bucket("condition"),
    )


@router.get("/{batch_id}", response_model=schemas.WasteBatchOut)
def get_batch(batch_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    batch = db.query(models.WasteBatch).filter(models.WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Waste batch not found.")
    return batch


@router.patch("/{batch_id}", response_model=schemas.WasteBatchOut)
def update_batch(batch_id: str, payload: schemas.WasteBatchUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(require_roles(*CAN_EDIT))):
    batch = db.query(models.WasteBatch).filter(models.WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Waste batch not found.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(batch, field, value)
    db.commit(); db.refresh(batch)
    return batch


@router.delete("/{batch_id}", status_code=204)
def delete_batch(batch_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(require_roles(models.UserRole.ADMIN))):
    batch = db.query(models.WasteBatch).filter(models.WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Waste batch not found.")
    db.delete(batch); db.commit()
    return None
