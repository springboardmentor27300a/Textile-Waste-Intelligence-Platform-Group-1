from pathlib import Path
import shutil
import uuid
from typing import List

from fastapi import (
    UploadFile,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.models.analysis import Analysis
from app.models.collection import Collection
from app.models.waste_source import WasteSource

from app.schemas.analysis import (
    AnalysisResponse,
)

from app.services.image_processor import (
    ImageProcessor,
)

from app.services.collection_service import (
    CollectionService,
)


class AnalysisService:
    """
    =========================================================

            Textile Waste Intelligence Platform

                 Analysis Service

    Responsibilities

    • Store uploaded images
    • Execute complete AI pipeline
    • Save analysis
    • Update collection metrics
    • Trigger downstream workflow

    =========================================================
    """

    UPLOAD_DIRECTORY = "uploads"

    # ======================================================
    # Image Upload
    # ======================================================

    @staticmethod
    def save_image(
        file: UploadFile,
    ) -> str:

        Path(
            AnalysisService.UPLOAD_DIRECTORY
        ).mkdir(
            exist_ok=True
        )

        extension = Path(
            file.filename
        ).suffix

        filename = (
            f"{uuid.uuid4()}{extension}"
        )

        filepath = (
            Path(
                AnalysisService.UPLOAD_DIRECTORY
            )
            / filename
        )

        with open(
            filepath,
            "wb",
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer,
            )

        return str(filepath)

    # ======================================================
    # Validation
    # ======================================================

    @staticmethod
    def validate_collection(
        collection_id: int,
        db: Session,
    ) -> Collection:

        collection = (
            db.query(Collection)
            .filter(
                Collection.id == collection_id
            )
            .first()
        )

        if collection is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collection not found.",
            )

        return collection

    @staticmethod
    def validate_waste_source(
        waste_source_id: int,
        db: Session,
    ) -> WasteSource:

        source = (
            db.query(WasteSource)
            .filter(
                WasteSource.id == waste_source_id
            )
            .first()
        )

        if source is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Waste source not found.",
            )

        return source

    # ======================================================
    # AI Pipeline
    # ======================================================

    @staticmethod
    def analyze_image(
        collection_id: int,
        file: UploadFile,
        db: Session,
    ) -> AnalysisResponse:

        # ------------------------------------------
        # Validate Collection
        # ------------------------------------------

        collection = (
            AnalysisService.validate_collection(
                collection_id,
                db,
            )
        )

        waste_source = (
            AnalysisService.validate_waste_source(
                collection.waste_source_id,
                db,
            )
        )

        # ------------------------------------------
        # Save Uploaded Image
        # ------------------------------------------

        image_path = (
            AnalysisService.save_image(
                file
            )
        )

        # ------------------------------------------
        # Execute AI Pipeline
        # ------------------------------------------

        result = (
            ImageProcessor.analyze(
                image_path
            )
        )

        # ------------------------------------------
        # Create Analysis Entity
        # ------------------------------------------

        analysis = Analysis(

            collection_id=collection.id,

            image_path=image_path,

            image_name=file.filename,

            material=result.material,

            primary_material=result.primary_material,

            secondary_material=result.secondary_material,

            composition=result.composition,

            material_quality=result.material_quality,

            confidence=result.confidence,

            material_category=result.material_category,

            biodegradable=result.biodegradable,

            recyclable=result.recyclable,

            recycled_content=result.recycled_content,

            # ------------------------------------------
            # Image Intelligence
            # ------------------------------------------

            dominant_color=result.dominant_color,

            color_palette=result.color_palette,

            texture=result.texture,

            pattern=result.pattern,

            defects=result.defects,

            contamination_level=result.contamination_level,

            waste_category=result.waste_category,

            waste_subcategory=result.waste_subcategory,

            reuse_potential=result.reuse_potential,

            recycling_method=result.recycling_method,

            reuse_score=result.reuse_score,

            recyclability_score=result.recyclability_score,

            environmental_score=result.environmental_score,

            overall_score=result.overall_score,

            sustainability_score=result.sustainability_score,

            material_recovery_score=result.material_recovery_score,

            circularity_score=result.circularity_score,

            carbon_footprint=result.carbon_footprint,

            carbon_savings=result.carbon_savings,

            water_consumption=result.water_consumption,

            water_savings=result.water_savings,

            energy_consumption=result.energy_consumption,

            energy_savings=result.energy_savings,

            landfill_diversion=result.landfill_diversion,

            resource_conservation=result.resource_conservation,

            sustainability_rating=result.sustainability_rating,

            sustainability_status=result.sustainability_status,

            esg_score=result.esg_score,

            esg_readiness=result.esg_readiness,

            environmental_impact=result.environmental_impact,

            circular_economy_index=result.circular_economy_index,

            recycling_target=result.recycling_target,

            recycling_progress=result.recycling_progress,

            priority=result.priority,

            recommendation=result.recommendation,

            next_step=result.next_step,

            expected_benefit=result.expected_benefit,
        )

        db.add(analysis)

        db.commit()

        db.refresh(analysis)

        # ------------------------------------------
        # Update Collection Summary
        # ------------------------------------------

        analyses = (
            db.query(Analysis)
            .filter(
                Analysis.collection_id == collection.id
            )
            .all()
        )

        CollectionService.update_collection_summary(
            collection=collection,
            analyses=analyses,
            db=db,
        )

        # ------------------------------------------
        # Update Waste Source Statistics
        # ------------------------------------------

        waste_source.total_collections = (
            db.query(Collection)
            .filter(
                Collection.waste_source_id ==
                waste_source.id
            )
            .count()
        )

        collections = (
            db.query(Collection)
            .filter(
                Collection.waste_source_id ==
                waste_source.id
            )
            .all()
        )

        waste_source.total_waste_received = round(

            sum(
                c.total_weight
                for c in collections
            ),

            2,

        )

        waste_source.total_recycled = round(

            sum(
                c.recyclable_weight
                for c in collections
            ),

            2,

        )

        waste_source.total_landfill_diverted = round(

            sum(
                c.recyclable_weight
                for c in collections
            ),

            2,

        )

        waste_source.total_carbon_saved = round(

            sum(
                c.carbon_saved
                for c in collections
            ),

            2,

        )

        waste_source.total_water_saved = round(

            sum(
                c.water_saved
                for c in collections
            ),

            2,

        )

        waste_source.total_energy_saved = round(

            sum(
                c.energy_saved
                for c in collections
            ),

            2,

        )

        if collections:

            waste_source.company_sustainability_score = round(

                sum(
                    c.sustainability_score
                    for c in collections
                )
                / len(collections),

                2,

            )

        else:

            waste_source.company_sustainability_score = 0

        db.commit()

        db.refresh(waste_source)

        # ------------------------------------------
        # Inventory Generation
        # ------------------------------------------

        try:

            from app.services.inventory_service import (
                InventoryService,
            )

            InventoryService.create_or_update_inventory(
                collection_id=collection.id,
                db=db,
            )

        except Exception as e:

            print(
                "Inventory Update:",
                e,
            )

        # ------------------------------------------
        # Recycling Workflow
        # ------------------------------------------

        try:

            from app.services.recycling_engine import (
                RecyclingEngine,
            )

            RecyclingEngine.process_collection(

                collection_id=collection.id,

                db=db,

            )

        except Exception as e:

            print(
                "Recycling Engine:",
                e,
            )

        # ------------------------------------------
        # PDF Report
        # ------------------------------------------

        try:

            from app.services.report_service import (
                ReportService,
            )

            ReportService.generate_collection_report(

                collection.id,

                db,

            )

        except Exception as e:

            print(
                "Report:",
                e,
            )

        # ------------------------------------------
        # Refresh Analysis
        # ------------------------------------------

        db.refresh(analysis)

        return analysis

    # ======================================================
    # Query Methods
    # ======================================================

    @staticmethod
    def get_all(
        db: Session,
    ):

        return (
            db.query(Analysis)
            .order_by(
                Analysis.created_at.desc()
            )
            .all()
        )

    @staticmethod
    def get_by_id(
        analysis_id: int,
        db: Session,
    ):

        analysis = (
            db.query(Analysis)
            .filter(
                Analysis.id == analysis_id
            )
            .first()
        )

        if analysis is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found.",
            )

        return analysis

    @staticmethod
    def get_by_collection(
        collection_id: int,
        db: Session,
    ):

        AnalysisService.validate_collection(
            collection_id,
            db,
        )

        return (
            db.query(Analysis)
            .filter(
                Analysis.collection_id ==
                collection_id
            )
            .order_by(
                Analysis.created_at.desc()
            )
            .all()
        )

    @staticmethod
    def get_by_material(
        material: str,
        db: Session,
    ):

        return (
            db.query(Analysis)
            .filter(
                Analysis.material == material
            )
            .order_by(
                Analysis.created_at.desc()
            )
            .all()
        )

    @staticmethod
    def get_recent(
        limit: int,
        db: Session,
    ):

        return (
            db.query(Analysis)
            .order_by(
                Analysis.created_at.desc()
            )
            .limit(limit)
            .all()
        )

    # ======================================================
    # Delete
    # ======================================================

    @staticmethod
    def delete(
        analysis_id: int,
        db: Session,
    ):

        analysis = (
            AnalysisService.get_by_id(
                analysis_id,
                db,
            )
        )

        image_path = Path(
            analysis.image_path
        )

        if image_path.exists():

            try:

                image_path.unlink()

            except Exception:

                pass

        db.delete(
            analysis
        )

        db.commit()

        return {

            "message":
            "Analysis deleted successfully."

        }

    # ======================================================
    # Reanalyse Collection
    # ======================================================

    @staticmethod
    def reanalyse_collection(
        collection_id: int,
        db: Session,
    ):

        analyses = (
            AnalysisService.get_by_collection(
                collection_id,
                db,
            )
        )

        return {

            "collection_id": collection_id,

            "analysis_count": len(
                analyses
            ),

            "status":
            "Ready for reanalysis."

        }

    # ======================================================
    # Statistics
    # ======================================================

    @staticmethod
    def statistics(
        db: Session,
    ):

        analyses = (
            db.query(
                Analysis
            ).all()
        )

        if not analyses:

            return {

                "total_analysis": 0,

                "average_confidence": 0,

                "average_sustainability": 0,

                "average_recovery": 0,

                "average_circularity": 0,

            }

        return {

            "total_analysis": len(
                analyses
            ),

            "average_confidence": round(

                sum(
                    a.confidence
                    for a in analyses
                ) / len(analyses),

                2,

            ),

            "average_sustainability": round(

                sum(
                    a.sustainability_score
                    for a in analyses
                ) / len(analyses),

                2,

            ),

            "average_recovery": round(

                sum(
                    a.material_recovery_score
                    for a in analyses
                ) / len(analyses),

                2,

            ),

            "average_circularity": round(

                sum(
                    a.circularity_score
                    for a in analyses
                ) / len(analyses),

                2,

            ),

        }