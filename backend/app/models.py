import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Enum,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from .database import Base


# ==========================
# User Roles
# ==========================

class UserRole(str, enum.Enum):
    RECYCLING_FACILITY_OPERATOR = "recycling_facility_operator"
    SUSTAINABILITY_MANAGER = "sustainability_manager"
    TEXTILE_MANUFACTURER = "textile_manufacturer"
    ADMINISTRATOR = "administrator"


# ==========================
# User Model
# ==========================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)

    email = Column(String, unique=True, index=True, nullable=False)

    hashed_password = Column(String, nullable=False)

    role = Column(
        Enum(UserRole),
        nullable=False,
        default=UserRole.RECYCLING_FACILITY_OPERATOR,
    )

    is_active = Column(Integer, default=1)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    waste_batches = relationship(
        "WasteBatch",
        back_populates="owner",
    )

    predictions = relationship(
        "Prediction",
        back_populates="user",
        cascade="all, delete-orphan",
    )


# ==========================
# Waste Condition
# ==========================

class WasteCondition(str, enum.Enum):
    NEW = "new"
    GOOD = "good"
    WORN = "worn"
    DAMAGED = "damaged"
    CONTAMINATED = "contaminated"


# ==========================
# Waste Batch Model
# ==========================

class WasteBatch(Base):
    __tablename__ = "waste_batches"

    id = Column(Integer, primary_key=True, index=True)

    batch_code = Column(
        String,
        unique=True,
        index=True,
        nullable=False,
    )

    fabric_type = Column(String, nullable=False)

    source = Column(String, nullable=False)

    quantity_kg = Column(Float, nullable=False)

    color = Column(String)

    condition = Column(
        Enum(WasteCondition),
        default=WasteCondition.GOOD,
    )

    collection_date = Column(
        DateTime,
        default=datetime.utcnow,
    )

    notes = Column(String)

    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
    )

    owner = relationship(
        "User",
        back_populates="waste_batches",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )


# ==========================
# Dataset Model
# ==========================

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    file_name = Column(
        String,
        nullable=False,
    )

    file_path = Column(
        String,
        nullable=False,
    )

    uploaded_by = Column(
        Integer,
        nullable=True,
    )

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow,
    )


# ==========================
# Prediction Model
# ==========================

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    image_name = Column(
        String,
        nullable=False,
    )

    image_path = Column(
        String,
        nullable=True,
    )

    material = Column(
        String,
        nullable=False,
    )

    confidence = Column(
        Float,
        nullable=False,
    )

    waste_category = Column(
        String,
        nullable=False,
    )

    reuse_potential = Column(
        String,
        nullable=False,
    )

    disposal_method = Column(
        String,
        nullable=False,
    )

    recyclability_score = Column(
        Float,
        nullable=False,
    )

    recyclability_level = Column(
        String,
        nullable=False,
    )

    recommendation = Column(
        String,
        nullable=False,
    )

    estimated_carbon_saving_kg = Column(
        Float,
        default=0.0,
    )

    estimated_water_saving_liters = Column(
        Float,
        default=0.0,
    )

    circularity_score = Column(
        Float,
        default=0.0,
    )

    circularity_category = Column(
        String,
        nullable=True,
    )

    sustainability_score = Column(
        Float,
        default=0.0,
    )

    material_recovery_score = Column(
        Float,
        default=0.0,
    )

    reuse_score = Column(
        Float,
        default=0.0,
    )

    environmental_benefit_score = Column(
        Float,
        default=0.0,
    )

    processing_feasibility_score = Column(
        Float,
        default=0.0,
    )

    estimated_energy_saving_kwh = Column(
        Float,
        default=0.0,
    )

    landfill_diverted_kg = Column(
        Float,
        default=0.0,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    user = relationship(
        "User",
        back_populates="predictions",
    )


# ==========================
# Notification Model (Module 11)
# ==========================

class NotificationCategory(str, enum.Enum):
    WASTE_COLLECTION = "waste_collection"
    RECYCLING_OPPORTUNITY = "recycling_opportunity"
    SUSTAINABILITY_MILESTONE = "sustainability_milestone"
    INVENTORY_WARNING = "inventory_warning"
    PLATFORM_ANNOUNCEMENT = "platform_announcement"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    category = Column(Enum(NotificationCategory), default=NotificationCategory.PLATFORM_ANNOUNCEMENT)
    priority = Column(String, default="normal")
    is_read = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)