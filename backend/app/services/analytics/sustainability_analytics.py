from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.models.analysis import Analysis


class SustainabilityAnalytics:
    """
    ==========================================================
        Textile Waste Intelligence Platform

            Sustainability Analytics Service

    Single source of truth for the persisted sustainability metrics
    used by the Sustainability Dashboard.

    The method intentionally returns BOTH:
      1. canonical frontend fields, and
      2. the previous average_* compatibility fields.

    This prevents one consumer from being fixed by breaking another.
    ==========================================================
    """

    @staticmethod
    def summary(db: Session) -> dict:
        def avg(column):
            value = db.query(
                func.coalesce(func.avg(column), 0)
            ).scalar()
            return round(float(value or 0), 2)

        sustainability_score = avg(Analysis.sustainability_score)
        recyclability_score = avg(Analysis.recyclability_score)
        reuse_score = avg(Analysis.reuse_score)
        material_recovery_score = avg(Analysis.material_recovery_score)
        circularity_score = avg(Analysis.circularity_score)
        environmental_score = avg(Analysis.environmental_score)
        overall_score = avg(Analysis.overall_score)
        esg_score = avg(Analysis.esg_score)
        circular_economy_index = avg(Analysis.circular_economy_index)
        recycling_target = avg(Analysis.recycling_target)
        recycling_progress = avg(Analysis.recycling_progress)
        resource_conservation = avg(Analysis.resource_conservation)

        # ------------------------------------------------------
        # Status / rating — same thresholds used by the current
        # SustainabilityEngine implementation.
        # ------------------------------------------------------
        if overall_score >= 90:
            sustainability_rating = "Excellent"
            sustainability_status = "Leader"
        elif overall_score >= 80:
            sustainability_rating = "Very Good"
            sustainability_status = "Leader"
        elif overall_score >= 70:
            sustainability_rating = "Good"
            sustainability_status = "On Target"
        elif overall_score >= 60:
            sustainability_rating = "Average"
            sustainability_status = "Needs Improvement"
        else:
            sustainability_rating = "Needs Improvement"
            sustainability_status = "Critical"

        if esg_score >= 90:
            esg_readiness = "Excellent"
        elif esg_score >= 75:
            esg_readiness = "Good"
        elif esg_score >= 60:
            esg_readiness = "Moderate"
        else:
            esg_readiness = "Needs Improvement"

        if circular_economy_index >= 90:
            circular_economy_status = "Excellent"
        elif circular_economy_index >= 75:
            circular_economy_status = "Good"
        elif circular_economy_index >= 60:
            circular_economy_status = "Average"
        else:
            circular_economy_status = "Poor"

        # ------------------------------------------------------
        # Recycling target
        # ------------------------------------------------------
        if recycling_target > 0:
            target_achievement = round(
                min(
                    max(
                        (recycling_progress / recycling_target) * 100,
                        0,
                    ),
                    100,
                ),
                2,
            )
        else:
            target_achievement = 0.0

        if recycling_target <= 0:
            target_status = "Not Assessed"
        elif recycling_progress >= recycling_target:
            target_status = "Target Achieved"
        elif recycling_progress >= recycling_target * 0.75:
            target_status = "On Track"
        elif recycling_progress >= recycling_target * 0.50:
            target_status = "Needs Improvement"
        else:
            target_status = "Critical"

        target_gap = round(
            max(recycling_target - recycling_progress, 0),
            2,
        )

        # ------------------------------------------------------
        # Benchmarking
        # ------------------------------------------------------
        if overall_score >= 90:
            benchmark = "Excellent"
            company_level = "Gold"
        elif overall_score >= 80:
            benchmark = "Industry Leader"
            company_level = "Silver"
        elif overall_score >= 70:
            benchmark = "Above Average"
            company_level = "Bronze"
        elif overall_score >= 60:
            benchmark = "Average"
            company_level = "Standard"
        else:
            benchmark = "Needs Improvement"
            company_level = "Improvement Required"

        # ------------------------------------------------------
        # Latest persisted recommendation.
        # Using a real Analysis recommendation is preferable to inventing
        # an aggregate recommendation from unrelated records.
        # ------------------------------------------------------
        latest = (
            db.query(Analysis)
            .order_by(desc(Analysis.created_at))
            .first()
        )

        recommendation = (
            getattr(latest, "recommendation", None)
            if latest is not None
            else None
        )
        priority = (
            getattr(latest, "priority", None)
            if latest is not None
            else None
        )
        next_step = (
            getattr(latest, "next_step", None)
            if latest is not None
            else None
        )
        expected_benefit = (
            getattr(latest, "expected_benefit", None)
            if latest is not None
            else None
        )
        latest_environmental_impact = (
            getattr(latest, "environmental_impact", None)
            if latest is not None
            else None
        )

        if not recommendation:
            if overall_score >= 90:
                recommendation = (
                    "Maintain current sustainability practices, maximize "
                    "closed-loop recycling, and continue leading circular "
                    "economy initiatives."
                )
            elif overall_score >= 80:
                recommendation = (
                    "Increase material recovery and optimize recycling "
                    "efficiency to reach industry-leading performance."
                )
            elif overall_score >= 70:
                recommendation = (
                    "Improve segregation quality, increase textile reuse, "
                    "and expand circular economy practices."
                )
            elif overall_score >= 60:
                recommendation = (
                    "Reduce contamination, improve collection quality, "
                    "and strengthen recycling processes."
                )
            else:
                recommendation = (
                    "Immediate intervention required. Improve collection, "
                    "sorting, recycling infrastructure, and sustainability "
                    "policies."
                )

        environmental_impact = (
            latest_environmental_impact
            or "Not assessed"
        )

        summary_text = (
            f"Average sustainability performance is {sustainability_score:.2f}%. "
            f"Circular economy index is {circular_economy_index:.2f}%, "
            f"material recovery is {material_recovery_score:.2f}%, and ESG "
            f"score is {esg_score:.2f}. Recycling progress is "
            f"{recycling_progress:.2f}% against a {recycling_target:.2f}% target."
        )

        # ------------------------------------------------------
        # Canonical dashboard contract + compatibility aliases.
        # ------------------------------------------------------
        return {
            # Canonical frontend fields
            "sustainability_score": sustainability_score,
            "sustainability_rating": sustainability_rating,
            "sustainability_status": sustainability_status,
            "overall_score": overall_score,
            "recyclability_score": recyclability_score,
            "reuse_score": reuse_score,
            "material_recovery_score": material_recovery_score,
            "circularity_score": circularity_score,
            "environmental_score": environmental_score,
            "esg_score": esg_score,
            "esg_readiness": esg_readiness,
            "circular_economy_index": circular_economy_index,
            "circular_economy_status": circular_economy_status,
            "recycling_target": recycling_target,
            "recycling_progress": recycling_progress,
            "target_achievement": target_achievement,
            "target_gap": target_gap,
            "target_status": target_status,
            "benchmark": benchmark,
            "company_benchmark": benchmark,
            "benchmark_level": benchmark,
            "company_level": company_level,
            "company_score": overall_score,
            "resource_conservation": resource_conservation,
            "environmental_impact": environmental_impact,
            "recommendation": recommendation,
            "priority": priority,
            "next_step": next_step,
            "expected_benefit": expected_benefit,
            "summary": summary_text,

            # Compatibility aliases used by existing analytics consumers
            "average_score": sustainability_score,
            "average_circularity": circularity_score,
            "average_recovery": material_recovery_score,
            "average_reuse": reuse_score,
            "average_recyclability": recyclability_score,
            "average_esg": esg_score,
            "average_circular_economy": circular_economy_index,
            "average_overall_score": overall_score,
            "average_recycling_target": recycling_target,
            "average_recycling_progress": recycling_progress,

            # Existing nested summary compatibility
            "summary_metrics": {
                "sustainability_score": sustainability_score,
                "esg_score": esg_score,
                "overall_score": overall_score,
                "circularity_score": circularity_score,
                "resource_recovery": material_recovery_score,
                "reuse_score": reuse_score,
            },
        }