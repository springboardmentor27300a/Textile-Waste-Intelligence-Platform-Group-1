from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import User, Role
from app.schemas.schemas import UserRegister, UserLogin, UserResponse, Token, UserUpdate
from app.utils.security import verify_password, get_password_hash
from app.auth.jwt_handler import create_access_token
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if role exists
    role = db.query(Role).filter(Role.name == user_in.role).first()
    if not role:
        # Create role dynamically if not found
        role = Role(name=user_in.role)
        db.add(role)
        db.commit()
        db.refresh(role)

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        # Update existing user to facilitate background creation & quick login
        existing_user.full_name = user_in.full_name
        existing_user.hashed_password = get_password_hash(user_in.password)
        existing_user.role_id = role.id
        existing_user.phone_number = user_in.phone_number
        db.commit()
        db.refresh(existing_user)
        return existing_user
    
    # Create new user
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role_id=role.id,
        phone_number=user_in.phone_number
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create JWT access token
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.email is not None:
        # Check if email is being changed and is already taken
        if user_update.email != current_user.email:
            existing_user = db.query(User).filter(User.email == user_update.email).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use by another account."
                )
            current_user.email = user_update.email
    if user_update.phone_number is not None:
        current_user.phone_number = user_update.phone_number
    if user_update.password is not None:
        current_user.hashed_password = get_password_hash(user_update.password)
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Administrator-only endpoint to retrieve all registered accounts, including passwords.
    """
    if not current_user.role or current_user.role.name != "Administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only Administrators are allowed to view all user credentials."
        )
        
    users = db.query(User).all()
    
    results = []
    for u in users:
        results.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role.name if u.role else "N/A",
            "phone_number": u.phone_number,
            "hashed_password": u.hashed_password
        })
    return results
