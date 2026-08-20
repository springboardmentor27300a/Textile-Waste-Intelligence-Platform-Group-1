from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.waste_source import WasteSource


class CompanyAnalytics:
    """
    =========================================================

        Textile Waste Intelligence Platform

            Company Analytics Service

    Responsibilities

    • Company Sustainability Ranking
    • Company Benchmarking
    • Environmental Performance
    • Resource Recovery
    • Dashboard Analytics
    • Executive Reports

    =========================================================
    """

    # =====================================================
    # Company Ranking
    # =====================================================

    @staticmethod
    def get_company_ranking(
        db: Session,
    ):

        companies = (

            db.query(WasteSource)

            .order_by(
                desc(
                    WasteSource.company_sustainability_score
                )
            )

            .all()

        )

        ranking = []

        for index, company in enumerate(companies):

            recycling_rate = 0

            if company.total_waste_received > 0:

                recycling_rate = round(

                    (

                        company.total_recycled

                        /

                        company.total_waste_received

                    ) * 100,

                    2,

                )

            # -----------------------------------------
            # Company Level
            # -----------------------------------------

            score = company.company_sustainability_score

            if score >= 90:

                company_level = "Gold"

                sustainability_grade = "A+"

            elif score >= 80:

                company_level = "Silver"

                sustainability_grade = "A"

            elif score >= 70:

                company_level = "Bronze"

                sustainability_grade = "B"

            elif score >= 55:

                company_level = "Improvement Required"

                sustainability_grade = "C"

            else:

                company_level = "Critical Improvement Required"

                sustainability_grade = "D"

            # -----------------------------------------
            # Environmental Rating
            # -----------------------------------------

            carbon = company.total_carbon_saved

            if carbon >= 500:

                environmental_rating = "Excellent"

            elif carbon >= 250:

                environmental_rating = "Good"

            elif carbon >= 100:

                environmental_rating = "Average"

            else:

                environmental_rating = "Needs Improvement"

            # -----------------------------------------
            # Recovery Status
            # -----------------------------------------

            if recycling_rate >= 90:

                recovery_status = "Excellent"

            elif recycling_rate >= 75:

                recovery_status = "Good"

            elif recycling_rate >= 60:

                recovery_status = "Average"

            else:

                recovery_status = "Poor"

            ranking.append({

                "rank":
                    index + 1,

                "company_id":
                    company.id,

                "organization_name":
                    company.organization_name,

                "industry":
                    company.industry,

                "city":
                    company.city,

                "country":
                    company.country,

                "collections":
                    company.total_collections,

                "waste_received":
                    round(
                        company.total_waste_received,
                        2,
                    ),

                "waste_recycled":
                    round(
                        company.total_recycled,
                        2,
                    ),

                "recycling_rate":
                    recycling_rate,

                "carbon_saved":
                    round(
                        company.total_carbon_saved,
                        2,
                    ),

                "water_saved":
                    round(
                        company.total_water_saved,
                        2,
                    ),

                "energy_saved":
                    round(
                        company.total_energy_saved,
                        2,
                    ),

                "sustainability_score":
                    round(
                        score,
                        2,
                    ),

                "company_level":
                    company_level,

                "sustainability_grade":
                    sustainability_grade,

                "environmental_rating":
                    environmental_rating,

                "recovery_status":
                    recovery_status,

                "verified":
                    company.is_verified,

                "partner":
                    company.sustainability_partner,

            })

        return ranking

    # =====================================================
    # Best Company
    # =====================================================

    @staticmethod
    def best_company(
        db: Session,
    ):

        return (

            db.query(WasteSource)

            .order_by(
                desc(
                    WasteSource.company_sustainability_score
                )
            )

            .first()

        )

    # =====================================================
    # Worst Company
    # =====================================================

    @staticmethod
    def worst_company(
        db: Session,
    ):

        return (

            db.query(WasteSource)

            .order_by(
                WasteSource.company_sustainability_score
            )

            .first()

        )

    # =====================================================
    # Dashboard Summary
    # =====================================================

    @staticmethod
    def comparison_summary(
        db: Session,
    ):

        companies = CompanyAnalytics.get_company_ranking(db)

        if not companies:

            return {

                "total_companies": 0,

                "average_score": 0,

                "best_company": None,

                "worst_company": None,

                "highest_recycling": None,

                "highest_carbon_saved": None,

                "highest_water_saved": None,

            }

        average_score = round(

            sum(

                company["sustainability_score"]

                for company in companies

            )

            / len(companies),

            2,

        )

        return {

            "total_companies":
                len(companies),

            "average_score":
                average_score,

            "best_company":
                companies[0],

            "worst_company":
                companies[-1],

            "highest_recycling":

                max(

                    companies,

                    key=lambda company: company["recycling_rate"],

                ),

            "highest_carbon_saved":

                max(

                    companies,

                    key=lambda company: company["carbon_saved"],

                ),

            "highest_water_saved":

                max(

                    companies,

                    key=lambda company: company["water_saved"],

                ),

        }