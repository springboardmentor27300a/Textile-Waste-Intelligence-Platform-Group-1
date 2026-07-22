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


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)

    organization_id: Mapped[int | None] = mapped_column(
        ForeignKey("organizations.id"),
        nullable=True,
        index=True,
    )

    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.id"),
        nullable=False,
        index=True,
    )

    full_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    phone: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
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

    organization: Mapped["Organization | None"] = relationship(
        back_populates="users"
    )

    role: Mapped["Role"] = relationship(
        back_populates="users"
    )

    created_batches: Mapped[list["WasteBatch"]] = relationship(
        back_populates="creator",
        foreign_keys="WasteBatch.created_by",
    )

    verified_classifications: Mapped[list["Classification"]] = relationship(
        back_populates="verified_by_user",
        foreign_keys="Classification.verified_by",
    )

    status_changes: Mapped[list["BatchStatusHistory"]] = relationship(
        back_populates="changed_by_user",
        foreign_keys="BatchStatusHistory.changed_by",
    )

    notifications: Mapped[list["Notification"]] = relationship(
        back_populates="user"
    )

    reports: Mapped[list["Report"]] = relationship(
        back_populates="generated_by_user"
    )

    audit_logs: Mapped[list["AuditLog"]] = relationship(
        back_populates="user"
    )