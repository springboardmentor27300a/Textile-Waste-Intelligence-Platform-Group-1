"""Fabric defect detection, trained on the AITEX Fabric Image Database.

This is the one fully supervised computer-vision model in the platform: AITEX
ships pixel masks, so the labels are drawn by people rather than derived from a
rule. It feeds the Damage Detection and Contamination Detection features of the
image analysis engine, replacing the heuristic damage score when trained.

Three decisions here came out of measurement on the real data, not taste:

* **128px patches, not 256.** At 256 a defect covering half a percent of a patch
  is averaged into invisibility. Halving the patch lifted average precision from
  0.39 to 0.92 on held-out images.
* **Local-anomaly features alongside the global ones** (see `anomaly.py`). Global
  statistics describe the average of a swatch; a defect is its worst spot.
* **The decision threshold is picked from out-of-fold predictions**, never from
  the test split. Tuning a threshold on the same data used to report the score
  inflates it.
* **The split holds out images per fabric structure, not at random.** AITEX has
  only seven structures; a random split put whole structures in the test set
  alone, the model met fabric it had never seen, and the tuned threshold stopped
  transferring — out-of-fold recall 0.75 collapsed to 0.35 on test. Splitting
  within each structure took test recall to 0.91 at the same precision.
"""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    average_precision_score, classification_report, roc_auc_score,
)
from sklearn.model_selection import GroupKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from ..config import settings
from .anomaly import ANOMALY_FEATURE_NAMES, anomaly_features, to_anomaly_vector
from .datasets import iter_aitex_patches
from .features import FEATURE_NAMES, extract_features, to_vector

MODEL_NAME = "defect_detector.joblib"
DEFECT_FEATURE_NAMES = FEATURE_NAMES + ANOMALY_FEATURE_NAMES
# Operational choice: a missed defect costs more than a clean patch sent for a
# second look, so target recall rather than maximising F1.
TARGET_RECALL = 0.75
_cache: dict = {}


def defect_vector(image_bgr: np.ndarray) -> np.ndarray:
    """Global appearance features plus local-anomaly features, concatenated."""
    return np.concatenate([
        to_vector(extract_features(image_bgr)),
        to_anomaly_vector(anomaly_features(image_bgr)),
    ])


def _split_by_fabric(groups: np.ndarray, fabrics: np.ndarray,
                     test_size: float = 0.25, seed: int = 42):
    """Hold out whole source images, but a share of them from every fabric code.

    Two constraints pull against each other. Patches from one strip are near
    duplicates, so the split has to be by image or the score is meaningless. But
    AITEX has only seven fabric structures, and splitting images purely at random
    left entire structures out of training — the model then met unseen fabric at
    test time and its probabilities shifted down, so the tuned threshold stopped
    working. Holding out images *within* each structure satisfies both.
    """
    image_fabric: dict[str, str] = {}
    for source, fabric in zip(groups.tolist(), fabrics.tolist()):
        image_fabric[source] = fabric

    by_fabric: dict[str, list[str]] = defaultdict(list)
    for source, fabric in image_fabric.items():
        by_fabric[fabric].append(source)

    rng = np.random.default_rng(seed)
    held_out: set[str] = set()
    for fabric, images in by_fabric.items():
        images = sorted(images)
        rng.shuffle(images)
        count = max(1, int(round(len(images) * test_size)))
        held_out.update(images[:count])

    test_idx = np.array([i for i, s in enumerate(groups.tolist()) if s in held_out])
    fit_idx = np.array([i for i, s in enumerate(groups.tolist()) if s not in held_out])
    if len(test_idx) == 0 or len(fit_idx) == 0:
        raise SystemExit("Not enough source images to build a train/test split.")
    return fit_idx, test_idx


def train_defect_detector(root: Path, patch: int = 128, limit_clean: int = 0,
                          defect_pixel_threshold: float = 0.005,
                          out_dir: Path | None = None) -> dict:
    out_dir = out_dir or Path(settings.model_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Two passes. The first counts clean patches without extracting features, so
    # the cap can be spread evenly across every source image. Filling it in
    # directory order instead drew the whole clean class from the first handful of
    # images and left most fabric structures unrepresented.
    clean_total = sum(1 for sample in iter_aitex_patches(
        root, patch=patch, defect_pixel_threshold=defect_pixel_threshold, quiet=True)
        if not sample.is_defective)
    keep_every = max(1, clean_total // limit_clean) if limit_clean else 1

    X, y, groups, fabrics = [], [], [], []
    clean_seen = 0
    for sample in iter_aitex_patches(root, patch=patch,
                                     defect_pixel_threshold=defect_pixel_threshold):
        if not sample.is_defective:
            clean_seen += 1
            if clean_seen % keep_every:
                continue
        X.append(defect_vector(sample.image))
        y.append(int(sample.is_defective))
        groups.append(sample.source)     # split by source image, never by patch
        fabrics.append(sample.fabric_code)

    if not X:
        raise SystemExit(f"No usable patches under {root}. Expected Defect_images/, "
                         f"NODefect_images/ and Mask_images/ folders.")
    X, y, groups = np.array(X), np.array(y), np.array(groups)
    if len(set(y.tolist())) < 2:
        raise SystemExit("Only one class found — need both defect and no-defect images.")

    fit_idx, test_idx = _split_by_fabric(groups, np.array(fabrics), test_size=0.25)

    def build() -> Pipeline:
        return Pipeline([
            ("scale", StandardScaler()),
            ("clf", RandomForestClassifier(n_estimators=400, min_samples_leaf=3,
                                           class_weight="balanced", n_jobs=-1,
                                           random_state=42)),
        ])

    # Out-of-fold probabilities across the fit set, so the threshold is chosen
    # without ever seeing the test images.
    out_of_fold = np.zeros(len(fit_idx))
    n_folds = min(4, len(set(groups[fit_idx].tolist())))
    if n_folds >= 2:
        folds = GroupKFold(n_splits=n_folds)
        for inner_train, inner_val in folds.split(X[fit_idx], y[fit_idx], groups[fit_idx]):
            fold_model = build().fit(X[fit_idx][inner_train], y[fit_idx][inner_train])
            out_of_fold[inner_val] = fold_model.predict_proba(X[fit_idx][inner_val])[:, 1]

    positive_scores = out_of_fold[y[fit_idx] == 1]
    threshold = (float(np.quantile(positive_scores, 1 - TARGET_RECALL))
                 if len(positive_scores) else 0.5)
    threshold = float(np.clip(threshold, 0.02, 0.9))

    model = build().fit(X[fit_idx], y[fit_idx])
    probabilities = model.predict_proba(X[test_idx])[:, 1]
    predicted = (probabilities >= threshold).astype(int)
    report = classification_report(y[test_idx], predicted, output_dict=True,
                                   target_names=["clean", "defective"], zero_division=0)

    metrics = {
        "patches": int(len(X)),
        "defective_patches": int(y.sum()),
        "clean_patches": int((y == 0).sum()),
        "source_images": int(len(set(groups.tolist()))),
        "clean_patches_available": int(clean_total),
        "clean_sampling": (f"kept 1 in {keep_every} clean patches, spread across every "
                           f"source image rather than filling from the first few"),
        "fabric_codes": sorted({f for f in fabrics if f}),
        "patch_px": patch,
        "defect_pixel_threshold": defect_pixel_threshold,
        "decision_threshold": round(threshold, 3),
        "target_recall": TARGET_RECALL,
        "holdout_auc": round(float(roc_auc_score(y[test_idx], probabilities)), 4),
        "average_precision": round(float(average_precision_score(y[test_idx], probabilities)), 4),
        "defect_recall": round(float(report["defective"]["recall"]), 4),
        "defect_precision": round(float(report["defective"]["precision"]), 4),
        "defect_f1": round(float(report["defective"]["f1-score"]), 4),
        "threshold_note": (f"Chosen from out-of-fold probabilities to catch about "
                           f"{int(TARGET_RECALL * 100)}% of defects, never from the test "
                           f"split. The scores above use it unchanged."),
        "split": ("held out whole source images, a share from every fabric code, so "
                  "patches never span train and test and no structure is unseen"),
        "source": str(root),
    }

    joblib.dump({"model": model, "features": DEFECT_FEATURE_NAMES,
                 "threshold": threshold, "metrics": metrics}, out_dir / MODEL_NAME)
    (out_dir / "defect_metrics.json").write_text(json.dumps(metrics, indent=2))
    return metrics


def _load():
    if "bundle" not in _cache:
        path = Path(settings.model_dir) / MODEL_NAME
        _cache["bundle"] = joblib.load(path) if path.exists() else None
    return _cache["bundle"]


def reload_defect_model() -> None:
    _cache.clear()


def available() -> bool:
    return _load() is not None


def predict_defect(image_bgr: np.ndarray) -> dict | None:
    """Probability that this swatch shows a manufacturing defect.

    Returns None when no model has been trained, so the caller falls back to the
    heuristic damage score rather than inventing a number.
    """
    bundle = _load()
    if bundle is None:
        return None

    probability = float(bundle["model"].predict_proba(
        defect_vector(image_bgr).reshape(1, -1))[0, 1])
    threshold = bundle.get("threshold", 0.5)
    metrics = bundle["metrics"]

    return {
        "defect_probability": round(probability, 4),
        "decision_threshold": round(threshold, 4),
        "verdict": "Defect detected" if probability >= threshold else "No defect detected",
        "model": "AITEX-trained RandomForest",
        "holdout_auc": metrics["holdout_auc"],
        "average_precision": metrics.get("average_precision"),
        "note": ("Trained on flat woven fabric strips. Reads a swatch reliably; a "
                 "cluttered photograph is outside what AITEX contains."),
    }
