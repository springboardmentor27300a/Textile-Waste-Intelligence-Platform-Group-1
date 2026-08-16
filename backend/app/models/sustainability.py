"""
Sustainability Database Models — Milestone 3
=============================================
Five new tables for storing sustainability and circular economy metrics:
- sustainability_analysis
- recycling_recommendations
- environmental_impact
- circularity_scores
- sustainability_reports
"""

import uuid
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey, Integer, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base, engine

_is_postgres = "postgresql" in str(engine.url)

if _is_postgres:
    from sqlalchemy.dialects.postgresql import UUID as PG_UUID
    def _uuid_pk():
        return Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    def _uuid_fk(ref, nullable=False):
        return Column(PG_UUID(as_uuid=True), ForeignKey(ref), nullable=nullable)
    def _uuid_fk_nullable(ref):
        return Column(PG_UUID(as_uuid=True), ForeignKey(ref), nullable=True)
else:
    def _uuid_pk():
        return Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    def _uuid_fk(ref, nullable=False):
        return Column(String(36), ForeignKey(ref), nullable=nullable)
    def _uuid_fk_nullable(ref):
        return Column(String(36), ForeignKey(ref), nullable=True)


class SustainabilityAnalysis(Base):
    """Stores high-level sustainability scores and AI-powered textual insights."""
    __tablename__ = "sustainability_analysis"

    id = _uuid_pk()
    prediction_id = _uuid_fk("predictions.id", nullable=False)
    user_id = _uuid_fk("users.id", nullable=False)
    inventory_id = _uuid_fk_nullable("waste_batches.id")

    material = Column(String(100), nullable=False)
    waste_category = Column(String(100), nullable=False)
    sustainability_score = Column(Float, nullable=False)
    environmental_benefit_score = Column(Float, nullable=False)
    resource_recovery_score = Column(Float, nullable=False)
    material_longevity_score = Column(Float, nullable=False)
    waste_diversion_score = Column(Float, nullable=False)
    insights = Column(Text, nullable=True)  # JSON-serialized list of string insights

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    prediction = relationship("Prediction", foreign_keys=[prediction_id])
    user = relationship("User", foreign_keys=[user_id])
    inventory = relationship("WasteBatch", foreign_keys=[inventory_id])


class RecyclingRecommendation(Base):
    """Stores detailed recycling and recovery pathways recommended by the system."""
    __tablename__ = "recycling_recommendations"

    id = _uuid_pk()
    prediction_id = _uuid_fk("predictions.id", nullable=False)
    recovery_method = Column(String(100), nullable=False)
    recovery_priority = Column(String(50), nullable=False)
    difficulty_level = Column(String(50), nullable=False)
    estimated_success = Column(Float, nullable=False)
    required_processing = Column(Text, nullable=False)
    industry_use_cases = Column(Text, nullable=False)
    expected_output = Column(String(200), nullable=False)
    reason = Column(Text, nullable=True)
    industry_applications = Column(Text, nullable=True)
    environmental_benefit = Column(Text, nullable=True)
    estimated_cost = Column(String(50), nullable=True)
    estimated_time = Column(String(50), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    prediction = relationship("Prediction", foreign_keys=[prediction_id])


class EnvironmentalImpact(Base):
    """Stores quantified ecological savings and equivalent reference metrics."""
    __tablename__ = "environmental_impact"

    id = _uuid_pk()
    prediction_id = _uuid_fk("predictions.id", nullable=False)
    co2_saved = Column(Float, nullable=False)                      # kg
    water_saved = Column(Float, nullable=False)                    # Liters
    energy_saved = Column(Float, nullable=False)                   # kWh
    landfill_diversion = Column(Float, nullable=False)             # kg
    resource_conservation = Column(Float, nullable=False)          # kg
    equivalent_trees = Column(Float, nullable=False)
    equivalent_electricity = Column(Float, nullable=False)
    equivalent_water_bottles = Column(Float, nullable=False)
    equivalent_household_energy = Column(Float, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    prediction = relationship("Prediction", foreign_keys=[prediction_id])


class CircularityScore(Base):
    """Stores detailed circular economy indicators and rating classification."""
    __tablename__ = "circularity_scores"

    id = _uuid_pk()
    prediction_id = _uuid_fk("predictions.id", nullable=False)
    circularity_score = Column(Float, nullable=False)
    reuse_potential = Column(Float, nullable=False)
    recovery_efficiency = Column(Float, nullable=False)
    material_retention = Column(Float, nullable=False)
    lifecycle_extension = Column(Float, nullable=False)
    circularity_index = Column(Float, nullable=False)
    classification = Column(String(100), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    prediction = relationship("Prediction", foreign_keys=[prediction_id])


class SustainabilityReport(Base):
    """Metadata and executive summary for generated printable sustainability reports."""
    __tablename__ = "sustainability_reports"

    id = _uuid_pk()
    prediction_id = _uuid_fk("predictions.id", nullable=False)
    user_id = _uuid_fk("users.id", nullable=False)
    report_title = Column(String(255), nullable=False)
    executive_summary = Column(Text, nullable=False)
    pdf_path = Column(String(512), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    prediction = relationship("Prediction", foreign_keys=[prediction_id])
    user = relationship("User", foreign_keys=[user_id])
