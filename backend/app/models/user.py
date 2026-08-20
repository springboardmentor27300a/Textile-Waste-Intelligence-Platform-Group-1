from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String

from app.database.database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    full_name = Column(
        String,
        nullable=False,
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False,
    )

    password = Column(
        String,
        nullable=False,
    )

    role = Column(
        String,
        default="operator",
    )

    organization_name = Column(
        String,
        nullable=True,
    )

    organization_type = Column(
        String,
        nullable=True,
    )

    business_category = Column(
        String,
        nullable=True,
    )

    organization_contact = Column(
        String,
        nullable=True,
    )