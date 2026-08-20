from pathlib import Path

import torch
import torch.nn as nn
from torchvision.models import efficientnet_b0


MODEL_PATH = (
    Path(__file__).resolve().parent
    / "models"
    / "best_textile_model_finetuned.pth"
)

DEVICE = torch.device("cpu")


# Dataset class names
# MODEL_CLASSES = [
#     "COTTON",
#     "BLENDED",
#     "DENIM",
#     "POLYESTER",
#     "SILK",
#     "RAYON",
#     "WOOL",
# ]


class TextileMaterialModel:

    def __init__(self):

        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model file not found: {MODEL_PATH}"
            )

        checkpoint = torch.load(
            MODEL_PATH,
            map_location=DEVICE,
        )

        self.model = efficientnet_b0(
            weights=None
        )

        num_features = (
            self.model.classifier[1].in_features
        )

        self.model.classifier[1] = nn.Linear(
            num_features,
            7,
        )

        # The saved checkpoint uses the
        # original dataset class order.
        self.model.load_state_dict(
            checkpoint["model_state_dict"]
        )

        self.model.to(DEVICE)
        self.model.eval()

        self.dataset_classes = checkpoint.get(
            "classes",
            [
                "Cotton",
                "Cotton MIxed",
                "Denim",
                "Polyester",
                "Silk",
                "Viscose",
                "Wool",
            ],
        )

    def predict(self, image_tensor):

        with torch.no_grad():

            outputs = self.model(
                image_tensor
            )

            probabilities = torch.softmax(
                outputs,
                dim=1,
            )[0]

        return probabilities


_model_instance = None


def get_material_model():

    global _model_instance

    if _model_instance is None:
        _model_instance = TextileMaterialModel()

    return _model_instance