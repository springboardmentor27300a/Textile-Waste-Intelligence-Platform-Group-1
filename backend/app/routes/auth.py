from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.config import settings
from app.models.user import User, Role, Organization
from app.models.support import Session as UserSession, ActivityLog
from app.schemas.auth import Token, LoginRequest, RefreshRequest
from app.schemas.user import UserCreate, UserResponse
from app.auth.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.auth.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email address already exists."
        )

    # Fetch role
    role = db.query(Role).filter(Role.name == user_in.role_name).first()
    if not role:
        raise HTTPException(
            status_code=400,
            detail=f"Role '{user_in.role_name}' does not exist. Available roles: Administrator, Sustainability Manager, Recycling Facility Operator, Textile Manufacturer"
        )

    # Manage organization assignment/creation
    org = None
    if user_in.organization_name:
        org = db.query(Organization).filter(Organization.name == user_in.organization_name).first()
        if not org:
            org_type = "Recycler" if "operator" in user_in.role_name.lower() else "Manufacturer"
            org = Organization(
                name=user_in.organization_name,
                type=org_type,
                description=f"Auto-generated organization for {user_in.organization_name}",
                contact_email=user_in.email
            )
            db.add(org)
            db.commit()
            db.refresh(org)

    # Create new user
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role_id=role.id,
        organization_id=org.id if org else None,
        contact_details=user_in.contact_details,
        profile_picture=user_in.profile_picture,
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create initial activity log
    log = ActivityLog(
        user_id=new_user.id,
        action="REGISTER",
        details=f"User registered with role {user_in.role_name} and organization {user_in.organization_name or 'None'}"
    )
    db.add(log)
    db.commit()

    return new_user

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )

    # Create tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    if login_data.remember_me:
        # Increase access token duration for remember-me (e.g., 24 hours)
        access_token_expires = timedelta(hours=24)
        
    access_token = create_access_token(user.id, expires_delta=access_token_expires)
    
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(user.id, expires_delta=refresh_token_expires)

    # Store refresh token in Sessions
    session_expires = datetime.utcnow() + refresh_token_expires
    new_session = UserSession(
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=session_expires,
        is_revoked=False
    )
    db.add(new_session)
    
    # Log the action
    log = ActivityLog(
        user_id=user.id,
        action="LOGIN",
        details=f"User logged in from API client (Remember me: {login_data.remember_me})"
    )
    db.add(log)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
def refresh_token(refresh_in: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(refresh_in.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
        
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token payload"
        )

    # Check active database session
    session = db.query(UserSession).filter(
        UserSession.refresh_token == refresh_in.refresh_token,
        UserSession.is_revoked == False,
        UserSession.expires_at > datetime.utcnow()
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is expired, revoked, or invalid"
        )

    # Generate new tokens
    access_token = create_access_token(user_id)
    new_refresh_token = create_refresh_token(user_id)

    # Revoke old session and save new session
    session.is_revoked = True
    
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    new_session = UserSession(
        user_id=session.user_id,
        refresh_token=new_refresh_token,
        expires_at=datetime.utcnow() + refresh_token_expires,
        is_revoked=False
    )
    db.add(new_session)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(refresh_in: RefreshRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(UserSession).filter(
        UserSession.refresh_token == refresh_in.refresh_token,
        UserSession.user_id == current_user.id
    ).first()
    
    if session:
        session.is_revoked = True
        
    # Log logout action
    log = ActivityLog(
        user_id=current_user.id,
        action="LOGOUT",
        details="User logged out and session revoked."
    )
    db.add(log)
    db.commit()
    
    return {"detail": "Successfully logged out"}
