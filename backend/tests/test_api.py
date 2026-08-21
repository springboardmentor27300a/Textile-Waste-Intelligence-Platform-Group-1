"""End-to-end API tests. Run with `pytest` from the backend folder."""
import os
import tempfile

import pytest
from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = f"sqlite:///{tempfile.mkdtemp()}/test.db"

from app.main import app  # noqa: E402

client = TestClient(app)
CREDENTIALS = {"username": "pytest@twip.dev", "password": "textile2026"}


@pytest.fixture(scope="module")
def token():
    client.post("/api/auth/register", json={
        "email": "pytest@twip.dev", "full_name": "Test Operator",
        "password": "textile2026", "role": "recycling_facility_operator",
    })
    response = client.post("/api/auth/login", data=CREDENTIALS)
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


def test_health():
    assert client.get("/api/health").json()["status"] == "ok"


def test_rejects_anonymous_access():
    assert client.get("/api/batches").status_code == 401


def test_batch_lifecycle_and_analysis(auth, tmp_path_factory):
    import cv2
    import numpy as np

    created = client.post("/api/batches", headers=auth, json={
        "fabric_type": "Unknown", "source": "Test mill", "quantity_kg": 400, "condition": "good",
    })
    assert created.status_code == 201
    batch = created.json()
    assert batch["batch_code"].startswith("TWB-")

    path = tmp_path_factory.mktemp("img") / "swatch.jpg"
    rng = np.random.default_rng(3)
    yy, xx = np.mgrid[0:300, 0:300]
    swatch = np.clip(np.dstack([180 + np.sin(xx * 2) * 8 + rng.normal(0, 6, (300, 300))] * 3), 0, 255)
    cv2.imwrite(str(path), swatch.astype("uint8"))

    with path.open("rb") as handle:
        analysed = client.post(f"/api/analysis/batches/{batch['id']}", headers=auth,
                               files={"image": ("swatch.jpg", handle, "image/jpeg")})
    assert analysed.status_code == 201
    result = analysed.json()
    assert result["material"]
    assert 0 <= result["circularity_score"] <= 100
    assert result["recommendations"]
    assert result["environmental_impact"]["co2_saved_kg"] > 0

    refreshed = client.get(f"/api/batches/{batch['id']}", headers=auth).json()
    assert refreshed["status"] == "analysed"
    assert refreshed["latest_analysis"]["id"] == result["id"]


def test_rejects_non_image_upload(auth):
    batch = client.post("/api/batches", headers=auth, json={"quantity_kg": 10}).json()
    response = client.post(f"/api/analysis/batches/{batch['id']}", headers=auth,
                           files={"image": ("notes.txt", b"hello", "text/plain")})
    assert response.status_code == 415


def test_dashboard_endpoints(auth):
    summary = client.get("/api/dashboard/summary", headers=auth).json()
    assert summary["batches"] >= 1
    assert client.get("/api/dashboard/composition", headers=auth).status_code == 200
    assert len(client.get("/api/dashboard/trend", headers=auth).json()) == 8
    assert client.get("/api/dashboard/esg", headers=auth).status_code == 200


def test_admin_area_is_role_guarded(auth):
    assert client.get("/api/users", headers=auth).status_code == 403


def test_reports_export(auth):
    pdf = client.get("/api/reports/pdf", headers=auth)
    assert pdf.status_code == 200 and pdf.content[:4] == b"%PDF"
    xlsx = client.get("/api/reports/excel", headers=auth)
    assert xlsx.status_code == 200 and xlsx.content[:2] == b"PK"


def test_dataset_model_status_endpoint(auth):
    """The datasets endpoint must answer whether or not the models are trained."""
    response = client.get("/api/models/datasets", headers=auth)
    assert response.status_code == 200
    body = response.json()
    for key in ("defect_detection", "garment_recognition"):
        assert key in body
        assert "trained" in body[key]
        # When untrained it must tell the user how to train it.
        if not body[key]["trained"]:
            assert body[key]["command"].startswith("python scripts/train_on_datasets.py")


def test_analysis_omits_dataset_blocks_when_untrained(auth, tmp_path_factory):
    """Optional models must be absent, never fabricated, when not trained."""
    import cv2
    import numpy as np

    from app.ml import defect, garment

    path = tmp_path_factory.mktemp("opt") / "s.jpg"
    cv2.imwrite(str(path), (np.random.rand(200, 200, 3) * 255).astype("uint8"))
    with path.open("rb") as handle:
        response = client.post("/api/analysis/quick", headers=auth,
                               files={"image": ("s.jpg", handle, "image/jpeg")},
                               data={"condition": "good", "quantity_kg": "10"})
    assert response.status_code == 200
    body = response.json()

    if defect.available():
        assert 0.0 <= body["defect_detection"]["defect_probability"] <= 1.0
    else:
        assert body["defect_detection"] is None
    if garment.available():
        block = body["garment_recognition"]
        # The module declines to guess on a fabric close-up; either shape is valid,
        # but it must never return a category with no confidence behind it.
        if block.get("applicable") is False:
            assert block["reason"]
        else:
            assert block["garment"] and 0.0 <= block["confidence"] <= 1.0
    else:
        assert body["garment_recognition"] is None


def test_fashion_mnist_loader_reads_both_formats(tmp_path):
    """CSV and IDX must both load — users have whichever Kaggle gave them."""
    import struct

    import numpy as np
    import pandas as pd

    from app.ml.datasets import load_fashion_mnist

    images = np.arange(3 * 784, dtype=np.uint8).reshape(3, 28, 28)
    labels = np.array([1, 2, 3], dtype=np.uint8)

    csv_dir = tmp_path / "csv"
    csv_dir.mkdir()
    pd.DataFrame(np.column_stack([labels, images.reshape(3, -1)]),
                 columns=["label"] + [f"pixel{i}" for i in range(784)]
                 ).to_csv(csv_dir / "fashion-mnist_train.csv", index=False)
    loaded_images, loaded_labels = load_fashion_mnist(csv_dir, "train")
    assert loaded_images.shape == (3, 28, 28)
    assert list(loaded_labels) == [1, 2, 3]

    idx_dir = tmp_path / "idx"
    idx_dir.mkdir()
    (idx_dir / "train-images-idx3-ubyte").write_bytes(
        struct.pack(">IIII", 2051, 3, 28, 28) + images.tobytes())
    (idx_dir / "train-labels-idx1-ubyte").write_bytes(
        struct.pack(">II", 2049, 3) + labels.tobytes())
    idx_images, idx_labels = load_fashion_mnist(idx_dir, "train")
    assert idx_images.shape == (3, 28, 28)
    assert list(idx_labels) == [1, 2, 3]


def test_aitex_patching_labels_from_masks(tmp_path):
    """A patch is defective only where the mask says so."""
    import cv2
    import numpy as np

    from app.ml.datasets import iter_aitex_patches

    (tmp_path / "Defect_images").mkdir()
    (tmp_path / "Mask_images").mkdir()
    # Textured, not flat: a constant strip is now correctly discarded as blank
    # padding, so a flat fixture would test nothing.
    rng = np.random.default_rng(0)
    strip = np.clip(150 + rng.normal(0, 12, (256, 1024)), 0, 255).astype(np.uint8)
    mask = np.zeros(strip.shape, np.uint8)
    mask[100:160, 100:200] = 255          # defect only in the first patch
    cv2.imwrite(str(tmp_path / "Defect_images" / "0001_019_04.png"), strip)
    cv2.imwrite(str(tmp_path / "Mask_images" / "0001_019_04_mask.png"), mask)

    patches = list(iter_aitex_patches(tmp_path, patch=256))
    assert len(patches) == 4
    assert patches[0].is_defective is True
    assert all(p.is_defective is False for p in patches[1:])
    assert patches[0].fabric_code == "04"


def test_aitex_merges_multiple_masks(tmp_path):
    """Images with two defects ship _mask1/_mask2; missing them mislabels the image."""
    import cv2
    import numpy as np

    from app.ml.datasets import find_masks, load_combined_mask

    (tmp_path / "Defect_images").mkdir()
    (tmp_path / "Mask_images").mkdir()
    image = tmp_path / "Defect_images" / "0044_019_04.png"
    rng = np.random.default_rng(1)
    cv2.imwrite(str(image), np.clip(rng.normal(150, 12, (256, 512)), 0, 255).astype(np.uint8))

    first, second = np.zeros((256, 512), np.uint8), np.zeros((256, 512), np.uint8)
    first[10:30, 10:30] = 255
    second[200:220, 400:420] = 255
    cv2.imwrite(str(tmp_path / "Mask_images" / "0044_019_04_mask1.png"), first)
    cv2.imwrite(str(tmp_path / "Mask_images" / "0044_019_04_mask2.png"), second)

    assert len(find_masks(tmp_path / "Mask_images", image)) == 2
    combined = load_combined_mask(tmp_path / "Mask_images", image, (256, 512))
    # Union of both, not just whichever happened to be found first.
    assert (combined > 127).sum() == 800


def test_blank_padding_patches_are_dropped(tmp_path):
    """AITEX strips are padded with flat white; that is not fabric."""
    import cv2
    import numpy as np

    from app.ml.datasets import iter_aitex_patches

    (tmp_path / "NODefect_images" / "fabric_a").mkdir(parents=True)
    rng = np.random.default_rng(2)
    strip = np.full((256, 768), 255, np.uint8)                 # two blank patches
    strip[:, :256] = np.clip(rng.normal(150, 12, (256, 256)), 0, 255).astype(np.uint8)
    cv2.imwrite(str(tmp_path / "NODefect_images" / "fabric_a" / "0001_000_00.png"), strip)

    kept = list(iter_aitex_patches(tmp_path, patch=256))
    assert len(kept) == 1, "flat white padding should not become training data"

    with_blank = list(iter_aitex_patches(tmp_path, patch=256, drop_blank=False))
    assert len(with_blank) == 3


def test_garment_guard_rejects_fabric_closeups():
    """The garment model must decline a weave shot, not label it "Dress".

    This regression exists because an earlier version cropped to a bounding box
    before testing applicability, which manufactured fake background and made
    every fabric patch look like a silhouette.
    """
    import numpy as np

    from app.ml import garment

    if not garment.available():
        import pytest
        pytest.skip("garment model not trained in this environment")

    height = width = 320
    yy, xx = np.mgrid[0:height, 0:width]
    rng = np.random.default_rng(5)

    # Full-bleed woven texture: no background anywhere in frame.
    weave = np.clip(150 + np.sin((xx + yy) * 1.2) * 20 + rng.normal(0, 8, (height, width)), 0, 255)
    swatch = np.dstack([weave] * 3).astype(np.uint8)
    assert garment.predict_garment(swatch)["applicable"] is False

    # Smooth swatch: uniform border, but still no subject against a background.
    flat = np.clip(180 + rng.normal(0, 4, (height, width)), 0, 255)
    assert garment.predict_garment(np.dstack([flat] * 3).astype(np.uint8))["applicable"] is False

    # A silhouette on a plain background is the shape it was trained on.
    canvas = np.zeros((height, width), np.uint8)
    canvas[70:250, 110:210] = 220
    result = garment.predict_garment(np.dstack([255 - canvas] * 3).astype(np.uint8))
    assert result["applicable"] is True
    assert result["garment"] in garment.FASHION_CLASSES
