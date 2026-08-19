"""
Material Classification Engine
================================

10-class fabric/material classifier built as a nearest-centroid model over
the 7-dimensional visual feature vector produced by feature_extraction.py.

Reference centroids below are domain-informed profiles (typical brightness,
saturation, weave regularity, and surface texture for each material) rather
than learned from a labeled image dataset, since no such dataset was
available for this milestone. This mirrors the Milestone 1 approach of
shipping a working, explainable baseline first; the API/output shape is
stable so a CNN trained on a real fabric-image dataset can replace the
scoring function in a later milestone without touching the routes layer.

Outputs:
  - predicted material (1 of 10)
  - confidence (based on relative distance to nearest centroids)
  - fiber composition estimate (blend %)
  - blend flag ("Pure" vs "Blended")
  - material quality estimate (Excellent / Good / Fair / Poor)
"""

from __future__ import annotations

import numpy as np
from app.ml.feature_extraction import feature_vector

MATERIALS = (
    "Cotton", "Polyester", "Wool", "Silk", "Linen",
    "Denim", "Nylon", "Rayon", "Acrylic", "Mixed Fabrics",
)

# Whether a material is a natural/biodegradable fiber (used by the waste
# classification engine for compostability decisions).
NATURAL_FIBERS = {"Cotton", "Wool", "Silk", "Linen", "Denim"}
SYNTHETIC_FIBERS = {"Polyester", "Nylon", "Rayon", "Acrylic"}

# Reference feature centroids, in the same order as feature_vector():
# [brightness, saturation, color_std, texture_roughness,
#  texture_uniformity, edge_density, pattern_regularity]
_CENTROIDS = {
    "Cotton":        [0.72, 0.28, 0.12, 0.34, 0.70, 0.16, 0.72],
    "Polyester":     [0.68, 0.45, 0.10, 0.18, 0.85, 0.10, 0.65],
    "Wool":          [0.55, 0.22, 0.16, 0.55, 0.55, 0.22, 0.55],
    "Silk":          [0.78, 0.50, 0.08, 0.12, 0.90, 0.08, 0.60],
    "Linen":         [0.70, 0.20, 0.15, 0.42, 0.62, 0.24, 0.80],
    "Denim":         [0.38, 0.30, 0.14, 0.48, 0.58, 0.20, 0.85],
    "Nylon":         [0.65, 0.42, 0.09, 0.15, 0.88, 0.09, 0.60],
    "Rayon":         [0.74, 0.38, 0.11, 0.22, 0.78, 0.12, 0.58],
    "Acrylic":       [0.66, 0.48, 0.13, 0.30, 0.68, 0.15, 0.55],
    "Mixed Fabrics": [0.60, 0.35, 0.18, 0.35, 0.65, 0.18, 0.62],
}

_WEIGHTS = np.array([1.2, 1.0, 1.3, 1.5, 1.1, 1.2, 0.9])  # emphasize texture/color-std


def _centroid_matrix():
    order = MATERIALS
    return order, np.array([_CENTROIDS[m] for m in order], dtype=np.float64)


def classify_material(features: dict) -> dict:
    order, matrix = _centroid_matrix()
    vec = feature_vector(features)

    diffs = (matrix - vec) * _WEIGHTS
    distances = np.sqrt((diffs**2).sum(axis=1))

    ranked_idx = np.argsort(distances)
    best_idx = int(ranked_idx[0])
    second_idx = int(ranked_idx[1])

    best_material = order[best_idx]
    second_material = order[second_idx]

    best_dist = float(distances[best_idx])
    second_dist = float(distances[second_idx])

    # Confidence: how much closer the winner is vs the runner-up.
    gap = second_dist - best_dist
    confidence = float(np.clip(0.5 + gap * 1.8, 0.35, 0.97))

    # Blend detection: if the top two candidates are nearly equidistant,
    # treat the fabric as a blend of those two materials.
    is_blend = (second_dist - best_dist) < 0.06
    if is_blend:
        blend_share_best = 50 + int(min(30, (0.06 - (second_dist - best_dist)) * 400))
        blend_share_second = 100 - blend_share_best
        composition = {best_material: blend_share_best, second_material: blend_share_second}
        blend_label = "Blended"
        predicted_material = "Mixed Fabrics" if best_material == "Mixed Fabrics" else best_material
    else:
        composition = {best_material: 100}
        blend_label = "Pure"
        predicted_material = best_material

    # Quality estimate: driven by texture uniformity and inverse damage.
    uniformity = features["texture_uniformity"]
    damage = features["damage_score"]
    quality_score = float(np.clip(uniformity * 0.7 + (1 - damage) * 0.3, 0, 1))
    if quality_score >= 0.75:
        quality_label = "Excellent"
    elif quality_score >= 0.55:
        quality_label = "Good"
    elif quality_score >= 0.35:
        quality_label = "Fair"
    else:
        quality_label = "Poor"

    fiber_category = (
        "Natural" if predicted_material in NATURAL_FIBERS
        else "Synthetic" if predicted_material in SYNTHETIC_FIBERS
        else "Mixed"
    )

    return {
        "predicted_material": predicted_material,
        "confidence": round(confidence, 3),
        "fiber_category": fiber_category,
        "blend_type": blend_label,
        "fiber_composition": composition,
        "quality_estimate": quality_label,
        "quality_score": round(quality_score, 3),
        "candidates_ranked": [
            {"material": order[i], "distance": round(float(distances[i]), 4)}
            for i in ranked_idx[:4]
        ],
        "model": "nearest-centroid (Milestone 2 baseline, 10-class)",
    }
