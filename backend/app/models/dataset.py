import uuid
from sqlalchemy import Column, String, BigInteger, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.session import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True) # e.g. DeepFashion, Fashion-MNIST, Fabric Image Dataset, Sustainable Fashion Dataset
    description = Column(String(500), nullable=True)
    size_bytes = Column(BigInteger, default=0)
    num_images = Column(Integer, default=0)
    format = Column(String(50), nullable=False) # e.g. JPEG, PNG, CSV, ZIP
    status = Column(String(50), default="Pending", nullable=False) # Pending, Processing, Ready, Failed
    upload_path = Column(String(255), nullable=True)
    
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    uploader = relationship("User", back_populates="datasets")
