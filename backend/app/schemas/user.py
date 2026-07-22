from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserResponse(BaseModel):
    id: int
    organization_id: int | None
    role_id: int

    full_name: str
    email: EmailStr
    phone: str | None

    is_active: bool
    is_verified: bool

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )