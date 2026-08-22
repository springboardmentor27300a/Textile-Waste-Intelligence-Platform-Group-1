import numpy as np
import cv2

from app.vision import analyze_image


def _encode(img):
    _, buf = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return buf.tobytes()


def _make_clean_shirt(seed=1, color=(180, 150, 110), with_dark_background=False):
    np.random.seed(seed)
    h, w = 400, 400
    img = np.zeros((h, w, 3), dtype=np.float32)
    if with_dark_background:
        pass  # stays black outside the garment mask
    else:
        bg = np.tile(np.array([60, 90, 130], dtype=np.float32), (h, w, 1)) + np.random.normal(0, 10, (h, w, 1))
        img[:, :] = bg
    mask = np.zeros((h, w), dtype=np.uint8)
    cv2.rectangle(mask, (30, 30), (370, 370), 255, -1)
    shirt = np.tile(np.array(color, dtype=np.float32), (h, w, 1)) + np.random.normal(0, 10, (h, w, 1))
    for cx, cy, ang in [(120, 120, 15), (260, 260, -10), (160, 320, 25)]:
        cv2.ellipse(shirt.astype(np.uint8), (cx, cy), (80, 16), ang, 0, 360, (-35, -35, -35), -1)
    img[mask == 255] = shirt[mask == 255]
    return np.clip(img, 0, 255).astype(np.uint8)


def test_clean_shirt_scores_zero_contamination():
    """Regression test: a plain colored garment with ordinary wrinkles must
    not be flagged as contaminated."""
    img = _make_clean_shirt()
    result = analyze_image(_encode(img))
    assert result.contamination_score == 0.0


def test_clean_shirt_with_dark_background_scores_zero_contamination():
    """Regression test for the real bug found during development: a plain
    dark background behind the garment must NOT be mistaken for a stain."""
    img = _make_clean_shirt(with_dark_background=True)
    result = analyze_image(_encode(img))
    assert result.contamination_score == 0.0


def test_clean_shirt_scores_zero_damage():
    img = _make_clean_shirt()
    result = analyze_image(_encode(img))
    assert result.damage_score == 0.0


def test_real_stain_is_detected():
    img = _make_clean_shirt(seed=2)
    cv2.circle(img, (150, 150), 60, (12, 12, 35), -1)  # large, real, dark stain
    result = analyze_image(_encode(img))
    assert result.contamination_score > 0.15


def test_noisy_image_has_higher_texture_than_smooth_image():
    smooth = np.full((300, 300, 3), (150, 130, 110), dtype=np.uint8)
    np.random.seed(5)
    noisy = (np.full((300, 300, 3), 150, dtype=np.float32) + np.random.normal(0, 40, (300, 300, 3))).clip(0, 255).astype(np.uint8)

    smooth_result = analyze_image(_encode(smooth))
    noisy_result = analyze_image(_encode(noisy))
    assert noisy_result.texture_score > smooth_result.texture_score


def test_dominant_color_is_a_valid_hex_string():
    img = _make_clean_shirt()
    result = analyze_image(_encode(img))
    assert result.dominant_color_hex.startswith("#")
    assert len(result.dominant_color_hex) == 7


def test_all_scores_within_valid_range():
    img = _make_clean_shirt()
    result = analyze_image(_encode(img))
    for score in [result.brightness, result.texture_score, result.contamination_score, result.damage_score]:
        assert 0.0 <= score <= 1.0
