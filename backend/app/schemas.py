from pydantic import BaseModel, EmailStr, field_validator
from datetime import date
from typing import Optional


# ==================================================
# User Schemas
# ==================================================

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str
    organization: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ==================================================
# Google OAuth Schemas
# ==================================================

class GoogleLogin(BaseModel):
    token: str


class GoogleRegister(BaseModel):
    token: str
    role: str
    organization: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    organization: Optional[str] = None
    auth_provider: str

    class Config:
        from_attributes = True


# ==================================================
# Textile Inventory Schemas
# ==================================================

class TextileInventoryCreate(BaseModel):
    waste_batch_id: str
    fabric_type: str
    source: str
    quantity: float
    color: Optional[str] = None
    condition: Optional[str] = None
    collection_date: date

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, value):
        if value <= 0:
            raise ValueError("Quantity must be greater than 0.")
        return value

    @field_validator("collection_date")
    @classmethod
    def validate_collection_date(cls, value):
        if value > date.today():
            raise ValueError("Future collection dates are not allowed.")
        return value

    @field_validator("waste_batch_id")
    @classmethod
    def validate_batch_id(cls, value):
        if not value.strip():
            raise ValueError("Waste Batch ID cannot be empty.")
        return value

    @field_validator("fabric_type")
    @classmethod
    def validate_fabric(cls, value):
        if not value.strip():
            raise ValueError("Fabric Type cannot be empty.")
        return value

    @field_validator("source")
    @classmethod
    def validate_source(cls, value):
        if not value.strip():
            raise ValueError("Source cannot be empty.")
        return value


class TextileInventoryResponse(BaseModel):
    id: int
    waste_batch_id: str
    fabric_type: str
    source: str
    quantity: float
    color: Optional[str] = None
    condition: Optional[str] = None
    collection_date: date
    created_by: int

    class Config:
        from_attributes = True


# ==================================================
# Profile Update Schema
# ==================================================

class ProfileUpdate(BaseModel):
    full_name: str
    organization: str

# ==========================
# Forgot Password
# ==========================

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str