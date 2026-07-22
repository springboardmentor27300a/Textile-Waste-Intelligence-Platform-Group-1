from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    __table_args__ = (
        CheckConstraint(
            "suitability_score BETWEEN 0 AND 100",
            name="ck_recommendation_suitability_range",
        ),
        CheckConstraint(
            "rank > 0",
            name="ck_recommendation_rank_positive",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    classification_id: Mapped[int] = mapped_column(
        ForeignKey("classifications.id"),
        nullable=False,
        index=True,
    )

    action: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    rank: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    suitability_score: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    reason: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    classification: Mapped["Classification"] = relationship(
        back_populates="recommendations"
    )