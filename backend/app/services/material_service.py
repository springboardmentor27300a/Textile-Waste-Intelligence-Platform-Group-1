import os
import numpy as np
from PIL import Image

from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input


class MaterialClassifier:

    def __init__(self):

        model_path = os.path.abspath(
            os.path.join(
                os.path.dirname(__file__),
                "..",
                "models",
                "best_material_classifier.keras"
            )
        )

        self.model = load_model(model_path)

        # Must match training order exactly
        self.class_names = [
            "Acrylic",
            "Cotton",
            "Polyamide",
            "Polyester"
        ]

    def preprocess(self, image_path):

        image = Image.open(image_path).convert("RGB")
        image = image.resize((224, 224))

        image = np.array(image, dtype=np.float32)

        image = preprocess_input(image)

        image = np.expand_dims(image, axis=0)

        return image

    def predict(self, image_path):

        image = self.preprocess(image_path)

        prediction = self.model.predict(image, verbose=0)[0]

        class_index = np.argmax(prediction)

        confidence = float(prediction[class_index])

        return {
            "label": self.class_names[class_index],
            "confidence": round(confidence, 4),
            "probabilities": {
                self.class_names[i]: round(float(prediction[i]), 4)
                for i in range(len(self.class_names))
            }
        }