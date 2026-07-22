from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ImpactEstimate(Base):
    __tablename__ = "impact_estimates"

    __table_args__ = (
        UniqueConstraint(
            "classification_id",
            name="uq_impact_estimates_classification_id",
        ),
        CheckConstraint(
            "co2_avoided_kg >= 0",
            name="ck_co2_avoided_nonnegative",
        ),
        CheckConstraint(
            "water_saved_liters >= 0",
            name="ck_water_saved_nonnegative",
        ),
        CheckConstraint(
            "landfill_avoided_kg >= 0",
            name="ck_landfill_avoided_nonnegative",
        ),
        CheckConstraint(
            "material_recovered_kg >= 0",
            name="ck_material_recovered_nonnegative",
        ),
        CheckConstraint(
            "diversion_percentage BETWEEN 0 AND 100",
            name="ck_diversion_percentage_range",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    classification_id: Mapped[int] = mapped_column(
        ForeignKey("classifications.id"),
        nullable=False,
        index=True,
    )

    co2_avoided_kg: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
        nullable=False,
    )

    water_saved_liters: Mapped[Decimal] = mapped_column(
        Numeric(14, 2),
        default=0,
        nullable=False,
    )

    landfill_avoided_kg: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
        nullable=False,
    )

    material_recovered_kg: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
        nullable=False,
    )

    diversion_percentage: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        default=0,
        nullable=False,
    )

    calculation_version: Mapped[str] = mapped_column(
        String(50),
        default="1.0",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    classification: Mapped["Classification"] = relationship(
        back_populates="impact_estimate"
    )