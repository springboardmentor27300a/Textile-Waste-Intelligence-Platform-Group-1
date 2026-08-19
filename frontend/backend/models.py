from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func

from backend.database import Base


# ==================================================
# User Table
# ==================================================

class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)

    email = Column(String(100), unique=True, nullable=False, index=True)

    phone = Column(String(20), nullable=False)

    company = Column(String(100), nullable=False)

    location = Column(String(100), nullable=False)

    role = Column(String(50), nullable=False)

    password = Column(String(255), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ==================================================
# Textile Waste Inventory Table
# ==================================================

class WasteInventory(Base):

    __tablename__ = "waste_inventory"

    id = Column(Integer, primary_key=True, index=True)

    batch_id = Column(String(50), unique=True, nullable=False)

    fabric_type = Column(String(50), nullable=False)

    quantity = Column(Float, nullable=False)

    color = Column(String(50), nullable=False)

    source = Column(String(100), nullable=False)

    condition = Column(String(50), nullable=False)

    category = Column(String(50), nullable=False)

    remarks = Column(String(500))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # ==================================================
# Prediction History Table
# ==================================================

class PredictionHistory(Base):

    __tablename__ = "prediction_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    image_name = Column(
        String(255),
        nullable=False
    )

    fabric_type = Column(
        String(50),
        nullable=False
    )

    confidence = Column(
        Float,
        nullable=False
    )

    composition = Column(
        String(100),
        nullable=False
    )

    visual_assessment = Column(
        String(200),
        nullable=False
    )

    waste_category = Column(
        String(50),
        nullable=False
    )

    recommendation = Column(
        String(255),
        nullable=False
    )

    carbon_saved = Column(
        String(50),
        nullable=False
    )

    estimated_emission = Column(
        String(50),
        nullable=False
    )

    waste_diversion = Column(
        String(50),
        nullable=False
    )

    circular_economy = Column(
        String(150),
        nullable=False
    )

    sustainability_score = Column(
        Integer,
        nullable=False
    )

    environmental_impact = Column(
        String(50),
        nullable=False
    )

    water_usage = Column(
        String(50),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )