from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from .models import UserRole, WasteCondition



# ==========================================================
# Authentication Schemas
# ==========================================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


# ==========================================================
# User Schemas
# ==========================================================

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole

# ==========================================================
# User Schemas
# ==========================================================

class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================================
# Waste Batch Schemas
# ==========================================================

class WasteBatchCreate(BaseModel):
    batch_code: str
    fabric_type: str
    source: str
    quantity_kg: float
    color: Optional[str] = None
    condition: WasteCondition = WasteCondition.GOOD
    notes: Optional[str] = None


class WasteBatchOut(BaseModel):
    id: int
    batch_code: str
    fabric_type: str
    source: str
    quantity_kg: float
    color: Optional[str] = None
    condition: WasteCondition
    notes: Optional[str] = None
    collection_date: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WasteBatchUpdate(BaseModel):
    fabric_type: Optional[str] = None
    source: Optional[str] = None
    quantity_kg: Optional[float] = None
    color: Optional[str] = None
    condition: Optional[WasteCondition] = None
    notes: Optional[str] = None


# ==========================================================
# Dataset Schemas
# ==========================================================

class DatasetResponse(BaseModel):
    id: int
    file_name: str
    file_path: str
    uploaded_by: Optional[int]
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================================
# AI Prediction Schemas
# ==========================================================

class ImageAnalysisResponse(BaseModel):
    width: int
    height: int
    channels: int
    brightness: float
    contrast: float


class MaterialPredictionResponse(BaseModel):
    material: str
    confidence: float
    class_index: int
    confidence_level: str
    requires_manual_verification: bool
    top_predictions: list[dict]
    fabric_type_classification: str
    fiber_composition_prediction: str
    blend_identification: str
    material_quality_estimation: str
    fabric_category_recognition: str
    supported_materials: list[str]


class RecommendationResponse(BaseModel):
    material: str
    waste_category: str
    reuse_potential: str
    disposal_method: str
    contamination_detection: str
    reuse_opportunity: str
    recycling_strategy: str
    upcycling_suggestion: str
    material_recovery_recommendation: str
    waste_reduction_strategy: str
    recycling_options: list[str]
    recyclability_score: float
    recyclability_level: str
    recommendation: str
    estimated_carbon_saving_kg: float
    estimated_water_saving_liters: float
    estimated_energy_saving_kwh: Optional[float] = 0.0
    landfill_diverted_kg: Optional[float] = 0.0
    circularity_score: float
    circularity_category: str
    sustainability_score: float
    material_recovery_score: Optional[float] = 0.0
    reuse_score: Optional[float] = 0.0
    environmental_benefit_score: Optional[float] = 0.0
    processing_feasibility_score: Optional[float] = 0.0
    sustainability_priority: str
    environmental_impact_summary: str
    milestone_2_summary: str
    milestone_3_summary: str


class PredictionResponse(BaseModel):
    image_analysis: ImageAnalysisResponse
    material_prediction: MaterialPredictionResponse
    recommendation: RecommendationResponse


# ==========================================================
# Prediction History
# ==========================================================

class PredictionHistoryResponse(BaseModel):
    id: int
    image_name: str
    material: str
    confidence: float
    waste_category: str
    recyclability_score: float
    recyclability_level: str
    recommendation: str
    circularity_score: Optional[float] = 0.0
    circularity_category: Optional[str] = "Disposal Recommended"
    sustainability_score: Optional[float] = 0.0
    estimated_carbon_saving_kg: Optional[float] = 0.0
    estimated_water_saving_liters: Optional[float] = 0.0
    estimated_energy_saving_kwh: Optional[float] = 0.0
    landfill_diverted_kg: Optional[float] = 0.0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EngineCalculateRequest(BaseModel):
    material: str = "Cotton"
    condition: str = "good"
    weight_kg: float = 1.0
    reuse_potential_label: Optional[str] = "High"


# ==========================================================
# Notification Schemas (Module 11)
# ==========================================================

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    category: str
    priority: str
    is_read: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)