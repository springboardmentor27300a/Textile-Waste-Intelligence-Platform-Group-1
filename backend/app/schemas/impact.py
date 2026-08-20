from pydantic import BaseModel, Field
from typing import List, Dict, Any

class ImpactResponse(BaseModel):
    batch_id: int
    co2_saved_kg: float
    water_saved_L: float
    landfill_reduced_kg: float

class EnvironmentalSavings(BaseModel):
    co2_saved_kg: float
    water_saved_L: float
    value_saved_usd: float

class MaterialBreakdownItem(BaseModel):
    fabric_type: str
    quantity_kg: float
    co2_saved_kg: float

class SustainabilityReport(BaseModel):
    entity_id: int
    reporting_period: str
    total_batches_analyzed: int
    total_quantity_managed_kg: float
    landfill_diversion_rate_pct: float
    environmental_savings: EnvironmentalSavings
    material_breakdown: List[MaterialBreakdownItem]
