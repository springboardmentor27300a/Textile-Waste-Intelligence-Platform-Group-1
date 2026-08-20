from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Boolean,
)

from sqlalchemy.orm import relationship

from app.database.database import Base


class WasteSource(Base):
    __tablename__ = "waste_source"

    id = Column(Integer, primary_key=True, index=True)

    source_code = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )

    organization_name = Column(
        String(150),
        unique=True,
        nullable=False,
    )

    source_type = Column(
        String(50),
        nullable=False,
    )

    industry = Column(
        String(80),
        nullable=False,
    )

    organization_size = Column(
        String(30),
        nullable=False,
    )

    contact_person = Column(
        String(100),
        nullable=False,
    )

    email = Column(
        String(120),
        unique=True,
        nullable=False,
    )

    phone = Column(
        String(20),
        nullable=False,
    )

    address = Column(
        String(255),
        nullable=False,
    )

    city = Column(
        String(80),
        nullable=False,
    )

    state = Column(
        String(80),
        nullable=False,
    )

    country = Column(
        String(80),
        nullable=False,
    )

    postal_code = Column(
        String(15),
        nullable=False,
    )

    collection_frequency = Column(
        String(30),
        nullable=False,
    )

    preferred_collection_day = Column(
        String(20),
        nullable=True,
    )

    average_monthly_waste = Column(
        Float,
        nullable=False,
    )

    status = Column(
        String(20),
        default="Active",
        nullable=False,
    )

    is_verified = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    sustainability_partner = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    company_sustainability_score = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    total_collections = Column(
        Integer,
        default=0,
        nullable=False,
    )

    total_waste_received = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    total_recycled = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    total_landfill_diverted = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    total_carbon_saved = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    total_water_saved = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    total_energy_saved = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    notes = Column(
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

    # Future relationships
    collections = relationship(
        "Collection",
        back_populates="waste_source",
        cascade="all, delete-orphan",
    )