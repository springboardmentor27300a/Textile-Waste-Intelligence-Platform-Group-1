from sqlalchemy import (
    extract,
    func,
)
from sqlalchemy.orm import Session

from app.models.analysis import Analysis
from app.models.collection import Collection
from app.models.waste_source import WasteSource


class TrendAnalytics:
    """
    =========================================================

        Textile Waste Intelligence Platform

            Trend Analytics Service

    Provides trend data for:

    • Dashboard
    • Analytics
    • Reports
    • Executive Summary

    Tracks

    • Collections
    • Waste
    • Recycling
    • Sustainability
    • Carbon Saving
    • Water Saving
    • Energy Saving
    • Circular Economy
    • Recovery
    • Company Growth

    =========================================================
    """

    MONTHS = [

        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",

        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",

    ]

    # =====================================================
    # Monthly Collections
    # =====================================================

    @staticmethod
    def monthly_collections(
        db: Session,
    ):

        results = (

            db.query(

                extract(
                    "month",
                    Collection.collection_date,
                ).label("month"),

                func.count(
                    Collection.id
                ).label("count"),

            )

            .group_by("month")

            .order_by("month")

            .all()

        )

        data = {
            i: 0
            for i in range(1, 13)
        }

        for month, count in results:

            data[int(month)] = count

        return [

            {

                "month":
                    TrendAnalytics.MONTHS[i - 1],

                "collections":
                    data[i],

            }

            for i in range(1, 13)

        ]

    # =====================================================
    # Monthly Waste
    # =====================================================

    @staticmethod
    def monthly_waste(
        db: Session,
    ):

        results = (

            db.query(

                extract(
                    "month",
                    Collection.collection_date,
                ).label("month"),

                func.sum(
                    Collection.total_weight
                ).label("weight"),

            )

            .group_by("month")

            .order_by("month")

            .all()

        )

        data = {
            i: 0
            for i in range(1, 13)
        }

        for month, weight in results:

            data[int(month)] = round(
                weight or 0,
                2,
            )

        return [

            {

                "month":
                    TrendAnalytics.MONTHS[i - 1],

                "waste":
                    data[i],

            }

            for i in range(1, 13)

        ]

    # =====================================================
    # Monthly Carbon Saved
    # =====================================================

    @staticmethod
    def monthly_carbon_saved(
        db: Session,
    ):

        results = (

            db.query(

                extract(
                    "month",
                    Collection.collection_date,
                ).label("month"),

                func.sum(
                    Collection.carbon_saved
                ).label("carbon"),

            )

            .group_by("month")

            .order_by("month")

            .all()

        )

        data = {
            i: 0
            for i in range(1, 13)
        }

        for month, value in results:

            data[int(month)] = round(
                value or 0,
                2,
            )

        return [

            {

                "month":
                    TrendAnalytics.MONTHS[i - 1],

                "carbon_saved":
                    data[i],

            }

            for i in range(1, 13)

        ]

    # =====================================================
    # Monthly Water Saved
    # =====================================================

    @staticmethod
    def monthly_water_saved(
        db: Session,
    ):

        results = (

            db.query(

                extract(
                    "month",
                    Collection.collection_date,
                ).label("month"),

                func.sum(
                    Collection.water_saved
                ).label("water"),

            )

            .group_by("month")

            .order_by("month")

            .all()

        )

        data = {
            i: 0
            for i in range(1, 13)
        }

        for month, value in results:

            data[int(month)] = round(
                value or 0,
                2,
            )

        return [

            {

                "month":
                    TrendAnalytics.MONTHS[i - 1],

                "water_saved":
                    data[i],

            }

            for i in range(1, 13)

        ]

    # =====================================================
    # Monthly Energy Saved
    # =====================================================

    @staticmethod
    def monthly_energy_saved(
        db: Session,
    ):

        results = (

            db.query(

                extract(
                    "month",
                    Collection.collection_date,
                ).label("month"),

                func.sum(
                    Collection.energy_saved
                ).label("energy"),

            )

            .group_by("month")

            .order_by("month")

            .all()

        )

        data = {
            i: 0
            for i in range(1, 13)
        }

        for month, value in results:

            data[int(month)] = round(
                value or 0,
                2,
            )

        return [

            {

                "month":
                    TrendAnalytics.MONTHS[i - 1],

                "energy_saved":
                    data[i],

            }

            for i in range(1, 13)

        ]

    # =====================================================
    # Monthly Recovery Percentage
    # =====================================================

    @staticmethod
    def monthly_recovery(
        db: Session,
    ):

        results = (

            db.query(

                extract(
                    "month",
                    Collection.collection_date,
                ).label("month"),

                func.avg(
                    Collection.recovery_percentage
                ).label("recovery"),

            )

            .group_by("month")

            .order_by("month")

            .all()

        )

        data = {
            i: 0
            for i in range(1, 13)
        }

        for month, value in results:

            data[int(month)] = round(
                value or 0,
                2,
            )

        return [

            {

                "month":
                    TrendAnalytics.MONTHS[i - 1],

                "recovery":
                    data[i],

            }

            for i in range(1, 13)

        ]

    # =====================================================
    # Monthly Sustainability Score
    # =====================================================

    @staticmethod
    def monthly_sustainability(
        db: Session,
    ):

        results = (

            db.query(

                extract(
                    "month",
                    Collection.collection_date,
                ).label("month"),

                func.avg(
                    Collection.sustainability_score
                ).label("score"),

            )

            .group_by("month")

            .order_by("month")

            .all()

        )

        data = {
            i: 0
            for i in range(1, 13)
        }

        for month, value in results:

            data[int(month)] = round(
                value or 0,
                2,
            )

        return [

            {

                "month":
                    TrendAnalytics.MONTHS[i - 1],

                "sustainability":
                    data[i],

            }

            for i in range(1, 13)

        ]

    # =====================================================
    # Monthly Recycled Waste
    # =====================================================

    @staticmethod
    def monthly_recycling(
        db: Session,
    ):

        results = (

            db.query(

                extract(
                    "month",
                    Collection.collection_date,
                ).label("month"),

                func.sum(
                    Collection.recyclable_weight
                ).label("recycled"),

            )

            .group_by("month")

            .order_by("month")

            .all()

        )

        data = {
            i: 0
            for i in range(1, 13)
        }

        for month, value in results:

            data[int(month)] = round(
                value or 0,
                2,
            )

        return [

            {

                "month":
                    TrendAnalytics.MONTHS[i - 1],

                "recycled":
                    data[i],

            }

            for i in range(1, 13)

        ]

    # =====================================================
    # Monthly Rejected Waste
    # =====================================================

    @staticmethod
    def monthly_rejected(
        db: Session,
    ):

        results = (

            db.query(

                extract(
                    "month",
                    Collection.collection_date,
                ).label("month"),

                func.sum(
                    Collection.rejected_weight
                ).label("rejected"),

            )

            .group_by("month")

            .order_by("month")

            .all()

        )

        data = {
            i: 0
            for i in range(1, 13)
        }

        for month, value in results:

            data[int(month)] = round(
                value or 0,
                2,
            )

        return [

            {

                "month":
                    TrendAnalytics.MONTHS[i - 1],

                "rejected":
                    data[i],

            }

            for i in range(1, 13)

        ]

    # =====================================================
    # Monthly Company Growth
    # =====================================================

    @staticmethod
    def monthly_company_growth(
        db: Session,
    ):

        results = (

            db.query(

                extract(
                    "month",
                    WasteSource.created_at,
                ).label("month"),

                func.count(
                    WasteSource.id
                ).label("companies"),

            )

            .group_by("month")

            .order_by("month")

            .all()

        )

        data = {
            i: 0
            for i in range(1, 13)
        }

        for month, value in results:

            data[int(month)] = value

        return [

            {

                "month":
                    TrendAnalytics.MONTHS[i - 1],

                "companies":
                    data[i],

            }

            for i in range(1, 13)

        ]

    # =====================================================
    # Dashboard Summary
    # =====================================================

    @staticmethod
    def summary(
        db: Session,
    ):

        collections = TrendAnalytics.monthly_collections(db)
        carbon = TrendAnalytics.monthly_carbon_saved(db)
        recovery = TrendAnalytics.monthly_recovery(db)

        best_collection = max(
            collections,
            key=lambda x: x["collections"],
        )

        best_carbon = max(
            carbon,
            key=lambda x: x["carbon_saved"],
        )

        best_recovery = max(
            recovery,
            key=lambda x: x["recovery"],
        )

        return {

            "best_collection_month":
                best_collection,

            "highest_carbon_saved":
                best_carbon,

            "highest_recovery":
                best_recovery,

        }

    # =====================================================
    # Dashboard Trends
    # =====================================================

    @staticmethod
    def dashboard_trends(
        db: Session,
    ):

        return {

            "collections":
                TrendAnalytics.monthly_collections(db),

            "waste":
                TrendAnalytics.monthly_waste(db),

            "carbon":
                TrendAnalytics.monthly_carbon_saved(db),

            "water":
                TrendAnalytics.monthly_water_saved(db),

            "energy":
                TrendAnalytics.monthly_energy_saved(db),

            "recovery":
                TrendAnalytics.monthly_recovery(db),

            "sustainability":
                TrendAnalytics.monthly_sustainability(db),

            "recycling":
                TrendAnalytics.monthly_recycling(db),

            "rejected":
                TrendAnalytics.monthly_rejected(db),

            "company_growth":
                TrendAnalytics.monthly_company_growth(db),

            "summary":
                TrendAnalytics.summary(db),

        }