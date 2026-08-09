from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    contact_email = Column(String)
    country = Column(String)
    certification = Column(String)  # e.g. GOTS, OEKO-TEX, ISO 14001
    waste_rating = Column(Float, default=0.0)  # 0-5 sustainability score
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    inventory = relationship("Inventory", back_populates="supplier")
