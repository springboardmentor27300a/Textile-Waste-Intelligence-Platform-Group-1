"""
Pydantic schemas for Inventory
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InventoryCreate(BaseModel):
    fabric_type: str
    source: str
    quantity_kg: float
    color: Optional[str] = None
    condition: str
    collection_date: Optional[datetime] = None
    remarks: Optional[str] = None
    classification: Optional[str] = None

class InventoryUpdate(BaseModel):
    fabric_type: Optional[str] = None
    source: Optional[str] = None
    quantity_kg: Optional[float] = None
    color: Optional[str] = None
    condition: Optional[str] = None
    collection_date: Optional[datetime] = None
    remarks: Optional[str] = None
    classification: Optional[str] = None

class InventoryResponse(BaseModel):
    id: int
    waste_batch_id: str
    fabric_type: str
    source: str
    quantity_kg: float
    color: Optional[str] = None
    condition: str
    collection_date: Optional[datetime] = None
    remarks: Optional[str] = None
    classification: Optional[str] = None
    sustainability_score: Optional[float] = None
    image_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
