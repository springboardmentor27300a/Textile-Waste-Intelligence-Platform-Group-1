from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
 
from .. import models, schemas
from ..database import get_db
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return schemas.Token(access_token=token, user=user)


@router.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.post("/oauth2/login", response_model=schemas.Token)
def oauth2_login(payload: dict, db: Session = Depends(get_db)):
    provider = payload.get("provider", "google")
    email = payload.get("email", "demo.operator@textile-intelligence.org")
    role = payload.get("role", models.UserRole.RECYCLING_FACILITY_OPERATOR)
    full_name = payload.get("full_name", f"OAuth User ({provider.capitalize()})")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(
            full_name=full_name,
            email=email,
            hashed_password=hash_password("oauth2_secure_token"),
            role=role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return schemas.Token(access_token=token, user=user)

