import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Integer, Float, DateTime, Date, Enum, Boolean, ForeignKey, Text
)
from sqlalchemy.orm import relationship

from .database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    ADMIN = "administrator"
    RECYCLING_OPERATOR = "recycling_facility_operator"
    SUSTAINABILITY_MANAGER = "sustainability_manager"
    MANUFACTURER = "textile_manufacturer"


class FabricType(str, enum.Enum):
    COTTON = "cotton"
    POLYESTER = "polyester"
    WOOL = "wool"
    SILK = "silk"
    LINEN = "linen"
    DENIM = "denim"
    NYLON = "nylon"
    RAYON = "rayon"
    ACRYLIC = "acrylic"
    MIXED = "mixed_fabrics"
    UNKNOWN = "unclassified"


class WasteCondition(str, enum.Enum):
    NEW_SURPLUS = "new_surplus"
    LIGHTLY_WORN = "lightly_worn"
    WORN = "worn"
    DAMAGED = "damaged"
    CONTAMINATED = "contaminated"


class WasteCategory(str, enum.Enum):
    UNCLASSIFIED = "unclassified"
    RECYCLABLE = "recyclable"
    REUSABLE = "reusable"
    REPAIRABLE = "repairable"
    UPCYCLABLE = "upcyclable"
    COMPOSTABLE = "compostable"
    HAZARDOUS = "hazardous_textile_waste"


class BatchStatus(str, enum.Enum):
    REGISTERED = "registered"
    IN_ANALYSIS = "in_analysis"
    CLASSIFIED = "classified"
    ROUTED = "routed"
    PROCESSED = "processed"


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_uuid)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    organization = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.MANUFACTURER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    batches = relationship("WasteBatch", back_populates="registered_by_user")


class WasteBatch(Base):
    __tablename__ = "waste_batches"
    id = Column(String, primary_key=True, default=gen_uuid)
    batch_code = Column(String, unique=True, index=True, nullable=False)
    fabric_type = Column(Enum(FabricType), nullable=False, default=FabricType.UNKNOWN)
    fabric_blend_notes = Column(String, nullable=True)
    source = Column(String, nullable=False)
    source_type = Column(String, nullable=False, default="post_consumer")
    quantity_kg = Column(Float, nullable=False)
    color = Column(String, nullable=True)
    condition = Column(Enum(WasteCondition), nullable=False, default=WasteCondition.WORN)
    collection_date = Column(Date, nullable=False)
    category = Column(Enum(WasteCategory), nullable=False, default=WasteCategory.UNCLASSIFIED)
    status = Column(Enum(BatchStatus), nullable=False, default=BatchStatus.REGISTERED)
    notes = Column(Text, nullable=True)
    image_reference = Column(String, nullable=True)
    registered_by = Column(String, ForeignKey("users.id"), nullable=False)
    registered_by_user = relationship("User", back_populates="batches")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    analyses = relationship("ImageAnalysis", back_populates="batch", cascade="all, delete-orphan")


class DatasetStatus(str, enum.Enum):
    REGISTERED = "registered"
    DOWNLOAD_PENDING = "download_pending"
    READY = "ready"
    ERROR = "error"


class Dataset(Base):
    __tablename__ = "datasets"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    purpose = Column(String, nullable=False)
    source_url = Column(String, nullable=False)
    license = Column(String, nullable=True)
    local_path = Column(String, nullable=True)
    record_count = Column(Integer, nullable=True)
    status = Column(Enum(DatasetStatus), nullable=False, default=DatasetStatus.REGISTERED)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class MaterialInsight(Base):
    __tablename__ = "material_insights"
    id = Column(String, primary_key=True, default=gen_uuid)
    material_label = Column(String, nullable=False)
    matched_fabric_type = Column(String, nullable=True)
    avg_sustainability_score = Column(Float, nullable=False)
    sample_size = Column(Integer, nullable=False)
    source_dataset = Column(String, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ClassificationMethod(str, enum.Enum):
    TRAINED_MODEL = "trained_model"
    HEURISTIC = "heuristic"
    USER_DECLARED = "user_declared"


class ImageAnalysis(Base):
    __tablename__ = "image_analyses"
    id = Column(String, primary_key=True, default=gen_uuid)
    batch_id = Column(String, ForeignKey("waste_batches.id"), nullable=False)
    batch = relationship("WasteBatch", back_populates="analyses")

    image_filename = Column(String, nullable=True)
    image_path = Column(String, nullable=True)

    dominant_color_hex = Column(String, nullable=True)
    brightness = Column(Float, nullable=True)
    texture_score = Column(Float, nullable=True)
    contamination_score = Column(Float, nullable=True)
    damage_score = Column(Float, nullable=True)

    predicted_fabric_type = Column(Enum(FabricType), nullable=True)
    fabric_confidence = Column(Float, nullable=True)
    classification_method = Column(Enum(ClassificationMethod), nullable=False, default=ClassificationMethod.HEURISTIC)
    material_rationale = Column(Text, nullable=True)

    recommended_category = Column(Enum(WasteCategory), nullable=True)
    recyclability_score = Column(Float, nullable=True)
    rationale = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    @property
    def declared_fabric_type(self):
        return self.batch.fabric_type if self.batch else None

    @property
    def image_url(self):
        return f"/uploads/{self.image_path}" if self.image_path else None



class NotificationType(str, enum.Enum):
    COLLECTION_ALERT = "collection_alert"
    RECYCLING_OPPORTUNITY = "recycling_opportunity"
    SUSTAINABILITY_MILESTONE = "sustainability_milestone"
    INVENTORY_WARNING = "inventory_warning"
    ANNOUNCEMENT = "announcement"


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), nullable=False, default=NotificationType.ANNOUNCEMENT)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)  # None = broadcast to all
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

