from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
)


class AnalysisBase(BaseModel):

    # --------------------------------------------------
    # Image
    # --------------------------------------------------

    image_path: str

    image_name: str | None = None

    # --------------------------------------------------
    # AI Prediction
    # --------------------------------------------------

    material: str

    confidence: float

    # --------------------------------------------------
    # Material Intelligence
    # --------------------------------------------------

    primary_material: str

    secondary_material: str | None = None

    composition: str | None = None

    material_category: str

    material_quality: str | None = None

    biodegradable: bool

    recyclable: bool

    recycled_content: float

    # --------------------------------------------------
    # Image Intelligence
    # --------------------------------------------------

    dominant_color: str

    color_palette: list

    texture: str

    pattern: str

    defects: list

    contamination_level: str

    # --------------------------------------------------
    # Waste Intelligence
    # --------------------------------------------------

    waste_category: str

    waste_subcategory: str

    reuse_potential: str

    recycling_method: str

    # --------------------------------------------------
    # Circular Economy Scores
    # --------------------------------------------------

    recyclability_score: float

    reuse_score: float

    sustainability_score: float

    material_recovery_score: float

    circularity_score: float

    environmental_score: float

    overall_score: float

    # --------------------------------------------------
    # Environmental Assessment
    # --------------------------------------------------

    carbon_footprint: float

    carbon_savings: float

    water_consumption: float

    water_savings: float

    energy_consumption: float

    energy_savings: float

    landfill_diversion: float

    resource_conservation: float

    # --------------------------------------------------
    # Sustainability Intelligence
    # --------------------------------------------------

    sustainability_rating: str

    sustainability_status: str

    environmental_impact: str

    circular_economy_index: float

    recycling_target: float

    recycling_progress: float

    esg_score: float

    esg_readiness: str

    # --------------------------------------------------
    # Recommendation Engine
    # --------------------------------------------------

    priority: str

    recommendation: str

    next_step: str

    expected_benefit: str


class AnalysisCreate(
    AnalysisBase,
):
    pass


class AnalysisResponse(
    AnalysisBase,
):

    id: int

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )