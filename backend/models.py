from sqlalchemy import Column, Integer, String
from database import Base


# ---------------- User ---------------- #

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="User")


# ---------------- Inventory ---------------- #

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    fabric = Column(String, nullable=False)
    weight = Column(String, nullable=False)
    status = Column(String, default="Available")


# ---------------- Dataset ---------------- #

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    fabric_type = Column(String, nullable=False)
    status = Column(String, default="Uploaded")


# ---------------- Prediction History ---------------- #

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)

    fabric = Column(String)
    confidence = Column(String)

    category = Column(String)
    recyclability = Column(String)
    recommendation = Column(String)

    fiber_composition = Column(String)
    material_quality = Column(String)

    texture = Column(String)
    pattern = Column(String)
    color_type = Column(String)

    damage = Column(String)
    contamination = Column(String)

    reuse_potential = Column(String)
    disposal = Column(String)

    recycling_method = Column(String)

    environmental_impact = Column(String)

    co2_saving = Column(String)
    water_saving = Column(String)

    circular_score = Column(String)

    created_at = Column(String)