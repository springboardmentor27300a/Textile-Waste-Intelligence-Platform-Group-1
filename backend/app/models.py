from datetime import datetime, timezone
import enum

from sqlalchemy import (
    Boolean, DateTime, Enum, Float, ForeignKey, Integer, JSON, String, Text
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Role(str, enum.Enum):
    recycler = "recycling_facility_operator"
    sustainability = "sustainability_manager"
    manufacturer = "textile_manufacturer"
    admin = "administrator"


class WasteCategory(str, enum.Enum):
    recyclable = "Recyclable"
    reusable = "Reusable"
    repairable = "Repairable"
    upcyclable = "Upcyclable"
    compostable = "Compostable"
    hazardous = "Hazardous Textile Waste"


class BatchStatus(str, enum.Enum):
    registered = "registered"
    analysed = "analysed"
    scheduled = "scheduled"
    processed = "processed"
    disposed = "disposed"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    organisation: Mapped[str] = mapped_column(String(255), default="")
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.recycler)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    batches: Mapped[list["WasteBatch"]] = relationship(back_populates="owner")


class WasteBatch(Base):
    __tablename__ = "waste_batches"

    id: Mapped[int] = mapped_column(primary_key=True)
    batch_code: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    fabric_type: Mapped[str] = mapped_column(String(64), default="Unknown")
    source: Mapped[str] = mapped_column(String(128), default="")
    quantity_kg: Mapped[float] = mapped_column(Float, default=0.0)
    colour: Mapped[str] = mapped_column(String(64), default="")
    condition: Mapped[str] = mapped_column(String(32), default="good")
    collection_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    status: Mapped[BatchStatus] = mapped_column(Enum(BatchStatus), default=BatchStatus.registered)
    notes: Mapped[str] = mapped_column(Text, default="")
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    owner: Mapped["User"] = relationship(back_populates="batches")
    analyses: Mapped[list["Analysis"]] = relationship(
        back_populates="batch", cascade="all, delete-orphan", order_by="Analysis.id.desc()"
    )


class Analysis(Base):
    """One inference run over one uploaded textile image."""

    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(primary_key=True)
    # ON DELETE CASCADE at the database level, not just in the ORM: deleting a
    # batch straight from psql must clean up its analyses too.
    batch_id: Mapped[int] = mapped_column(
        ForeignKey("waste_batches.id", ondelete="CASCADE"), index=True)
    image_path: Mapped[str] = mapped_column(String(512), default="")

    # Image analysis engine
    visual_features: Mapped[dict] = mapped_column(JSON, default=dict)
    dominant_colour: Mapped[str] = mapped_column(String(32), default="")
    texture_class: Mapped[str] = mapped_column(String(32), default="")
    pattern_class: Mapped[str] = mapped_column(String(32), default="")
    damage_score: Mapped[float] = mapped_column(Float, default=0.0)
    contamination_score: Mapped[float] = mapped_column(Float, default=0.0)
    # Populated only when the AITEX / Fashion-MNIST models have been trained.
    defect_detection: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    garment_recognition: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Material classification engine
    material: Mapped[str] = mapped_column(String(64), default="")
    material_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    material_probabilities: Mapped[dict] = mapped_column(JSON, default=dict)
    fibre_composition: Mapped[dict] = mapped_column(JSON, default=dict)
    is_blend: Mapped[bool] = mapped_column(Boolean, default=False)
    material_quality: Mapped[float] = mapped_column(Float, default=0.0)

    # Waste classification engine
    waste_category: Mapped[WasteCategory] = mapped_column(
        Enum(WasteCategory), default=WasteCategory.recyclable
    )
    waste_probabilities: Mapped[dict] = mapped_column(JSON, default=dict)

    # Scoring engine
    recyclability_score: Mapped[float] = mapped_column(Float, default=0.0)
    reuse_score: Mapped[float] = mapped_column(Float, default=0.0)
    sustainability_score: Mapped[float] = mapped_column(Float, default=0.0)
    material_recovery_score: Mapped[float] = mapped_column(Float, default=0.0)
    circularity_score: Mapped[float] = mapped_column(Float, default=0.0)
    circularity_band: Mapped[str] = mapped_column(String(48), default="")
    score_components: Mapped[dict] = mapped_column(JSON, default=dict)
    score_weights: Mapped[dict] = mapped_column(JSON, default=dict)

    # Recommendation + environmental engines
    recommendations: Mapped[list] = mapped_column(JSON, default=list)
    environmental_impact: Mapped[dict] = mapped_column(JSON, default=dict)

    inference_ms: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    batch: Mapped["WasteBatch"] = relationship(back_populates="analyses")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    kind: Mapped[str] = mapped_column(String(48), default="info")
    title: Mapped[str] = mapped_column(String(255))
    body: Mapped[str] = mapped_column(Text, default="")
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
