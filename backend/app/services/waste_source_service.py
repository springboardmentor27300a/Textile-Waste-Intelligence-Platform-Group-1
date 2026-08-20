from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.waste_source import WasteSource
from app.schemas.waste_source import (
    WasteSourceCreate,
    WasteSourceUpdate,
)


class WasteSourceService:

    @staticmethod
    def generate_source_code(db: Session) -> str:
        """
        Generate a unique source code.
        Example:
        SRC-000001
        SRC-000002
        """

        last_source = (
            db.query(WasteSource)
            .order_by(WasteSource.id.desc())
            .first()
        )

        if not last_source:
            return "SRC-000001"

        next_id = last_source.id + 1
        return f"SRC-{next_id:06d}"

    @staticmethod
    def get_all_sources(db: Session):
        return (
            db.query(WasteSource)
            .order_by(WasteSource.created_at.desc())
            .all()
        )

    @staticmethod
    def get_source_by_id(source_id: int, db: Session):

        source = (
            db.query(WasteSource)
            .filter(WasteSource.id == source_id)
            .first()
        )

        if not source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Waste source not found."
            )

        return source

    @staticmethod
    def create_source(
        source: WasteSourceCreate,
        db: Session,
    ):

        existing_org = (
            db.query(WasteSource)
            .filter(
                WasteSource.organization_name ==
                source.organization_name
            )
            .first()
        )

        if existing_org:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization already exists."
            )

        existing_email = (
            db.query(WasteSource)
            .filter(
                WasteSource.email ==
                source.email
            )
            .first()
        )

        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered."
            )

        db_source = WasteSource(
            source_code=WasteSourceService.generate_source_code(db),
            **source.model_dump()
        )

        db.add(db_source)
        db.commit()
        db.refresh(db_source)

        return db_source

    @staticmethod
    def update_source(
        source_id: int,
        source: WasteSourceUpdate,
        db: Session,
    ):

        db_source = WasteSourceService.get_source_by_id(
            source_id,
            db,
        )

        update_data = source.model_dump(
            exclude_unset=True
        )

        for key, value in update_data.items():
            setattr(
                db_source,
                key,
                value,
            )

        db.commit()
        db.refresh(db_source)

        return db_source

    @staticmethod
    def delete_source(
        source_id: int,
        db: Session,
    ):

        db_source = WasteSourceService.get_source_by_id(
            source_id,
            db,
        )

        db.delete(db_source)
        db.commit()

        return {
            "message": "Waste source deleted successfully."
        }