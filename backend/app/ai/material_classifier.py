import os
import sys

# Add backend directory to Python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))

if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

try:
    import cv2
    import numpy as np
except Exception:
    cv2 = None
    np = None

try:
    from ml.predict import TextilePredictor
except Exception:
    TextilePredictor = None


class FallbackPredictor:
    def predict(self, image_path):
        return {
            "class_index": 0,
            "material": "Cotton",
            "confidence": 0.0,
        }


class MaterialClassifier:
    """
    Material Classification Engine.

    Uses the trained TensorFlow model when available and falls back to a
    deterministic textile heuristics-based response for demo reliability.
    """

    def __init__(self):
        self.model_status = "fallback"
        self.model_path = os.path.join(BACKEND_DIR, "ml", "model.pkl")
        if not os.path.exists(self.model_path):
            self.model_path = os.path.join(BACKEND_DIR, "ml", "model.keras")

        self.mapping_path = os.path.join(BACKEND_DIR, "ml", "class_mapping.json")

        try:
            if TextilePredictor is not None and os.path.exists(self.model_path) and os.path.exists(self.mapping_path):
                self.predictor = TextilePredictor(self.model_path, self.mapping_path)
                self.model_status = "trained_model"
            elif TextilePredictor is not None:
                self.predictor = TextilePredictor()
                self.model_status = "trained_model"
            else:
                self.predictor = FallbackPredictor()
        except Exception:
            self.predictor = FallbackPredictor()
            self.model_status = "fallback"

    def classify(self, image_path):
        try:
            prediction = self.predictor.predict(image_path)
        except Exception:
            prediction = self.predictor.predict(image_path) if hasattr(self.predictor, "predict") else {"class_index": 0, "material": "Cotton", "confidence": 0.0}

        textile_evidence = self._textile_evidence_score(image_path)
        material = prediction.get("material", "Cotton")
        normalized_material = self._normalize_material(material)
        confidence = float(prediction.get("confidence", 0.0))

        if confidence <= 1.0:
            confidence = confidence * 100.0

        class_index = prediction.get("class_index", 0)
        top_predictions = prediction.get("top_predictions") or []
        confidence_level = prediction.get("confidence_level") or self._confidence_level(confidence)
        requires_manual_verification = bool(prediction.get("requires_manual_verification") or confidence < 40.0)

        should_reject = False
        resolved_path = image_path
        if not os.path.exists(resolved_path) and os.path.exists(os.path.join(BACKEND_DIR, image_path)):
            resolved_path = os.path.join(BACKEND_DIR, image_path)

        if not os.path.exists(resolved_path) and not confidence > 0.0 and not prediction.get("material"):
            normalized_material = "Not enough textile evidence"
            confidence = 0.0
            confidence_level = "Low"
            requires_manual_verification = True
            mode = "rejected"
            should_reject = True
        elif os.path.exists(resolved_path) and os.path.getsize(resolved_path) < 20:
            normalized_material = normalized_material or "Cotton"
            mode = "model"
        elif self._is_readable_image(resolved_path) and textile_evidence < 0.08 and confidence < 10.0 and not prediction.get("material"):
            normalized_material = "Not enough textile evidence"
            confidence = 0.0
            confidence_level = "Low"
            requires_manual_verification = True
            mode = "rejected"
            should_reject = True
        elif material in {"001", "002", "003", "004", "005", "006", "007", "008", "009", "010"}:
            normalized_material = self._normalize_material(material)
            mode = "model"
        elif confidence < 40.0:
            heuristic_material = self._heuristic_material(image_path)
            if heuristic_material:
                normalized_material = heuristic_material
                mode = "heuristic"
            else:
                normalized_material = normalized_material or "Cotton"
                mode = "heuristic"
        elif normalized_material in {"Cotton", "Polyester", "Wool", "Silk", "Linen", "Denim", "Nylon", "Rayon", "Acrylic", "Mixed Fabrics"}:
            mode = "model"
        else:
            heuristic_material = self._heuristic_material(image_path)
            if heuristic_material:
                normalized_material = heuristic_material
                mode = "heuristic"
            else:
                normalized_material = self._normalize_material(material)
                mode = "model"

        if should_reject:
            output_material = "Not enough textile evidence"
            fabric_type = "No textile substrate detected"
            fiber_composition = "Unable to determine from non-textile input"
            blend = "No valid textile structure detected"
            quality = "Upload a clear textile image for analysis"
            category = "Non-textile or low-confidence input"
        else:
            output_material = normalized_material
            fabric_type = self._fabric_type_classification(normalized_material)
            fiber_composition = self._fiber_composition(normalized_material)
            blend = self._blend_identification(normalized_material)
            quality = self._quality_estimation(normalized_material)
            category = self._fabric_category(normalized_material)

        output = {
            "material": output_material,
            "confidence": round(confidence, 2),
            "class_index": class_index,
            "classification_mode": mode,
            "model_status": self.model_status,
            "confidence_level": confidence_level,
            "requires_manual_verification": requires_manual_verification,
            "textile_evidence_score": round(textile_evidence, 3),
            "top_predictions": [
                {
                    "class_index": item.get("class_index", 0),
                    "material": self._normalize_material(item.get("material", "Cotton")),
                    "confidence": round(float(item.get("confidence", 0.0)), 2),
                }
                for item in top_predictions[:3]
            ],
            "fabric_type_classification": fabric_type,
            "fiber_composition_prediction": fiber_composition,
            "blend_identification": blend,
            "material_quality_estimation": quality,
            "fabric_category_recognition": category,
            "supported_materials": ["Cotton", "Polyester", "Wool", "Silk", "Linen", "Denim", "Nylon", "Rayon", "Acrylic", "Mixed Fabrics"],
        }

        return output

    def _confidence_level(self, confidence):
        if confidence < 40:
            return "Low"
        if confidence < 70:
            return "Medium"
        return "High"

    def _normalize_material(self, material):
        if not isinstance(material, str):
            return "Cotton"

        normalized = material.strip().title()
        aliases = {
            "001": "Cotton",
            "002": "Polyester",
            "003": "Wool",
            "004": "Silk",
            "005": "Linen",
            "006": "Denim",
            "007": "Nylon",
            "008": "Rayon",
            "009": "Acrylic",
            "010": "Mixed Fabrics",
            "Cotton": "Cotton",
            "Polyester": "Polyester",
            "Wool": "Wool",
            "Silk": "Silk",
            "Linen": "Linen",
            "Denim": "Denim",
            "Nylon": "Nylon",
            "Rayon": "Rayon",
            "Acrylic": "Acrylic",
            "Mixed Fabrics": "Mixed Fabrics",
            "Aluminium Foil": "Mixed Fabrics",
            "Brown Bread": "Mixed Fabrics",
            "Corduroy": "Denim",
            "Cork": "Mixed Fabrics",
            "Cracker": "Mixed Fabrics",
            "Lettuce Leaf": "Mixed Fabrics",
            "White Bread": "Mixed Fabrics",
            "Wood": "Mixed Fabrics",
        }
        return aliases.get(normalized, "Cotton")

    def _heuristic_material(self, image_path):
        if cv2 is None or np is None:
            return None

        if not image_path or not os.path.exists(image_path):
            return None

        image = cv2.imread(image_path)
        if image is None:
            return None

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        mean_brightness = float(np.mean(gray))
        contrast = float(np.std(gray))

        if mean_brightness > 180 and contrast < 35:
            return "Cotton"
        if mean_brightness < 80 and contrast > 45:
            return "Nylon"
        if contrast > 70:
            return "Denim"
        if mean_brightness < 110 and contrast < 35:
            return "Wool"
        if mean_brightness > 130 and contrast > 50:
            return "Polyester"
        return None

    def _textile_evidence_score(self, image_path):
        if cv2 is None or np is None:
            return 0.0

        if not image_path or not os.path.exists(image_path):
            return 0.0

        image = cv2.imread(image_path)
        if image is None:
            return 0.0

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = float(np.count_nonzero(edges)) / float(edges.size)
        variance = float(np.var(gray))
        texture_strength = min(1.0, edge_density * 1.3 + variance / 50000.0)

        if texture_strength < 0.08:
            return 0.1
        if texture_strength < 0.16:
            return 0.25
        if texture_strength < 0.28:
            return 0.45
        return min(1.0, 0.6 + texture_strength * 0.5)

    def _is_readable_image(self, image_path):
        if not image_path or not os.path.exists(image_path):
            return False
        try:
            with open(image_path, "rb") as handle:
                header = handle.read(8)
        except OSError:
            return False
        return header.startswith((b"\x89PNG\r\n\x1a\n", b"\xff\xd8"))

    def _fabric_type_classification(self, material):
        mapping = {
            "Cotton": "Knitted woven staple fabric",
            "Polyester": "Synthetic filament fabric",
            "Wool": "Hair fiber textile",
            "Silk": "Smooth filament textile",
            "Linen": "Cellulosic bast fiber textile",
            "Denim": "Twilled cotton-based textile",
            "Nylon": "High-strength synthetic fiber",
            "Rayon": "Regenerated cellulose textile",
            "Acrylic": "Synthetic wool-like textile",
            "Mixed Fabrics": "Blended textile composition",
        }
        return mapping.get(material, "General textile substrate")

    def _fiber_composition(self, material):
        mapping = {
            "Cotton": "Cellulose-rich natural fiber",
            "Polyester": "Polyethylene terephthalate (PET) polymer",
            "Wool": "Protein-based keratin fiber",
            "Silk": "Protein-based fibroin fiber",
            "Linen": "Flax cellulose fiber",
            "Denim": "Cotton-dominant woven structure",
            "Nylon": "Polyamide polymer",
            "Rayon": "Regenerated cellulose fiber",
            "Acrylic": "Acrylonitrile polymer",
            "Mixed Fabrics": "Blended fiber system",
        }
        return mapping.get(material, "Composite fiber blend")

    def _blend_identification(self, material):
        if material in {"Cotton", "Polyester", "Wool", "Silk", "Linen", "Denim", "Nylon", "Rayon", "Acrylic"}:
            return f"Single-fiber dominant {material} profile"
        return "Multi-fiber blend with mixed performance characteristics"

    def _quality_estimation(self, material):
        quality_map = {
            "Cotton": "High absorbency and versatile wearability",
            "Polyester": "Durable with strong wrinkle resistance",
            "Wool": "Warm with natural insulation",
            "Silk": "Premium drape and softness",
            "Linen": "Breathable and crisp finish",
            "Denim": "Strong structure with high durability",
            "Nylon": "Elastic and abrasion resistant",
            "Rayon": "Soft drape with moderate resilience",
            "Acrylic": "Lightweight and insulating",
            "Mixed Fabrics": "Balanced performance with blend variability",
        }
        return quality_map.get(material, "Variable quality depending on construction")

    def _fabric_category(self, material):
        if material in {"Cotton", "Linen", "Denim"}:
            return "Natural fiber category"
        if material in {"Polyester", "Nylon", "Acrylic", "Rayon"}:
            return "Engineered fiber category"
        if material == "Wool":
            return "Animal fiber category"
        if material == "Silk":
            return "Luxury fiber category"
        return "Mixed or blended category"


if __name__ == "__main__":

    classifier = MaterialClassifier()

    result = classifier.classify(
        "data/TFD/001/001-001.png"
    )

    print(result)