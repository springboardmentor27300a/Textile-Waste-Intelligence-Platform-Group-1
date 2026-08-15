from typing import Dict


class RecyclabilityEngine:
    """
    Textile Recyclability Assessment Engine

    Calculates a recyclability score (0–100)
    and provides a recommendation.
    """

    def __init__(self):

        self.weights = {
            "material": 0.35,
            "condition": 0.20,
            "reuse": 0.20,
            "environment": 0.15,
            "processing": 0.10
        }

    def calculate_score(
        self,
        material_score: int,
        condition_score: int,
        reuse_score: int,
        environment_score: int,
        processing_score: int
    ) -> Dict:

        score = (

            material_score * self.weights["material"] +

            condition_score * self.weights["condition"] +

            reuse_score * self.weights["reuse"] +

            environment_score * self.weights["environment"] +

            processing_score * self.weights["processing"]

        )

        score = round(score, 2)

        if score >= 85:

            level = "Excellent"

            recommendation = "Highly Recommended for Recycling"

        elif score >= 70:

            level = "Good"

            recommendation = "Suitable for Recycling"

        elif score >= 50:

            level = "Moderate"

            recommendation = "Reuse or Repair Preferred"

        else:

            level = "Poor"

            recommendation = "Dispose using Approved Method"

        return {

            "score": score,

            "level": level,

            "recommendation": recommendation

        }

    def material_score(self, material: str) -> int:

        material_scores = {

            "001": 95,

            "002": 90,

            "003": 82,

            "004": 80,

            "005": 75,

            "006": 72,

            "007": 68,

            "008": 60,

            "009": 55,

            "010": 30

        }

        return material_scores.get(material, 50)


if __name__ == "__main__":

    engine = RecyclabilityEngine()

    material = "001"

    material_value = engine.material_score(material)

    result = engine.calculate_score(

        material_score=material_value,

        condition_score=90,

        reuse_score=85,

        environment_score=88,

        processing_score=80

    )

    print(result)