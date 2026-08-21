from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from typing import Optional
from datetime import datetime
from database import get_db
from models import User, Inventory, ActivityLog
from routes.auth import get_current_user
from routes.admin import get_current_admin
from auth_helpers import hash_password
from utils.activity_logger import log_action
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/users", tags=["users"])

# Request validation schemas for user creation/modification by admin
class UserCreateAdmin(BaseModel):
    name: str = Field(..., min_length=2)
    email: str
    phone: str = Field(..., min_length=10)
    organization: str = Field(..., min_length=2)
    password: str = Field(..., min_length=6)
    role: str = Field(default="Textile Manufacturer")

class UserUpdateAdmin(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    organization: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None

class StatusToggleRequest(BaseModel):
    status: bool

class RoleChangeRequest(BaseModel):
    role: str

def serialize_user_full(u: User, db):
    # Calculate total inventory metrics
    inventory_count = db.query(Inventory).filter(Inventory.user_id == u.id).count()
    quantity_sum = db.query(func.sum(Inventory.quantity)).filter(Inventory.user_id == u.id).scalar() or 0.0
    
    return {
        "id": u.id,
        "name": u.fullname,
        "email": u.email,
        "phone": u.phone,
        "organization": u.company,
        "role": u.role,
        "isActive": u.is_active if u.is_active is not None else True,
        "profilePicture": u.profile_picture,
        "registrationDate": u.created_at.isoformat() if u.created_at else None,
        "lastLogin": u.last_login.isoformat() if u.last_login else None,
        "totalInventory": round(quantity_sum, 1),
        "batchCount": inventory_count
    }

@router.get("")
def list_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    current_admin: User = Depends(get_current_admin),
    db=Depends(get_db)
):
    query = db.query(User)
    
    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            (User.fullname.ilike(search_filter)) |
            (User.email.ilike(search_filter)) |
            (User.phone.ilike(search_filter)) |
            (User.company.ilike(search_filter))
        )
        
    if role:
        query = query.filter(User.role == role)
        
    if status is not None and status != "":
        is_active_val = status.lower() in ["true", "active", "1"]
        query = query.filter(User.is_active == is_active_val)
        
    total = query.count()
    pages = max(1, (total + limit - 1) // limit)
    offset = (page - 1) * limit
    
    users = query.order_by(User.created_at.desc()).offset(offset).limit(limit).all()
    
    return {
        "success": True,
        "users": [serialize_user_full(u, db) for u in users],
        "pagination": {
            "page": page,
            "pages": pages,
            "total": total,
            "limit": limit
        }
    }

@router.get("/{id}")
def get_user_detail(id: int, current_admin: User = Depends(get_current_admin), db=Depends(get_db)):
    u = db.query(User).filter(User.id == id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Compile user details
    inventory_items = db.query(Inventory).filter(Inventory.user_id == u.id).order_by(Inventory.created_at.desc()).all()
    from routes.inventory_routes import serialize_record
    serialized_inventory = [serialize_record(item) for item in inventory_items]
    
    # User activity logs
    logs = db.query(ActivityLog).filter(ActivityLog.user_id == u.id).order_by(ActivityLog.timestamp.desc()).limit(20).all()
    serialized_logs = [{
        "id": log.id,
        "action": log.action,
        "detail": log.detail,
        "timestamp": log.timestamp.isoformat() if log.timestamp else None
    } for log in logs]
    
    total_quantity = sum(item.quantity for item in inventory_items)
    
    return {
        "success": True,
        "profile": serialize_user_full(u, db),
        "inventory": serialized_inventory,
        "activity": serialized_logs,
        "stats": {
            "total_batches": len(inventory_items),
            "total_quantity": round(total_quantity, 1)
        }
    }

@router.post("", status_code=201)
def create_user(data: UserCreateAdmin, current_admin: User = Depends(get_current_admin), db=Depends(get_db)):
    email_clean = data.email.strip().lower()
    if db.query(User).filter(User.email == email_clean).first():
        raise HTTPException(status_code=400, detail="Email is already in use")
    if db.query(User).filter(User.phone == data.phone).first():
        raise HTTPException(status_code=400, detail="Phone number is already in use")
        
    hashed = hash_password(data.password)
    user = User(
        fullname=data.name,
        email=email_clean,
        phone=data.phone,
        company=data.organization,
        password_hash=hashed,
        role=data.role,
        is_active=True
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    log_action(db, current_admin.id, current_admin.fullname, "User Registration", f"Admin created user {user.fullname} ({user.email})")
    
    return {
        "success": True,
        "message": "User account created successfully",
        "user": serialize_user_full(user, db)
    }

@router.put("/{id}")
def update_user(id: int, data: UserUpdateAdmin, current_admin: User = Depends(get_current_admin), db=Depends(get_db)):
    u = db.query(User).filter(User.id == id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
        
    if data.name is not None:
        u.fullname = data.name
    if data.email is not None:
        email_clean = data.email.strip().lower()
        if email_clean != u.email:
            if db.query(User).filter(User.email == email_clean).first():
                raise HTTPException(status_code=400, detail="Email address is already in use")
            u.email = email_clean
    if data.phone is not None:
        if data.phone != u.phone:
            if db.query(User).filter(User.phone == data.phone).first():
                raise HTTPException(status_code=400, detail="Phone number is already in use")
            u.phone = data.phone
    if data.organization is not None:
        u.company = data.organization
    if data.role is not None:
        if u.email == "madhulikagoddumarri@gmail.com" and data.role != "Administrator":
            raise HTTPException(status_code=400, detail="Cannot downgrade primary Administrator role")
        u.role = data.role
    if data.password is not None and data.password.strip() != "":
        u.password_hash = hash_password(data.password)
        
    db.commit()
    db.refresh(u)
    
    log_action(db, current_admin.id, current_admin.fullname, "Profile Update", f"Admin updated account details for {u.fullname}")
    
    return {
        "success": True,
        "message": "User account updated successfully",
        "user": serialize_user_full(u, db)
    }

@router.delete("/{id}")
def delete_user(id: int, current_admin: User = Depends(get_current_admin), db=Depends(get_db)):
    u = db.query(User).filter(User.id == id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
        
    if u.email == "madhulikagoddumarri@gmail.com":
        raise HTTPException(status_code=400, detail="Cannot delete primary Administrator account")
        
    db.delete(u)
    db.commit()
    
    log_action(db, current_admin.id, current_admin.fullname, "User Delete", f"Admin deleted account {u.fullname} ({u.email})")
    
    return {
        "success": True,
        "message": "User deleted successfully"
    }

@router.patch("/{id}/status")
def toggle_status(id: int, data: StatusToggleRequest, current_admin: User = Depends(get_current_admin), db=Depends(get_db)):
    u = db.query(User).filter(User.id == id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
        
    if u.email == "madhulikagoddumarri@gmail.com" and not data.status:
        raise HTTPException(status_code=400, detail="Cannot deactivate primary Administrator account")
        
    u.is_active = data.status
    db.commit()
    
    action = "Activate" if data.status else "Deactivate"
    log_action(db, current_admin.id, current_admin.fullname, f"Status Changed", f"Admin set {u.fullname} status to {action}")
    
    return {
        "success": True,
        "message": f"User status set to {'active' if data.status else 'inactive'} successfully",
        "user": serialize_user_full(u, db)
    }

@router.patch("/{id}/role")
def change_role(id: int, data: RoleChangeRequest, current_admin: User = Depends(get_current_admin), db=Depends(get_db)):
    u = db.query(User).filter(User.id == id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
        
    if u.email == "madhulikagoddumarri@gmail.com" and data.role != "Administrator":
        raise HTTPException(status_code=400, detail="Cannot downgrade primary Administrator role")
        
    old_role = u.role
    u.role = data.role
    db.commit()
    
    log_action(db, current_admin.id, current_admin.fullname, "Role Change", f"Admin changed {u.fullname} role from {old_role} to {data.role}")
    
    return {
        "success": True,
        "message": f"User role successfully updated to {data.role}",
        "user": serialize_user_full(u, db)
    }
