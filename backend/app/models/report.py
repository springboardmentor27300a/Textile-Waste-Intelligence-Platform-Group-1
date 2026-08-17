"""
Report Database Model — Milestone 4
=====================================
Stores metadata for all generated reports across 5 report types:
- waste_classification
- recycling
- sustainability
- environmental_impact
- circular_economy

Uses the same UUID/SQLite dual-dialect pattern as other models.
"""

import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
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


REPORT_TYPES = [
    "waste_classification",
    "recycling",
    "sustainability",
    "environmental_impact",
    "circular_economy",
]

REPORT_TYPE_LABELS = {
    "waste_classification": "Waste Classification Report",
    "recycling": "Recycling Report",
    "sustainability": "Sustainability Report",
    "environmental_impact": "Environmental Impact Report",
    "circular_economy": "Circular Economy Report",
}


class Report(Base):
    """
    Master report record.
    One row per generated report — stores assembled JSON data and export file paths.
    """
    __tablename__ = "reports_m4"

    id = _uuid_pk()

    # Report classification
    report_type = Column(String(50), nullable=False)   # One of REPORT_TYPES
    title = Column(String(255), nullable=False)
    status = Column(String(30), default="Generated")   # Generated | Exported | Archived

    # Source prediction (may be null for org-wide sustainability/environmental reports)
    prediction_id = _uuid_fk_nullable("predictions.id")

    # Author
    user_id = _uuid_fk("users.id", nullable=False)
    organization_id = _uuid_fk_nullable("organizations.id")

    # Serialised report data (JSON text — avoids schema changes for each type)
    report_data = Column(Text, nullable=True)

    # Export file paths (populated after generation)
    pdf_path = Column(String(512), nullable=True)
    excel_path = Column(String(512), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    prediction = relationship("Prediction", foreign_keys=[prediction_id])
    user = relationship("User", foreign_keys=[user_id])
    organization = relationship("Organization", foreign_keys=[organization_id])
