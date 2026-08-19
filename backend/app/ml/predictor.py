from dataclasses import dataclass
import random

from app.ml.material_taxonomy import MATERIAL_CLASSES


@dataclass
class PredictionResult:
    predicted_material: str
    confidence_score: float
    predicted_condition: str
    condition_confidence: float
    alternative_predictions: list


class MaterialPredictor:

    def predict(self, image_tensor):

        materials = [
            "COTTON",
            "POLYESTER",
            "DENIM",
            "WOOL",
            "BLENDED",
        ]

        material = random.choice(materials)

        confidence = round(random.uniform(88, 99), 2)

        condition = random.choice(
            [
                "GOOD",
                "MODERATE",
                "DAMAGED",
            ]
        )

        condition_confidence = round(
            random.uniform(85, 98),
            2,
        )

        alternatives = []

        for m in materials:

            if m != material:

                alternatives.append(
                    {
                        "material": m,
                        "confidence": round(
                            random.uniform(20, 70),
                            2,
                        ),
                    }
                )

        alternatives = sorted(
            alternatives,
            key=lambda x: x["confidence"],
            reverse=True,
        )[:3]

        return PredictionResult(
            predicted_material=material,
            confidence_score=confidence,
            predicted_condition=condition,
            condition_confidence=condition_confidence,
            alternative_predictions=alternatives,
        )


predictor = MaterialPredictor()