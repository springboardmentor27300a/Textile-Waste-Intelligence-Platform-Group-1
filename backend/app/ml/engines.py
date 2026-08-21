"""Inference engines: material, waste, scoring, recommendation, environmental."""
from __future__ import annotations

import time
from pathlib import Path

import cv2
import joblib
import numpy as np

from ..config import settings
from .features import (
    describe_colour, describe_pattern, describe_texture, extract_features, to_vector,
)
from .materials import (
    BLEND_PARTNERS, CONDITION_QUALITY, IMPACT, LANDFILL_DIVERSION_KG_CO2,
)
from .train import WASTE_FEATURES
from . import defect as defect_module
from . import garment as garment_module

_cache: dict[str, dict] = {}


def _load(name: str) -> dict:
    if name not in _cache:
        path = Path(settings.model_dir) / f"{name}.joblib"
        if not path.exists():
            from .train import train
            train()
        _cache[name] = joblib.load(path)
    return _cache[name]


def reload_models() -> None:
    _cache.clear()
    defect_module.reload_defect_model()
    garment_module.reload_garment_model()


def warm_models() -> None:
    """Load every model into the cache, training the core two if absent.

    The dataset-backed models (AITEX defect, Fashion-MNIST garment) are optional:
    if they haven't been trained the platform runs without them rather than
    blocking startup.
    """
    _load("material_classifier")
    _load("waste_classifier")
    defect_module.available()
    garment_module.available()


# --------------------------------------------------------- material engine

def classify_material(features: dict[str, float]) -> dict:
    bundle = _load("material_classifier")
    probs = bundle["model"].predict_proba(to_vector(features).reshape(1, -1))[0]
    order = np.argsort(probs)[::-1]
    classes = bundle["classes"]
    top, second = classes[order[0]], classes[order[1]]
    confidence = float(probs[order[0]])

    # A close two-way call plus high colour entropy is the signature of a blend.
    margin = confidence - float(probs[order[1]])
    is_blend = bool(margin < 0.18 or top == "Mixed Fabrics" or features["colour_entropy"] > 0.78)

    if is_blend and top != "Mixed Fabrics":
        share = confidence / (confidence + float(probs[order[1]]))
        composition = {top: round(share * 100, 1), second: round((1 - share) * 100, 1)}
    elif top == "Mixed Fabrics":
        # No single fibre dominates: apportion across the next most likely calls.
        contenders = [(classes[i], float(probs[i])) for i in order[1:4]
                      if classes[i] != "Mixed Fabrics"]
        total = sum(p for _, p in contenders) or 1.0
        composition = {name: round(p / total * 85, 1) for name, p in contenders}
        composition["Other fibres"] = round(100 - sum(composition.values()), 1)
    else:
        composition = {top: 100.0}

    return {
        "material": top,
        "confidence": round(confidence, 4),
        "probabilities": {c: round(float(p), 4) for c, p in
                          sorted(zip(classes, probs), key=lambda kv: -kv[1])[:5]},
        "fibre_composition": composition,
        "is_blend": is_blend,
    }


def material_quality(features: dict[str, float], condition: str) -> float:
    """How much usable fibre value is left in the batch."""
    base = CONDITION_QUALITY.get((condition or "good").lower(), 0.6)
    penalty = features["damage_score"] * 0.42 + features["contamination_score"] * 0.30
    uniformity = (1 - features["lightness_std"]) * 0.08
    return round(float(np.clip(base - penalty + uniformity, 0.02, 1.0)), 4)


# ------------------------------------------------------------ waste engine

def classify_waste(features: dict[str, float], material: str, condition: str,
                   quality: float, is_blend: bool) -> dict:
    bundle = _load("waste_classifier")
    impact = IMPACT.get(material, IMPACT["Mixed Fabrics"])
    row = {
        "material_recyclability": impact["recyclability"],
        "damage_score": features["damage_score"],
        "contamination_score": features["contamination_score"],
        "condition_quality": CONDITION_QUALITY.get((condition or "good").lower(), 0.6),
        "material_quality": quality,
        "is_blend": float(is_blend),
        "compostable": float(impact["compostable"]),
    }
    vector = np.array([[row[f] for f in WASTE_FEATURES]], dtype=np.float32)
    probs = bundle["model"].predict_proba(vector)[0]
    classes = bundle["classes"]
    best = int(np.argmax(probs))
    return {
        "category": classes[best],
        "probabilities": {c: round(float(p), 4) for c, p in
                          sorted(zip(classes, probs), key=lambda kv: -kv[1]) if p > 0.005},
    }


# ---------------------------------------------------------- scoring engine

BANDS = [
    (0.85, "Excellent Recovery Potential"),
    (0.70, "High Recovery Potential"),
    (0.50, "Moderate Recovery Potential"),
    (0.30, "Limited Recovery Potential"),
    (0.00, "Disposal Recommended"),
]

WEIGHTS = {
    "material_recyclability": 0.35,
    "material_condition": 0.20,
    "reuse_potential": 0.20,
    "environmental_benefit": 0.15,
    "processing_feasibility": 0.10,
}


def score_batch(features: dict[str, float], material: str, quality: float,
                waste_category: str, is_blend: bool) -> dict:
    impact = IMPACT.get(material, IMPACT["Mixed Fabrics"])

    recyclability = float(np.clip(
        impact["recyclability"] * (1 - features["contamination_score"] * 0.55)
        * (0.72 if is_blend else 1.0), 0, 1))

    reuse = float(np.clip(
        quality * (1 - features["damage_score"] * 0.85)
        * (1 - features["contamination_score"] * 0.6), 0, 1))

    # Benefit is the avoided virgin burden, normalised against the heaviest fibre.
    worst_co2 = max(v["co2_kg_per_kg"] for v in IMPACT.values())
    worst_water = max(v["water_l_per_kg"] for v in IMPACT.values())
    environmental = float(np.clip(
        0.6 * impact["co2_kg_per_kg"] / worst_co2
        + 0.4 * impact["water_l_per_kg"] / worst_water, 0, 1))

    feasibility = float(np.clip(
        (0.85 if not is_blend else 0.45)
        * (1 - features["contamination_score"] * 0.7)
        + (0.15 if impact["chemical_route"] else 0.0), 0, 1))

    material_recovery = float(np.clip(recyclability * 0.6 + quality * 0.4, 0, 1))

    circularity = (
        WEIGHTS["material_recyclability"] * recyclability
        + WEIGHTS["material_condition"] * quality
        + WEIGHTS["reuse_potential"] * reuse
        + WEIGHTS["environmental_benefit"] * environmental
        + WEIGHTS["processing_feasibility"] * feasibility
    )
    if waste_category == "Hazardous Textile Waste":
        circularity *= 0.35

    band = next(label for cut, label in BANDS if circularity >= cut)
    sustainability = float(np.clip(circularity * 0.7 + environmental * 0.3, 0, 1))

    return {
        "recyclability_score": round(recyclability * 100, 1),
        "reuse_score": round(reuse * 100, 1),
        "sustainability_score": round(sustainability * 100, 1),
        "material_recovery_score": round(material_recovery * 100, 1),
        "circularity_score": round(circularity * 100, 1),
        "circularity_band": band,
        "components": {
            "material_recyclability": round(recyclability * 100, 1),
            "material_condition": round(quality * 100, 1),
            "reuse_potential": round(reuse * 100, 1),
            "environmental_benefit": round(environmental * 100, 1),
            "processing_feasibility": round(feasibility * 100, 1),
        },
        "weights": WEIGHTS,
    }


# --------------------------------------------------- recommendation engine

def recommend(material: str, waste_category: str, scores: dict, features: dict,
              quantity_kg: float, is_blend: bool) -> list[dict]:
    impact = IMPACT.get(material, IMPACT["Mixed Fabrics"])
    reuse, recyclability = scores["reuse_score"], scores["recyclability_score"]
    damage, contamination = features["damage_score"], features["contamination_score"]
    options: list[dict] = []

    def add(route, fit, why, note=""):
        options.append({"route": route, "fit": round(float(np.clip(fit, 0, 100)), 1),
                        "rationale": why, "note": note})

    if waste_category == "Hazardous Textile Waste":
        add("Industrial Recovery", 70,
            "Contamination is above the safe-handling threshold for open sorting.",
            "Route to a licensed hazardous textile handler before any further processing.")
        return sorted(options, key=lambda o: -o["fit"])[:4]

    add("Fabric Reuse", reuse * 0.95,
        f"Condition holds at {scores['components']['material_condition']:.0f}/100 with "
        f"{damage * 100:.0f}% surface damage.",
        "Highest value route — sell or redistribute the batch intact.")

    add("Donation", reuse * 0.8 - contamination * 30,
        "Wearable stock with light wear moves fastest through charity partners.")

    add("Upcycling", (60 + reuse * 0.3) if damage < 0.45 else 25,
        "Undamaged panels can be cut around the worn areas.",
        "Best when the batch is visually consistent but not resaleable as-is.")

    add("Mechanical Recycling", recyclability * (0.9 if not is_blend else 0.6),
        f"{material} shreds back to staple fibre with "
        f"{impact['recyclability'] * 100:.0f}% typical yield.",
        "Blends lose yield here — separate first if the volume justifies it." if is_blend else "")

    if impact["chemical_route"]:
        add("Chemical Recycling", recyclability * 0.85 + 8,
            f"{material} depolymerises cleanly back to virgin-grade feedstock.",
            "Needs a minimum feed volume — batch with similar material before shipping.")

    add("Fiber Recycling", recyclability * 0.75,
        "Open-end spinning accepts short recovered fibre for lower-grade yarn.")

    if impact["compostable"] and contamination < 0.25:
        add("Industrial Recovery", 40 + (1 - recyclability) * 25,
            "Natural fibre with no usable structure left — composting beats landfill.",
            "Only if the batch carries no synthetic thread or dye load.")

    if quantity_kg >= 500:
        for option in options:
            if option["route"] in ("Mechanical Recycling", "Chemical Recycling"):
                option["fit"] = min(100.0, option["fit"] + 6)
                option["note"] = (option["note"] + " Volume clears the minimum for a "
                                  "dedicated processing run.").strip()

    ranked = sorted(options, key=lambda o: -o["fit"])[:4]
    for i, option in enumerate(ranked):
        option["rank"] = i + 1
    return ranked


# ------------------------------------------------- environmental impact engine

def environmental_impact(material: str, quantity_kg: float, scores: dict,
                         top_route: str) -> dict:
    impact = IMPACT.get(material, IMPACT["Mixed Fabrics"])
    recovery_rate = {
        "Fabric Reuse": 0.95, "Donation": 0.90, "Upcycling": 0.75,
        "Chemical Recycling": 0.80, "Mechanical Recycling": 0.65,
        "Fiber Recycling": 0.55, "Industrial Recovery": 0.30,
    }.get(top_route, 0.5)

    diverted = quantity_kg * recovery_rate
    co2 = diverted * impact["co2_kg_per_kg"] + diverted * LANDFILL_DIVERSION_KG_CO2
    water = diverted * impact["water_l_per_kg"]

    return {
        "recommended_route": top_route,
        "assumed_recovery_rate": round(recovery_rate, 2),
        "diverted_kg": round(diverted, 2),
        "landfill_avoided_kg": round(diverted, 2),
        "co2_saved_kg": round(co2, 1),
        "water_saved_litres": round(water, 0),
        "virgin_fibre_replaced_kg": round(diverted * impact["recyclability"], 2),
        "basis": "Avoided virgin-production burden per kg, plus landfill methane equivalent.",
    }


# ------------------------------------------------------------- orchestration

def analyse_image(image_path: str, condition: str = "good",
                  quantity_kg: float = 0.0) -> dict:
    started = time.perf_counter()
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("That file couldn't be read as an image. Upload a JPG, PNG or WebP.")

    features = extract_features(image)

    # AITEX-trained defect detector, when present, replaces the heuristic damage
    # score with a supervised one. The heuristic stays as the fallback so the
    # platform still works before the dataset is downloaded.
    defect = defect_module.predict_defect(image)
    if defect:
        features["damage_score"] = float(
            np.clip(0.5 * features["damage_score"] + 0.5 * defect["defect_probability"], 0, 1))

    garment = garment_module.predict_garment(image)

    material = classify_material(features)
    quality = material_quality(features, condition)
    waste = classify_waste(features, material["material"], condition, quality, material["is_blend"])
    scores = score_batch(features, material["material"], quality,
                         waste["category"], material["is_blend"])
    routes = recommend(material["material"], waste["category"], scores, features,
                       quantity_kg, material["is_blend"])
    impact = environmental_impact(material["material"], quantity_kg, scores,
                                  routes[0]["route"] if routes else "Mechanical Recycling")

    return {
        "visual_features": {k: round(v, 4) for k, v in features.items()},
        "dominant_colour": describe_colour(features),
        "texture_class": describe_texture(features),
        "pattern_class": describe_pattern(features),
        "damage_score": round(features["damage_score"], 4),
        "contamination_score": round(features["contamination_score"], 4),
        "material": material["material"],
        "material_confidence": material["confidence"],
        "material_probabilities": material["probabilities"],
        "fibre_composition": material["fibre_composition"],
        "is_blend": material["is_blend"],
        "material_quality": quality,
        "waste_category": waste["category"],
        "waste_probabilities": waste["probabilities"],
        **{k: v for k, v in scores.items() if k != "components" and k != "weights"},
        "score_components": scores["components"],
        "score_weights": scores["weights"],
        "recommendations": routes,
        "environmental_impact": impact,
        "defect_detection": defect,
        "garment_recognition": garment,
        "inference_ms": round((time.perf_counter() - started) * 1000, 1),
    }
