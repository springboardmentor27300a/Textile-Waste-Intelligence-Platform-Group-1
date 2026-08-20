"""
Textile Image Analysis Engine
==============================

Turns an arbitrary uploaded textile photo into a compact set of numeric
"visual features" using only PIL + NumPy:

  - Color analysis     -> dominant color, brightness, saturation, color spread
  - Texture analysis    -> local roughness (weave/knit texture proxy)
  - Pattern analysis    -> edge density + directional regularity
  - Damage detection    -> irregular high-variance patches (proxy for
                           fraying/tears/holes)
  - Contamination detection -> dark-spot / stain ratio and color-uniformity
                           outliers

These features feed both the Material Classification Engine and the Waste
Classification Engine.
"""

from __future__ import annotations

import io
import numpy as np
from PIL import Image

FEATURE_IMAGE_SIZE = (128, 128)


def load_image_from_bytes(image_bytes: bytes) -> Image.Image:
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert("RGB")
    return img


def _to_array(img: Image.Image, size=FEATURE_IMAGE_SIZE) -> np.ndarray:
    resized = img.resize(size, Image.BILINEAR)
    return np.asarray(resized).astype(np.float64)  # H x W x 3


def _grayscale(rgb: np.ndarray) -> np.ndarray:
    # ITU-R BT.601 luma
    return rgb[..., 0] * 0.299 + rgb[..., 1] * 0.587 + rgb[..., 2] * 0.114


def _sobel_like_gradients(gray: np.ndarray):
    """Simple gradient magnitude/direction without scipy, via np.diff."""
    gx = np.zeros_like(gray)
    gy = np.zeros_like(gray)
    gx[:, 1:-1] = gray[:, 2:] - gray[:, :-2]
    gy[1:-1, :] = gray[2:, :] - gray[:-2, :]
    magnitude = np.sqrt(gx**2 + gy**2)
    return gx, gy, magnitude


def _local_variance_map(gray: np.ndarray, block: int = 8) -> np.ndarray:
    h, w = gray.shape
    h_trim = h - (h % block)
    w_trim = w - (w % block)
    trimmed = gray[:h_trim, :w_trim]
    blocks = trimmed.reshape(h_trim // block, block, w_trim // block, block)
    blocks = blocks.transpose(0, 2, 1, 3).reshape(-1, block * block)
    return blocks.std(axis=1)


def extract_features(img: Image.Image) -> dict:
    rgb = _to_array(img)
    gray = _grayscale(rgb)

    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]

    # ---- Color analysis ----
    mean_r, mean_g, mean_b = float(r.mean()), float(g.mean()), float(b.mean())
    brightness = float(gray.mean()) / 255.0
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    saturation = float(((max_c - min_c) / (max_c + 1e-6)).mean())
    color_std = float(rgb.std(axis=(0, 1)).mean()) / 255.0

    # ---- Texture analysis ----
    local_var = _local_variance_map(gray, block=8)
    texture_roughness = float(local_var.mean()) / 128.0  # normalized ~0-1
    texture_uniformity = float(1.0 / (1.0 + local_var.std() / 10.0))

    # ---- Pattern analysis ----
    gx, gy, magnitude = _sobel_like_gradients(gray)
    edge_density = float((magnitude > (magnitude.mean() + magnitude.std())).mean())
    # Directional regularity: ratio of horizontal vs vertical gradient energy.
    # Very close to 1.0 => regular woven grid pattern; far from 1.0 => irregular knit/print.
    h_energy = float((gx**2).sum())
    v_energy = float((gy**2).sum())
    directional_ratio = h_energy / (v_energy + 1e-6)
    pattern_regularity = float(1.0 / (1.0 + abs(np.log(directional_ratio + 1e-6))))

    # ---- Damage detection proxy ----
    # Damage (frays, holes, tears) shows up as sharp, isolated high-variance
    # patches well above the garment's average local texture.
    var_threshold = local_var.mean() + 1.5 * local_var.std()
    damage_ratio = float((local_var > var_threshold).mean())
    damage_score = float(min(1.0, damage_ratio * 3.0))

    # ---- Contamination detection proxy ----
    # Stains/contamination show up as dark, low-saturation patches that
    # deviate from the garment's dominant color.
    dark_mask = gray < (gray.mean() - 1.2 * gray.std())
    contamination_ratio = float(dark_mask.mean())
    contamination_score = float(min(1.0, contamination_ratio * 2.5))

    return {
        "mean_color_rgb": [round(mean_r, 1), round(mean_g, 1), round(mean_b, 1)],
        "brightness": round(brightness, 4),
        "saturation": round(saturation, 4),
        "color_std": round(color_std, 4),
        "texture_roughness": round(texture_roughness, 4),
        "texture_uniformity": round(texture_uniformity, 4),
        "edge_density": round(edge_density, 4),
        "pattern_regularity": round(pattern_regularity, 4),
        "damage_score": round(damage_score, 4),
        "contamination_score": round(contamination_score, 4),
    }


def feature_vector(features: dict) -> np.ndarray:
    """Order-stable numeric vector used for nearest-centroid distance calcs."""
    return np.array([
        features["brightness"],
        features["saturation"],
        features["color_std"],
        features["texture_roughness"],
        features["texture_uniformity"],
        features["edge_density"],
        features["pattern_regularity"],
    ], dtype=np.float64)
