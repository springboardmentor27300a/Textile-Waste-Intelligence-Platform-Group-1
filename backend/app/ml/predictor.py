# from dataclasses import dataclass
# import random

# from app.ml.material_taxonomy import MATERIAL_CLASSES


# @dataclass
# class PredictionResult:
#     predicted_material: str
#     confidence_score: float
#     predicted_condition: str
#     condition_confidence: float
#     alternative_predictions: list


# class MaterialPredictor:

#     def predict(self, image_tensor):

#         materials = [
#             "COTTON",
#             "POLYESTER",
#             "DENIM",
#             "WOOL",
#             "BLENDED",
#         ]

#         material = random.choice(materials)

#         confidence = round(random.uniform(88, 99), 2)

#         condition = random.choice(
#             [
#                 "GOOD",
#                 "MODERATE",
#                 "DAMAGED",
#             ]
#         )

#         condition_confidence = round(
#             random.uniform(85, 98),
#             2,
#         )

#         alternatives = []

#         for m in materials:

#             if m != material:

#                 alternatives.append(
#                     {
#                         "material": m,
#                         "confidence": round(
#                             random.uniform(20, 70),
#                             2,
#                         ),
#                     }
#                 )

#         alternatives = sorted(
#             alternatives,
#             key=lambda x: x["confidence"],
#             reverse=True,
#         )[:3]

#         return PredictionResult(
#             predicted_material=material,
#             confidence_score=confidence,
#             predicted_condition=condition,
#             condition_confidence=condition_confidence,
#             alternative_predictions=alternatives,
#         )


# predictor = MaterialPredictor()


from dataclasses import dataclass

import numpy as np
import torch

from app.ml.model_loader import (
    get_material_model,
)


@dataclass
class PredictionResult:

    predicted_material: str

    confidence_score: float

    predicted_condition: str

    condition_confidence: float

    alternative_predictions: list


# Dataset class → project taxonomy
CLASS_MAPPING = {
    "Cotton": "COTTON",
    "Cotton MIxed": "BLENDED",
    "Denim": "DENIM",
    "Polyester": "POLYESTER",
    "Silk": "SILK",
    "Viscose": "RAYON",
    "Wool": "WOOL",
}


class MaterialPredictor:

    def predict(self, image_tensor):

        # --------------------------------------------------
        # Convert existing preprocessing output
        # to PyTorch NCHW format.
        # --------------------------------------------------

        image = np.asarray(
            image_tensor,
            dtype=np.float32,
        )

        if image.ndim == 4:
            image = image[0]

        tensor = torch.from_numpy(
            image
        )

        # Existing preprocessing returns:
        # H x W x C
        #
        # EfficientNet requires:
        # C x H x W

        tensor = tensor.permute(
            2,
            0,
            1,
        )

        # ImageNet normalization
        mean = torch.tensor(
            [0.485, 0.456, 0.406]
        ).view(3, 1, 1)

        std = torch.tensor(
            [0.229, 0.224, 0.225]
        ).view(3, 1, 1)

        tensor = (
            tensor - mean
        ) / std

        tensor = tensor.unsqueeze(0)

        # --------------------------------------------------
        # REAL MODEL PREDICTION
        # --------------------------------------------------

        model = get_material_model()

        probabilities = model.predict(
            tensor
        )

        top_values, top_indices = (
            torch.topk(
                probabilities,
                k=4,
            )
        )

        top_values = (
            top_values.cpu().numpy()
        )

        top_indices = (
            top_indices.cpu().numpy()
        )

        # --------------------------------------------------
        # Primary prediction
        # --------------------------------------------------

        raw_material = (
            model.dataset_classes[
                int(top_indices[0])
            ]
        )

        material = CLASS_MAPPING.get(
            raw_material,
            "UNKNOWN",
        )

        confidence = round(
            float(top_values[0]) * 100,
            2,
        )

        # --------------------------------------------------
        # Alternative predictions
        # --------------------------------------------------

        alternatives = []

        for probability, index in zip(
            top_values[1:],
            top_indices[1:],
        ):

            raw_name = (
                model.dataset_classes[
                    int(index)
                ]
            )

            mapped_name = CLASS_MAPPING.get(
                raw_name,
                "UNKNOWN",
            )

            alternatives.append(
                {
                    "material": mapped_name,
                    "confidence": round(
                        float(probability) * 100,
                        2,
                    ),
                }
            )

        # --------------------------------------------------
        # Temporary deterministic condition
        # --------------------------------------------------
        #
        # The current training dataset does not contain
        # condition labels. Therefore we must NOT invent
        # random condition predictions.
        #
        # Condition will be handled separately in the
        # intelligence/business-logic phase.

        predicted_condition = "NOT_EVALUATED"
        condition_confidence = 0.0

        return PredictionResult(
            predicted_material=material,
            confidence_score=confidence,
            predicted_condition=predicted_condition,
            condition_confidence=condition_confidence,
            alternative_predictions=alternatives,
        )


predictor = MaterialPredictor()