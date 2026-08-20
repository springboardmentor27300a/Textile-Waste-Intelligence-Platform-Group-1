"""
Inventory Router - Full CRUD
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional, List
from datetime import datetime
import random, string
from app.database import get_db
from app.models.inventory import TextileInventory
from app.schemas.inventory import InventoryCreate, InventoryUpdate, InventoryResponse
from app.services.auth_service import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/inventory", tags=["Inventory"])

def generate_batch_id():
    return "TW-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))

@router.get("/", response_model=dict)
async def list_inventory(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    fabric_type: Optional[str] = None,
    condition: Optional[str] = None,
    classification: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = select(TextileInventory)
    if search:
        query = query.where(or_(
            TextileInventory.waste_batch_id.ilike(f"%{search}%"),
            TextileInventory.fabric_type.ilike(f"%{search}%"),
            TextileInventory.source.ilike(f"%{search}%")
        ))
    if fabric_type:
        query = query.where(TextileInventory.fabric_type == fabric_type)
    if condition:
        query = query.where(TextileInventory.condition == condition)
    if classification:
        query = query.where(TextileInventory.classification == classification)

    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar()

    offset = (page - 1) * per_page
    query = query.order_by(TextileInventory.created_at.desc()).offset(offset).limit(per_page)
    result = await db.execute(query)
    items = result.scalars().all()

    return {
        "items": [InventoryResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page
    }

@router.post("/", response_model=InventoryResponse, status_code=201)
async def create_inventory(
    data: InventoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    item = TextileInventory(
        **data.model_dump(),
        waste_batch_id=generate_batch_id(),
        created_by=current_user.id
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item

@router.get("/{item_id}", response_model=InventoryResponse)
async def get_inventory_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(TextileInventory).where(TextileInventory.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.put("/{item_id}", response_model=InventoryResponse)
async def update_inventory_item(
    item_id: int,
    data: InventoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(TextileInventory).where(TextileInventory.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return item

@router.delete("/{item_id}")
async def delete_inventory_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(TextileInventory).where(TextileInventory.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    await db.delete(item)
    await db.commit()
    return {"message": "Item deleted successfully"}

@router.get("/stats/summary")
async def inventory_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    total_result = await db.execute(select(func.count(TextileInventory.id)))
    total = total_result.scalar()
    qty_result = await db.execute(select(func.sum(TextileInventory.quantity_kg)))
    total_qty = qty_result.scalar() or 0
    return {
        "total_batches": total,
        "total_quantity_kg": round(total_qty, 2),
        "recycled_kg": round(total_qty * 0.67, 2),
        "pending_kg": round(total_qty * 0.33, 2)
    }
