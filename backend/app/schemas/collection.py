from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CollectionBase(BaseModel):
    waste_source_id: int
    collection_date: date
    collected_by: str
    vehicle_number: Optional[str] = None
    collection_method: str
    total_weight: float
    collection_status: str = "Scheduled"
    remarks: Optional[str] = None


class CollectionCreate(CollectionBase):
    pass


class CollectionUpdate(BaseModel):
    waste_source_id: Optional[int] = None
    collection_date: Optional[date] = None
    collected_by: Optional[str] = None
    vehicle_number: Optional[str] = None
    collection_method: Optional[str] = None
    total_weight: Optional[float] = None
    collection_status: Optional[str] = None
    remarks: Optional[str] = None


class CollectionResponse(CollectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int

    collection_code: str

    analysis_status: str

    inventory_status: str

    recycling_status: str

    report_status: str

    recyclable_weight: float

    rejected_weight: float

    recovery_percentage: float

    sustainability_score: float

    carbon_saved: float

    water_saved: float

    energy_saved: float

    created_at: datetime

    updated_at: datetime