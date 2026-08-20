from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.collection import Collection
from app.models.waste_source import WasteSource
from app.schemas.collection import (
    CollectionCreate,
    CollectionUpdate,
)


class CollectionService:

    @staticmethod
    def generate_collection_code(db: Session):
        count = db.query(Collection).count() + 1
        return f"COL{count:04d}"

    @staticmethod
    def get_all_collections(db: Session):
        return (
            db.query(Collection)
            .order_by(Collection.created_at.desc())
            .all()
        )

    @staticmethod
    def get_collection_by_id(
        collection_id: int,
        db: Session,
    ):
        collection = (
            db.query(Collection)
            .filter(Collection.id == collection_id)
            .first()
        )

        if not collection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collection not found.",
            )

        return collection

    @staticmethod
    def create_collection(
        collection: CollectionCreate,
        db: Session,
    ):

        source = (
            db.query(WasteSource)
            .filter(
                WasteSource.id == collection.waste_source_id
            )
            .first()
        )

        if not source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Waste source not found.",
            )

        new_collection = Collection(
            collection_code=CollectionService.generate_collection_code(db),

            waste_source_id=collection.waste_source_id,
            collection_date=collection.collection_date,
            collected_by=collection.collected_by,
            vehicle_number=collection.vehicle_number,
            collection_method=collection.collection_method,
            total_weight=collection.total_weight,
            collection_status=collection.collection_status,

            analysis_status="Pending",
            inventory_status="Pending",
            recycling_status="Pending",
            report_status="Pending",

            recyclable_weight=0.0,
            rejected_weight=0.0,
            recovery_percentage=0.0,
            sustainability_score=0.0,
            carbon_saved=0.0,
            water_saved=0.0,
            energy_saved=0.0,
            remarks=collection.remarks,
        )

        db.add(new_collection)
        db.commit()
        db.refresh(new_collection)

        return new_collection

    @staticmethod
    def update_collection(
        collection_id: int,
        collection: CollectionUpdate,
        db: Session,
    ):

        existing = CollectionService.get_collection_by_id(
            collection_id,
            db,
        )

        update_data = collection.model_dump(
            exclude_unset=True
        )

        for key, value in update_data.items():
            setattr(existing, key, value)

        existing.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(existing)

        return existing

    @staticmethod
    def delete_collection(
        collection_id: int,
        db: Session,
    ):

        collection = CollectionService.get_collection_by_id(
            collection_id,
            db,
        )

        db.delete(collection)
        db.commit()

        return {
            "message": "Collection deleted successfully."
        }
    
    @staticmethod
    def update_collection_summary(
        collection: Collection,
        analyses,
        db: Session,
    ):
        """
        Update collection statistics after AI analysis.
        """

        if not analyses:
            return collection

        recyclable_weight = 0.0
        sustainability = 0.0
        carbon = 0.0
        water = 0.0
        energy = 0.0

        for analysis in analyses:

            sustainability += analysis.sustainability_score
            carbon += analysis.carbon_savings
            water += analysis.water_savings
            energy += analysis.energy_savings

            if analysis.recyclable:
                recyclable_weight += (
                    collection.total_weight /
                    len(analyses)
                )

        collection.analysis_status = "Completed"

        collection.recyclable_weight = round(
            recyclable_weight,
            2,
        )

        collection.rejected_weight = round(
            collection.total_weight -
            recyclable_weight,
            2,
        )

        collection.recovery_percentage = round(
            (
                recyclable_weight /
                collection.total_weight
            ) * 100,
            2,
        ) if collection.total_weight else 0

        collection.sustainability_score = round(
            sustainability / len(analyses),
            2,
        )

        collection.carbon_saved = round(
            carbon,
            2,
        )

        collection.water_saved = round(
            water,
            2,
        )

        collection.energy_saved = round(
            energy,
            2,
        )

        collection.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(collection)

        return collection