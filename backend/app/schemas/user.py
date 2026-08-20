from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "operator"

    organization_name: str | None = None
    organization_type: str | None = None
    business_category: str | None = None
    organization_contact: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: str

    organization_name: str | None = None
    organization_type: str | None = None
    business_category: str |None = None
    organization_contact: str | None = None


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str

    organization_name: str | None = None
    organization_type: str | None = None
    business_category: str | None = None
    organization_contact: str | None = None

    class Config:
        from_attributes = True