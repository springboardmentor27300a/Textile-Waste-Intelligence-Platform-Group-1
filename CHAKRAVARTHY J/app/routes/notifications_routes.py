"""
Milestone 4: Notification & Alert System.

Alerts are computed on the fly from existing data (inventory, analysis,
sustainability) rather than stored in their own table, so there's no
extra write path to keep in sync -- every alert always reflects the
current state of the platform.

GET /api/notifications/  - list current alerts for the logged-in user,
                            newest/most-severe first.
"""

from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request

from app.models.inventory import InventoryItem
from app.models.sustainability import SustainabilityAssessment
from app.utils.security import token_required

notifications_bp = Blueprint("notifications", __name__)

STALE_PENDING_DAYS = 7
CO2_MILESTONES_KG = [100, 500, 1000, 5000, 10000]

PLATFORM_ANNOUNCEMENTS = [
    {
        "type": "announcement",
        "severity": "info",
        "title": "Milestone 4 deployed",
        "message": "Executive dashboards, reports & export, and Docker-based deployment are now live.",
    },
]


def _inventory_warnings(items):
    alerts = []
    cutoff = datetime.utcnow() - timedelta(days=STALE_PENDING_DAYS)
    stale = [i for i in items if i.recycling_status == "Pending" and i.created_at and i.created_at <= cutoff]
    if stale:
        total_kg = round(sum(i.quantity_kg or 0 for i in stale), 1)
        alerts.append({
            "type": "inventory_warning",
            "severity": "warning",
            "title": f"{len(stale)} item(s) pending over {STALE_PENDING_DAYS} days",
            "message": f"{total_kg} kg of inventory has been sitting in 'Pending' status for more than {STALE_PENDING_DAYS} days.",
        })

    contaminated = [i for i in items if i.condition == "Contaminated" and i.recycling_status not in ("Rejected", "Disposed")]
    if contaminated:
        alerts.append({
            "type": "inventory_warning",
            "severity": "danger",
            "title": f"{len(contaminated)} contaminated item(s) unrouted",
            "message": "Contaminated inventory items still need a disposal/rejection decision.",
        })
    return alerts


def _waste_collection_alerts(items):
    alerts = []
    by_location = {}
    for i in items:
        if i.recycling_status != "Pending":
            continue
        loc = i.source_location or "Unspecified"
        by_location[loc] = by_location.get(loc, 0) + (i.quantity_kg or 0)

    for loc, kg in by_location.items():
        if kg >= 100:
            alerts.append({
                "type": "collection_alert",
                "severity": "info",
                "title": f"Collection recommended: {loc}",
                "message": f"{round(kg, 1)} kg of waste awaiting pickup at {loc}.",
            })
    return alerts


def _recycling_opportunity_alerts(assessments):
    alerts = []
    high_value = [a for a in assessments if (a.circularity_score or 0) >= 85]
    if high_value:
        alerts.append({
            "type": "recycling_opportunity",
            "severity": "success",
            "title": f"{len(high_value)} high-value recovery opportunit{'y' if len(high_value) == 1 else 'ies'}",
            "message": "One or more assessed batches score 'Excellent Recovery Potential' and are ready to route to a recycling partner.",
        })
    return alerts


def _sustainability_milestone_alerts(assessments):
    alerts = []
    total_co2 = sum(a.co2_saved_kg for a in assessments)
    reached = [m for m in CO2_MILESTONES_KG if total_co2 >= m]
    if reached:
        milestone = max(reached)
        alerts.append({
            "type": "sustainability_milestone",
            "severity": "success",
            "title": f"{milestone:,} kg CO2e milestone reached",
            "message": f"Cumulative CO2e savings across all assessments have passed {milestone:,} kg.",
        })
    return alerts


@notifications_bp.route("/", methods=["GET"])
@token_required
def list_notifications():
    items = InventoryItem.query.all()
    assessments = SustainabilityAssessment.query.all()

    alerts = []
    alerts += _inventory_warnings(items)
    alerts += _waste_collection_alerts(items)
    alerts += _recycling_opportunity_alerts(assessments)
    alerts += _sustainability_milestone_alerts(assessments)
    alerts += PLATFORM_ANNOUNCEMENTS

    severity_rank = {"danger": 0, "warning": 1, "success": 2, "info": 3}
    alerts.sort(key=lambda a: severity_rank.get(a["severity"], 9))

    return jsonify({"notifications": alerts, "count": len(alerts)}), 200
