from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import List, Optional

# --- Role Schemas ---
class RoleResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

# --- User Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: str = Field(..., min_length=2, description="Full name must be at least 2 characters")
    role: str = Field(..., description="Role must be one of: Administrator, Recycling Facility Operator, Sustainability Manager, Textile Manufacturer")
    phone_number: Optional[str] = Field(default=None, description="Optional contact phone number")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    phone_number: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None
    role: RoleResponse
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# --- Inventory/Location Schemas ---
class InventoryCreate(BaseModel):
    location_name: str
    capacity_kg: float = Field(..., gt=0)

class InventoryResponse(BaseModel):
    id: int
    location_name: str
    capacity_kg: float

    class Config:
        from_attributes = True

# --- Textile Waste Detail Schemas ---
class TextileWasteCreate(BaseModel):
    material_composition: str = Field(..., description="e.g. 100% Cotton, 50% Poly / 50% Wool")
    recyclability_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    has_contaminants: bool = Field(default=False)

class TextileWasteResponse(BaseModel):
    id: int
    waste_batch_id: int
    material_composition: Optional[str]
    recyclability_rate: float
    has_contaminants: bool

    class Config:
        from_attributes = True

# --- Waste Batch (Main Inventory) Schemas ---
class WasteBatchCreate(BaseModel):
    fabric_type: str = Field(..., description="Fabric type, e.g., Cotton, Polyester, Wool, Blend")
    source: str = Field(..., description="Source, e.g., Post-consumer, Pre-consumer, Industrial")
    quantity: float = Field(..., gt=0, description="Quantity in kg")
    color: str = Field(..., description="Color of fabric")
    condition: str = Field(..., description="Condition, e.g., Clean, Damaged, Recyclable")
    collection_date: date
    status: str = Field(default="Collected", description="Status, e.g., Collected, Sorting, Processing, Recycled, Disposed")
    inventory_id: Optional[int] = None
    textile_wastes: Optional[List[TextileWasteCreate]] = None

class WasteBatchUpdate(BaseModel):
    fabric_type: Optional[str] = None
    source: Optional[str] = None
    quantity: Optional[float] = None
    color: Optional[str] = None
    condition: Optional[str] = None
    collection_date: Optional[date] = None
    status: Optional[str] = None
    inventory_id: Optional[int] = None
    textile_wastes: Optional[List[TextileWasteCreate]] = None

# Simple User representation inside batch response
class UserMinResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr

    class Config:
        from_attributes = True

class WasteBatchResponse(BaseModel):
    id: int
    fabric_type: str
    source: str
    quantity: float
    color: str
    condition: str
    collection_date: date
    status: str
    operator_id: Optional[int]
    inventory_id: Optional[int]
    operator: Optional[UserMinResponse] = None
    inventory: Optional[InventoryResponse] = None
    textile_wastes: List[TextileWasteResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

# Paginated list schema
class WasteBatchListResponse(BaseModel):
    total: int
    page: int
    size: int
    pages: int
    items: List[WasteBatchResponse]
