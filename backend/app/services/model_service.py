import os
from pathlib import Path
from PIL import Image

try:
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

# Initialize pipeline lazily
_classifier = None

def load_model():
    """Loads the HuggingFace CLIP zero-shot classification model."""
    global _classifier
    
    if not TRANSFORMERS_AVAILABLE:
        print("[WARNING] transformers library is not available. Please install torch and transformers.")
        return False
        
    if _classifier is not None:
        return True
        
    try:
        print("[INFO] Loading CLIP Zero-Shot Image Classification model (this may take a moment)...")
        # Using a standard lightweight CLIP model
        _classifier = pipeline("zero-shot-image-classification", model="openai/clip-vit-base-patch32")
        print("[INFO] CLIP model loaded successfully.")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to load HuggingFace model: {e}")
        return False

def _predict_with_labels(image_path: str, candidate_labels: list):
    """Internal helper to run zero-shot classification against specific labels."""
    if _classifier is None:
        success = load_model()
        if not success:
            return None, 0.0
            
    try:
        img = Image.open(image_path)
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
        results = _classifier(img, candidate_labels=candidate_labels)
        
        # Results is a list of dicts: [{'score': 0.9, 'label': 'Cotton'}, ...]
        # They are sorted by score descending
        best_match = results[0]
        label = best_match['label']
        confidence = best_match['score'] * 100.0
        
        return label, confidence
    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        return None, 0.0

def predict_material(image_path: str):
    """Predicts the fabric material."""
    materials = [
        "Cotton fabric", "Polyester fabric", "Wool fabric", "Silk fabric", 
        "Denim fabric", "Nylon fabric", "Rayon fabric", "Linen fabric", "Acrylic fabric"
    ]
    label, conf = _predict_with_labels(image_path, materials)
    
    if label:
        # Strip " fabric" to match our standard list
        clean_label = label.replace(" fabric", "").strip()
        return clean_label, conf
    return None, 0.0

def predict_color(image_path: str):
    """Predicts the dominant color of the fabric."""
    colors = [
        "Navy Blue", "White", "Off-White", "Black", "Charcoal Grey", 
        "Brown", "Beige", "Red", "Burgundy", "Green", "Yellow", "Pink", "Multi-colored"
    ]
    return _predict_with_labels(image_path, colors)

def predict_pattern(image_path: str):
    """Predicts the pattern on the fabric."""
    patterns = [
        "Solid Plain", "Striped", "Plaid Checked", "Floral Print", 
        "Geometric Print", "Camouflage", "Polka Dot", "Abstract Print", "Jacquard Brocade"
    ]
    return _predict_with_labels(image_path, patterns)

# Keep the original predict() signature for backward compatibility with material_classifier.py
def predict(image_path: str):
    return predict_material(image_path)
