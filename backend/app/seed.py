"""Populate a demo facility: four roles, a batch register, and analysed images.

Run with `python -m app.seed`. Safe to re-run — it resets the demo rows only.
"""
from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path

import cv2
import numpy as np

from .config import settings
from .database import Base, SessionLocal, engine
from .models import (
    Analysis, BatchStatus, Notification, Role, User, WasteBatch, WasteCategory,
)
from .ml.engines import analyse_image, warm_models
from .security import hash_password

DEMO_USERS = [
    ("operator@twip.dev", "Priya Nair", Role.recycler, "Deccan Fibre Recovery"),
    ("sustainability@twip.dev", "Jyothsna", Role.sustainability, "Northwind Apparel Group"),
    ("manufacturer@twip.dev", "Lena Okafor", Role.manufacturer, "Kestrel Mills"),
    ("admin@twip.dev", "Site Administrator", Role.admin, "TWIP"),
]
PASSWORD = "textile2026"

SWATCHES = [
    ("Denim offcuts", "Kestrel Mills — cutting room", 840, "fair", "denim"),
    ("Cotton jersey", "Retail returns — Hyderabad", 310, "good", "cotton"),
    ("Polyester lining", "Kestrel Mills — line 4", 520, "excellent", "poly"),
    ("Wool knitwear", "Municipal collection", 145, "fair", "wool"),
    ("Silk remnants", "Atelier surplus", 38, "excellent", "silk"),
    ("Mixed post-consumer", "Kerbside collection", 1250, "poor", "mixed"),
    ("Linen shirting", "Northwind returns", 190, "good", "linen"),
    ("Acrylic blankets", "Hostel clearance", 275, "poor", "acrylic"),
]


def _swatch(kind: str, seed: int) -> np.ndarray:
    """Draw a synthetic but structurally plausible fabric swatch for the demo.

    Each kind exaggerates the visual signature the feature extractor looks for:
    twill runs diagonally, wool is high-contrast fuzz, silk is smooth with a
    specular band. Replace this with photographs for a real deployment.
    """
    rng = np.random.default_rng(seed)
    h = w = 420
    yy, xx = np.mgrid[0:h, 0:w]
    sigma = 9.0
    highlight = 0.0

    if kind == "denim":                       # indigo twill, diagonal rib
        base, weave = (46, 74, 118), np.sin((xx + yy) * 1.2) * 20
    elif kind == "cotton":                    # matte, even plain weave
        base, weave = (196, 190, 182), np.sin(xx * 2.0) * 7 + np.sin(yy * 2.0) * 7
    elif kind == "poly":                      # smooth, saturated, mild sheen
        base, weave, sigma, highlight = (172, 96, 88), np.sin(xx * 3.1) * 3, 3.0, 0.5
    elif kind == "wool":                      # napped surface, high local contrast
        base = (104, 92, 96)
        fuzz = cv2.GaussianBlur(rng.normal(0, 46, (h, w)).astype(np.float32), (0, 0), 1.6)
        weave, sigma = fuzz, 14.0
    elif kind == "silk":                      # very smooth with a specular band
        base, weave, sigma, highlight = (206, 178, 154), np.sin(xx * 0.35) * 24, 1.5, 1.0
    elif kind == "linen":                     # slubby, irregular plain weave
        base = (204, 196, 172)
        weave = np.sin(xx * 1.4) * 14 + np.sin(yy * 1.5) * 14 + rng.normal(0, 6, (h, w))
        sigma = 12.0
    elif kind == "acrylic":                   # bulky knit, saturated
        base = (150, 110, 168)
        weave, sigma = np.sin(yy * 4) * 12 + rng.normal(0, 14, (h, w)), 12.0
    else:                                     # mixed post-consumer: patchwork + contamination
        img = np.zeros((h, w, 3), np.uint8)
        for i in range(4):
            for j in range(4):
                img[i * 105:(i + 1) * 105, j * 105:(j + 1) * 105] = rng.integers(40, 220, 3)
        img = cv2.GaussianBlur(img, (5, 5), 0)
        for _ in range(14):  # foreign matter and holes
            cv2.circle(img, tuple(rng.integers(20, 400, 2).tolist()),
                       int(rng.integers(6, 20)), (12, 12, 12), -1)
        return img

    noise = rng.normal(0, sigma, (h, w))
    if highlight:
        # a soft bright band across the bolt, as a lustrous fibre catches the light
        band = np.exp(-((xx - w * 0.38) ** 2) / (2 * (w * 0.10) ** 2)) * 70 * highlight
        noise = noise + band

    # tuples above are RGB; OpenCV writes BGR, so reverse on the way out
    channels = [np.clip(c + weave + noise, 0, 255) for c in base[::-1]]
    return np.dstack(channels).astype(np.uint8)


def run() -> None:
    Base.metadata.create_all(bind=engine)
    warm_models()  # keep model training out of the recorded inference times
    db = SessionLocal()
    demo_dir = Path(settings.upload_dir) / "demo"
    demo_dir.mkdir(parents=True, exist_ok=True)

    try:
        # reset demo rows
        emails = [e for e, *_ in DEMO_USERS]
        existing = db.query(User).filter(User.email.in_(emails)).all()
        for user in existing:
            for batch in db.query(WasteBatch).filter(WasteBatch.owner_id == user.id).all():
                db.delete(batch)
            db.query(Notification).filter(Notification.user_id == user.id).delete()
        db.commit()

        users = {}
        for email, name, role, org in DEMO_USERS:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(email=email, full_name=name, role=role, organisation=org,
                            hashed_password=hash_password(PASSWORD))
                db.add(user)
            else:
                user.full_name, user.role, user.organisation = name, role, org
                user.hashed_password = hash_password(PASSWORD)
            users[role] = user
        db.commit()

        operator = users[Role.recycler]
        now = datetime.now(timezone.utc)

        for index, (fabric, source, kg, condition, kind) in enumerate(SWATCHES):
            collected = now - timedelta(days=index * 5 + 2)
            batch = WasteBatch(
                batch_code=f"TWB-{collected:%Y%m}-{secrets.token_hex(3).upper()}",
                fabric_type=fabric, source=source, quantity_kg=float(kg),
                condition=condition, collection_date=collected, owner_id=operator.id,
                created_at=collected, notes="Seeded demo batch.",
            )
            db.add(batch)
            db.flush()

            path = demo_dir / f"{kind}.jpg"
            cv2.imwrite(str(path), _swatch(kind, index))
            result = analyse_image(str(path), condition, float(kg))

            record = Analysis(
                batch_id=batch.id, image_path=str(path), created_at=collected,
                visual_features=result["visual_features"],
                dominant_colour=result["dominant_colour"],
                texture_class=result["texture_class"], pattern_class=result["pattern_class"],
                damage_score=result["damage_score"],
                contamination_score=result["contamination_score"],
                defect_detection=result.get("defect_detection"),
                garment_recognition=result.get("garment_recognition"),
                material=result["material"], material_confidence=result["material_confidence"],
                material_probabilities=result["material_probabilities"],
                fibre_composition=result["fibre_composition"], is_blend=result["is_blend"],
                material_quality=result["material_quality"],
                waste_category=WasteCategory(result["waste_category"]),
                waste_probabilities=result["waste_probabilities"],
                recyclability_score=result["recyclability_score"],
                reuse_score=result["reuse_score"],
                sustainability_score=result["sustainability_score"],
                material_recovery_score=result["material_recovery_score"],
                circularity_score=result["circularity_score"],
                circularity_band=result["circularity_band"],
                score_components=result["score_components"],
                score_weights=result["score_weights"],
                recommendations=result["recommendations"],
                environmental_impact=result["environmental_impact"],
                inference_ms=result["inference_ms"],
            )
            db.add(record)
            batch.status = BatchStatus.analysed if index % 3 else BatchStatus.processed

        db.add(Notification(
            user_id=operator.id, kind="collection",
            title="Collection scheduled for Kestrel Mills",
            body="Two cutting-room containers are ready for pickup on Thursday.",
        ))
        db.commit()
        print(f"Seeded {len(SWATCHES)} batches. Sign in with any of:")
        for email, name, role, _ in DEMO_USERS:
            print(f"  {email:28} / {PASSWORD}   ({role.value})")
    finally:
        db.close()


if __name__ == "__main__":
    run()
