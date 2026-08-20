from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.analysis import Analysis
from app.models.collection import Collection
from app.models.inventory import Inventory
from app.models.waste_source import WasteSource


class KPIService:
    """
    ==========================================================
                Textile Waste Intelligence Platform

                     KPI Analytics Service

    Provides all KPI cards used by:

    • Dashboard
    • Reports
    • Homepage
    • Executive Summary

    ==========================================================
    """

    @staticmethod
    def get_kpis(db: Session):

        # --------------------------------------------------
        # Counts
        # --------------------------------------------------

        total_companies = db.query(
            WasteSource
        ).count()

        total_collections = db.query(
            Collection
        ).count()

        total_analysis = db.query(
            Analysis
        ).count()

        total_inventory = db.query(
            Inventory
        ).count()

        # --------------------------------------------------
        # Waste
        # --------------------------------------------------

        total_waste = (
            db.query(
                func.coalesce(
                    func.sum(
                        Collection.total_weight
                    ),
                    0,
                )
            ).scalar()
        )

        recyclable_weight = (
            db.query(
                func.coalesce(
                    func.sum(
                        Collection.recyclable_weight
                    ),
                    0,
                )
            ).scalar()
        )

        rejected_weight = (
            db.query(
                func.coalesce(
                    func.sum(
                        Collection.rejected_weight
                    ),
                    0,
                )
            ).scalar()
        )

        # --------------------------------------------------
        # Sustainability
        # --------------------------------------------------

        carbon_saved = (
            db.query(
                func.coalesce(
                    func.sum(
                        Collection.carbon_saved
                    ),
                    0,
                )
            ).scalar()
        )

        water_saved = (
            db.query(
                func.coalesce(
                    func.sum(
                        Collection.water_saved
                    ),
                    0,
                )
            ).scalar()
        )

        energy_saved = (
            db.query(
                func.coalesce(
                    func.sum(
                        Collection.energy_saved
                    ),
                    0,
                )
            ).scalar()
        )

        landfill_diversion = (
            db.query(
                func.coalesce(
                    func.sum(
                        Analysis.landfill_diversion
                    ),
                    0,
                )
            ).scalar()
        )

        # --------------------------------------------------
        # Average Scores
        # --------------------------------------------------

        environmental_score = (
            db.query(
                func.coalesce(
                    func.avg(
                        Analysis.environmental_score
                    ),
                    0,
                )
            ).scalar()
        )

        sustainability_score = (
            db.query(
                func.coalesce(
                    func.avg(
                        Analysis.sustainability_score
                    ),
                    0,
                )
            ).scalar()
        )

        circularity_score = (
            db.query(
                func.coalesce(
                    func.avg(
                        Analysis.circularity_score
                    ),
                    0,
                )
            ).scalar()
        )

        reuse_score = (
            db.query(
                func.coalesce(
                    func.avg(
                        Analysis.reuse_score
                    ),
                    0,
                )
            ).scalar()
        )

        recovery_score = (
            db.query(
                func.coalesce(
                    func.avg(
                        Analysis.material_recovery_score
                    ),
                    0,
                )
            ).scalar()
        )

        overall_score = (
            db.query(
                func.coalesce(
                    func.avg(
                        Analysis.overall_score
                    ),
                    0,
                )
            ).scalar()
        )

        esg_score = (
            db.query(
                func.coalesce(
                    func.avg(
                        Analysis.esg_score
                    ),
                    0,
                )
            ).scalar()
        )

        circular_economy_index = (
            db.query(
                func.coalesce(
                    func.avg(
                        Analysis.circular_economy_index
                    ),
                    0,
                )
            ).scalar()
        )
        
        confidence = (
            db.query(
                func.coalesce(
                    func.avg(
                        Analysis.confidence
                    ),
                    0,
                )
            ).scalar()
        )

        dashboard_health = "Needs Improvement"

        if overall_score >= 90:

            dashboard_health = "Excellent"

        elif overall_score >= 80:

            dashboard_health = "Very Good"

        elif overall_score >= 70:

            dashboard_health = "Good"

        elif overall_score >= 60:

            dashboard_health = "Average"

        # --------------------------------------------------
        # Recovery %
        # --------------------------------------------------

        recovery_percentage = 0

        if total_waste > 0:

            recovery_percentage = round(

                (
                    recyclable_weight
                    / total_waste
                )
                * 100,

                2,

            )

        completion_percentage = 0

        if total_collections > 0:

            completion_percentage = round(

                (

                    total_analysis
                    / total_collections

                ) * 100,

                2,

            )

        # --------------------------------------------------
        # Active Companies
        # --------------------------------------------------

        active_companies = (
            db.query(
                WasteSource
            )
            .filter(
                WasteSource.status == "Active"
            )
            .count()
        )

        sustainability_partners = (
            db.query(
                WasteSource
            )
            .filter(
                WasteSource.sustainability_partner.is_(True)
            )
            .count()
        )

        # --------------------------------------------------
        # Return Dashboard KPIs
        # --------------------------------------------------

        return {

            # Counts

            "total_companies":
                total_companies,

            "active_companies":
                active_companies,

            "sustainability_partners":
                sustainability_partners,

            "total_collections":
                total_collections,

            "total_analysis":
                total_analysis,

            "total_inventory":
                total_inventory,

            # Waste

            "total_waste":
                round(total_waste, 2),

            "recyclable_weight":
                round(recyclable_weight, 2),

            "rejected_weight":
                round(rejected_weight, 2),

            "recovery_percentage":
                recovery_percentage,

            # Sustainability

            "carbon_saved":
                round(carbon_saved, 2),

            "water_saved":
                round(water_saved, 2),

            "energy_saved":
                round(energy_saved, 2),

            # AI

            "average_confidence":
                round(confidence, 2),

            "reuse_score":
                round(reuse_score, 2),

            "recovery_score":
                round(recovery_score, 2),

            "circularity_score":
                round(circularity_score, 2),

            "sustainability_score":
                round(sustainability_score, 2),

            "environmental_score":
                round(environmental_score, 2),

            "overall_score":
                round(overall_score, 2),

            "esg_score":
                round(esg_score, 2),

            "landfill_diversion":
                round(landfill_diversion, 2),

            "circular_economy_index":
                round(circular_economy_index, 2,),

            "dashboard_health":
                dashboard_health,

            "completion_percentage":
                completion_percentage,

        }