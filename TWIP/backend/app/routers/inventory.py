from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import Optional, List
from datetime import date

from app.database.db import get_db
from app.models.models import User, WasteBatch, TextileWaste, Inventory
from app.schemas.schemas import WasteBatchCreate, WasteBatchUpdate, WasteBatchResponse, WasteBatchListResponse
from app.auth.dependencies import get_current_user, RoleChecker

router = APIRouter(prefix="/api/inventory", tags=["Textile Waste Inventory"])

# Roles allowed to modify inventory
write_roles = RoleChecker(["Administrator", "Recycling Facility Operator"])
all_roles = get_current_user # Any authenticated user can view

@router.get("", response_model=WasteBatchListResponse)
def get_inventory(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term matching fabric type, color, source, or condition"),
    fabric_type: Optional[str] = Query(None, description="Filter by fabric type"),
    source: Optional[str] = Query(None, description="Filter by source"),
    status: Optional[str] = Query(None, description="Filter by status"),
    condition: Optional[str] = Query(None, description="Filter by condition"),
    sort_by: str = Query("collection_date", description="Field to sort by: collection_date, quantity, fabric_type, status"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(all_roles)
):
    query = db.query(WasteBatch)

    # 1. Apply Filters
    if fabric_type:
        query = query.filter(WasteBatch.fabric_type == fabric_type)
    if source:
        query = query.filter(WasteBatch.source == source)
    if status:
        query = query.filter(WasteBatch.status == status)
    if condition:
        query = query.filter(WasteBatch.condition == condition)

    # 2. Apply Search
    if search:
        search_filter = or_(
            WasteBatch.fabric_type.ilike(f"%{search}%"),
            WasteBatch.color.ilike(f"%{search}%"),
            WasteBatch.source.ilike(f"%{search}%"),
            WasteBatch.condition.ilike(f"%{search}%"),
            WasteBatch.status.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    # 3. Apply Sorting
    sort_col = getattr(WasteBatch, sort_by, WasteBatch.collection_date)
    if sort_order == "desc":
        query = query.order_by(desc(sort_col))
    else:
        query = query.order_by(asc(sort_col))

    # 4. Count total items before pagination
    total = query.count()

    # 5. Apply Pagination
    offset = (page - 1) * size
    items = query.offset(offset).limit(size).all()

    # Calculate total pages
    pages = (total + size - 1) // size if total > 0 else 0

    return {
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
        "items": items
    }

@router.post("", response_model=WasteBatchResponse, status_code=status.HTTP_201_CREATED)
def create_waste_batch(
    batch_in: WasteBatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(all_roles)
):
    # Ensure inventory location exists if inventory_id is provided
    if batch_in.inventory_id:
        inv = db.query(Inventory).filter(Inventory.id == batch_in.inventory_id).first()
        if not inv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inventory storage with ID {batch_in.inventory_id} not found."
            )
            
    # Create the WasteBatch record
    db_batch = WasteBatch(
        fabric_type=batch_in.fabric_type,
        source=batch_in.source,
        quantity=batch_in.quantity,
        color=batch_in.color,
        condition=batch_in.condition,
        collection_date=batch_in.collection_date,
        status=batch_in.status,
        inventory_id=batch_in.inventory_id,
        operator_id=current_user.id
    )
    
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)

    # Add child TextileWaste entries if provided
    if batch_in.textile_wastes:
        for waste_item in batch_in.textile_wastes:
            db_waste = TextileWaste(
                waste_batch_id=db_batch.id,
                material_composition=waste_item.material_composition,
                recyclability_rate=waste_item.recyclability_rate,
                has_contaminants=waste_item.has_contaminants
            )
            db.add(db_waste)
        db.commit()
        db.refresh(db_batch)

    return db_batch

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(all_roles)
):
    from sqlalchemy.sql import func
    total_records = db.query(WasteBatch).count()
    
    total_qty_result = db.query(func.sum(WasteBatch.quantity)).scalar()
    total_qty = float(total_qty_result) if total_qty_result is not None else 0.0
    
    # Recent items sorted by collection_date or created_at desc
    recent_entries = db.query(WasteBatch).order_by(desc(WasteBatch.collection_date)).limit(5).all()
    
    # Distributions for charts
    status_query = db.query(WasteBatch.status, func.count(WasteBatch.id)).group_by(WasteBatch.status).all()
    status_dist = {status: count for status, count in status_query}
    
    fabric_query = db.query(WasteBatch.fabric_type, func.count(WasteBatch.id)).group_by(WasteBatch.fabric_type).all()
    fabric_dist = {fab: count for fab, count in fabric_query}
    
    return {
        "total_records": total_records,
        "total_quantity": total_qty,
        "recent_entries": recent_entries,
        "status_distribution": status_dist,
        "fabric_distribution": fabric_dist
    }

@router.get("/{id}", response_model=WasteBatchResponse)
def get_waste_batch(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(all_roles)
):
    batch = db.query(WasteBatch).filter(WasteBatch.id == id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Waste batch with ID {id} not found."
        )
    return batch

@router.put("/{id}", response_model=WasteBatchResponse)
def update_waste_batch(
    id: int,
    batch_update: WasteBatchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(write_roles)
):
    batch = db.query(WasteBatch).filter(WasteBatch.id == id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Waste batch with ID {id} not found."
        )

    # Validate inventory location if updating it
    if batch_update.inventory_id is not None:
        inv = db.query(Inventory).filter(Inventory.id == batch_update.inventory_id).first()
        if not inv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inventory storage with ID {batch_update.inventory_id} not found."
            )

    # Update fields in WasteBatch
    update_data = batch_update.model_dump(exclude_unset=True)
    
    # Extract textile_wastes from update data if present
    textile_wastes_in = update_data.pop("textile_wastes", None)

    for key, value in update_data.items():
        setattr(batch, key, value)

    # Handle child TextileWaste update (delete old ones and recreate new ones for simplicity)
    if textile_wastes_in is not None:
        # Delete old relations
        db.query(TextileWaste).filter(TextileWaste.waste_batch_id == id).delete()
        # Create new ones
        for waste_item in textile_wastes_in:
            db_waste = TextileWaste(
                waste_batch_id=id,
                material_composition=waste_item.get("material_composition"),
                recyclability_rate=waste_item.get("recyclability_rate", 0.0),
                has_contaminants=waste_item.get("has_contaminants", False)
            )
            db.add(db_waste)

    db.commit()
    db.refresh(batch)
    return batch

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_waste_batch(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(write_roles)
):
    batch = db.query(WasteBatch).filter(WasteBatch.id == id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Waste batch with ID {id} not found."
        )
    
    db.delete(batch)
    db.commit()
    return None
