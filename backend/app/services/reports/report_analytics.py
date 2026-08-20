from sqlalchemy.orm import Session

from app.models.analysis import Analysis
from app.models.collection import Collection
from app.models.inventory import Inventory
from app.models.waste_source import WasteSource


class ReportAnalytics:
    """
    =========================================================

        Textile Waste Intelligence Platform

            Report Analytics Service

    Purpose

    • Prepare report data
    • Aggregate business information
    • Hide ORM from report layer
    • Return clean dictionaries

    Reports never access SQLAlchemy directly.

    =========================================================
    """

    # =====================================================
    # Analysis
    # =====================================================

    @staticmethod
    def analysis(
        analysis: Analysis,
    ) -> dict:

        return {

            # ------------------------------------------------
            # AI Prediction
            # ------------------------------------------------

            "material":
                analysis.material,

            "confidence":
                round(
                    analysis.confidence,
                    2,
                ),

            # ------------------------------------------------
            # Material Intelligence
            # ------------------------------------------------

            "primary_material":
                analysis.primary_material,

            "secondary_material":
                analysis.secondary_material,

            "composition":
                analysis.composition,

            "material_category":
                analysis.material_category,

            "material_quality":
                analysis.material_quality,

            "biodegradable":
                analysis.biodegradable,

            "recyclable":
                analysis.recyclable,

            "recycled_content":
                analysis.recycled_content,

            # ------------------------------------------------
            # Waste Intelligence
            # ------------------------------------------------

            "waste_category":
                analysis.waste_category,

            "waste_subcategory":
                analysis.waste_subcategory,

            "reuse_potential":
                analysis.reuse_potential,

            "recycling_method":
                analysis.recycling_method,

            # ------------------------------------------------
            # Circular Economy Scores
            # ------------------------------------------------

            "recyclability_score":
                analysis.recyclability_score,

            "reuse_score":
                analysis.reuse_score,

            "material_recovery_score":
                analysis.material_recovery_score,

            "circularity_score":
                analysis.circularity_score,

            "environmental_score":
                analysis.environmental_score,

            "sustainability_score":
                analysis.sustainability_score,

            "overall_score":
                analysis.overall_score,

            # ------------------------------------------------
            # Environmental Assessment
            # ------------------------------------------------

            "carbon_footprint":
                analysis.carbon_footprint,

            "carbon_savings":
                analysis.carbon_savings,

            "water_consumption":
                analysis.water_consumption,

            "water_savings":
                analysis.water_savings,

            "energy_consumption":
                analysis.energy_consumption,

            "energy_savings":
                analysis.energy_savings,

            "landfill_diversion":
                analysis.landfill_diversion,

            "resource_conservation":
                analysis.resource_conservation,

            # ------------------------------------------------
            # Sustainability
            # ------------------------------------------------

            "sustainability_rating":
                analysis.sustainability_rating,

            "sustainability_status":
                analysis.sustainability_status,

            "environmental_impact":
                analysis.environmental_impact,

            "circular_economy_index":
                analysis.circular_economy_index,

            "recycling_target":
                analysis.recycling_target,

            "recycling_progress":
                analysis.recycling_progress,

            "esg_score":
                analysis.esg_score,

            "esg_readiness":
                analysis.esg_readiness,

            # ------------------------------------------------
            # Recommendation Engine
            # ------------------------------------------------

            "priority":
                analysis.priority,

            "recommendation":
                analysis.recommendation,

            "next_step":
                analysis.next_step,

            "expected_benefit":
                analysis.expected_benefit,

        }

    # =====================================================
    # Inventory
    # =====================================================

    @staticmethod
    def inventory(
        inventory: Inventory,
    ) -> dict:

        return {

            "batch_id":
                inventory.batch_id,

            "fabric":
                inventory.fabric,

            "source":
                inventory.source,

            "color":
                inventory.color,

            "condition":
                inventory.condition,

            "quantity":
                inventory.quantity,

            "collection_date":
                inventory.collection_date,

            "storage_location":
                inventory.storage_location,

            "rack_number":
                inventory.rack_number,

            "status":
                inventory.status,

            "notes":
                inventory.notes,

        }

    # =====================================================
    # Collection
    # =====================================================

    @staticmethod
    def collection(
        collection: Collection,
    ) -> dict:

        recovery_percentage = 0

        if collection.total_weight > 0:

            recovery_percentage = round(

                (

                    collection.recyclable_weight

                    /

                    collection.total_weight

                ) * 100,

                2,

            )

        return {

            # --------------------------------------------
            # Collection Information
            # --------------------------------------------

            "collection_code":
                collection.collection_code,

            "collection_date":
                collection.collection_date,

            "collected_by":
                collection.collected_by,

            "vehicle_number":
                collection.vehicle_number,

            "collection_method":
                collection.collection_method,

            "collection_status":
                collection.collection_status,

            "analysis_status":
                collection.analysis_status,

            "inventory_status":
                collection.inventory_status,

            "recycling_status":
                collection.recycling_status,

            "report_status":
                collection.report_status,

            # --------------------------------------------
            # Waste Summary
            # --------------------------------------------

            "total_weight":
                round(
                    collection.total_weight,
                    2,
                ),

            "recyclable_weight":
                round(
                    collection.recyclable_weight,
                    2,
                ),

            "rejected_weight":
                round(
                    collection.rejected_weight,
                    2,
                ),

            "recovery_percentage":
                round(
                    recovery_percentage,
                    2,
                ),

            # --------------------------------------------
            # Sustainability Metrics
            # --------------------------------------------

            "sustainability_score":
                round(
                    collection.sustainability_score,
                    2,
                ),

            "carbon_saved":
                round(
                    collection.carbon_saved,
                    2,
                ),

            "water_saved":
                round(
                    collection.water_saved,
                    2,
                ),

            "energy_saved":
                round(
                    collection.energy_saved,
                    2,
                ),

            # --------------------------------------------
            # Remarks
            # --------------------------------------------

            "remarks":
                collection.remarks,

            # --------------------------------------------
            # Report Summary
            # --------------------------------------------

            "material_summary":
                "Material summary generated from linked analysis records.",

            "environment_summary":
                "Environmental savings estimated from textile recovery and recycling.",

            "operational_summary":
                "Collection completed successfully.",

            "recommendation":
                "Improve textile segregation to maximize recovery and sustainability performance.",

        }

    # =====================================================
    # Waste Source
    # =====================================================

    @staticmethod
    def waste_source(
        source: WasteSource,
    ) -> dict:

        recovery_rate = 0

        if source.total_waste_received > 0:

            recovery_rate = round(

                (

                    source.total_recycled

                    /

                    source.total_waste_received

                ) * 100,

                2,

            )

        return {

            # --------------------------------------------
            # Organization Information
            # --------------------------------------------

            "organization_name":
                source.organization_name,

            "organization_type":
                source.organization_type,

            "industry":
                source.industry,

            "contact_person":
                source.contact_person,

            "email":
                source.email,

            "phone":
                source.phone,

            "city":
                source.city,

            "state":
                source.state,

            "country":
                source.country,

            "status":
                source.status,

            "verified":
                source.is_verified,

            "sustainability_partner":
                source.sustainability_partner,

            # --------------------------------------------
            # Collection Statistics
            # --------------------------------------------

            "total_collections":
                source.total_collections,

            "total_waste_received":
                round(
                    source.total_waste_received,
                    2,
                ),

            "total_recycled":
                round(
                    source.total_recycled,
                    2,
                ),

            "recovery_rate":
                recovery_rate,

            # --------------------------------------------
            # Sustainability Metrics
            # --------------------------------------------

            "carbon_saved":
                round(
                    source.total_carbon_saved,
                    2,
                ),

            "water_saved":
                round(
                    source.total_water_saved,
                    2,
                ),

            "energy_saved":
                round(
                    source.total_energy_saved,
                    2,
                ),

            "company_sustainability_score":
                round(
                    source.company_sustainability_score,
                    2,
                ),

            # --------------------------------------------
            # Report Summary
            # --------------------------------------------

            "company_level":

                "Gold"

                if source.company_sustainability_score >= 90

                else

                "Silver"

                if source.company_sustainability_score >= 80

                else

                "Bronze"

                if source.company_sustainability_score >= 70

                else

                "Standard",

            "environmental_rating":

                "Excellent"

                if source.total_carbon_saved >= 500

                else

                "Good"

                if source.total_carbon_saved >= 250

                else

                "Average"

                if source.total_carbon_saved >= 100

                else

                "Needs Improvement",

            "performance_summary":

                "Company demonstrates positive textile waste recovery and sustainability performance.",

            "recommendation":

                "Increase textile segregation, improve recycling efficiency, and expand circular economy initiatives.",

        }

    # =====================================================
    # Executive Summary
    # =====================================================

    @staticmethod
    def executive_summary(
        analysis: Analysis | None = None,
        collection: Collection | None = None,
        source: WasteSource | None = None,
    ) -> dict:

        summary = {}

        if analysis:

            summary["analysis"] = ReportAnalytics.analysis(
                analysis
            )

        if collection:

            summary["collection"] = ReportAnalytics.collection(
                collection
            )

        if source:

            summary["waste_source"] = ReportAnalytics.waste_source(
                source
            )

        return summary