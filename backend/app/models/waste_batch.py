from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class WasteBatch(Base):
    __tablename__ = "waste_batches"

    id: Mapped[int] = mapped_column(primary_key=True)

    batch_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    organization_id: Mapped[int] = mapped_column(
        ForeignKey("organizations.id"),
        nullable=False,
        index=True,
    )

    facility_id: Mapped[int | None] = mapped_column(
        ForeignKey("facilities.id"),
        nullable=True,
        index=True,
    )

    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    source: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    quantity_kg: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    declared_material: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    color: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    condition: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    collection_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    processing_status: Mapped[str] = mapped_column(
        String(50),
        default="REGISTERED",
        nullable=False,
        index=True,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    is_archived: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    organization: Mapped["Organization"] = relationship(
        back_populates="waste_batches"
    )

    facility: Mapped["Facility | None"] = relationship(
        back_populates="waste_batches"
    )

    creator: Mapped["User"] = relationship(
        back_populates="created_batches",
        foreign_keys=[created_by],
    )

    images: Mapped[list["WasteImage"]] = relationship(
        back_populates="batch"
    )

    classifications: Mapped[list["Classification"]] = relationship(
        back_populates="batch"
    )

    status_history: Mapped[list["BatchStatusHistory"]] = relationship(
        back_populates="batch"
    )