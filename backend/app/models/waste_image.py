from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class WasteImage(Base):
    __tablename__ = "waste_images"

    id: Mapped[int] = mapped_column(primary_key=True)

    batch_id: Mapped[int] = mapped_column(
        ForeignKey("waste_batches.id"),
        nullable=False,
        index=True,
    )

    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    stored_filename: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    file_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    file_size_bytes: Mapped[int] = mapped_column(
        nullable=False,
    )

    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    # uploaded_at: Mapped[datetime] = mapped_column(
    #     DateTime(timezone=True),
    #     server_default=func.now(),
    #     nullable=False,
    # )
    uploaded_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now(),
    nullable=False,
)

    batch: Mapped["WasteBatch"] = relationship(
        back_populates="images"
    )

    classifications: Mapped[list["Classification"]] = relationship(
        back_populates="image"
    )