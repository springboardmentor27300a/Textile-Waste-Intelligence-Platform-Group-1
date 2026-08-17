"""
Report Pydantic Schemas — Milestone 4
=======================================
Request/Response schemas for all 5 report types and export endpoints.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime


# ─── Request Schemas ──────────────────────────────────────────────────────────

class GenerateReportRequest(BaseModel):
    report_type: str                          # waste_classification | recycling | sustainability | environmental_impact | circular_economy
    prediction_id: Optional[str] = None       # Required for per-prediction reports
    title: Optional[str] = None               # Auto-generated if not provided
    weight_kg: Optional[float] = 100.0        # Used for environmental calculations


# ─── Embedded Section Schemas ─────────────────────────────────────────────────

class AIResultsSection(BaseModel):
    material: Optional[str] = None
    material_confidence: Optional[float] = None
    fabric_category: Optional[str] = None
    detected_color: Optional[str] = None
    waste_category: Optional[str] = None
    waste_confidence: Optional[float] = None
    recyclability_score: Optional[float] = None
    reuse_potential: Optional[float] = None
    recovery_difficulty: Optional[str] = None
    material_recovery_score: Optional[float] = None
    overall_rating: Optional[str] = None
    overall_confidence: Optional[float] = None
    model_version: Optional[str] = None
    is_recyclable: Optional[bool] = None
    is_reusable: Optional[bool] = None
    is_repairable: Optional[bool] = None
    is_hazardous: Optional[bool] = None
    is_mixed: Optional[bool] = None
    contamination_status: Optional[str] = None
    damage_detection: Optional[str] = None
    image_quality: Optional[str] = None
    # ClassificationResult enrichment
    material_probabilities: Optional[Dict[str, Any]] = None
    fiber_composition: Optional[Dict[str, Any]] = None
    waste_reason: Optional[str] = None
    waste_description: Optional[str] = None
    status_badge: Optional[str] = None
    recovery_indicator: Optional[str] = None


class ImageSection(BaseModel):
    filename: Optional[str] = None
    original_path: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    surface_quality: Optional[str] = None
    fabric_pattern: Optional[str] = None
    dominant_colors: Optional[List[str]] = None
    visible_damage: Optional[bool] = None
    contamination_detected: Optional[bool] = None


class RecyclingSection(BaseModel):
    recommended_method: Optional[str] = None
    technique: Optional[str] = None
    recovery_recommendation: Optional[str] = None
    recovery_difficulty: Optional[str] = None
    material_recovery_pct: Optional[float] = None
    success_rate: Optional[str] = None
    estimated_cost: Optional[str] = None
    estimated_time: Optional[str] = None
    environmental_benefit: Optional[str] = None
    industry_applications: Optional[str] = None
    status_timeline: Optional[List[Dict[str, Any]]] = None
    all_recommendations: Optional[List[Dict[str, Any]]] = None


class SustainabilitySection(BaseModel):
    sustainability_score: Optional[float] = None
    environmental_benefit_score: Optional[float] = None
    resource_recovery_score: Optional[float] = None
    material_longevity_score: Optional[float] = None
    waste_diversion_score: Optional[float] = None
    carbon_footprint: Optional[str] = None
    sustainability_rating: Optional[str] = None
    insights: Optional[List[str]] = None
    organization_average: Optional[float] = None
    benchmark_difference: Optional[float] = None
    benchmark_status: Optional[str] = None


class EnvironmentalSection(BaseModel):
    co2_saved: Optional[float] = None
    water_saved: Optional[float] = None
    energy_saved: Optional[float] = None
    landfill_diversion: Optional[float] = None
    resource_conservation: Optional[float] = None
    equivalent_trees: Optional[float] = None
    equivalent_electricity: Optional[float] = None
    equivalent_water_bottles: Optional[float] = None
    equivalent_household_energy: Optional[float] = None


class CircularitySection(BaseModel):
    circularity_score: Optional[float] = None
    reuse_potential: Optional[float] = None
    recovery_efficiency: Optional[float] = None
    material_retention: Optional[float] = None
    lifecycle_extension: Optional[float] = None
    circularity_index: Optional[float] = None
    classification: Optional[str] = None
    overall_rating: Optional[str] = None


class ESGSection(BaseModel):
    esg_score: Optional[float] = None
    esg_rating: Optional[str] = None
    executive_summary: Optional[str] = None

    # Environmental (E)
    sustainability_score: Optional[float] = None
    sustainability_rating: Optional[str] = None
    carbon_footprint: Optional[str] = None
    co2_saved: Optional[float] = None
    water_saved: Optional[float] = None
    landfill_diversion: Optional[float] = None
    resource_recovery_score: Optional[float] = None
    circularity_score: Optional[float] = None
    waste_diversion_score: Optional[float] = None
    recycling_recommendation: Optional[str] = None
    material_recovery_score: Optional[float] = None

    # Social (S)
    compliance_status: Optional[str] = "Not Available"
    waste_handling_safety: Optional[str] = "Not Available"
    hazardous_material_detection: Optional[str] = "Not Available"
    contamination_risk: Optional[str] = "Not Available"
    supply_chain_transparency: Optional[str] = "Not Available"

    # Governance (G)
    prediction_confidence: Optional[float] = None
    model_version: Optional[str] = "Not Available"
    dataset_used: Optional[str] = "Not Available"
    generated_by: Optional[str] = None
    generated_on: Optional[str] = None
    prediction_id: Optional[str] = None
    waste_batch_id: Optional[str] = None
    dataset_traceability: Optional[str] = "Not Available"
    audit_timestamp: Optional[str] = None


# ─── Full Report Data Schemas ─────────────────────────────────────────────────

class ReportData(BaseModel):
    """Universal report data container — all fields optional since different types use different subsets."""
    report_id: Optional[str] = None
    report_type: str
    title: str
    generated_date: Optional[str] = None

    # Author metadata
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    organization_name: Optional[str] = None
    role_name: Optional[str] = None

    # Batch reference
    prediction_id: Optional[str] = None
    waste_batch_id: Optional[str] = None

    # Report sections (populated based on report_type)
    ai_results: Optional[AIResultsSection] = None
    image_info: Optional[ImageSection] = None
    ai_recommendation_summary: Optional[str] = None
    recycling: Optional[RecyclingSection] = None
    sustainability: Optional[SustainabilitySection] = None
    environmental: Optional[EnvironmentalSection] = None
    circularity: Optional[CircularitySection] = None
    esg: Optional[ESGSection] = None


# ─── Response Schemas ─────────────────────────────────────────────────────────

class ReportListItem(BaseModel):
    id: str
    report_type: str
    title: str
    status: str
    prediction_id: Optional[str] = None
    user_name: Optional[str] = None
    organization_name: Optional[str] = None
    has_pdf: bool = False
    has_excel: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    items: List[ReportListItem]
    total: int
    page: int
    per_page: int
    pages: int


class ReportDetailResponse(BaseModel):
    id: str
    report_type: str
    title: str
    status: str
    prediction_id: Optional[str] = None
    user_name: Optional[str] = None
    organization_name: Optional[str] = None
    has_pdf: bool = False
    has_excel: bool = False
    report_data: Optional[ReportData] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
