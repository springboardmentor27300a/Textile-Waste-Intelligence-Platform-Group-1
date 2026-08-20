"""
AI Log model
"""
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class AILog(Base):
    __tablename__ = "ai_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    analysis_type = Column(String(100))  # material_classification, waste_classification, image_analysis
    input_data = Column(Text, nullable=True)
    output_data = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
