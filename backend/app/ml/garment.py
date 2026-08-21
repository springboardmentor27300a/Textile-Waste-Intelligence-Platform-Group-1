"""Garment category recognition, trained on Fashion-MNIST.

The specification lists Fashion-MNIST for clothing classification and as an
image-classification baseline, which is exactly what this does. A garment
category is not a fibre, so the prediction is used two ways and never as a fibre
claim: it labels the item type, and it supplies a soft prior over the fibres that
garment is usually made from.
"""
from __future__ import annotations

import json
from pathlib import Path

import cv2
import joblib
import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report

from ..config import settings
from .datasets import FASHION_CLASSES, GARMENT_FIBRE_PRIOR, load_fashion_mnist

MODEL_NAME = "garment_classifier.joblib"
_cache: dict = {}


def _to_vector(image_grey_28: np.ndarray) -> np.ndarray:
    return (image_grey_28.reshape(-1).astype(np.float32) / 255.0)


def train_garment_classifier(root: Path, limit: int = 0, out_dir: Path | None = None) -> dict:
    out_dir = out_dir or Path(settings.model_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    train_images, train_labels = load_fashion_mnist(root, "train", limit)
    try:
        test_images, test_labels = load_fashion_mnist(root, "test", limit // 5 if limit else 0)
    except SystemExit:
        split = int(len(train_images) * 0.85)
        train_images, test_images = train_images[:split], train_images[split:]
        train_labels, test_labels = train_labels[:split], train_labels[split:]

    Xtr = np.stack([_to_vector(i) for i in train_images])
    Xte = np.stack([_to_vector(i) for i in test_images])

    model = HistGradientBoostingClassifier(
        max_iter=120, learning_rate=0.15, max_depth=None,
        early_stopping=True, validation_fraction=0.1, random_state=42,
    ).fit(Xtr, train_labels)

    predicted = model.predict(Xte)
    accuracy = accuracy_score(test_labels, predicted)
    present = sorted(set(test_labels.tolist()))
    report = classification_report(
        test_labels, predicted, labels=present,
        target_names=[FASHION_CLASSES[i] for i in present],
        output_dict=True, zero_division=0,
    )

    metrics = {
        "algorithm": "HistGradientBoostingClassifier (scikit-learn)",
        "train_samples": int(len(Xtr)),
        "test_samples": int(len(Xte)),
        "test_accuracy": round(float(accuracy), 4),
        "classes": [FASHION_CLASSES[i] for i in present],
        "per_class_f1": {FASHION_CLASSES[i]: round(report[FASHION_CLASSES[i]]["f1-score"], 3)
                         for i in present},
        "source": str(root),
    }

    joblib.dump({"model": model, "classes": FASHION_CLASSES, "metrics": metrics},
                out_dir / MODEL_NAME)
    (out_dir / "garment_metrics.json").write_text(json.dumps(metrics, indent=2))
    return metrics


def _load():
    if "bundle" not in _cache:
        path = Path(settings.model_dir) / MODEL_NAME
        _cache["bundle"] = joblib.load(path) if path.exists() else None
    return _cache["bundle"]


def reload_garment_model() -> None:
    _cache.clear()


def available() -> bool:
    return _load() is not None


def predict_garment(image_bgr: np.ndarray) -> dict | None:
    """Classify the garment type, matching Fashion-MNIST's own preprocessing.

    Fashion-MNIST is white-on-black silhouettes, so a photograph has to be
    inverted and centred to look anything like the training data. This is the
    honest weak point of the module: it works on garment photographs against a
    plain background, not on a close-up weave.
    """
    bundle = _load()
    if bundle is None:
        return None

    grey = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    if grey.mean() > 127:                     # dark garment on light background
        grey = 255 - grey

    # Applicability is judged on the *uncropped* image. Cropping to a bounding
    # box manufactures empty margin, which made a full-bleed fabric swatch look
    # like a silhouette on a background and defeated this guard entirely — every
    # AITEX patch came back as a confident "Dress".
    # A garment photo sits on a plain background, so its border ring is almost
    # featureless. A fabric close-up is textured right to the edge. Measured on
    # real data the two do not overlap: AITEX patches score ~64, Fashion-MNIST
    # style photographs score ~0. Counting dark pixels instead (the first attempt)
    # failed, because inverting a light-grey fabric turns its highlights into
    # "background" and every AITEX patch came back a confident "Dress".
    border = max(2, int(min(grey.shape) * 0.08))
    ring = np.concatenate([
        grey[:border, :].ravel(), grey[-border:, :].ravel(),
        grey[:, :border].ravel(), grey[:, -border:].ravel(),
    ])
    border_uniformity = float(ring.std())

    # Uniform border is necessary but not sufficient: a smooth, evenly lit fabric
    # swatch also has a flat border. A real garment photo additionally has a
    # background that differs from the subject, so require contrast between the
    # border ring and the centre of the frame.
    h, w = grey.shape
    centre = grey[h // 4:3 * h // 4, w // 4:3 * w // 4]
    subject_contrast = float(abs(float(centre.mean()) - float(ring.mean())))

    # Fashion-MNIST garments fill the frame edge to edge. Resizing a photograph
    # whole leaves the garment small inside its background, which is a different
    # picture from anything the model was trained on and costs a lot of accuracy
    # (measured: 4/12 correct before this crop, 10/12 after). So find the
    # garment and crop to it first, preserving aspect ratio the way the dataset does.
    _, foreground = cv2.threshold(grey, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    coords = cv2.findNonZero(foreground)
    if coords is not None:
        x, y, w, h = cv2.boundingRect(coords)
        if w > 4 and h > 4:
            side = max(w, h)
            pad = int(side * 0.08)            # dataset leaves a thin margin
            side += pad * 2
            cx, cy = x + w // 2, y + h // 2
            square = np.zeros((side, side), np.uint8)
            x0, y0 = max(0, cx - side // 2), max(0, cy - side // 2)
            crop = grey[y0:y0 + side, x0:x0 + side]
            square[:crop.shape[0], :crop.shape[1]] = crop
            grey = square

    grey = cv2.resize(grey, (28, 28), interpolation=cv2.INTER_AREA)

    # Fashion-MNIST images are a garment silhouette surrounded by empty
    # background. A full-bleed weave close-up has no background at all, and the
    # model will still name a class with real confidence — "Bag, 66%" on a denim
    # swatch. Detect that the input is the wrong shape of picture and say so,
    # rather than publishing a confident answer to a question nobody asked.
    applicable = border_uniformity < 25.0 and subject_contrast > 25.0

    probabilities = bundle["model"].predict_proba(_to_vector(grey).reshape(1, -1))[0]
    order = np.argsort(probabilities)[::-1]
    classes = bundle["classes"]
    top = classes[order[0]]
    confidence = float(probabilities[order[0]])

    if not applicable:
        return {
            "applicable": False,
            "reason": ("This looks like a close-up of fabric rather than a whole garment. "
                       "Fashion-MNIST only recognises garment silhouettes, so no category "
                       "is reported."),
            "border_uniformity": round(border_uniformity, 1),
            "subject_contrast": round(subject_contrast, 1),
        }

    return {
        "applicable": True,
        "garment": top,
        "confidence": round(confidence, 4),
        "border_uniformity": round(border_uniformity, 1),
        "subject_contrast": round(subject_contrast, 1),
        "probabilities": {classes[i]: round(float(probabilities[i]), 4) for i in order[:4]},
        "likely_fibres": GARMENT_FIBRE_PRIOR.get(top, []),
        "test_accuracy": bundle["metrics"]["test_accuracy"],
        "caveat": ("Fashion-MNIST is 28x28 silhouettes, so this reads whole-garment "
                   "photographs, not close-up weave shots."),
    }
