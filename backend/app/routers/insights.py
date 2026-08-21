"""Aggregate views that back the Classification, Recommendations, Sustainability
and Environmental screens. Each one summarises the latest analysis per batch."""
from collections import Counter, defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import current_user
from ..models import User
from ..ml.materials import IMPACT
from .dashboard import _latest_analyses

router = APIRouter(prefix="/api/insights", tags=["insights"])


@router.get("/classification")
def classification(db: Session = Depends(get_db), user: User = Depends(current_user)):
    """Every classified batch plus confidence distribution, for the Classification page."""
    _, pairs = _latest_analyses(db, user)
    rows, confidences = [], []
    materials: Counter[str] = Counter()
    categories: Counter[str] = Counter()
    blends = 0

    for batch, a in pairs:
        confidences.append(a.material_confidence)
        materials[a.material] += 1
        categories[a.waste_category.value] += 1
        blends += 1 if a.is_blend else 0
        rows.append({
            "batch_id": batch.id,
            "batch_code": batch.batch_code,
            "quantity_kg": batch.quantity_kg,
            "material": a.material,
            "confidence": a.material_confidence,
            "is_blend": a.is_blend,
            "fibre_composition": a.fibre_composition,
            "waste_category": a.waste_category.value,
            "texture": a.texture_class,
            "pattern": a.pattern_class,
            "colour": a.dominant_colour,
            "damage_score": a.damage_score,
            "contamination_score": a.contamination_score,
            "analysed_at": a.created_at,
        })

    rows.sort(key=lambda r: -r["confidence"])
    mean_conf = sum(confidences) / len(confidences) if confidences else 0.0
    bands = {"High (≥70%)": 0, "Medium (40–70%)": 0, "Low (<40%)": 0}
    for c in confidences:
        bands["High (≥70%)" if c >= 0.7 else "Medium (40–70%)" if c >= 0.4 else "Low (<40%)"] += 1

    return {
        "rows": rows,
        "classified": len(rows),
        "blends": blends,
        "mean_confidence": round(mean_conf, 4),
        "by_material": [{"label": k, "count": v} for k, v in materials.most_common()],
        "by_category": [{"label": k, "count": v} for k, v in categories.most_common()],
        "confidence_bands": [{"label": k, "count": v} for k, v in bands.items()],
    }


@router.get("/recommendations")
def recommendations(db: Session = Depends(get_db), user: User = Depends(current_user)):
    """Recommended routes across the facility, with the mass behind each."""
    _, pairs = _latest_analyses(db, user)
    by_route: dict[str, dict] = defaultdict(lambda: {"kg": 0.0, "batches": 0, "co2": 0.0, "fit": []})
    rows = []

    for batch, a in pairs:
        if not a.recommendations:
            continue
        top = a.recommendations[0]
        bucket = by_route[top["route"]]
        bucket["kg"] += batch.quantity_kg
        bucket["batches"] += 1
        bucket["co2"] += a.environmental_impact.get("co2_saved_kg", 0)
        bucket["fit"].append(top["fit"])
        rows.append({
            "batch_id": batch.id,
            "batch_code": batch.batch_code,
            "material": a.material,
            "quantity_kg": batch.quantity_kg,
            "waste_category": a.waste_category.value,
            "circularity_score": a.circularity_score,
            "band": a.circularity_band,
            "options": a.recommendations,
        })

    rows.sort(key=lambda r: -r["circularity_score"])
    routes = [{
        "route": route,
        "kg": round(v["kg"], 1),
        "batches": v["batches"],
        "co2_saved_kg": round(v["co2"], 1),
        "mean_fit": round(sum(v["fit"]) / len(v["fit"]), 1),
    } for route, v in sorted(by_route.items(), key=lambda kv: -kv[1]["kg"])]

    return {"routes": routes, "rows": rows}


@router.get("/environmental")
def environmental(db: Session = Depends(get_db), user: User = Depends(current_user)):
    """CO2, water, landfill and virgin-fibre savings, split by material."""
    _, pairs = _latest_analyses(db, user)
    by_material: dict[str, dict] = defaultdict(
        lambda: {"kg": 0.0, "co2": 0.0, "water": 0.0, "diverted": 0.0, "virgin": 0.0})
    totals = {"co2": 0.0, "water": 0.0, "diverted": 0.0, "virgin": 0.0, "kg": 0.0}

    for batch, a in pairs:
        impact = a.environmental_impact
        bucket = by_material[a.material]
        bucket["kg"] += batch.quantity_kg
        bucket["co2"] += impact.get("co2_saved_kg", 0)
        bucket["water"] += impact.get("water_saved_litres", 0)
        bucket["diverted"] += impact.get("diverted_kg", 0)
        bucket["virgin"] += impact.get("virgin_fibre_replaced_kg", 0)
        totals["kg"] += batch.quantity_kg
        totals["co2"] += impact.get("co2_saved_kg", 0)
        totals["water"] += impact.get("water_saved_litres", 0)
        totals["diverted"] += impact.get("diverted_kg", 0)
        totals["virgin"] += impact.get("virgin_fibre_replaced_kg", 0)

    return {
        "totals": {
            "registered_kg": round(totals["kg"], 1),
            "diverted_kg": round(totals["diverted"], 1),
            "landfill_avoided_kg": round(totals["diverted"], 1),
            "co2_saved_kg": round(totals["co2"], 1),
            "water_saved_litres": round(totals["water"], 0),
            "virgin_fibre_replaced_kg": round(totals["virgin"], 1),
            "trees_equivalent": round(totals["co2"] / 21.0, 1),
            "households_water_days": round(totals["water"] / 350.0, 0),
        },
        "by_material": [{
            "material": m,
            "kg": round(v["kg"], 1),
            "co2_saved_kg": round(v["co2"], 1),
            "water_saved_litres": round(v["water"], 0),
            "diverted_kg": round(v["diverted"], 1),
            "recyclability": IMPACT.get(m, IMPACT["Mixed Fabrics"])["recyclability"],
        } for m, v in sorted(by_material.items(), key=lambda kv: -kv[1]["co2"])],
        "basis": ("Savings are the avoided virgin-production burden for the mass each "
                  "recommended route recovers, plus landfill methane equivalent. "
                  "Equivalences use 21 kg CO2 per tree-year and 350 L per household-day."),
    }
