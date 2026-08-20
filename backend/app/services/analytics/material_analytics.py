from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.analysis import Analysis


class MaterialAnalytics:

    @staticmethod
    def distribution(db: Session):

        results = (

            db.query(

                Analysis.material,

                func.count(Analysis.id),

            )

            .group_by(
                Analysis.material
            )

            .all()

        )

        return [

            {

                "material": material,

                "count": count,

            }

            for material, count in results

        ]

    @staticmethod
    def categories(db: Session):

        results = (

            db.query(

                Analysis.material_category,

                func.count(Analysis.id),

            )

            .group_by(
                Analysis.material_category
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