"""
Textile image analysis engine (Milestone 2).

Every number here is computed directly from the pixels of the uploaded
image using OpenCV. Contamination and damage detection use LOCAL/BLOCK-based
comparison (not a single global threshold) - this was recalibrated after
testing found that a naive global-threshold approach falsely flagged plain
dark backgrounds and ordinary fabric wrinkles as "contamination"/"damage".
"""
import io
from dataclasses import dataclass

import cv2
import numpy as np
from PIL import Image


@dataclass
class ImageFeatures:
    dominant_color_hex: str
    brightness: float
    texture_score: float
    contamination_score: float
    damage_score: float
    twill_score: float = 0.0
    hue_median: float = 0.0
    saturation_median: float = 0.0
    sheen_score: float = 0.0
    color_std: float = 0.0


def _load_image(image_bytes: bytes, max_dim: int = 512) -> np.ndarray:
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    pil_img.thumbnail((max_dim, max_dim))
    return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)


def _center_crop(img_bgr: np.ndarray, fraction: float = 0.80) -> np.ndarray:
    h, w = img_bgr.shape[:2]
    ch, cw = int(h * fraction), int(w * fraction)
    y0, x0 = (h - ch) // 2, (w - cw) // 2
    return img_bgr[y0:y0 + ch, x0:x0 + cw]


def _get_foreground_mask(img_bgr: np.ndarray) -> np.ndarray:
    """Isolate fabric foreground from white/light studio background."""
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    
    # Exclude near-white studio background (S < 25 and V > 210)
    is_bg = (hsv[:, :, 1] < 25) & (hsv[:, :, 2] > 210)
    mask = (~is_bg).astype(np.uint8) * 255
    
    # Morphological cleanup
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    
    if np.count_nonzero(mask) < (img_bgr.shape[0] * img_bgr.shape[1] * 0.10):
        h, w = gray.shape
        mask = np.zeros((h, w), dtype=np.uint8)
        mask[int(h * 0.10):int(h * 0.90), int(w * 0.10):int(w * 0.90)] = 255
    return mask


def _dominant_color(img_bgr: np.ndarray, mask: np.ndarray, k: int = 3) -> str:
    if mask is not None and np.count_nonzero(mask) > 100:
        pixels = img_bgr[mask > 0].reshape(-1, 3).astype(np.float32)
    else:
        pixels = img_bgr.reshape(-1, 3).astype(np.float32)
    if len(pixels) == 0:
        return "#466eb4"
    if pixels.shape[0] > 20000:
        idx = np.random.choice(pixels.shape[0], 20000, replace=False)
        pixels = pixels[idx]
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 15, 1.0)
    _, labels, centers = cv2.kmeans(pixels, min(k, len(pixels)), None, criteria, 3, cv2.KMEANS_PP_CENTERS)
    counts = np.bincount(labels.flatten())
    dominant = centers[np.argmax(counts)]
    b, g, r = [int(max(0, min(255, v))) for v in dominant]
    return f"#{r:02x}{g:02x}{b:02x}"


def _brightness(img_bgr: np.ndarray, mask: np.ndarray) -> float:
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    fg = gray[mask > 0] if np.count_nonzero(mask) > 0 else gray
    return round(float(np.mean(fg)) / 255.0, 4)


def _texture_score(img_bgr: np.ndarray, mask: np.ndarray) -> float:
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 140)
    fg_edges = cv2.bitwise_and(edges, edges, mask=mask)
    total_fg = np.count_nonzero(mask) or edges.size
    density = float(np.count_nonzero(fg_edges)) / float(total_fg)
    return round(min(density / 0.25, 1.0), 4)


def _twill_score(img_bgr: np.ndarray, mask: np.ndarray) -> float:
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    
    g_diag1 = np.abs(gx + gy)
    g_diag2 = np.abs(gx - gy)
    g_horiz_vert = np.abs(gx) + np.abs(gy) + 1e-5
    
    diag_ratio = (g_diag1 + g_diag2) / (2.0 * g_horiz_vert)
    fg_ratio = diag_ratio[mask > 0] if np.count_nonzero(mask) > 0 else diag_ratio
    twill_val = float(np.mean(fg_ratio))
    return round(min(max((twill_val - 0.5) / 0.5, 0.0), 1.0), 4)


def _sheen_score(img_bgr: np.ndarray, mask: np.ndarray) -> float:
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    fg = gray[mask > 0] if np.count_nonzero(mask) > 0 else gray
    p95 = np.percentile(fg, 95)
    mean_val = np.mean(fg)
    if mean_val == 0:
        return 0.0
    ratio = (p95 - mean_val) / mean_val
    return round(min(max(ratio / 1.5, 0.0), 1.0), 4)


def _hsv_stats(img_bgr: np.ndarray, mask: np.ndarray) -> tuple[float, float]:
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    fg_hsv = hsv[mask > 0] if np.count_nonzero(mask) > 0 else hsv.reshape(-1, 3)
    hue_med = float(np.median(fg_hsv[:, 0]))
    sat_med = float(np.median(fg_hsv[:, 1]))
    return round(hue_med, 2), round(sat_med, 2)


def _color_std(img_bgr: np.ndarray, mask: np.ndarray) -> float:
    fg_pixels = img_bgr[mask > 0] if np.count_nonzero(mask) > 0 else img_bgr.reshape(-1, 3)
    if len(fg_pixels) == 0:
        return 0.0
    return round(float(np.mean(np.std(fg_pixels, axis=0))), 2)


def _contamination_score(img_bgr: np.ndarray) -> float:
    cropped = _center_crop(img_bgr)
    hsv = cv2.cvtColor(cropped, cv2.COLOR_BGR2HSV)
    h, w = hsv.shape[:2]
    grid_n = 10
    bh, bw = h // grid_n, w // grid_n
    if bh < 2 or bw < 2:
        return 0.0

    v_medians = np.zeros((grid_n, grid_n))
    for i in range(grid_n):
        for j in range(grid_n):
            block = hsv[i * bh:(i + 1) * bh, j * bw:(j + 1) * bw]
            v_medians[i, j] = np.median(block[:, :, 2])

    typical_v = np.median(v_medians)
    anomalous = v_medians < typical_v - 30

    if not anomalous.any():
        return 0.0

    anomalous_u8 = anomalous.astype(np.uint8)
    num_labels, _, stats, _ = cv2.connectedComponentsWithStats(anomalous_u8, connectivity=8)
    if num_labels <= 1:
        return 0.0
    largest_cluster = int(np.max(stats[1:, cv2.CC_STAT_AREA]))
    ratio = largest_cluster / (grid_n * grid_n)
    return round(min(ratio / 0.20, 1.0), 4)


def _damage_score(img_bgr: np.ndarray, mask: np.ndarray = None) -> float:
    cropped = _center_crop(img_bgr)
    gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (15, 15), 0)
    edges = cv2.Canny(blurred, 55, 145)
    if mask is not None and mask.size > 0:
        c_mask = _center_crop(mask)
        if c_mask.shape == edges.shape:
            edges = cv2.bitwise_and(edges, edges, mask=c_mask)
    edges = cv2.dilate(edges, np.ones((3, 3), np.uint8), iterations=1)
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return 0.0

    crop_area = gray.shape[0] * gray.shape[1]
    min_area = crop_area * 0.012 # Ignore small wrinkles & buttons

    jagged_count = 0
    for c in contours:
        area = cv2.contourArea(c)
        if area < min_area:
            continue
        hull = cv2.convexHull(c)
        hull_area = cv2.contourArea(hull)
        if hull_area == 0:
            continue
        solidity = area / hull_area
        if solidity < 0.35: # True jagged tears / heavy fraying
            jagged_count += 1

    return round(min(jagged_count / 3.0, 1.0), 4)


def analyze_image(image_bytes: bytes) -> ImageFeatures:
    img = _load_image(image_bytes)
    mask = _get_foreground_mask(img)
    h_med, s_med = _hsv_stats(img, mask)
    return ImageFeatures(
        dominant_color_hex=_dominant_color(img, mask),
        brightness=_brightness(img, mask),
        texture_score=_texture_score(img, mask),
        contamination_score=_contamination_score(img),
        damage_score=_damage_score(img, mask),
        twill_score=_twill_score(img, mask),
        hue_median=h_med,
        saturation_median=s_med,
        sheen_score=_sheen_score(img, mask),
        color_std=_color_std(img, mask),
    )


