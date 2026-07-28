import uuid
from sqlalchemy import Column, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.session import Base

class WasteBatch(Base):
    __tablename__ = "waste_batches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    batch_number = Column(String(50), unique=True, nullable=False, index=True)
    fabric_type = Column(String(100), nullable=False) # e.g. Cotton, Polyester, Denim, Wool, Silk, Nylon
    source = Column(String(100), nullable=False) # e.g. Factory A, Consumer Donation, Retail Return
    quantity = Column(Float, nullable=False) # in kg
    color = Column(String(50), nullable=False)
    condition = Column(String(100), nullable=False) # e.g. Clean, Dirty, Wet, Torn, Scraps
    collection_date = Column(Date, nullable=False)
    status = Column(String(50), default="Pending", nullable=False) # Pending, Sorting, Sorted, Recycling, Recycled, Disposed
    storage_location = Column(String(100), nullable=False) # e.g. Aisle 3 - Shelf B
    remarks = Column(String(500), nullable=True)
    
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    creator = relationship("User", back_populates="waste_batches")
    organization = relationship("Organization", back_populates="waste_batches")
    
    inventory_items = relationship("TextileInventory", back_populates="batch", cascade="all, delete-orphan")

class TextileInventory(Base):
    __tablename__ = "textile_inventory"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("waste_batches.id"), nullable=True)
    fabric_type = Column(String(100), nullable=False)
    quantity = Column(Float, nullable=False) # in kg
    color = Column(String(50), nullable=False)
    storage_location = Column(String(100), nullable=False)
    status = Column(String(50), default="In Stock", nullable=False) # In Stock, Processing, Dispatched
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    batch = relationship("WasteBatch", back_populates="inventory_items")
