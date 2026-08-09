"""
Sustainability Metric Model — Milestone 3

Stores the sustainability analysis results computed by the
Sustainability Intelligence Engine for every classified textile
waste inventory item.

Table: sustainability_metrics
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class SustainabilityMetric(Base):
    """
    Persists all sustainability KPIs calculated for a single inventory item.

    Relationships
    -------------
    inventory : Inventory
        The parent inventory record this metric belongs to.
    """

    __tablename__ = "sustainability_metrics"

    # ── Primary Key ───────────────────────────────────────────────────────────
    id = Column(Integer, primary_key=True, index=True)

    # ── Foreign Key ───────────────────────────────────────────────────────────
    inventory_id = Column(
        Integer,
        ForeignKey("inventory.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── Classification Inputs (snapshot at calculation time) ──────────────────
    material_type = Column(String, nullable=False)    # e.g. "Cotton"
    waste_category = Column(String, nullable=False)   # e.g. "Recyclable"
    weight_kg = Column(Float, nullable=False)         # must be > 0

    # ── Calculated Sustainability KPIs ────────────────────────────────────────
    co2_saved = Column(Float, nullable=False, default=0.0)
    """kg of CO₂ emissions avoided through recycling/recovery."""

    water_saved = Column(Float, nullable=False, default=0.0)
    """Litres of water saved through recycling instead of virgin production."""

    landfill_diverted = Column(Float, nullable=False, default=0.0)
    """Percentage of material weight diverted from landfill (0–100)."""

    resource_recovery = Column(Float, nullable=False, default=0.0)
    """kg of textile material estimated to be recovered/reused."""

    circularity_score = Column(String, nullable=False, default="Low")
    """Qualitative circular economy contribution: 'Low', 'Medium', or 'High'."""

    sustainability_score = Column(Float, nullable=False, default=0.0)
    """Composite weighted score from 0–100 across all KPIs."""

    # ── Audit ──────────────────────────────────────────────────────────────────
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # ── ORM Relationship ───────────────────────────────────────────────────────
    inventory = relationship(
        "Inventory",
        back_populates="sustainability_metrics",
    )
