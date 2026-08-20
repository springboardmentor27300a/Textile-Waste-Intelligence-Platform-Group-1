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
from sqlalchemy.sql import func

from app.database.database import Base


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # -----------------------------------------
    # Inventory Identification
    # -----------------------------------------

    batch_id = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )

    collection_id = Column(
        Integer,
        ForeignKey(
            "collections.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        unique=True,
    )

    # -----------------------------------------
    # Material Details
    # -----------------------------------------

    fabric = Column(
        String(100),
        nullable=False,
    )

    source = Column(
        String(150),
        nullable=False,
    )

    color = Column(
        String(50),
        nullable=False,
    )

    condition = Column(
        String(30),
        nullable=False,
    )

    # -----------------------------------------
    # Inventory Details
    # -----------------------------------------

    quantity = Column(
        Float,
        nullable=False,
        default=0.0,
    )

    collection_date = Column(
        Date,
        nullable=False,
    )

    storage_location = Column(
        String(100),
        nullable=True,
    )

    rack_number = Column(
        String(50),
        nullable=True,
    )

    status = Column(
        String(30),
        default="Available",
        nullable=False,
    )

    # -----------------------------------------
    # Sustainability Summary
    # -----------------------------------------

    recyclable_quantity = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    rejected_quantity = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    reuse_score = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    sustainability_score = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    circularity_score = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    carbon_saving = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    water_saving = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    energy_saving = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    notes = Column(
        String(500),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # -----------------------------------------
    # Relationships
    # -----------------------------------------

    collection = relationship(
        "Collection",
        back_populates="inventory",
    )