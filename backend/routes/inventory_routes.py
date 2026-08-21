from fastapi import APIRouter, Depends, HTTPException, Header, status
from typing import Optional
from datetime import datetime
from database import get_db
from models import User, Inventory, TextileRecordCreate, TextileRecordEdit
from routes.auth import get_current_user
from auth_helpers import decode_token
from utils.activity_logger import log_action

router = APIRouter(prefix="/api/textile", tags=["textile"])

def serialize_record(record: Inventory):
    if not record:
        return None
    return {
        "_id": str(record.id),
        "id": str(record.id),
        "batchId": record.batch_id,
        "fabricType": record.fabric_type,
        "source": record.source,
        "quantity": record.quantity,
        "color": record.color,
        "condition": record.condition,
        "collectionDate": record.collection_date.isoformat() if record.collection_date else None,
        "processingStatus": record.status,
        "remarks": record.remarks,
        "description": record.remarks,
        "imageUrl": record.image_url,
        "image": record.image_url,
        "createdBy": {
            "id": str(record.user.id) if record.user else "",
            "name": record.user.fullname if record.user else "System",
            "email": record.user.email if record.user else ""
        },
        "createdAt": record.created_at.isoformat() if record.created_at else None,
        "updatedAt": record.updated_at.isoformat() if record.updated_at else None
    }

def get_current_user_from_token(authorization: Optional[str] = Header(None), db=Depends(get_db)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    user_id = payload.get("id")
    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
    except ValueError:
        user = db.query(User).filter(User.email == user_id).first()
        
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user, payload

@router.post("", status_code=201)
def create_textile_record(data: TextileRecordCreate, auth_data=Depends(get_current_user_from_token), db=Depends(get_db)):
    current_user, payload = auth_data
    
    # Sustainability Manager check
    if payload.get("role") == "Sustainability Manager":
        raise HTTPException(status_code=403, detail="Sustainability Managers have read-only access and cannot register new waste batches")

    # Check if batchId already exists
    if db.query(Inventory).filter(Inventory.batch_id == data.batchId).first():
        raise HTTPException(status_code=400, detail="A batch with this Batch ID already exists")

    # Parse collection date string
    try:
        # Accept different formats (e.g. YYYY-MM-DD or full ISO strings)
        col_date_str = data.collectionDate[:19] # Strip timezone if needed
        if "T" in col_date_str:
            collection_date = datetime.strptime(col_date_str, "%Y-%m-%dT%H:%M:%S")
        else:
            collection_date = datetime.strptime(col_date_str[:10], "%Y-%m-%d")
    except Exception:
        collection_date = datetime.utcnow()

    # Image upload mapping
    image_url = data.image

    record = Inventory(
        user_id=current_user.id,
        batch_id=data.batchId,
        fabric_type=data.fabricType,
        source=data.source,
        quantity=float(data.quantity),
        color=data.color,
        condition=data.condition,
        collection_date=collection_date,
        status=data.processingStatus or "Pending",
        remarks=data.description,
        image_url=image_url
    )
    
    db.add(record)
    db.commit()
    db.refresh(record)
    
    log_action(db, current_user.id, current_user.fullname, "Inventory Upload", f"Registered new waste batch {record.batch_id} ({record.quantity} kg)")
    
    return {
        "success": True,
        "message": "Waste batch registered successfully",
        "record": serialize_record(record)
    }

@router.get("")
def list_textile_records(
    search: Optional[str] = None,
    fabricType: Optional[str] = None,
    condition: Optional[str] = None,
    processingStatus: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    auth_data=Depends(get_current_user_from_token),
    db=Depends(get_db)
):
    current_user, payload = auth_data
    
    query = db.query(Inventory)
    
    # Scoping: non-admins only see their own records
    is_admin = payload.get("role") in ["admin", "Administrator"]
    if not is_admin:
        query = query.filter(Inventory.user_id == current_user.id)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Inventory.batch_id.ilike(search_filter)) |
            (Inventory.source.ilike(search_filter)) |
            (Inventory.color.ilike(search_filter)) |
            (Inventory.fabric_type.ilike(search_filter))
        )
        
    if fabricType:
        query = query.filter(Inventory.fabric_type == fabricType)
    if condition:
        query = query.filter(Inventory.condition == condition)
    if processingStatus:
        query = query.filter(Inventory.status == processingStatus)

    # Calculate pagination
    total = query.count()
    pages = max(1, (total + limit - 1) // limit)
    offset = (page - 1) * limit
    
    records = query.order_by(Inventory.collection_date.desc()).offset(offset).limit(limit).all()
    
    return {
        "success": True,
        "records": [serialize_record(r) for r in records],
        "pagination": {
            "page": page,
            "pages": pages,
            "total": total,
            "limit": limit
        }
    }

@router.get("/stats")
def get_stats(auth_data=Depends(get_current_user_from_token), db=Depends(get_db)):
    current_user, payload = auth_data
    
    query = db.query(Inventory)
    is_admin = payload.get("role") in ["admin", "Administrator"]
    if not is_admin:
        query = query.filter(Inventory.user_id == current_user.id)

    records = query.all()
    
    total_batches = len(records)
    total_quantity = sum(float(r.quantity) for r in records)
    
    active_collections = sum(1 for r in records if r.status in ["Pending", "Collected", "Processing"])
    pending_processing = sum(1 for r in records if r.status == "Pending")
    recycled_waste = sum(float(r.quantity) for r in records if r.status == "Recycled")
    
    # Today's Collections
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    today_collections = sum(float(r.quantity) for r in records if r.collection_date.strftime("%Y-%m-%d") == today_str)
    
    # Global counts
    active_manufacturers = db.query(User).filter(User.role == "Textile Manufacturer").count()
    recycling_facilities = db.query(User).filter(User.role == "Recycling Facility Operator").count()
    
    if total_quantity > 0:
        sustainability_score = round((recycled_waste / total_quantity) * 100, 1)
    else:
        sustainability_score = 0.0
        
    # Fabric Type Distribution
    fabric_totals = {}
    for r in records:
        fabric_totals[r.fabric_type] = fabric_totals.get(r.fabric_type, 0.0) + r.quantity
    by_fabric = [{"name": k, "quantity": round(v, 2)} for k, v in fabric_totals.items()]
    
    # Group by Month Collection Trend
    month_totals = {}
    for r in records:
        cdate = r.collection_date
        if cdate:
            key = (cdate.month, cdate.year)
            month_totals[key] = month_totals.get(key, 0.0) + r.quantity
    by_month = [{"_id": {"month": k[0], "year": k[1]}, "quantity": round(v, 2)} for k, v in month_totals.items()]
    by_month.sort(key=lambda x: (x["_id"]["year"], x["_id"]["month"]))
    
    # Recent logs
    sorted_records = sorted(records, key=lambda x: x.collection_date, reverse=True)
    recent = [serialize_record(r) for r in sorted_records[:5]]
    
    # Source Distribution
    source_totals = {}
    for r in records:
        source_totals[r.source] = source_totals.get(r.source, 0.0) + r.quantity
    by_source = [{"name": k, "value": round(v, 2)} for k, v in source_totals.items()]
    
    # Recycling Progress
    progress_totals = {}
    for r in records:
        progress_totals[r.status] = progress_totals.get(r.status, 0.0) + r.quantity
    recycling_progress = [{"name": k, "quantity": round(v, 2)} for k, v in progress_totals.items()]
    
    # Material Composition
    composition = {"Natural": 0.0, "Synthetic": 0.0}
    for r in records:
        ft = r.fabric_type.lower()
        qty = r.quantity
        if any(w in ft for w in ["cotton", "wool", "silk", "linen", "denim"]):
            composition["Natural"] += qty
        else:
            composition["Synthetic"] += qty
    material_composition = [{"name": k, "value": round(v, 2)} for k, v in composition.items()]
    
    # Collection by Manufacturer
    mfg_totals = {}
    for r in records:
        mfg = r.user.fullname if r.user else "Unknown Manufacturer"
        mfg_totals[mfg] = mfg_totals.get(mfg, 0.0) + r.quantity
    by_manufacturer = [{"name": k, "quantity": round(v, 2)} for k, v in mfg_totals.items()]

    return {
        "success": True,
        "totalQuantity": round(total_quantity, 2),
        "totalBatches": total_batches,
        "activeCollections": active_collections,
        "pendingProcessing": pending_processing,
        "recycledWaste": round(recycled_waste, 2),
        "todayCollections": round(today_collections, 2),
        "activeManufacturers": active_manufacturers,
        "recyclingFacilities": recycling_facilities,
        "sustainabilityScore": sustainability_score,
        "byFabric": by_fabric,
        "byMonth": by_month,
        "bySource": by_source,
        "recyclingProgress": recycling_progress,
        "materialComposition": material_composition,
        "byManufacturer": by_manufacturer,
        "recent": recent
    }

@router.get("/{id}")
def get_textile_record(id: int, auth_data=Depends(get_current_user_from_token), db=Depends(get_db)):
    current_user, payload = auth_data
    
    record = db.query(Inventory).filter(Inventory.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
        
    # Scoping: non-admins can only see their own records
    is_admin = payload.get("role") in ["admin", "Administrator"]
    if not is_admin and record.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this record")
        
    return {
        "success": True,
        "record": serialize_record(record)
    }

@router.put("/{id}")
def update_textile_record(id: int, data: TextileRecordEdit, auth_data=Depends(get_current_user_from_token), db=Depends(get_db)):
    current_user, payload = auth_data
    
    record = db.query(Inventory).filter(Inventory.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
        
    # Sustainability Manager check
    if payload.get("role") == "Sustainability Manager":
        raise HTTPException(status_code=403, detail="Sustainability Managers have read-only access and cannot edit records")

    is_admin = payload.get("role") in ["admin", "Administrator"]

    # Recycler role check: can only update processingStatus (which maps to DB status)
    if payload.get("role") == "Recycling Facility Operator" and not is_admin:
        if data.processingStatus is not None:
            record.status = data.processingStatus
            record.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(record)
            
            log_action(db, current_user.id, current_user.fullname, "Inventory Update", f"Updated status of batch {record.batch_id} to {record.status}")
            
            return {
                "success": True,
                "message": "Processing status updated successfully",
                "record": serialize_record(record)
            }
        else:
            raise HTTPException(status_code=403, detail="Recycling Facility Operators can only update the processing status")

    # Regular user check: can only edit own records
    if not is_admin and record.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this record")
        
    if data.batchId is not None:
        # Check uniqueness if batchId changes
        if data.batchId != record.batch_id:
            if db.query(Inventory).filter(Inventory.batch_id == data.batchId).first():
                raise HTTPException(status_code=400, detail="A batch with this Batch ID already exists")
        record.batch_id = data.batchId
    if data.fabricType is not None:
        record.fabric_type = data.fabricType
    if data.source is not None:
        record.source = data.source
    if data.quantity is not None:
        record.quantity = float(data.quantity)
    if data.color is not None:
        record.color = data.color
    if data.condition is not None:
        record.condition = data.condition
    if data.collectionDate is not None:
        try:
            col_date_str = data.collectionDate[:19]
            if "T" in col_date_str:
                record.collection_date = datetime.strptime(col_date_str, "%Y-%m-%dT%H:%M:%S")
            else:
                record.collection_date = datetime.strptime(col_date_str[:10], "%Y-%m-%d")
        except Exception:
            pass
    if data.processingStatus is not None:
        record.status = data.processingStatus
    if data.description is not None:
        record.remarks = data.description
    if data.image is not None:
        record.image_url = data.image
        
    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    
    log_action(db, current_user.id, current_user.fullname, "Inventory Update", f"Updated details of waste batch {record.batch_id}")
        
    return {
        "success": True,
        "message": "Waste batch updated successfully",
        "record": serialize_record(record)
    }

@router.delete("/{id}")
def delete_textile_record(id: int, auth_data=Depends(get_current_user_from_token), db=Depends(get_db)):
    current_user, payload = auth_data
    
    record = db.query(Inventory).filter(Inventory.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
        
    # Delete guard: admins and creators only
    is_admin = payload.get("role") in ["admin", "Administrator"]
    if not is_admin and record.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this record")
        
    batch_id_tmp = record.batch_id
    db.delete(record)
    db.commit()
    
    log_action(db, current_user.id, current_user.fullname, "Inventory Delete", f"Removed waste batch {batch_id_tmp} from database")
    
    return {
        "success": True,
        "message": "Waste batch deleted successfully"
    }
