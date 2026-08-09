from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class WasteType(str, enum.Enum):
    fabric_scraps = "fabric_scraps"
    dye_waste = "dye_waste"
    water_waste = "water_waste"
    chemical_waste = "chemical_waste"
    packaging_waste = "packaging_waste"
    cutting_waste = "cutting_waste"


class DisposalMethod(str, enum.Enum):
    recycled = "recycled"
    landfill = "landfill"
    incineration = "incineration"
    composted = "composted"
    upcycled = "upcycled"
    donated = "donated"


class WasteRecord(Base):
    __tablename__ = "waste_records"

    id = Column(Integer, primary_key=True, index=True)
    waste_type = Column(Enum(WasteType), nullable=False)
    quantity_kg = Column(Float, nullable=False)
    disposal_method = Column(Enum(DisposalMethod), nullable=False)
    recycled_percentage = Column(Float, default=0.0)
    co2_equivalent_kg = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    period_month = Column(Integer)  # 1-12
    period_year = Column(Integer)

    inventory_id = Column(Integer, ForeignKey("inventory.id"), nullable=True)
    recorded_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    inventory_item = relationship("Inventory", back_populates="waste_records")
    recorder = relationship("User", back_populates="waste_records")
