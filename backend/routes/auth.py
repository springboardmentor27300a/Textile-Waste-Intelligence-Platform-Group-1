from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header, status
from typing import Optional
from database import get_db
from models import User, UserRegister, UserLogin, ProfileUpdate
from auth_helpers import hash_password, verify_password, generate_token, decode_token
from utils.activity_logger import log_action

router = APIRouter(prefix="/api/auth", tags=["auth"])

def serialize_user(user: User):
    if not user:
        return None
    return {
        "id": user.id,
        "name": user.fullname,
        "email": user.email,
        "phone": user.phone,
        "organization": user.company,
        "role": user.role,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None
    }

def get_current_user(authorization: Optional[str] = Header(None), db=Depends(get_db)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format (must be Bearer <token>)")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    allowed_roles = ["user", "admin", "Administrator", "Textile Manufacturer", "Recycling Facility Operator", "Sustainability Manager"]
    if not payload or payload.get("role") not in allowed_roles:
        raise HTTPException(status_code=401, detail="Invalid or expired user token")
        
    user_id = payload.get("id")
    # For Admin accounts, payload "id" is email
    if payload.get("role") in ["admin", "Administrator"] and "@" in str(user_id):
        user = db.query(User).filter(User.email == user_id).first()
    else:
        try:
            user = db.query(User).filter(User.id == int(user_id)).first()
        except ValueError:
            user = db.query(User).filter(User.email == user_id).first()
        
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/register", status_code=201)
def register(data: UserRegister, db=Depends(get_db)):
    email_clean = data.email.strip().lower()
    
    # Check uniqueness of email
    if db.query(User).filter(User.email == email_clean).first():
        raise HTTPException(status_code=400, detail="An account with this email already exists")
        
    # Check uniqueness of phone
    if db.query(User).filter(User.phone == data.phone).first():
        raise HTTPException(status_code=400, detail="An account with this phone number already exists")
        
    hashed = hash_password(data.password)
    user = User(
        fullname=data.name,
        email=email_clean,
        phone=data.phone,
        company=data.organization,
        password_hash=hashed,
        role=data.role
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    log_action(db, user.id, user.fullname, "User Registration", f"Registered new user account as {user.role}")
    
    return {
        "success": True,
        "message": "User registered successfully",
        "user": serialize_user(user)
    }
@router.post("/login")
def login(data: UserLogin, db=Depends(get_db)):
    email_clean = data.email.strip().lower()

    user = db.query(User).filter(User.email == email_clean).first()

    print("Email entered:", email_clean)
    print("User found:", user)

    if user:
        print("Stored hash:", user.password_hash)
        print("Password matches:", verify_password(data.password, user.password_hash))

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_role = "admin" if user.role == "Administrator" else user.role
    token = generate_token({"id": str(user.id), "role": token_role})

    user.last_login = datetime.utcnow()
    db.commit()

    log_action(db, user.id, user.fullname, "Login", "Successfully signed into account")

    return {
        "success": True,
        "message": "Login successful",
        "token": token,
        "user": serialize_user(user)
    }
@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "success": True,
        "user": serialize_user(current_user)
    }


@router.get("/debug/profile")
def debug_profile(authorization: Optional[str] = Header(None), current_user: User = Depends(get_current_user)):
    # Returns token payload and serialized user for debugging role/claims
    token_payload = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        from auth_helpers import decode_token
        token_payload = decode_token(token)

    return {
        "success": True,
        "token_payload": token_payload,
        "user": serialize_user(current_user)
    }

@router.put("/profile")
def update_profile(data: ProfileUpdate, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    if data.name is not None:
        current_user.fullname = data.name
    if data.organization is not None:
        current_user.company = data.organization
    if data.phone is not None:
        # Check uniqueness if phone changes
        if data.phone != current_user.phone:
            if db.query(User).filter(User.phone == data.phone).first():
                raise HTTPException(status_code=400, detail="This phone number is already in use")
        current_user.phone = data.phone
        
    if data.password is not None and data.password.strip() != "":
        if len(data.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        current_user.password_hash = hash_password(data.password)
        
    db.commit()
    db.refresh(current_user)
    
    log_action(db, current_user.id, current_user.fullname, "Profile Update", "Modified profile configurations")
    
    return {
        "success": True,
        "message": "Profile updated successfully",
        "user": serialize_user(current_user)
    }
