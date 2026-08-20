from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class RecommendationItem(BaseModel):
    strategy: str
    confidence_score: int
    rationale: str

class RecommendationResponse(BaseModel):
    batch_id: int
    primary_recommendation: Optional[RecommendationItem] = None
    ranked_recommendations: List[RecommendationItem]
    is_eligible_for_direct_reuse: bool
    upcycling_concept: str
    material_recovery_advice: str
    waste_reduction_tips: List[str]
