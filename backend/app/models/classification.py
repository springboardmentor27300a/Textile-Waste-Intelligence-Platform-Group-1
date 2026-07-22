from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    JSON,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Classification(Base):
    __tablename__ = "classifications"

    id: Mapped[int] = mapped_column(primary_key=True)

    batch_id: Mapped[int] = mapped_column(
        ForeignKey("waste_batches.id"),
        nullable=False,
        index=True,
    )

    image_id: Mapped[int | None] = mapped_column(
        ForeignKey("waste_images.id"),
        nullable=True,
        index=True,
    )

    predicted_material: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    confidence_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    alternative_predictions: Mapped[list | None] = mapped_column(
        JSON,
        nullable=True,
    )

    predicted_condition: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    condition_confidence: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    model_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    model_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    is_user_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    verified_material: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    verified_condition: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    verified_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    batch: Mapped["WasteBatch"] = relationship(
        back_populates="classifications"
    )

    image: Mapped["WasteImage | None"] = relationship(
        back_populates="classifications"
    )

    verified_by_user: Mapped["User | None"] = relationship(
        back_populates="verified_classifications",
        foreign_keys=[verified_by],
    )

    waste_score: Mapped["WasteScore | None"] = relationship(
        back_populates="classification",
        uselist=False,
    )

    recommendations: Mapped[list["Recommendation"]] = relationship(
        back_populates="classification"
    )

    impact_estimate: Mapped["ImpactEstimate | None"] = relationship(
        back_populates="classification",
        uselist=False,
    )