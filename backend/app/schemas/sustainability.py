from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class CarbonFootprintResponse(BaseModel):
    fabric_type: str
    quantity_kg: float
    co2e_kg: float
    water_L: float

class WasteDiversionResponse(BaseModel):
    batch_id: int
    quantity_kg: float
    diverted_kg: float
    landfill_kg: float
    diversion_rate: float

class ResourceRecoveryResponse(BaseModel):
    batch_id: int
    quantity_kg: float
    recyclability_rate: float
    recovered_value_usd: float
    potential_savings_co2_kg: float
    potential_savings_water_L: float

class CircularEconomyAnalysisResponse(BaseModel):
    total_batches: int
    total_quantity_kg: float
    total_diverted_kg: float
    total_landfill_kg: float
    overall_diversion_rate: float
    total_co2e_saved_kg: float
    total_water_saved_L: float
    avg_circularity_score: float

class BenchmarkMetric(BaseModel):
    metric: str
    twip: float
    industry_average: float
    percentage_difference: float

class SustainabilityBenchmarkResponse(BaseModel):
    benchmarks: List[BenchmarkMetric]

class EntityAnalysisRequest(BaseModel):
    batch_ids: List[int]

class SustainabilityMetricsResponse(BaseModel):
    id: int
    waste_batch_id: int
    co2_saved_kg: float
    water_saved_liters: float
    landfill_reduction_kg: float
    energy_saved_mj: float
    circularity_score: float
    sustainability_score: float

    class Config:
        from_attributes = True

class EnvironmentalImpactResponse(BaseModel):
    id: int
    waste_batch_id: int
    co2_saved_kg: float
    water_saved_liters: float
    landfill_reduction_kg: float
    energy_recovered_mj: float
    environmental_benefit_score: float

    class Config:
        from_attributes = True

class RecommendationDetail(BaseModel):
    strategy: str
    confidence: float
    rationale: str

class RecyclingRecommendationResponse(BaseModel):
    id: int
    waste_batch_id: int
    recommendations: List[RecommendationDetail]

    class Config:
        from_attributes = True

class CircularityAnalyticsResponse(BaseModel):
    id: int
    recovery_rate: float
    reuse_rate: float
    recycling_rate: float
    diversion_rate: float
    avg_circularity_score: float
    recorded_date: str

    class Config:
        from_attributes = True

class SustainabilityCalculateRequest(BaseModel):
    batch_id: int

class RecommendationCreateRequest(BaseModel):
    batch_id: int
