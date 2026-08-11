from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.database.db import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    # Relationships
    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    phone_number = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    role = relationship("Role", back_populates="users")
    batches = relationship("WasteBatch", back_populates="operator")

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String, unique=True, index=True, nullable=False)
    capacity_kg = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    batches = relationship("WasteBatch", back_populates="inventory")

class WasteBatch(Base):
    __tablename__ = "waste_batches"

    id = Column(Integer, primary_key=True, index=True)
    fabric_type = Column(String, nullable=False)
    source = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    color = Column(String, nullable=False)
    condition = Column(String, nullable=False)
    collection_date = Column(Date, nullable=False)
    status = Column(String, default="Collected")  # e.g., Collected, Sorting, Processing, Recycled, Disposed
    
    operator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    operator = relationship("User", back_populates="batches")
    inventory = relationship("Inventory", back_populates="batches")
    textile_wastes = relationship("TextileWaste", back_populates="batch", cascade="all, delete-orphan")
    sustainability_metrics = relationship("SustainabilityMetrics", back_populates="batch", cascade="all, delete-orphan", uselist=False)
    environmental_impacts = relationship("EnvironmentalImpact", back_populates="batch", cascade="all, delete-orphan")
    recommendations = relationship("RecyclingRecommendation", back_populates="batch", cascade="all, delete-orphan")

    @property
    def quantity_kg(self) -> float:
        return self.quantity

    @quantity_kg.setter
    def quantity_kg(self, value: float):
        self.quantity = value

    @property
    def contamination_flag(self) -> bool:
        return any(tw.has_contaminants for tw in self.textile_wastes) if self.textile_wastes else False

    @property
    def waste_category(self) -> str:
        cond_lower = self.condition.lower() if self.condition else ""
        if self.contamination_flag:
            return "Hazardous"
        if cond_lower in ["clean", "recyclable"]:
            return "Recyclable"
        if cond_lower == "damaged":
            return "Repairable"
        return "Disposal"

class TextileWaste(Base):
    __tablename__ = "textile_wastes"

    id = Column(Integer, primary_key=True, index=True)
    waste_batch_id = Column(Integer, ForeignKey("waste_batches.id", ondelete="CASCADE"), nullable=False)
    material_composition = Column(String, nullable=True)  # e.g., "100% Cotton", "60% Cotton / 40% Polyester"
    recyclability_rate = Column(Float, default=0.0)      # e.g., 0.85
    has_contaminants = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    batch = relationship("WasteBatch", back_populates="textile_wastes")

class SustainabilityMetrics(Base):
    __tablename__ = "sustainability_metrics"

    id = Column(Integer, primary_key=True, index=True)
    waste_batch_id = Column(Integer, ForeignKey("waste_batches.id", ondelete="CASCADE"), nullable=False)
    co2_saved_kg = Column(Float, default=0.0)
    water_saved_liters = Column(Float, default=0.0)
    landfill_reduction_kg = Column(Float, default=0.0)
    energy_saved_mj = Column(Float, default=0.0)
    circularity_score = Column(Float, default=0.0)
    sustainability_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    batch = relationship("WasteBatch", back_populates="sustainability_metrics")

class EnvironmentalImpact(Base):
    __tablename__ = "environmental_impacts"

    id = Column(Integer, primary_key=True, index=True)
    waste_batch_id = Column(Integer, ForeignKey("waste_batches.id", ondelete="CASCADE"), nullable=False)
    co2_saved_kg = Column(Float, default=0.0)
    water_saved_liters = Column(Float, default=0.0)
    landfill_reduction_kg = Column(Float, default=0.0)
    energy_recovered_mj = Column(Float, default=0.0)
    environmental_benefit_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    batch = relationship("WasteBatch", back_populates="environmental_impacts")

class RecyclingRecommendation(Base):
    __tablename__ = "recycling_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    waste_batch_id = Column(Integer, ForeignKey("waste_batches.id", ondelete="CASCADE"), nullable=False)
    
    recommendation_1_strategy = Column(String, nullable=True)
    recommendation_1_confidence = Column(Float, default=0.0)
    recommendation_1_rationale = Column(String, nullable=True)

    recommendation_2_strategy = Column(String, nullable=True)
    recommendation_2_confidence = Column(Float, default=0.0)
    recommendation_2_rationale = Column(String, nullable=True)

    recommendation_3_strategy = Column(String, nullable=True)
    recommendation_3_confidence = Column(Float, default=0.0)
    recommendation_3_rationale = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    batch = relationship("WasteBatch", back_populates="recommendations")

class CircularityAnalytics(Base):
    __tablename__ = "circularity_analytics"

    id = Column(Integer, primary_key=True, index=True)
    recovery_rate = Column(Float, default=0.0)
    reuse_rate = Column(Float, default=0.0)
    recycling_rate = Column(Float, default=0.0)
    diversion_rate = Column(Float, default=0.0)
    avg_circularity_score = Column(Float, default=0.0)
    recorded_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
