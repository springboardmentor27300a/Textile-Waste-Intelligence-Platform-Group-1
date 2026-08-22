from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from .models import (
    UserRole, FabricType, WasteCondition, WasteCategory, BatchStatus,
    DatasetStatus, ClassificationMethod
)


class UserCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    organization: Optional[str] = None
    password: str = Field(min_length=8, max_length=128)
    role: UserRole


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    full_name: str
    email: EmailStr
    organization: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class WasteBatchCreate(BaseModel):
    fabric_type: FabricType
    fabric_blend_notes: Optional[str] = None
    source: str = Field(min_length=2, max_length=200)
    source_type: str = Field(default="post_consumer")
    quantity_kg: float = Field(gt=0)
    color: Optional[str] = None
    condition: WasteCondition
    collection_date: date
    notes: Optional[str] = None


class WasteBatchUpdate(BaseModel):
    fabric_type: Optional[FabricType] = None
    fabric_blend_notes: Optional[str] = None
    source: Optional[str] = None
    source_type: Optional[str] = None
    quantity_kg: Optional[float] = Field(default=None, gt=0)
    color: Optional[str] = None
    condition: Optional[WasteCondition] = None
    collection_date: Optional[date] = None
    category: Optional[WasteCategory] = None
    status: Optional[BatchStatus] = None
    notes: Optional[str] = None


class WasteBatchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    batch_code: str
    fabric_type: FabricType
    fabric_blend_notes: Optional[str] = None
    source: str
    source_type: str
    quantity_kg: float
    color: Optional[str] = None
    condition: WasteCondition
    collection_date: date
    category: WasteCategory
    status: BatchStatus
    notes: Optional[str] = None
    registered_by: str
    created_at: datetime
    updated_at: datetime


class InventorySummary(BaseModel):
    total_batches: int
    total_quantity_kg: float
    by_fabric_type: dict
    by_category: dict
    by_status: dict
    by_condition: dict


class DatasetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    slug: str
    purpose: str
    source_url: str
    license: Optional[str] = None
    local_path: Optional[str] = None
    record_count: Optional[int] = None
    status: DatasetStatus
    notes: Optional[str] = None
    created_at: datetime


class MaterialInsightOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    material_label: str
    matched_fabric_type: Optional[str] = None
    avg_sustainability_score: float
    sample_size: int
    source_dataset: str
    updated_at: datetime


class ImageAnalysisOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    batch_id: str
    image_filename: Optional[str] = None
    image_url: Optional[str] = None
    dominant_color_hex: Optional[str] = None
    brightness: Optional[float] = None
    texture_score: Optional[float] = None
    contamination_score: Optional[float] = None
    damage_score: Optional[float] = None
    declared_fabric_type: Optional[FabricType] = None
    predicted_fabric_type: Optional[FabricType] = None
    fabric_confidence: Optional[float] = None
    classification_method: ClassificationMethod
    material_rationale: Optional[str] = None
    recommended_category: Optional[WasteCategory] = None
    recyclability_score: Optional[float] = None
    rationale: Optional[str] = None
    created_at: datetime


class ClassificationReportSummary(BaseModel):
    total_batches: int
    total_analyzed: int
    by_predicted_fabric_type: dict
    by_recommended_category: dict
    average_recyclability_score: Optional[float] = None
    high_contamination_count: int
    high_damage_count: int


# ---------- Milestone 3: Sustainability intelligence ----------

class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    message: str
    type: str
    user_id: Optional[str] = None
    is_read: bool
    created_at: datetime


class SustainabilityAssessmentOut(BaseModel):
    batch_id: str
    batch_code: str
    fabric_type: FabricType
    quantity_kg: float
    category: WasteCategory
    recommended_pathway: str
    pathway_options: list[str]
    co2_saved_kg: float
    water_saved_liters: float
    landfill_diverted_kg: float
    recyclability_component: Optional[float] = 70.0
    condition_component: Optional[float] = 60.0
    reuse_component: Optional[float] = 50.0
    environmental_component: Optional[float] = 50.0
    feasibility_component: Optional[float] = 60.0
    circularity_score: Optional[float] = 65.0
    circularity_category: Optional[str] = "Moderate Recovery Potential"
    rationale: str


class CircularEconomySummary(BaseModel):
    total_batches: int
    total_quantity_kg: float
    diverted_quantity_kg: float
    diversion_rate_pct: float
    total_co2_saved_kg: float
    total_water_saved_liters: float
    total_landfill_diverted_kg: float
    by_pathway: dict
    by_category_quantity_kg: dict

