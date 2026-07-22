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


class WasteScore(Base):
    __tablename__ = "waste_scores"

    __table_args__ = (
        UniqueConstraint(
            "classification_id",
            name="uq_waste_scores_classification_id",
        ),
        CheckConstraint(
            "recyclability_score BETWEEN 0 AND 100",
            name="ck_recyclability_score_range",
        ),
        CheckConstraint(
            "condition_score BETWEEN 0 AND 100",
            name="ck_condition_score_range",
        ),
        CheckConstraint(
            "reuse_potential_score BETWEEN 0 AND 100",
            name="ck_reuse_potential_score_range",
        ),
        CheckConstraint(
            "environmental_benefit_score BETWEEN 0 AND 100",
            name="ck_environmental_benefit_score_range",
        ),
        CheckConstraint(
            "processing_feasibility_score BETWEEN 0 AND 100",
            name="ck_processing_feasibility_score_range",
        ),
        CheckConstraint(
            "circularity_score BETWEEN 0 AND 100",
            name="ck_circularity_score_range",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    classification_id: Mapped[int] = mapped_column(
        ForeignKey("classifications.id"),
        nullable=False,
        index=True,
    )

    recyclability_score: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    condition_score: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    reuse_potential_score: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    environmental_benefit_score: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    processing_feasibility_score: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    circularity_score: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    waste_category: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
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
        back_populates="waste_score"
    )