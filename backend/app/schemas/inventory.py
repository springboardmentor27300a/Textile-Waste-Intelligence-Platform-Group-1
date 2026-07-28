from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import date, datetime

# Textile Inventory Item Schemas
class TextileInventoryBase(BaseModel):
    fabric_type: str
    quantity: float
    color: str
    storage_location: str
    status: str = "In Stock"

class TextileInventoryCreate(TextileInventoryBase):
    batch_id: Optional[UUID] = None

class TextileInventoryResponse(TextileInventoryBase):
    id: UUID
    batch_id: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Waste Batch Schemas
class WasteBatchBase(BaseModel):
    fabric_type: str
    source: str
    quantity: float
    color: str
    condition: str
    collection_date: date
    storage_location: str
    remarks: Optional[str] = None
    status: str = "Pending"

class WasteBatchCreate(WasteBatchBase):
    pass

class WasteBatchUpdate(BaseModel):
    fabric_type: Optional[str] = None
    source: Optional[str] = None
    quantity: Optional[float] = None
    color: Optional[str] = None
    condition: Optional[str] = None
    collection_date: Optional[date] = None
    storage_location: Optional[str] = None
    remarks: Optional[str] = None
    status: Optional[str] = None

class WasteBatchResponse(WasteBatchBase):
    id: UUID
    batch_number: str
    creator_id: UUID
    organization_id: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    inventory_items: List[TextileInventoryResponse] = []

    class Config:
        from_attributes = True

# Inventory Pagination Wrapper
class WasteBatchListResponse(BaseModel):
    total: int
    items: List[WasteBatchResponse]
    page: int
    size: int
