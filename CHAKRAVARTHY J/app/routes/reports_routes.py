"""
Milestone 4: Reports & Export System.

Every report is available in two formats and follows the same shape:
  GET /api/reports/<report>/pdf
  GET /api/reports/<report>/excel

Reports:
  waste-classification   - one row per AnalysisResult (Milestone 2 output)
  recycling               - one row per InventoryItem, recycling-status focus
  sustainability           - one row per SustainabilityAssessment
  environmental-impact     - CO2 / water / landfill / resource columns only
  circular-economy         - circularity score, loop stage, recovery columns

GET /api/reports/ - list available report types (used to build the
                     Reports & Export page without hardcoding it twice).
"""

from flask import Blueprint, jsonify, send_file

from app.models.inventory import InventoryItem
from app.models.analysis import AnalysisResult
from app.models.sustainability import SustainabilityAssessment
from app.utils.security import token_required
from app.utils.report_utils import build_excel_report, build_pdf_report

reports_bp = Blueprint("reports", __name__)

REPORT_CATALOG = [
    {
        "id": "waste-classification",
        "title": "Waste Classification Report",
        "description": "Material + waste category classification result for every analyzed item.",
        "icon": "🔬",
    },
    {
        "id": "recycling",
        "title": "Recycling Report",
        "description": "Inventory items grouped by recycling status, category and condition.",
        "icon": "♻️",
    },
    {
        "id": "sustainability",
        "title": "Sustainability Report",
        "description": "Full sustainability assessment: scores, category and recommended pathway.",
        "icon": "🌱",
    },
    {
        "id": "environmental-impact",
        "title": "Environmental Impact Report",
        "description": "CO2, water, landfill diversion and resource conservation per assessment.",
        "icon": "🌍",
    },
    {
        "id": "circular-economy",
        "title": "Circular Economy Report",
        "description": "Circularity score, loop stage, recovery efficiency and benchmark delta.",
        "icon": "🔁",
    },
]


@reports_bp.route("/", methods=["GET"])
@token_required
def list_reports():
    return jsonify({"reports": REPORT_CATALOG}), 200


# ---------- data shaping (shared between pdf/excel for each report) ----------

def _waste_classification_rows():
    columns = ["ID", "Material", "Confidence %", "Waste Category", "Recyclability", "Reuse Potential", "Contamination", "Damage", "Created"]
    results = AnalysisResult.query.order_by(AnalysisResult.created_at.desc()).all()
    rows = [[
        r.id, r.predicted_material, round((r.confidence or 0) * 100, 1), r.waste_category,
        r.recyclability_score, r.reuse_potential, "Yes" if r.contamination_detected else "No",
        "Yes" if r.damage_detected else "No", r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else "-",
    ] for r in results]
    return columns, rows, results


def _recycling_rows():
    columns = ["ID", "Item Name", "Fabric Type", "Waste Category", "Qty (kg)", "Condition", "Status", "Source Location"]
    items = InventoryItem.query.order_by(InventoryItem.created_at.desc()).all()
    rows = [[
        i.id, i.item_name, i.fabric_type, i.waste_category, i.quantity_kg, i.condition,
        i.recycling_status, i.source_location or "-",
    ] for i in items]
    return columns, rows, items


def _sustainability_rows():
    columns = ["ID", "Material", "Waste Category", "Qty (kg)", "Circularity Score", "Category", "Sustainability Score", "Pathway", "Priority"]
    rows_data = SustainabilityAssessment.query.order_by(SustainabilityAssessment.created_at.desc()).all()
    rows = [[
        a.id, a.material, a.waste_category, a.quantity_kg, a.circularity_score, a.circularity_category,
        a.sustainability_score, a.recommended_pathway, a.recommendation_priority,
    ] for a in rows_data]
    return columns, rows, rows_data


def _environmental_impact_rows():
    columns = ["ID", "Material", "Qty (kg)", "CO2 Saved (kg)", "Water Saved (L)", "Landfill Diverted (kg)", "Diversion Level", "Raw Material Conserved (kg)", "Energy Conserved (kWh)"]
    rows_data = SustainabilityAssessment.query.order_by(SustainabilityAssessment.created_at.desc()).all()
    rows = [[
        a.id, a.material, a.quantity_kg, a.co2_saved_kg, a.water_saved_liters, a.landfill_diverted_kg,
        a.diversion_level, a.raw_material_conserved_kg, a.energy_conserved_kwh,
    ] for a in rows_data]
    return columns, rows, rows_data


def _circular_economy_rows():
    columns = ["ID", "Material", "Circular Loop Stage", "Loop Closed", "Recoverable Material (kg)", "Recovery Efficiency %", "Benchmark Delta", "Benchmark Label"]
    rows_data = SustainabilityAssessment.query.order_by(SustainabilityAssessment.created_at.desc()).all()
    rows = [[
        a.id, a.material, a.circular_loop_stage, "Yes" if a.loop_closed else "No",
        a.recoverable_material_kg, a.recovery_efficiency_pct, a.benchmark_delta, a.benchmark_label,
    ] for a in rows_data]
    return columns, rows, rows_data


_REPORT_BUILDERS = {
    "waste-classification": _waste_classification_rows,
    "recycling": _recycling_rows,
    "sustainability": _sustainability_rows,
    "environmental-impact": _environmental_impact_rows,
    "circular-economy": _circular_economy_rows,
}


def _stat_cards(report_id: str, records: list) -> list:
    if report_id == "waste-classification":
        n = len(records)
        avg_conf = round(sum((r.confidence or 0) for r in records) / n * 100, 1) if n else 0.0
        return [("Total Analyzed", n), ("Avg Confidence", f"{avg_conf}%"),
                ("Contaminated", sum(1 for r in records if r.contamination_detected)),
                ("Damaged", sum(1 for r in records if r.damage_detected))]
    if report_id == "recycling":
        n = len(records)
        total_kg = round(sum(i.quantity_kg or 0 for i in records), 1)
        recycled = sum(1 for i in records if i.recycling_status == "Recycled")
        return [("Total Items", n), ("Total Qty (kg)", total_kg),
                ("Recycled", recycled), ("Pending", sum(1 for i in records if i.recycling_status == "Pending"))]
    if report_id == "sustainability":
        n = len(records)
        avg = round(sum(a.circularity_score for a in records) / n, 1) if n else 0.0
        return [("Assessments", n), ("Avg Circularity", avg),
                ("High Priority", sum(1 for a in records if a.recommendation_priority == "High"))]
    if report_id == "environmental-impact":
        return [("Total CO2 Saved (kg)", round(sum(a.co2_saved_kg for a in records), 1)),
                ("Total Water Saved (L)", round(sum(a.water_saved_liters for a in records), 1)),
                ("Total Landfill Diverted (kg)", round(sum(a.landfill_diverted_kg for a in records), 1))]
    if report_id == "circular-economy":
        n = len(records)
        closed = sum(1 for a in records if a.loop_closed)
        return [("Assessments", n), ("Loop Closed", f"{closed}/{n}" if n else "0/0"),
                ("Avg Recovery %", round(sum((a.recovery_efficiency_pct or 0) for a in records) / n, 1) if n else 0.0)]
    return []


def _report_meta(report_id: str) -> dict:
    return next((r for r in REPORT_CATALOG if r["id"] == report_id), {"title": report_id, "description": ""})


@reports_bp.route("/<report_id>/pdf", methods=["GET"])
@token_required
def report_pdf(report_id):
    builder = _REPORT_BUILDERS.get(report_id)
    if not builder:
        return jsonify({"error": f"Unknown report type '{report_id}'"}), 404

    columns, rows, records = builder()
    meta = _report_meta(report_id)
    buffer = build_pdf_report(
        title=meta["title"],
        subtitle=meta["description"],
        stat_cards=_stat_cards(report_id, records),
        columns=columns,
        rows=rows,
    )
    return send_file(
        buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"{report_id}-report.pdf",
    )


@reports_bp.route("/<report_id>/excel", methods=["GET"])
@token_required
def report_excel(report_id):
    builder = _REPORT_BUILDERS.get(report_id)
    if not builder:
        return jsonify({"error": f"Unknown report type '{report_id}'"}), 404

    columns, rows, _records = builder()
    meta = _report_meta(report_id)
    buffer = build_excel_report(title=meta["title"], columns=columns, rows=rows, sheet_name=meta["title"])
    return send_file(
        buffer,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        as_attachment=True,
        download_name=f"{report_id}-report.xlsx",
    )
