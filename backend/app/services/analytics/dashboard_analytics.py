from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.analysis import Analysis
from app.models.collection import Collection

from app.services.analytics.kpi_service import (
    KPIService,
)

from app.services.analytics.company_analytics import (
    CompanyAnalytics,
)

from app.services.analytics.trend_analytics import (
    TrendAnalytics,
)

from app.services.analytics.environmental_analytics import (
    EnvironmentalAnalytics,
)

from app.services.analytics.sustainability_analytics import (
    SustainabilityAnalytics,
)


class DashboardAnalytics:
    """
    ========================================================

        Textile Waste Intelligence Platform

            Dashboard Analytics Service

    Single service powering the complete dashboard.

    Provides

    • KPI Cards
    • Company Analytics
    • Dashboard Summary
    • Trend Analytics
    • Material Distribution
    • Waste Distribution
    • Sustainability Distribution
    • Environmental Distribution
    • Recycling Distribution
    • Recent Collections
    • Recent Analysis

    ========================================================
    """

    @staticmethod
    def dashboard(
        db: Session,
    ):

        # ------------------------------------------
        # KPI Cards
        # ------------------------------------------

        kpis = KPIService.get_kpis(db)

        # ------------------------------------------
        # Company Analytics
        # ------------------------------------------

        companies = (
            CompanyAnalytics.get_company_ranking(db)
        )

        company_summary = (
            CompanyAnalytics.comparison_summary(db)
        )

        # ------------------------------------------
        # Milestone 3 Intelligence Summaries
        # ------------------------------------------

        environmental_summary = (
            EnvironmentalAnalytics.summary(db)
        )

        sustainability_summary = (
            SustainabilityAnalytics.summary(db)
        )

        # ------------------------------------------
        # Dashboard Trends
        # ------------------------------------------

        trends = (
            TrendAnalytics.dashboard_trends(db)
        )

        # ------------------------------------------
        # Recent Collections
        # ------------------------------------------

        recent_collections = (

            db.query(Collection)

            .order_by(
                desc(
                    Collection.created_at
                )
            )

            .limit(5)

            .all()

        )

        collection_data = []

        for collection in recent_collections:

            collection_data.append({

                "id":
                    collection.id,

                "collection_code":
                    collection.collection_code,

                "date":
                    collection.collection_date,

                "status":
                    collection.collection_status,

                "weight":
                    round(
                        collection.total_weight,
                        2,
                    ),

                "organization":

                    collection.waste_source.organization_name

                    if collection.waste_source

                    else None,

            })

        # ------------------------------------------
        # Recent Analysis
        # ------------------------------------------

        recent_analysis = (

            db.query(Analysis)

            .order_by(
                desc(
                    Analysis.created_at
                )
            )

            .limit(5)

            .all()

        )

        analysis_data = []

        for analysis in recent_analysis:

            analysis_data.append({

                "id":
                    analysis.id,

                "material":
                    analysis.material,

                "confidence":
                    round(
                        analysis.confidence,
                        2,
                    ),

                "waste_category":
                    analysis.waste_category,

                "recycling_method":
                    analysis.recycling_method,

                "sustainability_score":
                    round(
                        analysis.sustainability_score,
                        2,
                    ),

                "environmental_score":
                    round(
                        analysis.environmental_score,
                        2,
                    ),

                "overall_score":
                    round(
                        analysis.overall_score,
                        2,
                    ),

                "created_at":
                    analysis.created_at,

            })

        # ------------------------------------------
        # Material Distribution
        # ------------------------------------------

        material_distribution = {}

        materials = db.query(
            Analysis.material
        ).all()

        for (material,) in materials:

            material_distribution[material] = (

                material_distribution.get(
                    material,
                    0,
                )

                + 1

            )

        material_chart = [

            {

                "material": key,

                "count": value,

            }

            for key, value in

            sorted(

                material_distribution.items(),

                key=lambda x: x[1],

                reverse=True,

            )

        ]

        # ------------------------------------------
        # Waste Distribution
        # ------------------------------------------

        waste_distribution = {}

        waste = db.query(
            Analysis.waste_category
        ).all()

        for (category,) in waste:

            waste_distribution[category] = (

                waste_distribution.get(
                    category,
                    0,
                )

                + 1

            )

        waste_chart = [

            {

                "category": key,

                "count": value,

            }

            for key, value in

            sorted(

                waste_distribution.items(),

                key=lambda x: x[1],

                reverse=True,

            )

        ]

        # ------------------------------------------
        # Sustainability Distribution
        # ------------------------------------------

        sustainability_distribution = {}

        ratings = db.query(
            Analysis.sustainability_rating
        ).all()

        for (rating,) in ratings:

            sustainability_distribution[rating] = (

                sustainability_distribution.get(
                    rating,
                    0,
                )

                + 1

            )

        sustainability_chart = [

            {

                "rating": key,

                "count": value,

            }

            for key, value in

            sorted(

                sustainability_distribution.items(),

                key=lambda x: x[1],

                reverse=True,

            )

        ]

        # ------------------------------------------
        # Environmental Distribution
        # ------------------------------------------

        environmental_distribution = {}

        impacts = db.query(
            Analysis.environmental_impact
        ).all()

        for (impact,) in impacts:

            environmental_distribution[impact] = (

                environmental_distribution.get(
                    impact,
                    0,
                )

                + 1

            )

        environment_chart = [

            {

                "impact": key,

                "count": value,

            }

            for key, value in

            sorted(

                environmental_distribution.items(),

                key=lambda x: x[1],

                reverse=True,

            )

        ]

        # ------------------------------------------
        # Recycling Method Distribution
        # ------------------------------------------

        recycling_distribution = {}

        methods = db.query(
            Analysis.recycling_method
        ).all()

        for (method,) in methods:

            recycling_distribution[method] = (

                recycling_distribution.get(
                    method,
                    0,
                )

                + 1

            )

        recycling_chart = [

            {

                "method": key,

                "count": value,

            }

            for key, value in

            sorted(

                recycling_distribution.items(),

                key=lambda x: x[1],

                reverse=True,

            )

        ]

        # ------------------------------------------
        # Dashboard Summary
        # ------------------------------------------

        dashboard_summary = {

            "best_company":

                company_summary.get(
                    "best_company"
                ),

            "worst_company":

                company_summary.get(
                    "worst_company"
                ),

            "highest_recycling":

                company_summary.get(
                    "highest_recycling"
                ),

            "highest_carbon_saved":

                company_summary.get(
                    "highest_carbon_saved"
                ),

            "highest_water_saved":

                company_summary.get(
                    "highest_water_saved"
                ),

            "average_company_score":

                company_summary.get(
                    "average_score"
                ),

            "total_companies":

                company_summary.get(
                    "total_companies"
                ),

        }

        # ------------------------------------------
        # Overall Analytics
        # ------------------------------------------

        total_analysis = len(recent_analysis)

        average_confidence = round(
            sum(a.confidence for a in recent_analysis) / total_analysis,
            2,
        ) if total_analysis else 0

        average_sustainability_score = round(
            sum(a.sustainability_score for a in recent_analysis) / total_analysis,
            2,
        ) if total_analysis else 0

        average_environmental_score = round(
            sum(a.environmental_score for a in recent_analysis) / total_analysis,
            2,
        ) if total_analysis else 0

        average_overall_score = round(
            sum(a.overall_score for a in recent_analysis) / total_analysis,
            2,
        ) if total_analysis else 0

        manual_review_count = sum(
            1
            for a in recent_analysis
            if (
                a.overall_score < 70
                or a.confidence < 80
            )
        )

        analytics = {

            "average_confidence":
                average_confidence,

            "average_sustainability_score":
                average_sustainability_score,

            "average_environmental_score":
                average_environmental_score,

            "average_overall_score":
                average_overall_score,

            "manual_review_count":
                manual_review_count,

            "total_analysis":
                total_analysis,

        }

        # ------------------------------------------
        # Dashboard Response
        # ------------------------------------------

        return {

            # KPI Cards

            "kpis":

                kpis,

            # Company Analytics

            "company_summary":

                company_summary,

            "company_ranking":

                companies,

            # Milestone 3 Analytics
            "environmental_summary":
                environmental_summary,

            "sustainability_summary":
                sustainability_summary,

            # Dashboard Trends

            "trends":

                trends,

            # Dashboard Charts

            "material_distribution":

                material_chart,

            "waste_distribution":

                waste_chart,

            "sustainability_distribution":

                sustainability_chart,

            "environmental_distribution":

                environment_chart,

            "recycling_distribution":

                recycling_chart,

            # Dashboard Summary

            "summary":

                dashboard_summary,

            "analytics":
                analytics,

            # Tables

            "recent_collections":

                collection_data,

            "recent_analysis":

                analysis_data,

        }