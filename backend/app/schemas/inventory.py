from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class InventoryBase(BaseModel):
    collection_id: int | None = None
    fabric: str = Field(..., min_length=2, max_length=100)
    source: str = Field(..., min_length=2, max_length=150)
    color: str = Field(..., min_length=2, max_length=50)
    condition: str = Field(..., min_length=2, max_length=30)
    quantity: float = Field(..., gt=0)
    collection_date: date
    storage_location: str | None = Field(default=None, max_length=100)
    rack_number: str | None = Field(default=None, max_length=50)
    status: str = Field(default="Available", max_length=30)
    notes: str | None = Field(default=None, max_length=500)


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(InventoryBase):
    pass


class InventoryResponse(InventoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    batch_id: str
    created_at: datetime
    updated_at: datetime
