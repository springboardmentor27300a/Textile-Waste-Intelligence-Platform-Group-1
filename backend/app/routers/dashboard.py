import math
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import current_user
from ..models import Analysis, Role, User, WasteBatch
from .inventory import _visible

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _latest_analyses(db: Session, user: User):
    batches = _visible(db, user).all()
    pairs = [(b, b.analyses[0]) for b in batches if b.analyses]
    return batches, pairs


@router.get("/summary")
def summary(db: Session = Depends(get_db), user: User = Depends(current_user)):
    """Headline numbers every role sees, scoped to what that role can view."""
    batches, pairs = _latest_analyses(db, user)
    total_kg = sum(b.quantity_kg for b in batches)
    diverted = sum(a.environmental_impact.get("diverted_kg", 0) for _, a in pairs)
    co2 = sum(a.environmental_impact.get("co2_saved_kg", 0) for _, a in pairs)
    water = sum(a.environmental_impact.get("water_saved_litres", 0) for _, a in pairs)
    circularity = [a.circularity_score for _, a in pairs]

    return {
        "role": user.role.value,
        "batches": len(batches),
        "awaiting_analysis": len(batches) - len(pairs),
        "total_kg": round(total_kg, 1),
        "diverted_kg": round(diverted, 1),
        "diversion_rate": round(diverted / total_kg * 100, 1) if total_kg else 0.0,
        "co2_saved_kg": round(co2, 1),
        "water_saved_litres": round(water, 0),
        "mean_circularity": round(sum(circularity) / len(circularity), 1) if circularity else 0.0,
    }


@router.get("/composition")
def composition(db: Session = Depends(get_db), user: User = Depends(current_user)):
    """Material mix and waste-category mix, weighted by mass."""
    _, pairs = _latest_analyses(db, user)
    by_material: dict[str, float] = defaultdict(float)
    by_category: dict[str, float] = defaultdict(float)
    by_band: dict[str, int] = defaultdict(int)
    for batch, analysis in pairs:
        by_material[analysis.material] += batch.quantity_kg
        by_category[analysis.waste_category.value] += batch.quantity_kg
        by_band[analysis.circularity_band] += 1
    return {
        "by_material": [{"label": k, "kg": round(v, 1)} for k, v in
                        sorted(by_material.items(), key=lambda kv: -kv[1])],
        "by_waste_category": [{"label": k, "kg": round(v, 1)} for k, v in
                              sorted(by_category.items(), key=lambda kv: -kv[1])],
        "by_circularity_band": [{"label": k, "count": v} for k, v in
                                sorted(by_band.items(), key=lambda kv: -kv[1])],
    }


@router.get("/trend")
def trend(weeks: int = 8, db: Session = Depends(get_db), user: User = Depends(current_user)):
    """Weekly diversion and circularity, for the sustainability and manufacturer views."""
    _, pairs = _latest_analyses(db, user)
    now = datetime.now(timezone.utc)
    buckets: dict[str, dict] = {}
    for offset in range(weeks - 1, -1, -1):
        start = now - timedelta(weeks=offset + 1)
        key = (now - timedelta(weeks=offset)).strftime("%d %b")
        buckets[key] = {"week": key, "_start": start, "_end": start + timedelta(weeks=1),
                        "kg": 0.0, "diverted_kg": 0.0, "circularity": []}

    for batch, analysis in pairs:
        created = analysis.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        for bucket in buckets.values():
            if bucket["_start"] <= created < bucket["_end"]:
                bucket["kg"] += batch.quantity_kg
                bucket["diverted_kg"] += analysis.environmental_impact.get("diverted_kg", 0)
                bucket["circularity"].append(analysis.circularity_score)
                break

    series = []
    for bucket in buckets.values():
        scores = bucket.pop("circularity")
        bucket.pop("_start"), bucket.pop("_end")
        bucket["kg"] = round(bucket["kg"], 1)
        bucket["diverted_kg"] = round(bucket["diverted_kg"], 1)
        bucket["mean_circularity"] = round(sum(scores) / len(scores), 1) if scores else 0.0
        series.append(bucket)
    return series


@router.get("/recycling-opportunities")
def opportunities(limit: int = 8, db: Session = Depends(get_db),
                  user: User = Depends(current_user)):
    """Highest-value unprocessed batches — the recycler's work queue."""
    _, pairs = _latest_analyses(db, user)
    rows = []
    for batch, analysis in pairs:
        if not analysis.recommendations:
            continue
        top = analysis.recommendations[0]
        rows.append({
            "batch_id": batch.id,
            "batch_code": batch.batch_code,
            "material": analysis.material,
            "quantity_kg": batch.quantity_kg,
            "status": batch.status.value,
            "route": top["route"],
            "fit": top["fit"],
            "circularity_score": analysis.circularity_score,
            "band": analysis.circularity_band,
            "co2_saved_kg": analysis.environmental_impact.get("co2_saved_kg", 0),
        })
    rows.sort(key=lambda r: -(r["circularity_score"] * max(r["quantity_kg"], 1) ** 0.5))
    return rows[:limit]


@router.get("/esg")
def esg(db: Session = Depends(get_db), user: User = Depends(current_user)):
    """Reporting block for the sustainability manager view."""
    batches, pairs = _latest_analyses(db, user)
    total_kg = sum(b.quantity_kg for b in batches) or 1
    diverted = sum(a.environmental_impact.get("diverted_kg", 0) for _, a in pairs)
    routes: dict[str, float] = defaultdict(float)
    for batch, analysis in pairs:
        if analysis.recommendations:
            routes[analysis.recommendations[0]["route"]] += batch.quantity_kg
    return {
        "reporting_period": datetime.now(timezone.utc).strftime("%B %Y"),
        "waste_diversion_rate": round(diverted / total_kg * 100, 1),
        "landfill_avoided_kg": round(diverted, 1),
        "co2_saved_tonnes": round(
            sum(a.environmental_impact.get("co2_saved_kg", 0) for _, a in pairs) / 1000, 2),
        "water_saved_kilolitres": round(
            sum(a.environmental_impact.get("water_saved_litres", 0) for _, a in pairs) / 1000, 1),
        "virgin_fibre_replaced_kg": round(
            sum(a.environmental_impact.get("virgin_fibre_replaced_kg", 0) for _, a in pairs), 1),
        "recovery_routes": [{"route": k, "kg": round(v, 1)} for k, v in
                            sorted(routes.items(), key=lambda kv: -kv[1])],
        "hazardous_batches": sum(1 for _, a in pairs
                                 if a.waste_category.value == "Hazardous Textile Waste"),
    }


@router.get("/admin")
def admin_metrics(db: Session = Depends(get_db), user: User = Depends(current_user)):
    if user.role is not Role.admin:
        return {"available": False}
    analyses = db.query(Analysis).all()
    latencies = sorted(a.inference_ms for a in analyses) or [0.0]
    # nearest-rank percentile: truncating the index drops the slowest sample and
    # can report a p95 below the mean on small sample counts
    p95_index = max(0, math.ceil(0.95 * len(latencies)) - 1)
    by_role = defaultdict(int)
    for u in db.query(User).all():
        by_role[u.role.value] += 1
    return {
        "available": True,
        "users": db.query(User).count(),
        "users_by_role": dict(by_role),
        "batches": db.query(WasteBatch).count(),
        "analyses": len(analyses),
        "mean_inference_ms": round(sum(latencies) / len(latencies), 1),
        "p95_inference_ms": round(latencies[p95_index], 1),
    }
