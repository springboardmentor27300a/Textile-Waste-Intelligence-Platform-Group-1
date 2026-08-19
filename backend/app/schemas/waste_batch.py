from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator


ALLOWED_SOURCES = {
    "PRODUCTION_SCRAP",
    "CUTTING_WASTE",
    "QUALITY_REJECT",
    "DEAD_STOCK",
    "RETURNED_PRODUCT",
    "POST_CONSUMER",
    "SAMPLE_WASTE",
    "OTHER",
}

ALLOWED_CONDITIONS = {
    "CLEAN",
    "LIGHTLY_USED",
    "DAMAGED",
    "CONTAMINATED",
    "MIXED",
    "UNKNOWN",
}


def normalize_optional_text(value: str | None) -> str | None:
    if value is None:
        return None

    value = value.strip()
    return value or None


class WasteBatchCreate(BaseModel):
    facility_id: int | None = Field(default=None, gt=0)
    source: str
    quantity_kg: Decimal = Field(gt=0, decimal_places=2)
    declared_material: str | None = Field(default=None, max_length=100)
    color: str | None = Field(default=None, max_length=50)
    condition: str | None = None
    collection_date: date
    notes: str | None = None

    @field_validator("source")
    @classmethod
    def validate_source(cls, value: str) -> str:
        value = value.strip().upper()

        if value not in ALLOWED_SOURCES:
            raise ValueError(
                f"Invalid source. Allowed values: "
                f"{', '.join(sorted(ALLOWED_SOURCES))}"
            )

        return value

    @field_validator("condition")
    @classmethod
    def validate_condition(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip().upper()

        if value not in ALLOWED_CONDITIONS:
            raise ValueError(
                f"Invalid condition. Allowed values: "
                f"{', '.join(sorted(ALLOWED_CONDITIONS))}"
            )

        return value

    @field_validator("declared_material", "color", "notes")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        return normalize_optional_text(value)


class WasteBatchUpdate(BaseModel):
    facility_id: int | None = Field(default=None, gt=0)
    source: str | None = None
    quantity_kg: Decimal | None = Field(
        default=None,
        gt=0,
        decimal_places=2,
    )
    declared_material: str | None = Field(default=None, max_length=100)
    color: str | None = Field(default=None, max_length=50)
    condition: str | None = None
    collection_date: date | None = None
    notes: str | None = None
    is_archived: bool | None = None

    @field_validator("source")
    @classmethod
    def validate_source(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip().upper()

        if value not in ALLOWED_SOURCES:
            raise ValueError(
                f"Invalid source. Allowed values: "
                f"{', '.join(sorted(ALLOWED_SOURCES))}"
            )

        return value

    @field_validator("condition")
    @classmethod
    def validate_condition(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip().upper()

        if value not in ALLOWED_CONDITIONS:
            raise ValueError(
                f"Invalid condition. Allowed values: "
                f"{', '.join(sorted(ALLOWED_CONDITIONS))}"
            )

        return value

    @field_validator("declared_material", "color", "notes")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        return normalize_optional_text(value)

class WasteBatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    batch_code: str
    organization_id: int
    facility_id: int | None
    created_by: int

    source: str
    quantity_kg: Decimal
    declared_material: str | None
    color: str | None
    condition: str | None
    collection_date: date

    processing_status: str
    notes: str | None
    is_archived: bool

    created_at: datetime
    updated_at: datetime


class BatchStatusUpdate(BaseModel):
    status: str
    remarks: str | None = None


class BatchStatusHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    batch_id: int
    changed_by: int
    old_status: str | None
    new_status: str
    remarks: str | None
    changed_at: datetime


class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int


class WasteBatchListResponse(BaseModel):
    items: list[WasteBatchResponse]
    pagination: PaginationMeta