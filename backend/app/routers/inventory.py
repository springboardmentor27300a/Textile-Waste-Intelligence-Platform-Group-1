from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.inventory import Inventory
from app.schemas import InventoryCreate, InventoryUpdate, InventoryOut
from app.services.auth_service import get_current_user, require_admin, require_admin_or_analyst

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.get("", response_model=List[InventoryOut])
def list_inventory(
    skip: int = 0,
    limit: int = 50,
    material_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    supplier_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all inventory records."""
    query = db.query(Inventory)
    if material_type:
        query = query.filter(Inventory.material_type.ilike(f"%{material_type}%"))
    if status:
        query = query.filter(Inventory.status == status)
    if supplier_id:
        query = query.filter(Inventory.supplier_id == supplier_id)
    return query.offset(skip).limit(limit).all()


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return aggregated inventory statistics."""
    from sqlalchemy import func
    total_kg = db.query(func.sum(Inventory.quantity_kg)).scalar() or 0
    total_items = db.query(func.count(Inventory.id)).scalar() or 0
    by_material = (
        db.query(Inventory.material_type, func.sum(Inventory.quantity_kg))
        .group_by(Inventory.material_type)
        .all()
    )
    by_status = (
        db.query(Inventory.status, func.count(Inventory.id))
        .group_by(Inventory.status)
        .all()
    )
    return {
        "total_kg": round(total_kg, 2),
        "total_items": total_items,
        "by_material": {m: round(kg, 2) for m, kg in by_material},
        "by_status": {str(s): c for s, c in by_status},
    }


@router.get("/{inventory_id}", response_model=InventoryOut)
def get_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item


from app.services.notification_service import NotificationService

from sqlalchemy import func

@router.post("", response_model=InventoryOut, status_code=201)
def create_inventory(
    data: InventoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_analyst),
):
    """Create a new inventory batch record."""
    existing = db.query(Inventory).filter(func.lower(Inventory.batch_code) == data.batch_code.lower()).first()
    if existing:
        # Generate a notification alert for the duplicate attempt
        from app.models.notification import NotificationType
        NotificationService._create_notification(
            db=db,
            title="Duplicate Batch Code",
            message=f"Attempted to enter a batch code that already exists: {data.batch_code}",
            n_type=NotificationType.alert,
            user_id=current_user.id
        )
        raise HTTPException(status_code=400, detail="Batch code already exists")
    item = Inventory(**data.model_dump(), created_by_id=current_user.id)
    db.add(item)
    db.commit()
    db.refresh(item)
    
    # Automatically trigger notifications
    NotificationService.run_all_triggers(db)
    
    return item


@router.put("/{inventory_id}", response_model=InventoryOut)
def update_inventory(
    inventory_id: int,
    data: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_analyst),
):
    """Update an inventory record."""
    item = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not item:
        raise HTTPException(status_code=403, detail="Inventory item not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    
    # Automatically trigger notifications
    NotificationService.run_all_triggers(db)
    
    return item


@router.delete("/{inventory_id}", status_code=204)
def delete_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Delete an inventory record (Admin only)."""
    item = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not item:
        raise HTTPException(status_code=403, detail="Inventory item not found")
    db.delete(item)
    db.commit()
