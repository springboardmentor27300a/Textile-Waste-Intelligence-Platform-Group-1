from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import or_, desc, asc, func
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.database.session import get_db
from app.models.user import User
from app.models.waste_batch import WasteBatch, TextileInventory
from app.models.support import ActivityLog
from app.schemas.inventory import (
    WasteBatchCreate,
    WasteBatchUpdate,
    WasteBatchResponse,
    WasteBatchListResponse
)
from app.auth.deps import get_current_user, RoleChecker

router = APIRouter(prefix="/inventory", tags=["Inventory"])

def generate_batch_number(db: Session) -> str:
    # Generate sequential identifier, e.g. WB-2026-0001
    year = datetime.utcnow().year
    prefix = f"WB-{year}-"
    
    # Count how many batches for this year exist
    count = db.query(WasteBatch).filter(WasteBatch.batch_number.like(f"{prefix}%")).count()
    next_num = count + 1
    return f"{prefix}{next_num:04d}"

# Create Batch
@router.post("/batches", response_model=WasteBatchResponse, status_code=status.HTTP_201_CREATED)
def create_waste_batch(
    batch_in: WasteBatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Administrator", "Sustainability Manager", "Recycling Facility Operator", "Textile Manufacturer"]))
):
    batch_num = generate_batch_number(db)
    
    # Create the waste batch
    new_batch = WasteBatch(
        batch_number=batch_num,
        fabric_type=batch_in.fabric_type,
        source=batch_in.source,
        quantity=batch_in.quantity,
        color=batch_in.color,
        condition=batch_in.condition,
        collection_date=batch_in.collection_date,
        status=batch_in.status,
        storage_location=batch_in.storage_location,
        remarks=batch_in.remarks,
        creator_id=current_user.id,
        organization_id=current_user.organization_id
    )
    
    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)
    
    # Auto-yield a TextileInventory stock item if the status is active / sorted / recycling
    if new_batch.status not in ["Pending", "Disposed"]:
        inv_item = TextileInventory(
            batch_id=new_batch.id,
            fabric_type=new_batch.fabric_type,
            quantity=new_batch.quantity,
            color=new_batch.color,
            storage_location=new_batch.storage_location,
            status="In Stock" if new_batch.status in ["Sorted", "Recycling"] else "Processing"
        )
        db.add(inv_item)
        db.commit()
        db.refresh(new_batch)

    # Log action
    log = ActivityLog(
        user_id=current_user.id,
        action="CREATE_BATCH",
        details=f"Created waste batch {new_batch.batch_number} ({new_batch.fabric_type}, {new_batch.quantity} kg)"
    )
    db.add(log)
    db.commit()
    
    return new_batch

# List Batches with filters, sorting, and pagination
@router.get("/batches", response_model=WasteBatchListResponse)
def list_waste_batches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    fabric_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    order: str = Query("desc")
):
    query = db.query(WasteBatch)
    
    # Role-based restriction: Manufacturers can only see their own submitted waste
    if current_user.role.name == "Textile Manufacturer":
        query = query.filter(WasteBatch.organization_id == current_user.organization_id)
        
    # Filtering
    if fabric_type:
        query = query.filter(WasteBatch.fabric_type == fabric_type)
    if status:
        query = query.filter(WasteBatch.status == status)
        
    # Search filter (batch number, source, remarks, storage location)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                WasteBatch.batch_number.ilike(search_filter),
                WasteBatch.source.ilike(search_filter),
                WasteBatch.remarks.ilike(search_filter),
                WasteBatch.storage_location.ilike(search_filter),
                WasteBatch.fabric_type.ilike(search_filter)
            )
        )
        
    # Sorting
    sort_column = getattr(WasteBatch, sort_by, WasteBatch.created_at)
    if order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
        
    # Pagination
    total = query.count()
    offset = (page - 1) * size
    items = query.offset(offset).limit(size).all()
    
    return {
        "total": total,
        "items": items,
        "page": page,
        "size": size
    }

# View Details
@router.get("/batches/{batch_id}", response_model=WasteBatchResponse)
def get_waste_batch(
    batch_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    batch = db.query(WasteBatch).filter(WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Waste batch not found")
        
    # Check Manufacturer access
    if current_user.role.name == "Textile Manufacturer" and batch.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this batch")
        
    return batch

# Edit Batch
@router.put("/batches/{batch_id}", response_model=WasteBatchResponse)
def update_waste_batch(
    batch_id: UUID,
    batch_in: WasteBatchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Administrator", "Sustainability Manager", "Recycling Facility Operator", "Textile Manufacturer"]))
):
    batch = db.query(WasteBatch).filter(WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Waste batch not found")
        
    # Check Manufacturer access to prevent editing other organization's batches
    if current_user.role.name == "Textile Manufacturer" and batch.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this batch")
        
    # Update fields
    update_data = batch_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(batch, field, value)
        
    db.add(batch)
    db.commit()
    db.refresh(batch)
    
    # Sync with TextileInventory based on updated status
    inventory_item = db.query(TextileInventory).filter(TextileInventory.batch_id == batch.id).first()
    
    if batch.status not in ["Pending", "Disposed"]:
        if not inventory_item:
            # Create new stock record
            inventory_item = TextileInventory(
                batch_id=batch.id,
                fabric_type=batch.fabric_type,
                quantity=batch.quantity,
                color=batch.color,
                storage_location=batch.storage_location,
                status="In Stock" if batch.status in ["Sorted", "Recycling"] else "Processing"
            )
            db.add(inventory_item)
        else:
            # Update stock record details
            inventory_item.fabric_type = batch.fabric_type
            inventory_item.quantity = batch.quantity
            inventory_item.color = batch.color
            inventory_item.storage_location = batch.storage_location
            inventory_item.status = "In Stock" if batch.status in ["Sorted", "Recycling"] else "Processing"
            db.add(inventory_item)
    elif inventory_item:
        # If status changed back to Pending/Disposed, delete corresponding stock
        db.delete(inventory_item)
        
    # Log Action
    log = ActivityLog(
        user_id=current_user.id,
        action="UPDATE_BATCH",
        details=f"Updated batch {batch.batch_number} (Status: {batch.status})"
    )
    db.add(log)
    db.commit()
    db.refresh(batch)
    
    return batch

# Delete Batch
@router.delete("/batches/{batch_id}", status_code=status.HTTP_200_OK)
def delete_waste_batch(
    batch_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Administrator", "Sustainability Manager"]))
):
    batch = db.query(WasteBatch).filter(WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Waste batch not found")
        
    batch_num = batch.batch_number
    db.delete(batch)
    
    # Log Action
    log = ActivityLog(
        user_id=current_user.id,
        action="DELETE_BATCH",
        details=f"Deleted waste batch {batch_num}"
    )
    db.add(log)
    db.commit()
    
    return {"detail": f"Waste batch {batch_num} deleted successfully."}
