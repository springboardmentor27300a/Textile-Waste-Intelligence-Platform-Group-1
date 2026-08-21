"""Model training.

The platform ships with a bootstrap corpus synthesised from the fibre profiles in
`materials.py`, so a fresh clone trains and serves in seconds with no download.
To train on real imagery instead, point `--images` at a folder of
`<material_name>/*.jpg` sub-folders (TIPS, DeepFashion, or the Kaggle fabric
set all unpack into that shape) and the same pipeline runs over extracted
features from those files.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from ..config import settings
from .features import FEATURE_NAMES, extract_features, to_vector
from .materials import CONDITION_QUALITY, IMPACT, MATERIALS, PROFILES

WASTE_LABELS = [
    "Recyclable", "Reusable", "Repairable",
    "Upcyclable", "Compostable", "Hazardous Textile Waste",
]

WASTE_FEATURES = [
    "material_recyclability", "damage_score", "contamination_score",
    "condition_quality", "material_quality", "is_blend", "compostable",
]


# ------------------------------------------------------------------ synthesis

def synthesise_material_corpus(per_class: int = 900, seed: int = 7):
    """Draw feature vectors from each fibre's visual profile."""
    rng = np.random.default_rng(seed)
    X, y = [], []
    for material in MATERIALS:
        profile = PROFILES[material]
        # "Mixed Fabrics" has a deliberately wide profile, so an equal prior lets it
        # swallow the specific fibres. Sample it less often to keep it a fallback.
        draws = int(per_class * 0.45) if material == "Mixed Fabrics" else per_class
        for _ in range(draws):
            row = {}
            for name in FEATURE_NAMES:
                if name in profile:
                    mu, sigma = profile[name]
                    row[name] = float(np.clip(rng.normal(mu, sigma), 0, 1))
                elif name in ("chroma_a", "chroma_b"):
                    row[name] = float(np.clip(rng.normal(0, 0.15), -1, 1))
                else:
                    row[name] = float(np.clip(rng.normal(0.4, 0.18), 0, 1))
            # correlated features derived from the profile draw
            row["lightness_std"] = float(np.clip(row["glcm_contrast"] * 0.5 + rng.normal(0.1, 0.05), 0, 1))
            row["gradient_mean"] = float(np.clip(row["glcm_contrast"] * 0.8 + rng.normal(0, 0.08), 0, 1))
            row["gradient_std"] = float(np.clip(row["gradient_mean"] * 0.9 + rng.normal(0, 0.07), 0, 1))
            row["edge_density"] = float(np.clip(row["highfreq_ratio"] * 0.6 + rng.normal(0, 0.07), 0, 1))
            row["glcm_energy"] = float(np.clip(row["glcm_homogeneity"] * 0.7 + rng.normal(0, 0.08), 0, 1))
            row["lbp_flat_ratio"] = float(np.clip(row["lbp_uniformity"] * 0.4 + rng.normal(0, 0.06), 0, 1))
            X.append(to_vector(row))
            y.append(material)
    return np.array(X), np.array(y)


def corpus_from_images(root: Path):
    import cv2
    X, y = [], []
    for folder in sorted(p for p in root.iterdir() if p.is_dir()):
        for image_path in folder.glob("*"):
            if image_path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp", ".bmp"}:
                continue
            image = cv2.imread(str(image_path))
            if image is None:
                continue
            X.append(to_vector(extract_features(image)))
            y.append(folder.name)
    if not X:
        raise SystemExit(f"No readable images under {root}")
    return np.array(X), np.array(y)


def label_waste_category(row: dict) -> str:
    """Expert rule used to seed the waste classifier's training targets.

    The deployed model is a gradient-boosted surrogate of this rule, which lets
    it soften the hard thresholds and stay calibrated once real labelled batches
    replace the synthetic ones.
    """
    if row["contamination_score"] > 0.62:
        return "Hazardous Textile Waste"
    if row["condition_quality"] >= 0.72 and row["damage_score"] < 0.14:
        return "Reusable"
    if row["condition_quality"] >= 0.48 and 0.10 <= row["damage_score"] < 0.38:
        return "Repairable"
    if 0.34 <= row["material_quality"] <= 0.74 and row["damage_score"] < 0.52 and not row["is_blend"]:
        return "Upcyclable"
    if row["compostable"] and row["material_quality"] < 0.38 and row["contamination_score"] < 0.2:
        return "Compostable"
    return "Recyclable"


def synthesise_waste_corpus(n: int = 9000, seed: int = 11):
    rng = np.random.default_rng(seed)
    X, y = [], []
    for _ in range(n):
        material = MATERIALS[rng.integers(len(MATERIALS))]
        impact = IMPACT[material]
        condition = list(CONDITION_QUALITY)[rng.integers(len(CONDITION_QUALITY))]
        damage = float(np.clip(rng.beta(1.6, 4.0) + (1 - CONDITION_QUALITY[condition]) * 0.3, 0, 1))
        row = {
            "material_recyclability": impact["recyclability"],
            "damage_score": damage,
            "contamination_score": float(np.clip(rng.beta(1.4, 6.0), 0, 1)),
            "condition_quality": CONDITION_QUALITY[condition],
            "material_quality": float(np.clip(CONDITION_QUALITY[condition] - damage * 0.4 + rng.normal(0, 0.08), 0, 1)),
            "is_blend": float(rng.random() < 0.32),
            "compostable": float(impact["compostable"]),
        }
        X.append([row[f] for f in WASTE_FEATURES])
        y.append(label_waste_category(row))
    return np.array(X, dtype=np.float32), np.array(y)


# ------------------------------------------------------------------- training

def train(images: Path | None = None, out_dir: Path | None = None) -> dict:
    out_dir = out_dir or Path(settings.model_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    Xm, ym = corpus_from_images(images) if images else synthesise_material_corpus()
    Xm_tr, Xm_te, ym_tr, ym_te = train_test_split(Xm, ym, test_size=0.2, stratify=ym, random_state=42)
    material_model = Pipeline([
        ("scale", StandardScaler()),
        # min_samples_leaf=2 grew a 94 MB forest that took 1.4s to load for no
        # accuracy gain; leaf pruning keeps it small enough to commit and warm fast.
        ("clf", RandomForestClassifier(n_estimators=200, min_samples_leaf=12,
                                       class_weight="balanced", n_jobs=-1, random_state=42)),
    ]).fit(Xm_tr, ym_tr)
    material_acc = accuracy_score(ym_te, material_model.predict(Xm_te))

    # XGBoost on the tabular waste features: fast, handles the mixed continuous /
    # binary columns well, and exposes feature importances for the admin screen.
    Xw, yw = synthesise_waste_corpus()
    encoder = LabelEncoder().fit(yw)
    Xw_tr, Xw_te, yw_tr, yw_te = train_test_split(Xw, encoder.transform(yw), test_size=0.2,
                                                  stratify=yw, random_state=42)
    waste_model = XGBClassifier(
        n_estimators=300, max_depth=4, learning_rate=0.09, subsample=0.9,
        colsample_bytree=0.9, objective="multi:softprob",
        num_class=len(encoder.classes_), tree_method="hist",
        eval_metric="mlogloss", random_state=42,
    ).fit(Xw_tr, yw_tr)
    waste_acc = accuracy_score(yw_te, waste_model.predict(Xw_te))

    joblib.dump({"model": material_model, "features": FEATURE_NAMES,
                 "classes": list(material_model.classes_)}, out_dir / "material_classifier.joblib")
    joblib.dump({"model": waste_model, "features": WASTE_FEATURES,
                 "classes": list(encoder.classes_),
                 "importances": dict(zip(WASTE_FEATURES,
                                         [float(v) for v in waste_model.feature_importances_]))},
                out_dir / "waste_classifier.joblib")

    metrics = {
        "material_holdout_accuracy": round(float(material_acc), 4),
        "material_samples": int(len(Xm)),
        "material_source": str(images) if images else "synthetic bootstrap corpus",
        "waste_holdout_accuracy": round(float(waste_acc), 4),
        "waste_samples": int(len(Xw)),
        "waste_note": ("The waste model is a surrogate of a deterministic expert rule, so a "
                       "near-perfect holdout score confirms it reproduces the rule faithfully "
                       "— it is not evidence of real-world accuracy. Retrain on labelled "
                       "batches once the facility has them."),
        "material_report": classification_report(ym_te, material_model.predict(Xm_te), output_dict=True),
        "material_algorithm": "RandomForestClassifier (scikit-learn)",
        "waste_algorithm": "XGBClassifier (XGBoost)",
        "waste_feature_importance": dict(sorted(
            zip(WASTE_FEATURES, [round(float(v), 4) for v in waste_model.feature_importances_]),
            key=lambda kv: -kv[1])),
    }
    (out_dir / "metrics.json").write_text(json.dumps(metrics, indent=2))
    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the textile waste models")
    parser.add_argument("--images", type=Path, default=None,
                        help="Folder of <material>/*.jpg sub-folders to train on instead")
    args = parser.parse_args()
    result = train(args.images)
    print(f"Material accuracy : {result['material_holdout_accuracy']:.3f} "
          f"({result['material_samples']} samples, {result['material_source']})")
    print(f"Waste accuracy    : {result['waste_holdout_accuracy']:.3f} "
          f"({result['waste_samples']} samples)")
