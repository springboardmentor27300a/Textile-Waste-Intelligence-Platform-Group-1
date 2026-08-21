"""Textile image analysis engine.

Turns a raw photograph of a textile batch into an interpretable feature vector.
Every feature here is a real measurement on the pixels, so the same code path
serves both training and inference.
"""
from __future__ import annotations

import numpy as np
import cv2
from skimage.feature import graycomatrix, graycoprops, local_binary_pattern

FEATURE_NAMES = [
    "lightness", "chroma_a", "chroma_b", "lightness_std",
    "saturation", "saturation_std", "colour_entropy",
    "edge_density", "gradient_mean", "gradient_std",
    "glcm_contrast", "glcm_homogeneity", "glcm_energy", "glcm_correlation",
    "lbp_uniformity", "lbp_edge_ratio", "lbp_flat_ratio",
    "fft_periodicity", "diagonal_bias", "highfreq_ratio",
    "specular_ratio", "damage_score", "contamination_score",
]

TARGET_SIZE = 384


def _prepare(image_bgr: np.ndarray) -> np.ndarray:
    h, w = image_bgr.shape[:2]
    scale = TARGET_SIZE / max(h, w)
    if scale < 1:
        image_bgr = cv2.resize(image_bgr, (int(w * scale), int(h * scale)),
                               interpolation=cv2.INTER_AREA)
    return image_bgr


def _colour_entropy(hsv: np.ndarray) -> float:
    hist = cv2.calcHist([hsv], [0], None, [32], [0, 180]).ravel()
    p = hist / max(hist.sum(), 1e-6)
    p = p[p > 0]
    return float(-(p * np.log2(p)).sum() / 5.0)


def _texture(gray: np.ndarray) -> dict:
    q = (gray // 8).astype(np.uint8)  # 32 grey levels
    glcm = graycomatrix(q, distances=[1, 3],
                        angles=[0, np.pi / 4, np.pi / 2, 3 * np.pi / 4],
                        levels=32, symmetric=True, normed=True)
    props = {p: float(graycoprops(glcm, p).mean()) for p in
             ("contrast", "homogeneity", "energy", "correlation")}
    props["contrast"] = min(props["contrast"] / 50.0, 1.0)

    lbp = local_binary_pattern(gray, P=8, R=1, method="uniform")
    hist, _ = np.histogram(lbp, bins=10, range=(0, 10), density=True)
    props["lbp_uniformity"] = float(hist[:2].sum())
    props["lbp_edge_ratio"] = float(hist[3:7].sum())
    props["lbp_flat_ratio"] = float(hist[9])
    return props


def _periodicity(gray: np.ndarray) -> tuple[float, float]:
    """Weave and print regularity, measured in the frequency domain."""
    g = gray.astype(np.float32) / 255.0
    g = g - g.mean()
    win = np.outer(np.hanning(g.shape[0]), np.hanning(g.shape[1]))
    spec = np.abs(np.fft.fftshift(np.fft.fft2(g * win)))
    cy, cx = np.array(spec.shape) // 2
    spec[cy - 2:cy + 3, cx - 2:cx + 3] = 0
    total = spec.sum() + 1e-6

    periodicity = float(np.clip(spec.max() / (spec.mean() * spec.size / 400.0 + 1e-6), 0, 1))

    yy, xx = np.mgrid[0:spec.shape[0], 0:spec.shape[1]]
    radius = np.hypot(yy - cy, xx - cx)
    highfreq = float(spec[radius > min(cy, cx) * 0.45].sum() / total)

    return periodicity, highfreq



def _diagonal_bias(gray: np.ndarray) -> float:
    """Twill detection via the structure tensor.

    A twill's gradients all point one way, at roughly 45 degrees to the selvedge.
    Measuring orientation in the spatial domain avoids the axis-aligned leakage
    that the FFT window introduces, which otherwise buries the signal.
    """
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    jxx, jyy, jxy = float((gx * gx).mean()), float((gy * gy).mean()), float((gx * gy).mean())

    trace = jxx + jyy
    if trace < 1e-6:
        return 0.0
    coherence = float(np.hypot(jxx - jyy, 2 * jxy) / trace)  # 0 isotropic, 1 single direction
    orientation = 0.5 * np.arctan2(2 * jxy, jxx - jyy)
    alignment = float(abs(np.sin(2 * orientation)))          # 1 on a diagonal, 0 on warp/weft
    return float(np.clip(coherence * alignment * 1.6, 0, 1))


def _damage(gray: np.ndarray) -> float:
    """Holes, tears and worn patches read as dark, sharply bounded blobs."""
    blur = cv2.GaussianBlur(gray, (7, 7), 0)
    thresh = max(int(np.percentile(blur, 2)), 12)
    dark = (blur < thresh).astype(np.uint8)
    dark = cv2.morphologyEx(dark, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    _, _, stats, _ = cv2.connectedComponentsWithStats(dark, 8)
    area = gray.size
    blobs = sum(s[cv2.CC_STAT_AREA] for s in stats[1:] if s[cv2.CC_STAT_AREA] > area * 0.0008)
    return float(np.clip(blobs / area * 12.0, 0, 1))


def _contamination(image_bgr: np.ndarray, hsv: np.ndarray) -> float:
    """Foreign matter: pixels far from the batch's own colour cluster."""
    lab = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2LAB).reshape(-1, 3).astype(np.float32)
    idx = np.random.default_rng(0).choice(len(lab), size=min(4000, len(lab)), replace=False)
    sample = lab[idx]
    centre = np.median(sample, axis=0)
    dist = np.linalg.norm(sample - centre, axis=1)
    cutoff = np.percentile(dist, 75) * 2.2 + 10
    outliers = float((dist > cutoff).mean())
    stains = float(((hsv[..., 1] < 40) & (hsv[..., 2] < 70)).mean())
    return float(np.clip(outliers * 2.5 + stains * 0.6, 0, 1))


def _specular(gray: np.ndarray) -> float:
    """Sheen — silk and smooth synthetics throw bright highlights."""
    bright = (gray > np.percentile(gray, 99.0)).mean()
    return float(np.clip(bright * 40.0 * (gray.std() / 60.0 + 0.5), 0, 1))


def extract_features(image_bgr: np.ndarray) -> dict[str, float]:
    image_bgr = _prepare(image_bgr)
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2HSV)
    lab = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2LAB)

    tex = _texture(gray)
    periodicity, highfreq = _periodicity(gray)
    diagonal_bias = _diagonal_bias(gray)
    edges = cv2.Canny(gray, 60, 160)
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    mag = np.hypot(gx, gy)

    return {
        "lightness": float(lab[..., 0].mean() / 255.0),
        "chroma_a": float((lab[..., 1].mean() - 128) / 128.0),
        "chroma_b": float((lab[..., 2].mean() - 128) / 128.0),
        "lightness_std": float(lab[..., 0].std() / 128.0),
        "saturation": float(hsv[..., 1].mean() / 255.0),
        "saturation_std": float(hsv[..., 1].std() / 128.0),
        "colour_entropy": float(np.clip(_colour_entropy(hsv), 0, 1)),
        "edge_density": float(edges.mean() / 255.0),
        "gradient_mean": float(np.clip(mag.mean() / 80.0, 0, 1)),
        "gradient_std": float(np.clip(mag.std() / 80.0, 0, 1)),
        "glcm_contrast": tex["contrast"],
        "glcm_homogeneity": tex["homogeneity"],
        "glcm_energy": tex["energy"],
        "glcm_correlation": float(np.clip(tex["correlation"], 0, 1)),
        "lbp_uniformity": tex["lbp_uniformity"],
        "lbp_edge_ratio": tex["lbp_edge_ratio"],
        "lbp_flat_ratio": tex["lbp_flat_ratio"],
        "fft_periodicity": periodicity,
        "diagonal_bias": diagonal_bias,
        "highfreq_ratio": float(np.clip(highfreq * 3.0, 0, 1)),
        "specular_ratio": _specular(gray),
        "damage_score": _damage(gray),
        "contamination_score": _contamination(image_bgr, hsv),
    }


def to_vector(features: dict[str, float]) -> np.ndarray:
    return np.array([features[name] for name in FEATURE_NAMES], dtype=np.float32)


# ---------------------------------------------------------------- descriptors

def describe_colour(features: dict[str, float]) -> str:
    l, a, b, s = (features["lightness"], features["chroma_a"],
                  features["chroma_b"], features["saturation"])
    if s < 0.12:
        return "White / off-white" if l > 0.72 else "Black / charcoal" if l < 0.25 else "Grey"
    if b < -0.08:
        return "Blue / indigo"
    if a > 0.10:
        return "Red / warm" if b > 0.05 else "Pink / magenta"
    if b > 0.12:
        return "Yellow / ochre" if a > -0.02 else "Green / olive"
    return "Muted / mixed"


def describe_texture(features: dict[str, float]) -> str:
    c, h = features["glcm_contrast"], features["glcm_homogeneity"]
    if features["specular_ratio"] > 0.45 and c < 0.25:
        return "Smooth / lustrous"
    if c > 0.45:
        return "Coarse / napped"
    if h > 0.75:
        return "Fine / tightly woven"
    return "Medium weave"


def describe_pattern(features: dict[str, float]) -> str:
    if features["diagonal_bias"] > 0.55:
        return "Twill / diagonal"
    if features["fft_periodicity"] > 0.55:
        return "Repeating print or check"
    if features["colour_entropy"] > 0.65:
        return "Multi-colour / mixed print"
    return "Solid"
