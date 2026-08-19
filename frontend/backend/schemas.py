from pydantic import BaseModel, EmailStr


# ==================================================
# User Registration Schema
# ==================================================

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    company: str
    location: str
    role: str
    password: str


# ==================================================
# User Login Schema
# ==================================================

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ==================================================
# Waste Inventory Schema
# ==================================================

class WasteCreate(BaseModel):
    batch_id: str
    fabric_type: str
    quantity: float
    color: str
    source: str
    condition: str
    category: str
    remarks: str


# ==================================================
# Response Schema
# ==================================================

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str
    company: str
    location: str
    role: str

    class Config:
        from_attributes = True


class WasteResponse(BaseModel):
    id: int
    batch_id: str
    fabric_type: str
    quantity: float
    color: str
    source: str
    condition: str
    category: str
    remarks: str

    class Config:
        from_attributes = True


# ==================================================
# Profile Update Schema
# ==================================================

class ProfileUpdate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    company: str
    location: str