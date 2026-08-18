from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from app.database import get_db
from app.models import TextileInventory, User
from app.schemas import (
    TextileInventoryCreate,
    TextileInventoryResponse
)
from app.dependencies import (
    get_current_user,
    RoleChecker
)
from app.services.notification_service import NotificationService

router = APIRouter()


# ===================================================
# Create Textile Waste Record
# Admin & Manufacturer Only
# ===================================================
@router.post(
    "/",
    response_model=TextileInventoryResponse
)
def create_inventory(
    inventory: TextileInventoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        RoleChecker([
            "admin",
            "manufacturer"
        ])
    )
):

    # Prevent future collection date
    if inventory.collection_date > date.today():
        raise HTTPException(
            status_code=400,
            detail="Future collection dates are not allowed."
        )

    # Prevent duplicate Batch ID
    existing = (
        db.query(TextileInventory)
        .filter(
            TextileInventory.waste_batch_id ==
            inventory.waste_batch_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Waste Batch ID already exists."
        )

    new_inventory = TextileInventory(
        waste_batch_id=inventory.waste_batch_id,
        fabric_type=inventory.fabric_type,
        source=inventory.source,
        quantity=inventory.quantity,
        color=inventory.color,
        condition=inventory.condition,
        collection_date=inventory.collection_date,
        created_by=current_user.id
    )
    db.add(new_inventory)
    db.commit()
    db.refresh(new_inventory)


    # ==========================================
    # Create Inventory Notification
    # ==========================================

    NotificationService.create_notification(

        db=db,

        user_id=current_user.id,

        title="New Inventory Added",

        message=(
            f"Textile waste batch "
            f"{new_inventory.waste_batch_id} "
            f"has been added successfully. "
            f"Material: {new_inventory.fabric_type}, "
            f"Quantity: {new_inventory.quantity} kg."
        ),

        notification_type="inventory_created",

        priority="medium"
    )


    return new_inventory

# ===================================================
# View All Inventory
# All Logged-in Users
# ===================================================
@router.get(
    "/",
    response_model=list[TextileInventoryResponse]
)
def get_inventory(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return db.query(TextileInventory).all()


# ===================================================
# View Single Inventory
# ===================================================
@router.get(
    "/{inventory_id}",
    response_model=TextileInventoryResponse
)
def get_inventory_by_id(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    inventory = (
        db.query(TextileInventory)
        .filter(TextileInventory.id == inventory_id)
        .first()
    )

    if inventory is None:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found"
        )

    return inventory


# ===================================================
# Update Inventory
# Admin, Manufacturer & Recycling Operator
# ===================================================
@router.put(
    "/{inventory_id}",
    response_model=TextileInventoryResponse
)
def update_inventory(
    inventory_id: int,
    inventory: TextileInventoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        RoleChecker([
            "admin",
            "manufacturer",
            "recycling_operator"
        ])
    )
):

    db_inventory = (
        db.query(TextileInventory)
        .filter(TextileInventory.id == inventory_id)
        .first()
    )

    if db_inventory is None:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found"
        )

    # Prevent duplicate Batch ID (excluding current record)
    existing = (
        db.query(TextileInventory)
        .filter(
            TextileInventory.waste_batch_id ==
            inventory.waste_batch_id,
            TextileInventory.id != inventory_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Waste Batch ID already exists."
        )

    # Prevent future collection date
    if inventory.collection_date > date.today():
        raise HTTPException(
            status_code=400,
            detail="Future collection dates are not allowed."
        )

    db_inventory.waste_batch_id = inventory.waste_batch_id
    db_inventory.fabric_type = inventory.fabric_type
    db_inventory.source = inventory.source
    db_inventory.quantity = inventory.quantity
    db_inventory.color = inventory.color
    db_inventory.condition = inventory.condition
    db_inventory.collection_date = inventory.collection_date

    db.commit()
    db.refresh(db_inventory)

    return db_inventory


# ===================================================
# Delete Inventory
# Administrator Only
# ===================================================
@router.delete("/{inventory_id}")
def delete_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        RoleChecker([
            "admin"
        ])
    )
):

    inventory = (
        db.query(TextileInventory)
        .filter(TextileInventory.id == inventory_id)
        .first()
    )

    if inventory is None:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found"
        )

    db.delete(inventory)
    db.commit()

    return {
        "message": "Inventory deleted successfully"
    }