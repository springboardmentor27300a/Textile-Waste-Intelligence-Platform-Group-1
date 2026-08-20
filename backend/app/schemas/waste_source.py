from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class WasteSourceBase(BaseModel):
    organization_name: str = Field(..., min_length=2, max_length=150)
    source_type: str = Field(..., min_length=2, max_length=50)
    industry: str = Field(..., min_length=2, max_length=80)
    organization_size: str = Field(..., min_length=1, max_length=30)

    contact_person: str = Field(..., min_length=2, max_length=100)

    email: EmailStr

    phone: str = Field(..., min_length=10, max_length=20)

    address: str = Field(..., min_length=5, max_length=255)

    city: str = Field(..., min_length=2, max_length=80)

    state: str = Field(..., min_length=2, max_length=80)

    country: str = Field(..., min_length=2, max_length=80)

    postal_code: str = Field(..., min_length=3, max_length=15)

    collection_frequency: str = Field(..., min_length=2, max_length=30)

    preferred_collection_day: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    average_monthly_waste: float = Field(
        ...,
        gt=0,
        description="Average monthly textile waste in kilograms",
    )

    status: str = Field(
        default="Active",
        max_length=20,
    )

    notes: Optional[str] = Field(
        default=None,
        max_length=500,
    )


class WasteSourceCreate(WasteSourceBase):
    pass


class WasteSourceUpdate(BaseModel):
    organization_name: Optional[str] = Field(None, min_length=2, max_length=150)
    source_type: Optional[str] = Field(None, min_length=2, max_length=50)
    industry: Optional[str] = Field(None, min_length=2, max_length=80)
    organization_size: Optional[str] = Field(None, min_length=1, max_length=30)

    contact_person: Optional[str] = Field(None, min_length=2, max_length=100)

    email: Optional[EmailStr] = None

    phone: Optional[str] = Field(None, min_length=10, max_length=20)

    address: Optional[str] = Field(None, min_length=5, max_length=255)

    city: Optional[str] = Field(None, min_length=2, max_length=80)

    state: Optional[str] = Field(None, min_length=2, max_length=80)

    country: Optional[str] = Field(None, min_length=2, max_length=80)

    postal_code: Optional[str] = Field(None, min_length=3, max_length=15)

    collection_frequency: Optional[str] = Field(None, min_length=2, max_length=30)

    preferred_collection_day: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    average_monthly_waste: Optional[float] = Field(
        default=None,
        gt=0,
    )

    status: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    notes: Optional[str] = Field(
        default=None,
        max_length=500,
    )


class WasteSourceResponse(WasteSourceBase):
    id: int
    source_code: str

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)