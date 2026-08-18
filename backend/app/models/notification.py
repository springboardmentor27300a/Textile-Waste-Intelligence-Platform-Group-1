from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from app.database import Base
from app.models.user import UserRole
import enum

class NotificationType(str, enum.Enum):
    alert = "alert"
    warning = "warning"
    info = "info"
    success = "success"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    role_target = Column(Enum(UserRole), nullable=True, index=True)  # If null, targeted by user_id
    type = Column(Enum(NotificationType), default=NotificationType.info, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
