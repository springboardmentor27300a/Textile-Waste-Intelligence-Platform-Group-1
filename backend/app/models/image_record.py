from sqlalchemy import Column, Integer, String, BigInteger, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class TextileImage(Base):
    """
    Stores metadata for uploaded textile images.
    The actual file is saved to disk in app/uploads/.
    """
    __tablename__ = "textile_images"

    id              = Column(Integer, primary_key=True, index=True)
    filename        = Column(String, nullable=False)          # stored filename (uuid-based)
    original_name   = Column(String, nullable=False)          # original user filename
    file_path       = Column(String, nullable=False)          # absolute path on disk
    file_url        = Column(String, nullable=False)          # URL to serve the image
    file_size       = Column(BigInteger, default=0)           # bytes
    mime_type       = Column(String, default="image/jpeg")

    uploaded_by_id  = Column(Integer, ForeignKey("users.id"), nullable=True)
    uploaded_at     = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    uploader = relationship("User", foreign_keys=[uploaded_by_id])

    @property
    def user_sequence_num(self):
        from sqlalchemy.orm import object_session
        session = object_session(self)
        if session and self.uploaded_by_id:
            return session.query(TextileImage).filter(
                TextileImage.uploaded_by_id == self.uploaded_by_id,
                TextileImage.id <= self.id
            ).count()
        return self.id
