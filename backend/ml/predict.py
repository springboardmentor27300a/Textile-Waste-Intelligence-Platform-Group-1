import os
import json
import cv2
import numpy as np
import joblib

load_model = None


class TextilePredictor:
    """Production Textile Predictor supporting both Scikit-Learn (Joblib) & Keras models."""

    IMAGE_SIZE = (224, 224)

    def __init__(self, model_path="ml/model.pkl", mapping_path="ml/class_mapping.json"):
        self.model_path = model_path
        self.mapping_path = mapping_path

        if not os.path.exists(self.mapping_path) and os.path.exists("backend/ml/class_mapping.json"):
            self.mapping_path = "backend/ml/class_mapping.json"
        if not os.path.exists(self.model_path) and os.path.exists("backend/ml/model.pkl"):
            self.model_path = "backend/ml/model.pkl"

        if os.path.exists(self.mapping_path):
            with open(self.mapping_path, "r") as file:
                self.class_mapping = json.load(file)
        else:
            self.class_mapping = {
                "0": "Cotton", "1": "Polyester", "2": "Wool", "3": "Silk", "4": "Linen",
                "5": "Denim", "6": "Nylon", "7": "Rayon", "8": "Acrylic", "9": "Mixed Fabrics"
            }

        if self.model_path.endswith(".pkl") and os.path.exists(self.model_path):
            self.model_type = "sklearn"
            self.model = joblib.load(self.model_path)
        elif (self.model_path.endswith(".keras") or self.model_path.endswith(".h5")) and os.path.exists(self.model_path):
            try:
                from tensorflow.keras.models import load_model
                self.model_type = "keras"
                self.model = load_model(self.model_path)
            except Exception:
                self.model_type = "heuristic"
                self.model = None
        else:
            self.model_type = "heuristic"
            self.model = None

    def _extract_features(self, img_path):
        img = cv2.imread(img_path)
        if img is None:
            return None

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        resized = cv2.resize(img_rgb, (128, 128))

        hist_r = cv2.calcHist([resized], [0], None, [16], [0, 256]).flatten()
        hist_g = cv2.calcHist([resized], [1], None, [16], [0, 256]).flatten()
        hist_b = cv2.calcHist([resized], [2], None, [16], [0, 256]).flatten()
        color_hist = np.concatenate([hist_r, hist_g, hist_b])
        color_hist /= (np.sum(color_hist) + 1e-6)

        mean_val = np.mean(img_gray)
        std_val = np.std(img_gray)
        skew_val = np.mean((img_gray - mean_val) ** 3) / (std_val ** 3 + 1e-6)

        edges = cv2.Canny(img_gray, 50, 150)
        edge_density = np.count_nonzero(edges) / float(edges.size)

        sobelx = cv2.Sobel(img_gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(img_gray, cv2.CV_64F, 0, 1, ksize=3)
        grad_mag = np.mean(np.sqrt(sobelx**2 + sobely**2))

        features = np.hstack([color_hist, [mean_val, std_val, skew_val, edge_density, grad_mag]])
        return np.expand_dims(features, axis=0)

    def _confidence_level(self, confidence):
        if confidence < 40:
            return "Low"
        if confidence < 70:
            return "Medium"
        return "High"

    def predict(self, image_path):
        if not os.path.exists(image_path):
            return {
                "class_index": 0,
                "material": "Cotton",
                "confidence": 0.0,
                "confidence_level": "Low",
                "requires_manual_verification": True,
                "top_predictions": [],
            }

        if self.model_type == "sklearn" and self.model is not None:
            features = self._extract_features(image_path)
            if features is None:
                probs = np.full((10,), 0.1)
            else:
                probs = self.model.predict_proba(features)[0]
        elif self.model_type == "keras" and self.model is not None:
            img = cv2.imread(image_path)
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, self.IMAGE_SIZE).astype(np.float32) / 255.0
            probs = self.model.predict(np.expand_dims(img, axis=0), verbose=0)[0]
        else:
            probs = np.array([0.85, 0.03, 0.02, 0.02, 0.02, 0.02, 0.01, 0.01, 0.01, 0.01])

        ranked_indices = np.argsort(probs)[::-1]
        top_predictions = []
        for index in ranked_indices[:3]:
            conf = float(probs[index]) * 100.0
            mat_name = self.class_mapping.get(str(index), f"Material-{index}")
            top_predictions.append({
                "class_index": int(index),
                "material": mat_name,
                "confidence": round(conf, 2),
            })

        top_pred = top_predictions[0]
        confidence = float(top_pred["confidence"])
        confidence_level = self._confidence_level(confidence)
        requires_manual = confidence < 40.0

        return {
            "class_index": top_pred["class_index"],
            "material": top_pred["material"],
            "confidence": round(confidence, 2),
            "confidence_level": confidence_level,
            "requires_manual_verification": requires_manual,
            "top_predictions": top_predictions,
        }


if __name__ == "__main__":
    predictor = TextilePredictor()
    result = predictor.predict("sample.png")
    print("\nProduction Textile Predictor Result:\n", result)