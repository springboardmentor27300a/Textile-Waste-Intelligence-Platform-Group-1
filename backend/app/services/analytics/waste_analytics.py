from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.analysis import Analysis


class WasteAnalytics:

    @staticmethod
    def categories(db: Session):

        results = (

            db.query(

                Analysis.waste_category,

                func.count(Analysis.id),

            )

            .group_by(
                Analysis.waste_category
            )

            .all()

        )

        return [

            {

                "category": category,

                "count": count,

            }

            for category, count in results

        ]

    @staticmethod
    def reuse(db: Session):

        results = (

            db.query(

                Analysis.reuse_potential,

                func.count(Analysis.id),

            )

            .group_by(
                Analysis.reuse_potential
            )

            .all()

        )

        return [

            {

                "reuse": reuse,

                "count": count,

            }

            for reuse, count in results

        ]