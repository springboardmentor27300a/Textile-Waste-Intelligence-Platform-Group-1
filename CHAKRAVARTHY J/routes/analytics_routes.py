"""
Milestone 4: Executive Dashboards & Analytics.

Aggregates data that already lives in InventoryItem, AnalysisResult and
SustainabilityAssessment (Milestones 1-3) into the four persona-oriented
dashboard views from the platform spec:

  - Recycling Facility Dashboard  -> "facility"     section
  - Sustainability Manager Dashboard -> "sustainability" section
  - Manufacturer Dashboard        -> "manufacturer"  section
  - Admin Dashboard               -> "admin"         section (admin role only)

GET /api/analytics/executive  - single aggregated payload for the
                                 Executive Dashboard / Analytics page.
GET /api/analytics/trends     - time-series (last N days) for charts.
"""

from collections import defaultdict
from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request

from app.models.inventory import InventoryItem
from app.models.analysis import AnalysisResult
from app.models.sustainability import SustainabilityAssessment
from app.models.user import User
from app.utils.security import token_required

analytics_bp = Blueprint("analytics", __name__)


def _pct(part, whole):
    return round((part / whole) * 100, 1) if whole else 0.0


def _facility_section(items, results):
    """Recycling Facility Dashboard: waste inventory, recycling
    opportunities, processing analytics, recovery statistics."""
    total_kg = round(sum(i.quantity_kg or 0 for i in items), 1)

    by_status = defaultdict(lambda: {"count": 0, "quantity_kg": 0.0})
    for i in items:
        bucket = by_status[i.recycling_status]
        bucket["count"] += 1
        bucket["quantity_kg"] = round(bucket["quantity_kg"] + (i.quantity_kg or 0), 1)

    by_category = defaultdict(lambda: {"count": 0, "quantity_kg": 0.0})
    for i in items:
        bucket = by_category[i.waste_category]
        bucket["count"] += 1
        bucket["quantity_kg"] = round(bucket["quantity_kg"] + (i.quantity_kg or 0), 1)

    by_fabric = defaultdict(int)
    for i in items:
        by_fabric[i.fabric_type] += 1

    recycled_kg = sum(i.quantity_kg or 0 for i in items if i.recycling_status == "Recycled")
    pending_count = sum(1 for i in items if i.recycling_status == "Pending")

    recyclable_opportunities = [
        {
            "id": r.id,
            "material": r.predicted_material,
            "waste_category": r.waste_category,
            "recyclability_score": r.recyclability_score,
            "recommended_routes": r.recommended_routes_json,
        }
        for r in sorted(results, key=lambda r: (r.recyclability_score or 0), reverse=True)
        if (r.recyclability_score or 0) >= 70
    ][:8]

    return {
        "total_items": len(items),
        "total_quantity_kg": total_kg,
        "recycled_quantity_kg": round(recycled_kg, 1),
        "recycling_rate_pct": _pct(recycled_kg, total_kg),
        "pending_items": pending_count,
        "by_recycling_status": by_status,
        "by_waste_category": by_category,
        "by_fabric_type": by_fabric,
        "top_recycling_opportunities": recyclable_opportunities,
    }


def _sustainability_section(assessments):
    """Sustainability Manager Dashboard: sustainability metrics, carbon
    reduction, waste diversion analytics, ESG-style reporting."""
    n = len(assessments)
    total_co2 = round(sum(a.co2_saved_kg for a in assessments), 1)
    total_water = round(sum(a.water_saved_liters for a in assessments), 1)
    total_landfill = round(sum(a.landfill_diverted_kg for a in assessments), 1)
    avg_circularity = round(sum(a.circularity_score for a in assessments) / n, 1) if n else 0.0
    avg_diversion = round(sum(a.diversion_rate_pct for a in assessments) / n, 1) if n else 0.0

    by_category = defaultdict(int)
    for a in assessments:
        by_category[a.circularity_category] += 1

    co2_by_material = defaultdict(float)
    for a in assessments:
        co2_by_material[a.material] = round(co2_by_material[a.material] + a.co2_saved_kg, 1)

    loop_closed = sum(1 for a in assessments if a.loop_closed)

    return {
        "total_assessments": n,
        "total_co2_saved_kg": total_co2,
        "total_water_saved_liters": total_water,
        "total_landfill_diverted_kg": total_landfill,
        "avg_circularity_score": avg_circularity,
        "avg_diversion_rate_pct": avg_diversion,
        "circular_loop_closed_pct": _pct(loop_closed, n),
        "by_circularity_category": by_category,
        "co2_saved_by_material": co2_by_material,
        # ESG-style summary line, safe to show directly on a report/slide
        "esg_summary": (
            f"{total_co2:,.1f} kg CO2e avoided and {total_water:,.0f} L water saved "
            f"across {n} assessed batches, diverting {total_landfill:,.1f} kg from landfill "
            f"(avg circularity score {avg_circularity}/100)."
        ),
    }


def _manufacturer_section(items, results):
    """Manufacturer Dashboard: production waste analysis, circular
    economy insights, material recovery, sustainability performance."""
    preconsumer = [i for i in items if i.waste_category == "Pre-consumer"]
    postconsumer = [i for i in items if i.waste_category == "Post-consumer"]
    industrial = [i for i in items if i.waste_category == "Industrial"]

    preconsumer_kg = round(sum(i.quantity_kg or 0 for i in preconsumer), 1)
    postconsumer_kg = round(sum(i.quantity_kg or 0 for i in postconsumer), 1)
    industrial_kg = round(sum(i.quantity_kg or 0 for i in industrial), 1)

    by_location = defaultdict(float)
    for i in items:
        loc = i.source_location or "Unspecified"
        by_location[loc] = round(by_location[loc] + (i.quantity_kg or 0), 1)

    avg_quality = round(
        sum(r.quality_score or 0 for r in results) / len(results), 1
    ) if results else 0.0

    return {
        "production_waste_kg": preconsumer_kg,
        "post_consumer_waste_kg": postconsumer_kg,
        "industrial_waste_kg": industrial_kg,
        "waste_by_source_location": by_location,
        "avg_material_quality_score": avg_quality,
        "analyses_run": len(results),
    }


def _admin_section(items, results, assessments):
    """Admin Dashboard: user management, platform analytics, system
    monitoring, report management."""
    users = User.query.all()
    by_role = defaultdict(int)
    for u in users:
        by_role[u.role] += 1

    return {
        "total_users": len(users),
        "users_by_role": by_role,
        "total_inventory_records": len(items),
        "total_analyses": len(results),
        "total_sustainability_assessments": len(assessments),
        "records_last_7_days": sum(
            1 for r in results if r.created_at and r.created_at >= datetime.utcnow() - timedelta(days=7)
        ),
        "system_status": "operational",
    }


@analytics_bp.route("/executive", methods=["GET"])
@token_required
def executive_dashboard():
    items = InventoryItem.query.all()
    results = AnalysisResult.query.all()
    assessments = SustainabilityAssessment.query.all()

    payload = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "facility": _facility_section(items, results),
        "sustainability": _sustainability_section(assessments),
        "manufacturer": _manufacturer_section(items, results),
    }

    if request.current_user.get("role") == "admin":
        payload["admin"] = _admin_section(items, results, assessments)

    return jsonify(payload), 200


@analytics_bp.route("/trends", methods=["GET"])
@token_required
def trends():
    """Daily time series over the last `days` (default 14) for the
    inventory intake volume and CO2-saved lines on the Analytics page."""
    try:
        days = int(request.args.get("days", 14))
    except (TypeError, ValueError):
        days = 14
    days = max(1, min(days, 90))

    since = datetime.utcnow() - timedelta(days=days - 1)
    since = since.replace(hour=0, minute=0, second=0, microsecond=0)

    items = InventoryItem.query.filter(InventoryItem.created_at >= since).all()
    assessments = SustainabilityAssessment.query.filter(SustainabilityAssessment.created_at >= since).all()

    labels = [(since + timedelta(days=d)).strftime("%Y-%m-%d") for d in range(days)]
    intake_by_day = {label: 0.0 for label in labels}
    co2_by_day = {label: 0.0 for label in labels}

    for i in items:
        key = i.created_at.strftime("%Y-%m-%d")
        if key in intake_by_day:
            intake_by_day[key] = round(intake_by_day[key] + (i.quantity_kg or 0), 1)

    for a in assessments:
        key = a.created_at.strftime("%Y-%m-%d")
        if key in co2_by_day:
            co2_by_day[key] = round(co2_by_day[key] + (a.co2_saved_kg or 0), 1)

    return jsonify({
        "labels": labels,
        "intake_kg_by_day": [intake_by_day[l] for l in labels],
        "co2_saved_kg_by_day": [co2_by_day[l] for l in labels],
    }), 200
