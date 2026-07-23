from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


FacilityType = Literal[
    "MANUFACTURING",
    "PROCESSING",
    "WAREHOUSE",
    "COLLECTION_CENTER",
    "RECYCLING_UNIT",
]


class FacilityCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    facility_code: str = Field(min_length=2, max_length=50)
    facility_type: FacilityType | None = None
    address: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    country: str = Field(default="India", min_length=2, max_length=100)

    @field_validator(
        "name",
        "facility_code",
        "address",
        "city",
        "state",
        "country",
        mode="before",
    )
    @classmethod
    def strip_text(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("facility_code")
    @classmethod
    def normalize_facility_code(cls, value: str) -> str:
        return value.upper()


class FacilityUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    facility_type: FacilityType | None = None
    address: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    country: str | None = Field(default=None, min_length=2, max_length=100)
    is_active: bool | None = None

    @field_validator(
        "name",
        "address",
        "city",
        "state",
        "country",
        mode="before",
    )
    @classmethod
    def strip_text(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value


class FacilityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    name: str
    facility_code: str
    facility_type: str | None
    address: str | None
    city: str | None
    state: str | None
    country: str
    is_active: bool
    created_at: datetime
    updated_at: datetime