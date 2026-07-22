from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class BatchStatusHistory(Base):
    __tablename__ = "batch_status_history"

    id: Mapped[int] = mapped_column(primary_key=True)

    batch_id: Mapped[int] = mapped_column(
        ForeignKey("waste_batches.id"),
        nullable=False,
        index=True,
    )

    changed_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    old_status: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    new_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    batch: Mapped["WasteBatch"] = relationship(
        back_populates="status_history"
    )

    changed_by_user: Mapped["User"] = relationship(
        back_populates="status_changes",
        foreign_keys=[changed_by],
    )