import os
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from .waste_info import FABRIC_INFO

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "fabric_model.keras")

model = load_model(MODEL_PATH)

class_names = [
    "Chiffon",
    "Cotton",
    "Denim",
    "Jacquard",
    "Linen",
    "Nylon",
    "Oxford",
    "Polyester",
    "Polyester_(coated)",
    "Satin",
    "Velveteen"
]

def predict_fabric(image_path):

    img = image.load_img(
        image_path,
        target_size=(224,224)
    )

    img_array = image.img_to_array(img)

    img_array = np.expand_dims(img_array, axis=0)

    img_array = preprocess_input(img_array)

    prediction = model.predict(img_array, verbose=0)

    predicted_index = np.argmax(prediction)

    confidence = float(np.max(prediction) * 100)
    fabric = class_names[predicted_index]

    info = FABRIC_INFO[fabric]


    return {

    "fabric": fabric,
    "confidence": round(confidence, 2),

    "category": info["category"],
    "recyclability": info["recyclability"],
    "recommendation": info["recommendation"],

    "fiber_composition": info["fiber_composition"],
    "material_quality": info["material_quality"],

    "texture": info["texture"],
    "pattern": info["pattern"],
    "color_type": info["color_type"],

    "damage": info["damage"],
    "contamination": info["contamination"],

    "reuse_potential": info["reuse_potential"],
    "disposal": info["disposal"],

    "recycling_method": info["recycling_method"],

    "environmental_impact": info["environmental_impact"],
    "recyclability_score": info["recyclability_score"],
    "reuse_potential_score": info["reuse_potential_score"],
    "environmental_impact_score": info["environmental_impact_score"],

    "co2_saving": info["co2_saving"],
    "water_saving": info["water_saving"],

    "circular_score": info["circular_score"],
    "blend_identification": info["blend_identification"],
    "waste_category": info["waste_category"],
    "recycling_options": info["recycling_options"],
    "waste_reduction": info["waste_reduction"]

}


if __name__ == "__main__":

    test_image = os.path.join(
        BASE_DIR,
        "..",
        "dataset",
        "fabric_dataset",
        "Cotton",
        os.listdir(
            os.path.join(
                BASE_DIR,
                "..",
                "dataset",
                "fabric_dataset",
                "Cotton"
            )
        )[0]
    )

    result = predict_fabric(test_image)

    print(result)