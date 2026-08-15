from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas 
from ..database import get_db
from ..auth import get_current_user, require_roles

router = APIRouter(prefix="/api/inventory", tags=["Textile Inventory & Waste Management"])


@router.post("/", response_model=schemas.WasteBatchOut, status_code=status.HTTP_201_CREATED)
def create_batch(
    payload: schemas.WasteBatchCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = db.query(models.WasteBatch).filter(models.WasteBatch.batch_code == payload.batch_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Batch code already exists.")

    batch = models.WasteBatch(**payload.model_dump(), owner_id=current_user.id)
    db.add(batch)
    db.commit()
    db.refresh(batch)
    return batch


@router.get("/", response_model=List[schemas.WasteBatchOut])
def list_batches(
    fabric_type: Optional[str] = None,
    condition: Optional[models.WasteCondition] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.WasteBatch)
    if fabric_type:
        query = query.filter(models.WasteBatch.fabric_type.ilike(f"%{fabric_type}%"))
    if condition:
        query = query.filter(models.WasteBatch.condition == condition)
    return query.order_by(models.WasteBatch.created_at.desc()).all()


@router.get("/{batch_id}", response_model=schemas.WasteBatchOut)
def get_batch(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    batch = db.query(models.WasteBatch).filter(models.WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Waste batch not found.")
    return batch


@router.patch("/{batch_id}", response_model=schemas.WasteBatchOut)
def update_batch(
    batch_id: int,
    payload: schemas.WasteBatchUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    batch = db.query(models.WasteBatch).filter(models.WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Waste batch not found.")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(batch, field, value)

    db.commit()
    db.refresh(batch)
    return batch


@router.delete("/{batch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_batch(
    batch_id: int,
    db: Session = Depends(get_db),
    # Only operators/admins can delete inventory records
    current_user: models.User = Depends(
        require_roles(models.UserRole.RECYCLING_FACILITY_OPERATOR, models.UserRole.ADMINISTRATOR)
    ),
):
    batch = db.query(models.WasteBatch).filter(models.WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Waste batch not found.")
    db.delete(batch)
    db.commit()
    return None


@router.get("/stats/summary")
def inventory_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Basic inventory monitoring stats for the dashboard."""
    batches = db.query(models.WasteBatch).all()
    total_kg = sum(b.quantity_kg for b in batches)
    by_fabric = {}
    by_condition = {}
    for b in batches:
        by_fabric[b.fabric_type] = by_fabric.get(b.fabric_type, 0) + b.quantity_kg
        by_condition[b.condition.value] = by_condition.get(b.condition.value, 0) + b.quantity_kg

    return {
        "total_batches": len(batches),
        "total_quantity_kg": total_kg,
        "quantity_by_fabric_type": by_fabric,
        "quantity_by_condition": by_condition,
    }
