from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class InventoryStatus(str, enum.Enum):
    active = "active"
    depleted = "depleted"
    reserved = "reserved"
    quarantined = "quarantined"


class MaterialGrade(str, enum.Enum):
    A = "A"
    B = "B"
    C = "C"
    waste = "waste"


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    batch_code = Column(String, unique=True, index=True, nullable=False)
    material_type = Column(String, nullable=False)  # cotton, polyester, etc.
    quantity_kg = Column(Float, nullable=False)
    color = Column(String, default="raw")
    grade = Column(Enum(MaterialGrade), default=MaterialGrade.A)
    location = Column(String)  # warehouse / facility name
    status = Column(Enum(InventoryStatus), default=InventoryStatus.active)
    date_received = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    supplier = relationship("Supplier", back_populates="inventory")
    creator = relationship("User", back_populates="inventory_records", foreign_keys=[created_by_id])
    waste_records = relationship("WasteRecord", back_populates="inventory_item")
    sustainability_metrics = relationship(                          # Milestone 3
        "SustainabilityMetric",
        back_populates="inventory",
        cascade="all, delete-orphan",
    )
    recycling_recommendations = relationship(                       # Milestone 4
        "RecyclingRecommendation",
        back_populates="inventory",
        cascade="all, delete-orphan",
    )
    environmental_report = relationship(                           # Milestone 4 — Environmental Impact
        "EnvironmentalReport",
        back_populates="inventory",
        cascade="all, delete-orphan",
        uselist=False,   # one-to-one: one report per inventory item
    )
