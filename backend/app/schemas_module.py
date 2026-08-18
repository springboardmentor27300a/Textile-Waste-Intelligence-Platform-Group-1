from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


# ── Auth Schemas ─────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: UserRole = UserRole.analyst


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class UserRoleUpdate(BaseModel):
    role: UserRole


class UserStatusUpdate(BaseModel):
    is_active: bool


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None


# ── Supplier Schemas ──────────────────────────────────────────────────────────

class SupplierBase(BaseModel):
    name: str
    contact_email: Optional[str] = None
    country: Optional[str] = None
    certification: Optional[str] = None
    waste_rating: Optional[float] = 0.0


class SupplierCreate(SupplierBase):
    pass


class SupplierOut(SupplierBase):
    id: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ── Inventory Schemas ─────────────────────────────────────────────────────────

class InventoryBase(BaseModel):
    batch_code: str
    material_type: str
    quantity_kg: float
    color: Optional[str] = "raw"
    grade: Optional[str] = "A"
    location: Optional[str] = None
    status: Optional[str] = "active"
    supplier_id: Optional[int] = None


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseModel):
    quantity_kg: Optional[float] = None
    color: Optional[str] = None
    grade: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    supplier_id: Optional[int] = None


class InventoryOut(InventoryBase):
    id: int
    date_received: Optional[datetime]
    created_at: Optional[datetime]
    supplier: Optional[SupplierOut] = None

    class Config:
        from_attributes = True


# ── Waste Record Schemas ──────────────────────────────────────────────────────

class WasteRecordBase(BaseModel):
    waste_type: str
    quantity_kg: float
    disposal_method: str
    recycled_percentage: Optional[float] = 0.0
    co2_equivalent_kg: Optional[float] = 0.0
    notes: Optional[str] = None
    period_month: Optional[int] = None
    period_year: Optional[int] = None
    inventory_id: Optional[int] = None


class WasteRecordCreate(WasteRecordBase):
    pass


class WasteRecordOut(WasteRecordBase):
    id: int
    recorded_at: Optional[datetime]

    class Config:
        from_attributes = True


# ── Analytics Schema ──────────────────────────────────────────────────────────

class WasteAnalytics(BaseModel):
    total_waste_kg: float
    total_recycled_kg: float
    recycling_rate: float
    by_material: dict
    by_disposal: dict
    monthly_trend: list
    top_waste_type: str


class DashboardStats(BaseModel):
    total_inventory_kg: float
    total_inventory_items: int
    total_waste_kg: float
    recycling_rate: float
    active_suppliers: int
    recent_waste_records: int


# ── Notification Schemas ──────────────────────────────────────────────────────

from app.models.notification import NotificationType

class NotificationCreate(BaseModel):
    title: str
    message: str
    type: NotificationType = NotificationType.info
    role_target: Optional[UserRole] = None
    user_id: Optional[int] = None

class NotificationOut(BaseModel):
    id: int
    user_id: Optional[int]
    role_target: Optional[UserRole]
    type: NotificationType
    title: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
