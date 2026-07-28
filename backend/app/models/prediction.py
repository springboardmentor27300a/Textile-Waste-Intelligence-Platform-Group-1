"""
Prediction Database Models — Milestone 2
==========================================
Four new tables for storing AI prediction data:
- uploaded_images
- predictions
- classification_results
- prediction_reports

Uses PostgreSQL UUID type when connected to PostgreSQL,
falls back to String(36) for SQLite compatibility.
"""

import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.session import Base, engine

# ─── Detect database dialect ──────────────────────────────────────────────────
_is_postgres = "postgresql" in str(engine.url)

if _is_postgres:
    from sqlalchemy.dialects.postgresql import UUID as PG_UUID
    # Use native PostgreSQL UUID for primary keys and FKs to match existing tables
    def _uuid_pk():
        return Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    def _uuid_fk(ref, nullable=False):
        return Column(PG_UUID(as_uuid=True), ForeignKey(ref), nullable=nullable)
    def _uuid_fk_nullable(ref):
        return Column(PG_UUID(as_uuid=True), ForeignKey(ref), nullable=True)
else:
    # SQLite fallback: use String(36) with str UUIDs
    def _uuid_pk():
        return Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    def _uuid_fk(ref, nullable=False):
        return Column(String(36), ForeignKey(ref), nullable=nullable)
    def _uuid_fk_nullable(ref):
        return Column(String(36), ForeignKey(ref), nullable=True)


class UploadedImage(Base):
    """Stores metadata and paths for uploaded textile images."""
    __tablename__ = "uploaded_images"

    id = _uuid_pk()
    filename = Column(String(255), nullable=False)
    original_path = Column(String(512), nullable=False)
    processed_path = Column(String(512), nullable=True)
    file_size = Column(Integer, nullable=True)
    file_hash = Column(String(64), nullable=True, index=True)
    content_type = Column(String(100), nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    format = Column(String(20), nullable=True)

    # Image feature metadata
    dominant_colors = Column(Text, nullable=True)           # JSON: ["White", "Blue", ...]
    texture_complexity = Column(String(20), nullable=True)  # Low / Medium / High
    fabric_pattern = Column(String(50), nullable=True)      # Solid, Stripes, Plaid, etc.
    brightness = Column(Float, nullable=True)
    contrast = Column(Float, nullable=True)

    # Visual detection flags
    visible_damage = Column(Boolean, default=False)
    contamination_detected = Column(Boolean, default=False)
    wrinkle_detected = Column(Boolean, default=False)
    tear_detected = Column(Boolean, default=False)
    surface_quality = Column(String(20), nullable=True)     # Excellent / Good / Fair / Poor

    # Foreign keys — match the UUID type of the referenced tables
    uploader_id = _uuid_fk("users.id", nullable=False)
    inventory_id = _uuid_fk_nullable("waste_batches.id")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    uploader = relationship("User", foreign_keys=[uploader_id])
    predictions = relationship("Prediction", back_populates="image", cascade="all, delete-orphan")


class Prediction(Base):
    """Top-level AI prediction result linking image → material → waste → recyclability."""
    __tablename__ = "predictions"

    id = _uuid_pk()
    image_id = _uuid_fk("uploaded_images.id", nullable=False)
    user_id = _uuid_fk("users.id", nullable=False)

    # Material Classification
    material = Column(String(100), nullable=False)
    material_confidence = Column(Float, nullable=False)
    fabric_category = Column(String(100), nullable=True)
    detected_color = Column(String(50), nullable=True)
    texture_description = Column(Text, nullable=True)

    # Waste Classification
    waste_category = Column(String(100), nullable=False)
    waste_confidence = Column(Float, nullable=False)
    material_quality = Column(String(50), nullable=True)
    severity_level = Column(String(50), nullable=True)

    # Recyclability
    recyclability_score = Column(Float, nullable=True)
    reuse_potential = Column(Float, nullable=True)
    recovery_difficulty = Column(String(50), nullable=True)
    material_recovery_score = Column(Float, nullable=True)
    overall_rating = Column(String(50), nullable=True)

    # Metadata
    overall_confidence = Column(Float, nullable=True)
    status = Column(String(20), default="Success")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    image = relationship("UploadedImage", back_populates="predictions")
    user = relationship("User", foreign_keys=[user_id])
    classification_result = relationship(
        "ClassificationResult", back_populates="prediction",
        uselist=False, cascade="all, delete-orphan"
    )
    report = relationship(
        "PredictionReport", back_populates="prediction",
        uselist=False, cascade="all, delete-orphan"
    )


class ClassificationResult(Base):
    """Detailed breakdown: probability distributions, fiber compositions, waste reasons."""
    __tablename__ = "classification_results"

    id = _uuid_pk()
    prediction_id = _uuid_fk("predictions.id", nullable=False)

    # JSON text fields
    material_probabilities = Column(Text, nullable=True)    # {"Cotton": 94.2, ...}
    fiber_composition = Column(Text, nullable=True)         # {"Cotton": 95, "Elastane": 5}
    material_properties = Column(Text, nullable=True)       # material property dict

    # Waste details
    waste_reason = Column(Text, nullable=True)
    waste_description = Column(Text, nullable=True)
    status_badge = Column(String(50), nullable=True)

    # Recyclability
    recovery_indicator = Column(String(200), nullable=True)

    # Raw image features JSON
    image_features_json = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    prediction = relationship("Prediction", back_populates="classification_result")


class PredictionReport(Base):
    """Metadata for generated classification reports."""
    __tablename__ = "prediction_reports"

    id = _uuid_pk()
    prediction_id = _uuid_fk("predictions.id", nullable=False)
    user_id = _uuid_fk("users.id", nullable=False)

    report_title = Column(String(255), nullable=True)
    summary = Column(Text, nullable=True)
    status = Column(String(20), default="Generated")    # Generated / Exported / Archived
    pdf_path = Column(String(512), nullable=True)       # Future: server-side PDF path

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    prediction = relationship("Prediction", back_populates="report")
    user = relationship("User", foreign_keys=[user_id])
