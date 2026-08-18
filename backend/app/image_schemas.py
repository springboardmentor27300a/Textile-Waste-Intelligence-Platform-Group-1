from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Image Schemas (Milestone 2) ───────────────────────────────────────────────

class ImageOut(BaseModel):
    """Returned whenever an image record is retrieved or created."""
    id:            int
    filename:      str
    original_name: str
    file_url:      str
    file_size:     int
    mime_type:     str
    uploaded_by_id: Optional[int] = None
    uploaded_at:   Optional[datetime] = None
    user_sequence_num: Optional[int] = None

    class Config:
        from_attributes = True


class ImageListOut(BaseModel):
    total: int
    images: List[ImageOut]


# ── Material Classification Schemas ───────────────────────────────────────────

class MaterialClassifyRequest(BaseModel):
    image_id: int


class MaterialClassifyResponse(BaseModel):
    image_id:   int
    user_sequence_num: Optional[int] = None
    material:   str
    confidence: float
    fabric_type: str
    fiber_composition: str
    blend_identification: str
    material_quality: str
    fabric_category: str


# ── Waste Classification Schemas ──────────────────────────────────────────────

class WasteClassifyRequest(BaseModel):
    material: str


class WasteClassifyResponse(BaseModel):
    material:   str
    category:   str
    confidence: float
    handling:   str = ""   # Handling guidance
    disposal:   str = ""   # Disposal recommendation
    recyclability_assessment: str = ""
    reuse_potential: str = ""
    contamination_detection: str = ""


# ── Recyclability Assessment Schemas ──────────────────────────────────────────

class RecyclabilityRequest(BaseModel):
    material:      str
    condition:     str   # excellent | good | fair | poor | unusable
    contamination: str   # none | low | medium | high


class RecyclabilityResponse(BaseModel):
    material:      str
    condition:     str
    contamination: str
    score:         int
    status:        str


# ── Report Schema ─────────────────────────────────────────────────────────────

class TextileReport(BaseModel):
    image_id:           int
    inventory_id:       Optional[int] = None
    user_sequence_num:  Optional[int] = None
    image_url:          str
    original_name:      str
    material:           str
    material_confidence: float
    waste_category:     str
    waste_confidence:   float
    waste_handling:     str = ""   # Handling guidance from waste classifier
    waste_disposal:     str = ""   # Disposal recommendation from waste classifier
    recyclability_score: int
    recovery_status:    str
    generated_at:       str


# ── AI Stats Summary Schema ───────────────────────────────────────────────────

class AIStatsResponse(BaseModel):
    """Aggregate AI analysis statistics across all uploaded textile images."""
    total_images:                  int
    material_distribution:         dict   # { material_name: count }
    waste_category_distribution:   dict   # { category_name: count }
    average_recyclability_score:   float
    recyclability_status_counts:   dict   # { status_label: count }
    generated_at:                  str


# ── Recommendation Schemas ────────────────────────────────────────────────────

class RecommendationRequest(BaseModel):
    material: str
    category: str
    image_id: Optional[int] = None

class RecommendationResponse(BaseModel):
    material: str
    waste_category: str
    recyclability: str
    reuse_potential: str
    recommendations: List[str]


# ── Image Analysis Schemas ────────────────────────────────────────────────────

class ImageAnalysisResponse(BaseModel):
    fabric_detection: str
    material_recognition: str
    texture_analysis: str
    color_analysis: str
    fabric_pattern: str
    damage_detection: dict
    contamination_detection: dict
    overall_confidence: float
    # New fields for unified response
    material_classification: Optional[MaterialClassifyResponse] = None
    waste_classification: Optional[WasteClassifyResponse] = None
    recommendations: Optional[RecommendationResponse] = None
