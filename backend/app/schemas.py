from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from .models import BatchStatus, Role, WasteCategory


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ----------------------------------------------------------------- auth/users

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    organisation: str = ""
    role: Role = Role.recycler


class UserOut(ORMModel):
    id: int
    email: EmailStr
    full_name: str
    organisation: str
    role: Role
    is_active: bool
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: str | None = None
    organisation: str | None = None
    role: Role | None = None
    is_active: bool | None = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# --------------------------------------------------------------------- batches

class BatchCreate(BaseModel):
    fabric_type: str = "Unknown"
    source: str = ""
    quantity_kg: float = Field(default=0, ge=0, le=1_000_000)
    colour: str = ""
    condition: str = "good"
    collection_date: datetime | None = None
    notes: str = ""


class BatchUpdate(BaseModel):
    fabric_type: str | None = None
    source: str | None = None
    quantity_kg: float | None = Field(default=None, ge=0)
    colour: str | None = None
    condition: str | None = None
    status: BatchStatus | None = None
    notes: str | None = None


class AnalysisOut(ORMModel):
    id: int
    batch_id: int
    image_path: str
    visual_features: dict
    dominant_colour: str
    texture_class: str
    pattern_class: str
    damage_score: float
    contamination_score: float
    defect_detection: dict | None = None
    garment_recognition: dict | None = None
    material: str
    material_confidence: float
    material_probabilities: dict
    fibre_composition: dict
    is_blend: bool
    material_quality: float
    waste_category: WasteCategory
    waste_probabilities: dict
    recyclability_score: float
    reuse_score: float
    sustainability_score: float
    material_recovery_score: float
    circularity_score: float
    circularity_band: str
    score_components: dict
    score_weights: dict
    recommendations: list
    environmental_impact: dict
    inference_ms: float
    created_at: datetime


class BatchOut(ORMModel):
    id: int
    batch_code: str
    fabric_type: str
    source: str
    quantity_kg: float
    colour: str
    condition: str
    collection_date: datetime
    status: BatchStatus
    notes: str
    owner_id: int
    created_at: datetime
    latest_analysis: AnalysisOut | None = None


class NotificationOut(ORMModel):
    id: int
    kind: str
    title: str
    body: str
    read: bool
    created_at: datetime
