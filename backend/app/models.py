from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    DateTime,
    ForeignKey,
    Boolean
)
from sqlalchemy.sql import func

from .database import Base


# ===========================
# User Table
# ===========================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    # Nullable because Google users don't have a local password
    password = Column(
        String,
        nullable=True
    )

    # Roles:
    # recycling_operator
    # sustainability_manager
    # manufacturer
    # admin
    role = Column(
    String,
    nullable=True
)

    organization = Column(
        String,
        nullable=True
    )

    # local / google
    auth_provider = Column(
        String,
        nullable=False,
        default="local"
    )
    is_active = Column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


# ===========================
# Textile Inventory Table
# ===========================
class TextileInventory(Base):
    __tablename__ = "textile_inventory"

    id = Column(Integer, primary_key=True, index=True)

    waste_batch_id = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    fabric_type = Column(String, nullable=False)

    source = Column(String, nullable=False)

    quantity = Column(Float, nullable=False)

    color = Column(String)

    condition = Column(String)

    collection_date = Column(Date)

    created_by = Column(
        Integer,
        ForeignKey("users.id")
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

# ===========================
# Analysis History Table
# ===========================
class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)

    image_name = Column(
        String,
        nullable=False
    )

    material = Column(
        String,
        nullable=False
    )

    material_confidence = Column(
        Float,
        nullable=False
    )

    damage = Column(
        String,
        nullable=False
    )

    damage_confidence = Column(
        Float,
        nullable=False
    )

    quality_score = Column(
        Float,
        nullable=False
    )

    quality_grade = Column(
        String,
        nullable=False
    )

    recommended_action = Column(
        String,
        nullable=False
    )

    recyclability = Column(
        String,
        nullable=False
    )

    environmental_impact = Column(
        String,
        nullable=False
    )

    estimated_value = Column(
        String,
        nullable=False
    )

    priority = Column(
        String,
        nullable=False
    )
    # ==========================
    # Material Classification
    # ==========================

    material_category = Column(String)

    fiber_composition = Column(String)

    blend_identification = Column(String)

    fabric_texture = Column(String)

    fabric_pattern = Column(String)

    # ==========================
    # Waste Classification
    # ==========================

    waste_category = Column(String)

    reuse_potential = Column(String)

    contamination_detection = Column(String)

    disposal_recommendation = Column(String)

    compostable = Column(String)

    hazardous_textile = Column(String)

    # ==========================
    # Recycling Recommendation
    # ==========================

    recommended_method = Column(String)

    fiber_recycling = Column(String)

    mechanical_recycling = Column(String)

    chemical_recycling = Column(String)

    fabric_reuse = Column(String)

    industrial_recovery = Column(String)

    donation = Column(String)

    waste_reduction_strategy = Column(String)

    upcycling_suggestions = Column(String)

    # ==========================
    # Sustainability Intelligence
    # ==========================

    sustainability_score = Column(Float)

    environmental_rating = Column(String)

    carbon_footprint = Column(Float)


    co2_saved = Column(Float)

    water_saved = Column(Float)

    landfill_saved = Column(Float)

    resource_conservation = Column(String)

    # ==========================
    # Environmental Analytics
    # ==========================

    carbon_reduction = Column(Float)

    water_conservation = Column(Float)

    landfill_diversion = Column(Float)

    eco_rating = Column(Float)

    analyzed_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    analyzed_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    # ==========================
    # Waste Scoring Engine
    # ==========================

    recyclability_score = Column(Float)

    reuse_score = Column(Float)

    material_recovery_score = Column(Float)

    processing_feasibility_score = Column(Float)

    circularity_score = Column(Float)

    circularity_category = Column(String)

    # ==========================
    # Circular Economy Analytics
    # ==========================

    recycling_efficiency = Column(Float)

    waste_diversion_rate = Column(Float)

    resource_recovery_rate = Column(Float)

    circular_economy_index = Column(Float)

    circular_rating = Column(String)

    # ==========================
    # Sustainability Benchmark
    # ==========================

    overall_score = Column(Float)

    sustainability_grade = Column(String)

    esg_rating = Column(String)

    industry_percentile = Column(Float)

    performance = Column(String)

    improvement_suggestions = Column(String)


# ==========================================
# Inventory Sustainability Analysis
# ==========================================

class InventorySustainabilityAnalysis(Base):

    __tablename__ = "inventory_sustainability_analysis"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Link to Textile Inventory
    inventory_id = Column(
    Integer,
    ForeignKey("textile_inventory.id"),
    nullable=False,
    unique=True,
    index=True
)

    # Snapshot of inventory information
    batch_id = Column(
        String,
        nullable=False
    )

    fabric_type = Column(
        String,
        nullable=False
    )

    quantity = Column(
        Float,
        nullable=False
    )

    condition = Column(
        String
    )

    # ======================================
    # Recommendation
    # ======================================

    recommended_action = Column(
        String
    )

    recovery_potential = Column(
        String
    )

    # ======================================
    # Environmental Impact
    # ======================================

    carbon_footprint = Column(
        Float
    )

    water_impact = Column(
        Float
    )

    co2_saved = Column(
        Float
    )

    water_saved = Column(
        Float
    )

    landfill_diversion = Column(
        Float
    )

    # ======================================
    # LCA Source & Methodology
    # ======================================

    impact_source = Column(
        String
    )

    impact_boundary = Column(
        String
    )

    impact_factor_status = Column(
        String
    )

    impact_region = Column(
        String
    )

    impact_scenario = Column(
        String
    )

    # ======================================
    # Sustainability Scores
    # ======================================

    recyclability_score = Column(
        Float
    )

    reuse_score = Column(
        Float
    )

    material_recovery_score = Column(
        Float
    )

    sustainability_score = Column(
        Float
    )

    circularity_score = Column(
        Float
    )

    circularity_category = Column(
        String
    )

    # ======================================
    # Circular Economy
    # ======================================

    waste_diversion_rate = Column(
        Float
    )

    resource_recovery_rate = Column(
        Float
    )

    circular_economy_index = Column(
        Float
    )

    circular_rating = Column(
        String
    )

    # ======================================
    # Analysis Metadata
    # ======================================

    analyzed_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    analyzed_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


# ==========================================
# Notification & Alert System
# ==========================================

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    title = Column(
        String(200),
        nullable=False
    )

    message = Column(
        String(1000),
        nullable=False
    )

    notification_type = Column(
        String(50),
        nullable=False
    )

    priority = Column(
        String(20),
        nullable=False,
        default="medium"
    )

    is_read = Column(
        Boolean,
        nullable=False,
        default=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )