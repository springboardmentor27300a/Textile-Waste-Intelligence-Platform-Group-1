from pydantic import BaseModel, EmailStr, Field


# ---------- User ---------- #

class RegisterUser(BaseModel):

    name: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=6,
        max_length=100
    )


class LoginUser(BaseModel):

    email: EmailStr

    password: str = Field(
        ...,
        min_length=1
    )


# ---------- Inventory ---------- #

class InventoryItem(BaseModel):

    fabric: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    weight: str = Field(
        ...,
        min_length=1,
        max_length=50
    )


# ---------- Dataset ---------- #

class DatasetItem(BaseModel):

    filename: str = Field(
        ...,
        min_length=1,
        max_length=255
    )

    fabric_type: str = Field(
        ...,
        min_length=2,
        max_length=100
    )


# ---------- Prediction History ---------- #

class PredictionHistoryItem(BaseModel):

    fabric: str
    confidence: str

    category: str
    recyclability: str
    recommendation: str

    fiber_composition: str
    material_quality: str

    texture: str
    pattern: str
    color_type: str

    damage: str
    contamination: str

    reuse_potential: str
    disposal: str

    recycling_method: str

    environmental_impact: str

    co2_saving: str
    water_saving: str

    circular_score: str

    created_at: str