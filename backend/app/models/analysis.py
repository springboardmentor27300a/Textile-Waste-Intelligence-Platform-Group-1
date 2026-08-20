from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    JSON,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class Analysis(Base):
    __tablename__ = "analysis"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # -------------------------------------------------------
    # Collection Relationship
    # -------------------------------------------------------

    collection_id = Column(
        Integer,
        ForeignKey(
            "collections.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # -------------------------------------------------------
    # Image
    # -------------------------------------------------------

    image_path = Column(
        String(255),
        nullable=False,
    )

    image_name = Column(
        String(255),
        nullable=True,
    )

    # -------------------------------------------------------
    # AI Prediction
    # -------------------------------------------------------

    material = Column(
        String(100),
        nullable=False,
    )

    primary_material = Column(
        String(100),
        nullable=False,
    )

    secondary_material = Column(
        String(100),
        nullable=True,
    )

    composition = Column(
        String(100),
        nullable=True,
    )

    material_quality = Column(
        String(50),
        nullable=True,
    )

    confidence = Column(
        Float,
        nullable=False,
    )

    # -------------------------------------------------------
    # Material Intelligence
    # -------------------------------------------------------

    material_category = Column(
        String(100),
        nullable=False,
    )

    biodegradable = Column(
        Boolean,
        nullable=False,
    )

    recyclable = Column(
        Boolean,
        nullable=False,
    )

    recycled_content = Column(
        Float,
        default=0,
    )

    # -------------------------------------------------------
    # Image Intelligence
    # -------------------------------------------------------

    dominant_color = Column(
        String(100),
        nullable=False,
    )

    color_palette = Column(
        JSON,
        nullable=False,
        default=list,
    )

    texture = Column(
        String(100),
        nullable=False,
    )

    pattern = Column(
        String(100),
        nullable=False,
    )

    defects = Column(
        JSON,
        nullable=False,
        default=list,
    )

    contamination_level = Column(
        String(30),
        nullable=False,
    )

    # -------------------------------------------------------
    # Waste Intelligence
    # -------------------------------------------------------

    waste_category = Column(
        String(100),
        nullable=False,
    )

    waste_subcategory = Column(
        String(100),
        nullable=False,
    )

    reuse_potential = Column(
        String(50),
        nullable=False,
    )

    recycling_method = Column(
        String(100),
        nullable=False,
    )

    # -------------------------------------------------------
    # Circular Economy Scores
    # -------------------------------------------------------

    reuse_score = Column(
        Float,
        nullable=False,
    )

    sustainability_score = Column(
        Float,
        nullable=False,
    )

    material_recovery_score = Column(
        Float,
        nullable=False,
    )

    circularity_score = Column(
        Float,
        nullable=False,
    )

    recyclability_score = Column(
        Float,
        nullable=False,
    )

    environmental_score = Column(
        Float,
        nullable=False,
    )

    overall_score = Column(
        Float,
        nullable=False,
    )

    # -------------------------------------------------------
    # Environmental Assessment
    # -------------------------------------------------------

    carbon_footprint = Column(
        Float,
        nullable=False,
    )

    carbon_savings = Column(
        Float,
        nullable=False,
    )

    water_consumption = Column(
        Float,
        nullable=False,
    )

    water_savings = Column(
        Float,
        nullable=False,
    )

    energy_consumption = Column(
        Float,
        nullable=False,
    )

    energy_savings = Column(
        Float,
        nullable=False,
    )

    landfill_diversion = Column(
        Float,
        nullable=False,
    )

    resource_conservation = Column(
        Float,
        nullable=False,
    )

    # -------------------------------------------------------
    # Sustainability Indicators
    # -------------------------------------------------------

    sustainability_rating = Column(
        String(50),
        nullable=False,
    )

    sustainability_status = Column(
        String(50),
        nullable=False,
    )

    esg_score = Column(
        Float,
        nullable=False,
    )

    esg_readiness = Column(
        String(50),
        nullable=False,
    )

    environmental_impact = Column(
        String(50),
        nullable=False,
    )

    circular_economy_index = Column(
        Float,
        nullable=False,
    )

    recycling_target = Column(
        Float,
        nullable=False,
    )

    recycling_progress = Column(
        Float,
        nullable=False,
    )

    # -------------------------------------------------------
    # Recommendation Engine
    # -------------------------------------------------------

    priority = Column(
        String(30),
        nullable=False,
    )

    recommendation = Column(
        String(500),
        nullable=False,
    )

    next_step = Column(
        String(300),
        nullable=False,
    )

    expected_benefit = Column(
        String(500),
        nullable=False,
    )

    # -------------------------------------------------------
    # Metadata
    # -------------------------------------------------------

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

    # -------------------------------------------------------
    # Relationship
    # -------------------------------------------------------

    collection = relationship(
        "Collection",
        back_populates="analyses",
    )