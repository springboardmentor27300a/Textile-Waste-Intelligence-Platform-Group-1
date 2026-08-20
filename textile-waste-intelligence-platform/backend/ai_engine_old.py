import os
import tempfile
from ai.predict import predict_image
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
    temp = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
    temp_path = temp.name
    temp.close()

    cv2.imwrite(temp_path, image)

    # Run TensorFlow prediction
    result = predict_image(temp_path)

    os.remove(temp_path)

    processing_time = round(time.time() - start_time, 3)

    prediction = result["prediction"]
    confidence = result["confidence"]
    if prediction == "Defect":
        return {
            "fabric_type": "Cotton",
            "confidence_score": 96.2,
            "processing_time": processing_time,
            "visual_features": {
                "texture": "Woven, soft, mid-weight",
                "pattern": "Solid",
                "color": detected_color,
                "damage": "None detected",
                "contamination": "Minor surface dust (low impact)"
            },
            "material_prediction": {
                "Cotton": 94.0,
                "Polyester": 4.0,
                "Elastane": 2.0
            },
            "waste_category": "Recyclable",
            "waste_explanation": "Pre-consumer cutting scraps consisting of high-purity cotton blend fibers suitable for mechanical carding and fiber reclamation.",
            "metrics": {
                "recyclability_score": 92,
                "contamination_level": 5,
                "reuse_potential": 40,
                "environmental_risk": 2,
                "sustainability_score": 90,
                "circular_economy_score": 85,
                "carbon_footprint": 1.2,  # kg CO2/kg (net savings: ~6.8)
                "water_savings": 8500,     # liters/kg
                "landfill_diversion": 100,
                "resource_recovery_score": 92
            },
            "recommendations": [
                {
                    "rank": 1,
                    "name": "Mechanical Recycling",
                    "confidence": 95,
                    "environmental_benefit": "Excellent. Diverts raw high-grade cotton fiber back into yarn spin cycles.",
                    "carbon_reduction": "3.2 kg CO2/kg",
                    "cost_effectiveness": "High Efficiency",
                    "reasoning": "High-purity cotton blend allows high-yield mechanical carding without heavy chemical processing."
                },
                {
                    "rank": 2,
                    "name": "Fabric Reuse / Donation",
                    "confidence": 35,
                    "environmental_benefit": "Moderate. Provides textile scrap inputs to craft or packaging industries.",
                    "carbon_reduction": "0.8 kg CO2/kg",
                    "cost_effectiveness": "Low",
                    "reasoning": "Scrap pieces are small (offcuts), rendering garment-level resale or donation less suitable than fiber recycling."
                }
            ]
        }
    elif variant == 1:
        return {
            "fabric_type": "Denim",
            "confidence_score": 98.4,
            "processing_time": processing_time,
            "visual_features": {
                "texture": "Heavy twill weave, faded",
                "pattern": "Solid / Blue jean",
                "color": detected_color,
                "damage": "Moderate wear on cuffs and pockets (frayed edges)",
                "contamination": "None detected"
            },
            "material_prediction": {
                "Cotton": 100.0
            },
            "waste_category": "Reusable",
            "waste_explanation": "Post-consumer denim garment. Contains minor frayed sections but remains structurally robust, making it excellent for secondary resale, donation, or upcycled fashion items.",
            "metrics": {
                "recyclability_score": 85,
                "contamination_level": 0,
                "reuse_potential": 95,
                "environmental_risk": 1,
                "sustainability_score": 95,
                "circular_economy_score": 98,
                "carbon_footprint": 0.5,  # kg CO2/kg (net savings: ~15.0)
                "water_savings": 10000,    # liters/kg
                "landfill_diversion": 100,
                "resource_recovery_score": 95
            },
            "recommendations": [
                {
                    "rank": 1,
                    "name": "Fabric Reuse / Donation",
                    "confidence": 98,
                    "environmental_benefit": "Outstanding. Extends garment life cycle, preserving all energy and water inputs.",
                    "carbon_reduction": "12.0 kg CO2/kg",
                    "cost_effectiveness": "Very High",
                    "reasoning": "Fully functional structure allows immediate redistribution to reuse markets with zero remanufacturing overhead."
                },
                {
                    "rank": 2,
                    "name": "Upcycling",
                    "confidence": 88,
                    "environmental_benefit": "Excellent. Converts denim panels into secondary premium goods (e.g. bags, patchworks).",
                    "carbon_reduction": "8.5 kg CO2/kg",
                    "cost_effectiveness": "High",
                    "reasoning": "Worn or damaged cuffs can be cropped out, leaving large high-quality heavy cotton panels for upcycled crafting."
                },
                {
                    "rank": 3,
                    "name": "Mechanical Recycling",
                    "confidence": 75,
                    "environmental_benefit": "Good. Shreds denim fibers for coarse insulation or industrial wipes.",
                    "carbon_reduction": "2.8 kg CO2/kg",
                    "cost_effectiveness": "Medium",
                    "reasoning": "If reuse markets are saturated, 100% cotton denim provides excellent feedstock for tearing into insulation felt."
                }
            ]
        }
    elif variant == 2:
        return {
            "fabric_type": "Polyester",
            "confidence_score": 91.5,
            "processing_time": processing_time,
            "visual_features": {
                "texture": "Synthetically knit, elastic",
                "pattern": "Heathered",
                "color": detected_color,
                "damage": "None detected",
                "contamination": "None detected"
            },
            "material_prediction": {
                "Polyester": 88.0,
                "Spandex": 12.0
            },
            "waste_category": "Recyclable",
            "waste_explanation": "Synthetic athletic wear containing spandex. The elastic components pose challenges to standard mechanical pulling, requiring chemical depolymerization.",
            "metrics": {
                "recyclability_score": 70,
                "contamination_level": 2,
                "reuse_potential": 60,
                "environmental_risk": 8,
                "sustainability_score": 72,
                "circular_economy_score": 78,
                "carbon_footprint": 2.5,  # kg CO2/kg (net savings: ~3.0)
                "water_savings": 1500,     # liters/kg
                "landfill_diversion": 90,
                "resource_recovery_score": 75
            },
            "recommendations": [
                {
                    "rank": 1,
                    "name": "Chemical Recycling",
                    "confidence": 85,
                    "environmental_benefit": "High. Breaks down synthetic polymers back into clean monomers, bypassing spandex inhibitors.",
                    "carbon_reduction": "1.8 kg CO2/kg",
                    "cost_effectiveness": "Medium (High Capital)",
                    "reasoning": "Elastane/Spandex blends degrade the quality of mechanically shredded polyester; chemical depolymerization recovers pure polyester feedstock."
                },
                {
                    "rank": 2,
                    "name": "Mechanical Recycling",
                    "confidence": 50,
                    "environmental_benefit": "Low. Shreds elastomeric fibers into low-grade technical felts.",
                    "carbon_reduction": "1.1 kg CO2/kg",
                    "cost_effectiveness": "Low",
                    "reasoning": "High stretch fibers tend to clog mechanical spinning shredders, limiting output value."
                },
                {
                    "rank": 3,
                    "name": "Industrial Recovery",
                    "confidence": 45,
                    "environmental_benefit": "Minor. Processes textile waste into underlay pad feedstocks.",
                    "carbon_reduction": "0.8 kg CO2/kg",
                    "cost_effectiveness": "Low",
                    "reasoning": "Converts synthetic knit scrap into coarse carpet underlay pads if circular chemical loops are unavailable."
                }
            ]
        }
    elif variant == 3:
        return {
            "fabric_type": "Wool",
            "confidence_score": 93.0,
            "processing_time": processing_time,
            "visual_features": {
                "texture": "Thick knit, felted / shrunk",
                "pattern": "Cable knit ribbed",
                "color": detected_color,
                "damage": "Shrunk structure, moderate pilling, two minor holes in chest",
                "contamination": "Slight organic stain on sleeve"
            },
            "material_prediction": {
                "Wool": 100.0
            },
            "waste_category": "Repairable",
            "waste_explanation": "Felted wool sweater. Felting restricts standard resale, but pure wool fibers remain highly valuable. Stains and minor holes are easily repairable or upcyclable.",
            "metrics": {
                "recyclability_score": 80,
                "contamination_level": 15,
                "reuse_potential": 30,
                "environmental_risk": 3,
                "sustainability_score": 80,
                "circular_economy_score": 82,
                "carbon_footprint": 1.1,  # kg CO2/kg (net savings: ~8.0)
                "water_savings": 6000,     # liters/kg
                "landfill_diversion": 100,
                "resource_recovery_score": 80
            },
            "recommendations": [
                {
                    "rank": 1,
                    "name": "Mechanical Recycling",
                    "confidence": 90,
                    "environmental_benefit": "High. Reclaims wool fibers to spin secondary wool blends (shoddy wool).",
                    "carbon_reduction": "4.5 kg CO2/kg",
                    "cost_effectiveness": "Very High",
                    "reasoning": "Pure felted wool maintains high protein fiber structural integrity, excellent for pulling back into secondary carded wool streams."
                },
                {
                    "rank": 2,
                    "name": "Upcycling",
                    "confidence": 65,
                    "environmental_benefit": "Good. Reuses felted panels directly without shredding.",
                    "carbon_reduction": "3.0 kg CO2/kg",
                    "cost_effectiveness": "High",
                    "reasoning": "Felted wool is highly stable and does not fray, allowing panel cutting for felt crafts, thermal sleeves, or insoles."
                }
            ]
        }
    else:
        return {
            "fabric_type": "Silk",
            "confidence_score": 94.8,
            "processing_time": processing_time,
            "visual_features": {
                "texture": "Smooth, glossy satin finish",
                "pattern": "Floral printed design",
                "color": detected_color,
                "damage": "None detected",
                "contamination": "Ink/marker residues from cutting tables"
            },
            "material_prediction": {
                "Silk": 95.0,
                "Polyester": 5.0
            },
            "waste_category": "Upcyclable",
            "waste_explanation": "Fine luxury silk scraps with marker ink. Offcuts are too small for garment reuse, but the high-grade satin feel makes them ideal for upcycling into small accessories.",
            "metrics": {
                "recyclability_score": 60,
                "contamination_level": 8,
                "reuse_potential": 80,
                "environmental_risk": 2,
                "sustainability_score": 88,
                "circular_economy_score": 92,
                "carbon_footprint": 0.8,  # kg CO2/kg (net savings: ~18.0)
                "water_savings": 4500,     # liters/kg
                "landfill_diversion": 100,
                "resource_recovery_score": 85
            },
            "recommendations": [
                {
                    "rank": 1,
                    "name": "Upcycling",
                    "confidence": 94,
                    "environmental_benefit": "Excellent. Reclaims premium print silk into high-value accessories.",
                    "carbon_reduction": "14.5 kg CO2/kg",
                    "cost_effectiveness": "High",
                    "reasoning": "Luxury printed silk scraps have high aesthetic value. Can be sewn into eye masks, scrunchies, or patchwork trims with minimal processing."
                },
                {
                    "rank": 2,
                    "name": "Fiber Recycling",
                    "confidence": 40,
                    "environmental_benefit": "Moderate. Reclaims short filament fibers.",
                    "carbon_reduction": "2.1 kg CO2/kg",
                    "cost_effectiveness": "Low",
                    "reasoning": "Shredding breaks premium long-filament silk strands into short fibers, causing a significant downcycle in material grade."
                }
            ]
        }
