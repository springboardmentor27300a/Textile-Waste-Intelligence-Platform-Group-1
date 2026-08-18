from sqlalchemy.orm import Session

from app.models import AnalysisHistory,InventorySustainabilityAnalysis


class HistoryService:

    def __init__(self, db: Session):
        self.db = db

    def save_analysis(
        self,
        image_name: str,
        material: dict,
        damage: dict,
        quality: dict,
        recommendation: dict,
        material_classification: dict,
        waste_classification: dict,
        recycling_engine: dict,
        sustainability: dict,
        environmental_analytics: dict,
        waste_scoring: dict,
        circular_economy: dict,
        benchmark: dict,
        analyzed_by: int = None
):
        """
        Save AI analysis results into the database.
        """
        print("Saving Waste Scoring:", waste_scoring)
        print("Saving Circular Economy:", circular_economy) 
        record = AnalysisHistory(

            image_name=image_name,

            material=material["label"],
            material_confidence=material["confidence"],

            damage=damage["label"],
            damage_confidence=damage["confidence"],

            quality_score=quality["quality_score"],
            quality_grade=quality["quality_grade"],

            recommended_action=recommendation.get("recommended_action", "Unknown"),
            recyclability=recommendation["recyclability"],
            environmental_impact=recommendation.get("environmental_impact", "Unknown"),
            estimated_value=recommendation.get("estimated_value", "Unknown"),
            priority=recommendation.get("priority", "N/A"),

            # ==========================
            # Material Classification
            # ==========================

            material_category=material_classification["material_category"],
            fiber_composition=material_classification["fiber_composition"],
            blend_identification=material_classification["blend_identification"],
            fabric_texture=material_classification["fabric_texture"],
            fabric_pattern=material_classification["fabric_pattern"],

            # ==========================
            # Waste Classification
            # ==========================

            waste_category=waste_classification["category"],
            reuse_potential=waste_classification["reuse_potential"],
            contamination_detection=waste_classification["contamination_detection"],
            disposal_recommendation=waste_classification["disposal_recommendation"],
            compostable=str(waste_classification["compostable"]),
            hazardous_textile=str(waste_classification["hazardous_textile"]),

            # ==========================
            # Recycling Recommendation
            # ==========================

            recommended_method=recycling_engine["recommended_method"],
            fiber_recycling=recycling_engine["fiber_recycling"],
            mechanical_recycling=recycling_engine["mechanical_recycling"],
            chemical_recycling=recycling_engine["chemical_recycling"],
            fabric_reuse=recycling_engine["fabric_reuse"],
            industrial_recovery=recycling_engine["industrial_recovery"],
            donation=recycling_engine["donation"],
            waste_reduction_strategy=recycling_engine["waste_reduction_strategy"],
            upcycling_suggestions=", ".join(
                recycling_engine["upcycling_suggestions"]
            ),

            # ==========================
            # Sustainability Intelligence
            # ==========================

            sustainability_score=sustainability["score"],
            environmental_rating=sustainability["environmental_rating"],
            carbon_footprint=sustainability["carbon_footprint"],
            co2_saved=sustainability["co2_saved"],
            water_saved=sustainability["water_saved"],
            landfill_saved=sustainability["landfill_saved"],
            resource_conservation=sustainability["resource_conservation"],

            # ==========================
            # Environmental Analytics
            # ==========================

            carbon_reduction=environmental_analytics["carbon_reduction"],
            water_conservation=environmental_analytics["water_conservation"],
            landfill_diversion=environmental_analytics["landfill_diversion"],
            eco_rating=environmental_analytics["eco_rating"],

            # ==========================
            # Waste Scoring Engine
            # ==========================

            recyclability_score=waste_scoring["recyclability_score"],
            reuse_score=waste_scoring["reuse_score"],
            material_recovery_score=waste_scoring["material_recovery_score"],
            processing_feasibility_score=waste_scoring["processing_feasibility_score"],
            circularity_score=waste_scoring["circularity_score"],
            circularity_category=waste_scoring["circularity_category"],

            # ==========================
            # Circular Economy Analytics
            # ==========================

            recycling_efficiency=circular_economy["recycling_efficiency"],
            waste_diversion_rate=circular_economy["waste_diversion_rate"],
            resource_recovery_rate=circular_economy["resource_recovery_rate"],
            circular_economy_index=circular_economy["circular_economy_index"],
            circular_rating=circular_economy["rating"],

            # ==========================
            # Sustainability Benchmark
            # ==========================

            overall_score=benchmark["overall_score"],
            sustainability_grade=benchmark["sustainability_grade"],
            esg_rating=benchmark["esg_rating"],
            industry_percentile=benchmark["industry_percentile"],
            performance=benchmark["performance"],
            improvement_suggestions=", ".join(
                benchmark["improvement_suggestions"]
            ),

            analyzed_by=analyzed_by

        )

        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        print("Saved Record ID:", record.id)
        print("Saved recyclability_score:", record.recyclability_score)
        print("Saved reuse_score:", record.reuse_score)
        print("Saved material_recovery_score:", record.material_recovery_score)
        print("Saved processing_feasibility_score:", record.processing_feasibility_score)
        print("Saved circularity_score:", record.circularity_score)
        print("Saved recycling_efficiency:", record.recycling_efficiency)
        print("Saved circular_rating:", record.circular_rating)

        return record

    def get_all_history(self):
        """
        Return all analysis records.
        """

        return (
            self.db.query(AnalysisHistory)
            .order_by(AnalysisHistory.analyzed_at.desc())
            .all()
        )

    def get_history_by_id(self, history_id: int):
        """
        Return a single analysis record.
        """

        return (
            self.db.query(AnalysisHistory)
            .filter(AnalysisHistory.id == history_id)
            .first()
        )

    def delete_history(self, history_id: int):
        """
        Delete one analysis record.
        """

        record = (
            self.db.query(AnalysisHistory)
            .filter(AnalysisHistory.id == history_id)
            .first()
        )

        if record:
            self.db.delete(record)
            self.db.commit()
            return True

        return False

    def get_dashboard_summary(self):
        """
        Return dashboard statistics.
        """

        total = self.db.query(AnalysisHistory).count()

        reusable = (
            self.db.query(AnalysisHistory)
            .filter(
                AnalysisHistory.recommended_action.like("%Reuse%")
            )
            .count()
        )

        recyclable = (
            self.db.query(AnalysisHistory)
            .filter(
                AnalysisHistory.recommended_action.like("%Recycle%")
            )
            .count()
        )

        defective = (
            self.db.query(AnalysisHistory)
            .filter(
                AnalysisHistory.damage == "Defective"
            )
            .count()
        )

        clean = (
            self.db.query(AnalysisHistory)
            .filter(
                AnalysisHistory.damage == "Clean"
            )
            .count()
        )

        return {
            "total_analyses": total,
            "reusable_items": reusable,
            "recyclable_items": recyclable,
            "clean_items": clean,
            "defective_items": defective
        }

    def get_material_distribution(self):
        """
        Material-wise distribution.
        """

        materials = {}

        rows = self.db.query(AnalysisHistory).all()

        for row in rows:
            materials[row.material] = materials.get(row.material, 0) + 1

        return materials

    def get_damage_distribution(self):
        """
        Damage-wise distribution.
        """

        damage = {}

        rows = self.db.query(AnalysisHistory).all()

        for row in rows:
            damage[row.damage] = damage.get(row.damage, 0) + 1

        return damage

    def get_quality_distribution(self):
        """
        Quality grade distribution.
        """

        grades = {}

        rows = self.db.query(AnalysisHistory).all()

        for row in rows:
            grades[row.quality_grade] = grades.get(row.quality_grade, 0) + 1

        return grades

    def get_recommendation_distribution(self):
        """
        Return normalized recommendation distribution
        for sustainability and recovery analytics.
        """

        recommendations = {
            "Reuse": 0,
            "Recycle": 0,
            "Upcycle": 0,
            "Donate": 0,
            "Recovery": 0,
            "Other": 0
        }

        rows = self.db.query(AnalysisHistory).all()

        for row in rows:

            action = (row.recommended_action or "").strip().lower()

            if "reus" in action:
                recommendations["Reuse"] += 1

            elif "recycl" in action:
                recommendations["Recycle"] += 1

            elif "upcycl" in action:
                recommendations["Upcycle"] += 1

            elif "donat" in action:
                recommendations["Donate"] += 1

            elif "recover" in action:
                recommendations["Recovery"] += 1

            else:
                recommendations["Other"] += 1

        return recommendations

    def get_sustainability_summary(self):
        """
        Inventory Sustainability Dashboard Summary

        Uses InventorySustainabilityAnalysis records only.
        This keeps inventory sustainability analytics separate
        from image-based textile analysis.
        """

        rows = (
            self.db
            .query(InventorySustainabilityAnalysis)
            .all()
        )

        if not rows:
            return {
                "total_analyzed_batches": 0,
                "lca_coverage": 0,
                "lca_coverage_total": 0,
                "total_quantity": 0,
                "total_carbon_footprint": 0,
                "total_co2_saved": 0,
                "total_water_impact": 0,
                "total_water_saved": 0,
                "total_landfill_diversion": 0,
                "average_sustainability_score": 0,
                "average_circularity_score": 0,
                "average_resource_recovery": 0,
                "recycling_opportunities": 0,
            }

        # ==========================================
        # Basic Inventory Metrics
        # ==========================================

        total_analyzed_batches = len(rows)

        lca_coverage = sum(
            1
            for r in rows
            if r.carbon_footprint is not None
        )

        total_quantity = sum(
            r.quantity or 0
            for r in rows
        )

        # ==========================================
        # Environmental Metrics
        # ==========================================

        total_carbon_footprint = sum(
            r.carbon_footprint or 0
            for r in rows
        )

        total_co2_saved = sum(
            r.co2_saved or 0
            for r in rows
        )

        total_water_impact = sum(
            r.water_impact or 0
            for r in rows
        )

        total_water_saved = sum(
            r.water_saved or 0
            for r in rows
        )

        total_landfill_diversion = sum(
            r.landfill_diversion or 0
            for r in rows
        )

        # ==========================================
        # Sustainability Metrics
        # ==========================================

        average_sustainability_score = (
            sum(
                r.sustainability_score or 0
                for r in rows
            )
            / total_analyzed_batches
        )

        average_circularity_score = (
            sum(
                r.circularity_score or 0
                for r in rows
            )
            / total_analyzed_batches
        )

        average_resource_recovery = (
            sum(
                r.resource_recovery_rate or 0
                for r in rows
            )
            / total_analyzed_batches
        )

        # ==========================================
        # Recycling Opportunities
        # ==========================================

        recycling_opportunities = sum(
            1
            for r in rows
            if (r.recommended_action or "").lower()
            in ["recycle", "recover"]
        )

        # ==========================================
        # Return Dashboard Data
        # ==========================================

        return {
            "total_analyzed_batches": total_analyzed_batches,
            "lca_coverage":lca_coverage,
            "lca_coverage_total":total_analyzed_batches,
            "total_quantity": round(total_quantity, 2),
            "total_carbon_footprint": round(total_carbon_footprint, 2),
            "total_co2_saved": round(total_co2_saved, 2),
            "total_water_impact": round(total_water_impact, 2),
            "total_water_saved": round(total_water_saved, 2),
            "total_landfill_diversion": round(total_landfill_diversion, 2),
            "average_sustainability_score": round(average_sustainability_score, 2),
            "average_circularity_score": round(average_circularity_score, 2),
            "average_resource_recovery": round(average_resource_recovery, 2),
            "recycling_opportunities": recycling_opportunities,
        }