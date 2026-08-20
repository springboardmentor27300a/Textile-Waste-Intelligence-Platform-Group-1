from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from app.database.database import Base


class Collection(Base):
    __tablename__ = "collections"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    collection_code = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )

    # --------------------------------------------------
    # Waste Source
    # --------------------------------------------------

    waste_source_id = Column(
        Integer,
        ForeignKey(
            "waste_source.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    # --------------------------------------------------
    # Collection Details
    # --------------------------------------------------

    collection_date = Column(
        Date,
        nullable=False,
    )

    collected_by = Column(
        String(100),
        nullable=False,
    )

    vehicle_number = Column(
        String(30),
        nullable=True,
    )

    collection_method = Column(
        String(30),
        nullable=False,
    )

    total_weight = Column(
        Float,
        nullable=False,
    )

    # --------------------------------------------------
    # Workflow
    # --------------------------------------------------

    collection_status = Column(
        String(30),
        default="Scheduled",
        nullable=False,
    )

    analysis_status = Column(
        String(30),
        default="Pending",
        nullable=False,
    )

    inventory_status = Column(
        String(30),
        default="Pending",
        nullable=False,
    )

    recycling_status = Column(
        String(30),
        default="Pending",
        nullable=False,
    )

    report_status = Column(
        String(30),
        default="Pending",
        nullable=False,
    )

    # --------------------------------------------------
    # Summary Metrics
    # --------------------------------------------------

    recyclable_weight = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    rejected_weight = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    recovery_percentage = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    sustainability_score = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    carbon_saved = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    water_saved = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    energy_saved = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    remarks = Column(
        String(500),
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # --------------------------------------------------
    # Relationships
    # --------------------------------------------------

    waste_source = relationship(
        "WasteSource",
        back_populates="collections",
    )

    analyses = relationship(
        "Analysis",
        back_populates="collection",
        cascade="all, delete-orphan",
    )

    inventory = relationship(
        "Inventory",
        back_populates="collection",
        uselist=False,
    )

    # reports = relationship(
    #     "Report",
    #     back_populates="collection",
    #     cascade="all, delete-orphan",
    # )