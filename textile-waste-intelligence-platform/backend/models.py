from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field, model_validator
from db import Base

# =====================================================================
# SQLAlchemy Database Models
# =====================================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    fullname = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), unique=True, nullable=False)
    company = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    profile_picture = Column(Text, nullable=True)
    created_at = Column(Column(DateTime, default=datetime.utcnow).type, default=datetime.utcnow)
    updated_at = Column(Column(DateTime, default=datetime.utcnow).type, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    inventories = relationship("Inventory", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    batch_id = Column(String(100), unique=True, index=True, nullable=False)
    fabric_type = Column(String(100), nullable=False)
    source = Column(String(255), nullable=False)
    quantity = Column(Float, nullable=False)
    color = Column(String(100), nullable=False)
    condition = Column(String(100), nullable=False)
    collection_date = Column(DateTime, nullable=False)
    status = Column(String(100), nullable=False, default="Pending")
    remarks = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    created_at = Column(Column(DateTime, default=datetime.utcnow).type, default=datetime.utcnow)
    updated_at = Column(Column(DateTime, default=datetime.utcnow).type, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="inventories")

# =====================================================================
# Pydantic Schemas for Validation and API Request Bodies
# =====================================================================

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2)
    email: str
    phone: str = Field(..., min_length=10)
    organization: str = Field(..., min_length=2)
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    role: str = Field(default="Textile Manufacturer")

    @model_validator(mode='after')
    def verify_passwords(self):
        if self.password != self.confirm_password:
            raise ValueError("passwords do not match")
        return self


class UserLogin(BaseModel):
    email: str
    password: str


class AdminLogin(BaseModel):
    admin_id: str
    password: str


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    organization: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None


class UserEditAdmin(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    organization: Optional[str] = None
    role: Optional[str] = None


class TextileRecordCreate(BaseModel):
    batchId: str
    fabricType: str
    source: str
    quantity: float
    color: str
    condition: str
    collectionDate: str
    processingStatus: Optional[str] = "Pending"
    description: Optional[str] = ""
    image: Optional[str] = None  # Frontend image base64 or URL


class TextileRecordEdit(BaseModel):
    batchId: Optional[str] = None
    fabricType: Optional[str] = None
    source: Optional[str] = None
    quantity: Optional[float] = None
    color: Optional[str] = None
    condition: Optional[str] = None
    collectionDate: Optional[str] = None
    processingStatus: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(Text, nullable=False)
    fabric_type = Column(String(100), nullable=False)
    material_prediction = Column(JSON, nullable=False)  # Composition dictionary
    waste_category = Column(String(100), nullable=False)
    confidence_score = Column(Float, nullable=False)
    sustainability_score = Column(Float, nullable=False)
    recommendation = Column(JSON, nullable=False)  # Ranked recommendations list
    visual_features = Column(JSON, nullable=False)  # Texture, pattern, color, damage, contamination
    sustainability_metrics = Column(JSON, nullable=False)  # Water, carbon footprint, resource score
    timestamp = Column(Column(DateTime, default=datetime.utcnow).type, default=datetime.utcnow)

    # Relationships
    user = relationship("User")


class AIAnalysisCreate(BaseModel):
    image: str  # Base64 string of the image


class AIAnalysisResponse(BaseModel):
    id: int
    user_id: int
    image_url: str
    fabric_type: str
    material_prediction: dict
    waste_category: str
    confidence_score: float
    sustainability_score: float
    recommendation: list
    visual_features: dict
    sustainability_metrics: dict
    timestamp: datetime

    class Config:
        from_attributes = True


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    username = Column(String(255), nullable=False)
    action = Column(String(255), nullable=False)
    detail = Column(Text, nullable=False)
    timestamp = Column(Column(DateTime, default=datetime.utcnow).type, default=datetime.utcnow)

    user = relationship("User", back_populates="activity_logs")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(80), nullable=False, default="platform")
    is_read = Column(Boolean, default=False)
    created_at = Column(Column(DateTime, default=datetime.utcnow).type, default=datetime.utcnow)
    context = Column(JSON, default=dict)

    user = relationship("User")


