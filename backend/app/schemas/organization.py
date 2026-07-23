from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)


class OrganizationCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=150,
    )

    organization_type: str | None = Field(
        default=None,
        max_length=100,
    )

    email: EmailStr | None = None

    phone: str | None = Field(
        default=None,
        max_length=30,
    )

    address: str | None = Field(
        default=None,
        max_length=255,
    )

    city: str | None = Field(
        default=None,
        max_length=100,
    )

    state: str | None = Field(
        default=None,
        max_length=100,
    )

    country: str = Field(
        default="India",
        min_length=2,
        max_length=100,
    )

    @field_validator(
        "name",
        "organization_type",
        "phone",
        "address",
        "city",
        "state",
        "country",
    )
    @classmethod
    def strip_text(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            return None

        return value


class OrganizationUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    organization_type: str | None = Field(
        default=None,
        max_length=100,
    )

    email: EmailStr | None = None

    phone: str | None = Field(
        default=None,
        max_length=30,
    )

    address: str | None = Field(
        default=None,
        max_length=255,
    )

    city: str | None = Field(
        default=None,
        max_length=100,
    )

    state: str | None = Field(
        default=None,
        max_length=100,
    )

    country: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    @field_validator(
        "name",
        "organization_type",
        "phone",
        "address",
        "city",
        "state",
        "country",
    )
    @classmethod
    def strip_text(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            return None

        return value


class OrganizationResponse(BaseModel):
    id: int

    name: str
    organization_type: str | None

    email: EmailStr | None
    phone: str | None

    address: str | None
    city: str | None
    state: str | None
    country: str

    is_active: bool

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )