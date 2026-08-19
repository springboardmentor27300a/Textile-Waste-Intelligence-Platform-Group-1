"""
Textile waste dataset integration.

This module loads the Fashion-MNIST test set (downloaded into
backend/data/fashion_mnist/) and exposes it through the API so the
frontend can:
  1. Browse sample garment images by class (fabric/garment categories)
  2. Run a lightweight classification demo (nearest-centroid model,
     computed once at startup) that mimics the "fabric/garment
     recognition" workflow called for in the brief - without requiring
     a GPU or a heavy deep-learning framework for this milestone.

In later milestones this nearest-centroid baseline would be swapped
for a trained CNN (e.g. on TIPS / DeepFashion / Fabric Image Dataset)
without changing the API contract below.
"""

import os
import gzip
import base64
import io
import numpy as np
from flask import Blueprint, jsonify, current_app, request
from app.utils.security import token_required

dataset_bp = Blueprint("dataset", __name__)

CLASS_NAMES = [
    "T-shirt/top", "Trouser", "Pullover", "Dress", "Coat",
    "Sandal", "Shirt", "Sneaker", "Bag", "Ankle boot",
]

# Maps Fashion-MNIST garment classes to textile-waste-relevant categories,
# illustrating how a garment classifier feeds the waste-sorting workflow.
GARMENT_TO_WASTE_CATEGORY = {
    "T-shirt/top": "Cotton/Knit Apparel",
    "Trouser": "Woven Apparel",
    "Pullover": "Knitwear",
    "Dress": "Woven Apparel",
    "Coat": "Outerwear",
    "Sandal": "Non-textile (footwear)",
    "Shirt": "Woven Apparel",
    "Sneaker": "Non-textile (footwear)",
    "Bag": "Non-textile (accessory)",
    "Ankle boot": "Non-textile (footwear)",
}

_cache = {"images": None, "labels": None, "centroids": None}


def _load_dataset(app):
    if _cache["images"] is not None:
        return

    dataset_dir = os.path.join(app.config["DATASET_DIR"], "fashion_mnist")
    images_path = os.path.join(dataset_dir, "t10k-images-idx3-ubyte.gz")
    labels_path = os.path.join(dataset_dir, "t10k-labels-idx1-ubyte.gz")

    with gzip.open(images_path, "rb") as f:
        f.read(16)  # IDX header
        buf = f.read()
        images = np.frombuffer(buf, dtype=np.uint8).reshape(-1, 28, 28)

    with gzip.open(labels_path, "rb") as f:
        f.read(8)  # IDX header
        labels = np.frombuffer(f.read(), dtype=np.uint8)

    _cache["images"] = images
    _cache["labels"] = labels

    # Compute one centroid (mean image) per class -> nearest-centroid
    # classifier. This is intentionally simple for Milestone 1: it
    # proves the data pipeline end-to-end (load -> preprocess -> infer)
    # without requiring model training infrastructure yet.
    centroids = np.zeros((10, 28 * 28), dtype=np.float64)
    flat = images.reshape(len(images), -1).astype(np.float64)
    for c in range(10):
        mask = labels == c
        centroids[c] = flat[mask].mean(axis=0)
    _cache["centroids"] = centroids


def _image_to_base64_png(arr_28x28):
    from PIL import Image
    img = Image.fromarray(arr_28x28.astype(np.uint8), mode="L").resize((112, 112), Image.NEAREST)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


@dataset_bp.route("/info", methods=["GET"])
@token_required
def dataset_info():
    _load_dataset(current_app)
    images, labels = _cache["images"], _cache["labels"]
    counts = {CLASS_NAMES[c]: int((labels == c).sum()) for c in range(10)}
    return jsonify({
        "dataset": "Fashion-MNIST (test split)",
        "purpose": "Clothing classification / image classification baseline",
        "total_images": int(len(images)),
        "image_shape": list(images.shape[1:]),
        "classes": CLASS_NAMES,
        "counts_per_class": counts,
        "garment_to_waste_category": GARMENT_TO_WASTE_CATEGORY,
    }), 200


@dataset_bp.route("/sample", methods=["GET"])
@token_required
def dataset_sample():
    """Returns N random sample images (as base64 PNG) with their labels."""
    _load_dataset(current_app)
    images, labels = _cache["images"], _cache["labels"]

    n = min(int(request.args.get("n", 8)), 24)
    class_filter = request.args.get("class_name")

    if class_filter and class_filter in CLASS_NAMES:
        class_idx = CLASS_NAMES.index(class_filter)
        candidates = np.where(labels == class_idx)[0]
    else:
        candidates = np.arange(len(images))

    rng = np.random.default_rng()
    chosen = rng.choice(candidates, size=min(n, len(candidates)), replace=False)

    samples = []
    for idx in chosen:
        label_idx = int(labels[idx])
        class_name = CLASS_NAMES[label_idx]
        samples.append({
            "index": int(idx),
            "label": class_name,
            "waste_category": GARMENT_TO_WASTE_CATEGORY[class_name],
            "image_base64": _image_to_base64_png(images[idx]),
        })

    return jsonify({"samples": samples}), 200


@dataset_bp.route("/classify", methods=["GET"])
@token_required
def classify_sample():
    """
    Demo classification workflow: pick a random test image, classify it
    with the nearest-centroid baseline, and return predicted vs actual
    label plus the derived waste category - demonstrating the intended
    'image in -> garment/fabric class out -> waste workflow routing' flow.
    """
    _load_dataset(current_app)
    images, labels = _cache["images"], _cache["labels"]
    centroids = _cache["centroids"]

    idx = request.args.get("index")
    if idx is not None:
        idx = int(idx) % len(images)
    else:
        idx = int(np.random.default_rng().integers(0, len(images)))

    img_flat = images[idx].reshape(-1).astype(np.float64)
    distances = np.linalg.norm(centroids - img_flat, axis=1)
    predicted_idx = int(np.argmin(distances))
    actual_idx = int(labels[idx])

    predicted_name = CLASS_NAMES[predicted_idx]
    actual_name = CLASS_NAMES[actual_idx]

    return jsonify({
        "index": idx,
        "image_base64": _image_to_base64_png(images[idx]),
        "predicted_class": predicted_name,
        "actual_class": actual_name,
        "correct": predicted_idx == actual_idx,
        "predicted_waste_category": GARMENT_TO_WASTE_CATEGORY[predicted_name],
        "model": "nearest-centroid (Milestone 1 baseline)",
    }), 200
