from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleResponse(RoleBase):
    id: UUID

    class Config:
        from_attributes = True

class OrganizationBase(BaseModel):
    name: str
    type: Optional[str] = None
    description: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    contact_details: Optional[str] = None
    profile_picture: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role_name: str # e.g. "Administrator", "Sustainability Manager", etc.
    organization_name: Optional[str] = None # Will auto-create/assign organization

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    contact_details: Optional[str] = None
    organization_name: Optional[str] = None
    profile_picture: Optional[str] = None
    password: Optional[str] = None

class UserAdminUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role_name: Optional[str] = None
    organization_name: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    role: RoleResponse
    organization: Optional[OrganizationResponse] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
