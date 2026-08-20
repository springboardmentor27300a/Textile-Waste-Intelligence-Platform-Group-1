"""
Textile Inventory model
"""
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class TextileInventory(Base):
    __tablename__ = "textile_inventory"

    id = Column(Integer, primary_key=True, index=True)
    waste_batch_id = Column(String(50), unique=True, index=True)
    fabric_type = Column(String(100), nullable=False)
    source = Column(String(200), nullable=False)
    quantity_kg = Column(Float, nullable=False)
    color = Column(String(50), nullable=True)
    condition = Column(String(50), nullable=False)  # Good, Fair, Poor, Critical
    collection_date = Column(DateTime(timezone=True))
    remarks = Column(Text, nullable=True)
    classification = Column(String(100), nullable=True)  # Recyclable, Reusable, etc.
    sustainability_score = Column(Float, nullable=True)
    image_url = Column(String(500), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
