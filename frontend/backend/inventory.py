from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import WasteInventory
from backend.schemas import WasteCreate

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


# ==========================================
# Add Waste Inventory
# ==========================================

@router.post("/add")
def add_inventory(item: WasteCreate, db: Session = Depends(get_db)):

    existing = db.query(WasteInventory).filter(
        WasteInventory.batch_id == item.batch_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Batch ID already exists"
        )

    waste = WasteInventory(
        batch_id=item.batch_id,
        fabric_type=item.fabric_type,
        quantity=item.quantity,
        color=item.color,
        source=item.source,
        condition=item.condition,
        category=item.category,
        remarks=item.remarks
    )

    db.add(waste)
    db.commit()
    db.refresh(waste)

    return {
        "message": "Inventory Added Successfully",
        "inventory": waste
    }


# ==========================================
# View All Inventory
# ==========================================

@router.get("/all")
def get_all_inventory(db: Session = Depends(get_db)):

    inventory = db.query(WasteInventory).all()

    return inventory


# ==========================================
# View Inventory by ID
# ==========================================

@router.get("/{inventory_id}")
def get_inventory(inventory_id: int, db: Session = Depends(get_db)):

    inventory = db.query(WasteInventory).filter(
        WasteInventory.id == inventory_id
    ).first()

    if inventory is None:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found"
        )

    return inventory


# ==========================================
# Update Inventory
# ==========================================

@router.put("/{inventory_id}")
def update_inventory(
    inventory_id: int,
    item: WasteCreate,
    db: Session = Depends(get_db)
):

    inventory = db.query(WasteInventory).filter(
        WasteInventory.id == inventory_id
    ).first()

    if inventory is None:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found"
        )

    inventory.batch_id = item.batch_id
    inventory.fabric_type = item.fabric_type
    inventory.quantity = item.quantity
    inventory.color = item.color
    inventory.source = item.source
    inventory.condition = item.condition
    inventory.category = item.category
    inventory.remarks = item.remarks

    db.commit()
    db.refresh(inventory)

    return {
        "message": "Inventory Updated Successfully",
        "inventory": inventory
    }


# ==========================================
# Delete Inventory
# ==========================================

@router.delete("/{inventory_id}")
def delete_inventory(inventory_id: int, db: Session = Depends(get_db)):

    inventory = db.query(WasteInventory).filter(
        WasteInventory.id == inventory_id
    ).first()

    if inventory is None:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found"
        )

    db.delete(inventory)
    db.commit()

    return {
        "message": "Inventory Deleted Successfully"
    }