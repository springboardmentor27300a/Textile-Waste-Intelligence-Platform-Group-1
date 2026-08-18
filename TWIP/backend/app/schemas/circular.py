from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class CircularityScoreMetrics(BaseModel):
    recyclability: float
    condition: float
    reuse_potential: float
    environmental_benefit: float
    processing_feasibility: float

class CircularityScoreResponse(BaseModel):
    batch_id: int
    circularity_score: float
    category: str
    metrics: CircularityScoreMetrics

class TimeTrendItem(BaseModel):
    label: str
    value: float

class CircularityAnalyticsResponse(BaseModel):
    average_score: float
    category_distribution: Dict[str, int]
    fabric_type_breakdown: Dict[str, float]
    source_breakdown: Dict[str, float]
    time_trend: List[TimeTrendItem]

class MaterialFlowResponse(BaseModel):
    inflow_kg: float
    recovered_kg: float
    diverted_kg: float
    disposed_kg: float

class CircularAnalyticsReportResponse(BaseModel):
    circularity: CircularityAnalyticsResponse
    material_flow: MaterialFlowResponse
