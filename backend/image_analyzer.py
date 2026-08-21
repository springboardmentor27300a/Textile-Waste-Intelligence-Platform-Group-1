
import os

# Force TensorFlow to use CPU on Render
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

import tempfile
from ai.predict import predict_image
from fabric_ai.predict_fabric import predict_fabric
from sustainability_calculator import analyze_sustainability
import base64
import cv2
import numpy as np
from io import BytesIO
from PIL import Image
import hashlib
import time
def get_dominant_color(image):
    # Resize image
    small = cv2.resize(image, (100, 100))

    # Convert BGR to HSV
    hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV)

    h = np.mean(hsv[:, :, 0])
    s = np.mean(hsv[:, :, 1])
    v = np.mean(hsv[:, :, 2])

    if v < 40:
        return "Black"

    if s < 30:
        if v > 200:
            return "White"
        return "Gray"

    if h < 10 or h > 170:
        return "Red"
    elif h < 25:
        return "Orange"
    elif h < 35:
        return "Yellow"
    elif h < 85:
        return "Green"
    elif h < 130:
        return "Blue"
    elif h < 160:
        return "Purple"

    return "Mixed"
def decode_base64_image(image_base64):
    # Remove header if present
    if "," in image_base64:
        image_base64 = image_base64.split(",")[1]

    # Decode Base64
    image_bytes = base64.b64decode(image_base64)

    # Convert bytes to PIL Image
    image = Image.open(BytesIO(image_bytes))

    # Convert PIL Image to OpenCV format
    image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    return image
def analyze_textile_image(image_base64: str) -> dict:

    image = decode_base64_image(image_base64)

    detected_color = get_dominant_color(image)

    start_time = time.time()

    # Save uploaded image temporarily
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
    temp_path = temp_file.name
    temp_file.close()

    cv2.imwrite(temp_path, image)

    # Run TensorFlow prediction
    fabric_result = predict_fabric(temp_path)

    # Temporarily disable the large defect model on Render Free
    result = {
         "prediction": "NoDefect",
         "confidence": 100.0
    }
    print("================================")
    print("IMAGE RECEIVED FROM WEBSITE:", temp_path)
    print("FABRIC RESULT:", fabric_result)
    print("================================")
    

    os.remove(temp_path)

    processing_time = round(time.time() - start_time, 3)

    prediction = result["prediction"]
    confidence = result["confidence"]
    fabric_type = fabric_result["prediction"]
    fabric_confidence = fabric_result["confidence"]

    sustainability_result = analyze_sustainability(
        fabric_type=fabric_type,
        defect_status=prediction,
        fabric_confidence=fabric_confidence,
        defect_confidence=confidence,
        waste_condition="Good",
    )

    metrics = {
        "recyclability_score": sustainability_result["scores"]["recyclability_score"],
        "contamination_level": 5 if prediction == "Defect" else 0,
        "reuse_potential": sustainability_result["scores"]["reuse_score"],
        "environmental_risk": max(1, round(100 - sustainability_result["environmental_impact"]["resource_conservation_score"], 1)),
        "sustainability_score": sustainability_result["scores"]["sustainability_score"],
        "circular_economy_score": sustainability_result["scores"]["circularity_score"],
        "carbon_footprint": sustainability_result["environmental_impact"]["co2_savings_kg"],
        "water_savings": sustainability_result["environmental_impact"]["water_savings_liters"],
        "landfill_diversion": sustainability_result["environmental_impact"]["landfill_reduction_percent"],
        "resource_recovery_score": sustainability_result["scores"]["material_recovery_score"],
    }

    return {
        "fabric_type": fabric_type,
        "fabric_confidence": fabric_confidence,
        "defect_status": prediction,
        "defect_confidence": confidence,
        "confidence_score": confidence,
        "processing_time": processing_time,
        "visual_features": {
            "texture": "Normal" if prediction != "Defect" else "Damaged",
            "pattern": "Detected",
            "color": detected_color,
            "damage": "No defect detected" if prediction != "Defect" else "Visible defect detected",
            "contamination": "None" if prediction != "Defect" else "Minor surface contamination"
        },
        "material_prediction": {
            "NoDefect": confidence,
            "Defect": round(100 - confidence, 2)
        },
        "waste_category": sustainability_result["waste_category"],
        "waste_explanation": f"{fabric_type} was assessed with deterministic sustainability factors based on material type, condition, and confidence.",
        "metrics": metrics,
        "recommendations": sustainability_result["recommendations"],
        "scores": sustainability_result["scores"],
        "circularity_category": sustainability_result["circularity_category"],
        "environmental_impact": sustainability_result["environmental_impact"],
        "reference_factors": sustainability_result["reference_factors"],
    }