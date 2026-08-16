from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None
    format: str

class DatasetRegister(DatasetBase):
    num_images: Optional[int] = 0
    size_bytes: Optional[int] = 0
    version: Optional[str] = "1.0.0"
    is_used_by_model: Optional[bool] = False
    training_date: Optional[datetime] = None
    model_compatibility: Optional[str] = None

class DatasetResponse(DatasetBase):
    id: UUID
    size_bytes: int
    num_images: int
    status: str
    upload_path: Optional[str] = None
    version: str
    is_used_by_model: bool
    training_date: Optional[datetime] = None
    model_compatibility: Optional[str] = None
    uploaded_by: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Statistics summary schema
class DatasetStats(BaseModel):
    total_datasets: int
    total_images: int
    total_size_bytes: int
    format_distribution: dict
