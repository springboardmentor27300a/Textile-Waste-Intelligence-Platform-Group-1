"""
==========================================================
WeaveCycle - Material Predictor
==========================================================

Runs inference using the trained EfficientNet model.

Author: WeaveCycle
"""

import numpy as np

from app.material_classifier.model_loader import model_loader
from app.material_classifier.preprocessing import preprocess_image


def predict_material(image_path, top_k=3):
    """
    Predict textile material.

    Parameters
    ----------
    image_path : str
        Path of uploaded image.

    top_k : int
        Number of predictions to return.

    Returns
    -------
    dict
    """

    # Load trained model
    model = model_loader.model

    # Load class names
    class_names = model_loader.class_names

    # Preprocess image
    image = preprocess_image(image_path)

    # Run inference
    predictions = model.predict(image, verbose=0)[0]

    # Top predictions
    top_indices = np.argsort(predictions)[::-1][:top_k]

    top_predictions = []

    for idx in top_indices:

        top_predictions.append({

            "class": class_names[idx],

            "confidence": round(
                float(predictions[idx]) * 100,
                2
            )

        })

    return {

        "material": top_predictions[0]["class"],

        "confidence": top_predictions[0]["confidence"],

        "top_predictions": top_predictions

    }