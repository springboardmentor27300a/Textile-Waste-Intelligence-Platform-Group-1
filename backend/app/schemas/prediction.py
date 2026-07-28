"""
Prediction Schemas — Pydantic Models for API Contracts
========================================================
All request/response schemas for the AI prediction endpoints.
These schemas define the API contract — they do NOT change when
the mock predictor is replaced with a real model.
"""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


# ─── Image Upload ─────────────────────────────────────────────────────────────

class ImageUploadResponse(BaseModel):
    id: str
    filename: str
    original_path: str
    processed_path: Optional[str] = None
    file_size: Optional[int] = None
    file_size_mb: Optional[float] = None
    width: Optional[int] = None
    height: Optional[int] = None
    format: Optional[str] = None
    dominant_colors: Optional[List[str]] = None
    texture_complexity: Optional[str] = None
    fabric_pattern: Optional[str] = None
    brightness: Optional[float] = None
    contrast: Optional[float] = None
    visible_damage: Optional[bool] = None
    contamination_detected: Optional[bool] = None
    wrinkle_detected: Optional[bool] = None
    tear_detected: Optional[bool] = None
    surface_quality: Optional[str] = None
    created_at: datetime
    message: str = "Image uploaded and processed successfully"

    class Config:
        from_attributes = True


# ─── Material Prediction ──────────────────────────────────────────────────────

class MaterialPredictRequest(BaseModel):
    image_id: str

class MaterialPredictResponse(BaseModel):
    image_id: str
    material: str
    confidence: float
    fabric_category: str
    detected_color: str
    texture_description: str
    fiber_composition: Dict[str, float]
    properties: Dict[str, Any]
    probabilities: Dict[str, float]

    class Config:
        from_attributes = True


# ─── Waste Classification ─────────────────────────────────────────────────────

class WasteClassifyRequest(BaseModel):
    image_id: str
    material: Optional[str] = None
    material_confidence: Optional[float] = None

class WasteClassifyResponse(BaseModel):
    image_id: str
    waste_category: str
    confidence: float
    reason: str
    material_quality: str
    severity_level: str
    description: str
    status_badge: str

    class Config:
        from_attributes = True


# ─── Recyclability Prediction ─────────────────────────────────────────────────

class RecyclabilityRequest(BaseModel):
    image_id: str
    material: Optional[str] = None
    waste_category: Optional[str] = None

class RecyclabilityResponse(BaseModel):
    image_id: str
    recyclability_score: float
    reuse_potential: float
    recovery_difficulty: str
    material_recovery_score: float
    overall_rating: str
    recovery_indicator: str

    class Config:
        from_attributes = True


# ─── Full Pipeline (Single endpoint) ─────────────────────────────────────────

class FullPredictionResponse(BaseModel):
    prediction_id: str
    image_id: str
    material: str
    confidence: float
    waste_category: str
    recyclability: float
    recovery: str
    status: str
    overall_confidence: float

    # Material Details
    material_details: Dict[str, Any]

    # Waste Details
    waste_details: Dict[str, Any]

    # Recyclability Details
    recyclability_details: Dict[str, Any]

    # Image features
    image_features: Dict[str, Any]

    created_at: datetime

    class Config:
        from_attributes = True


# ─── Prediction List/History ──────────────────────────────────────────────────

class PredictionImageInfo(BaseModel):
    id: str
    filename: str
    original_path: str
    surface_quality: Optional[str] = None

    class Config:
        from_attributes = True


class PredictionListItem(BaseModel):
    id: str
    image: Optional[PredictionImageInfo] = None
    material: str
    waste_category: str
    material_confidence: float
    waste_confidence: float
    overall_confidence: Optional[float] = None
    recyclability_score: Optional[float] = None
    recovery_difficulty: Optional[str] = None
    overall_rating: Optional[str] = None
    status: str
    user_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PredictionListResponse(BaseModel):
    items: List[PredictionListItem]
    total: int
    page: int
    per_page: int
    pages: int


# ─── Reports ─────────────────────────────────────────────────────────────────

class ReportItem(BaseModel):
    id: str
    prediction_id: str
    report_title: Optional[str] = None
    summary: Optional[str] = None
    status: str
    material: Optional[str] = None
    waste_category: Optional[str] = None
    recyclability_score: Optional[float] = None
    user_name: Optional[str] = None
    organization_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    items: List[ReportItem]
    total: int
