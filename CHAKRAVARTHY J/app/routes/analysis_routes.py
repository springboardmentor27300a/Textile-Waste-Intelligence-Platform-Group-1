"""
Milestone 2: Material Recognition & Waste Classification routes.

POST /api/analysis/upload            - run full analysis on an uploaded image
GET  /api/analysis/history           - list past analysis results
GET  /api/analysis/<id>               - fetch a single analysis result
POST /api/analysis/<id>/create-item   - create an InventoryItem from a result
GET  /api/analysis/materials         - supported materials reference data
GET  /api/analysis/waste-categories  - waste category + recycling route reference data
"""

import base64
import io
import json
from datetime import datetime

import numpy as np
from PIL import Image
from flask import Blueprint, request, jsonify, send_file
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from app import db
from app.models.analysis import AnalysisResult
from app.models.inventory import InventoryItem
from app.utils.security import token_required, role_required
from app.ml.feature_extraction import load_image_from_bytes, extract_features
from app.ml.material_classifier import classify_material, MATERIALS, NATURAL_FIBERS, SYNTHETIC_FIBERS
from app.ml.waste_classifier import classify_waste, WASTE_CATEGORIES, RECYCLING_ROUTES
from app.routes.sustainability_routes import run_assessment_for_result

analysis_bp = Blueprint("analysis", __name__)

MAX_IMAGE_BYTES = 8 * 1024 * 1024  # 8 MB
THUMBNAIL_SIZE = (160, 160)


def _decode_upload(data: dict) -> bytes:
    """Accepts either a raw base64 string or a data: URL and returns bytes."""
    b64 = data.get("image_base64") or ""
    if not b64:
        raise ValueError("image_base64 is required")
    if "," in b64 and b64.strip().lower().startswith("data:"):
        b64 = b64.split(",", 1)[1]
    try:
        raw = base64.b64decode(b64, validate=False)
    except Exception:
        raise ValueError("image_base64 could not be decoded")
    if len(raw) > MAX_IMAGE_BYTES:
        raise ValueError("image exceeds 8MB upload limit")
    return raw


def _make_thumbnail(img: Image.Image) -> str:
    thumb = img.copy()
    thumb.thumbnail(THUMBNAIL_SIZE)
    buf = io.BytesIO()
    thumb.save(buf, format="JPEG", quality=80)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def _safe_filename_part(value: str, fallback: str = "report") -> str:
    cleaned = "".join(ch.lower() if ch.isalnum() else "-" for ch in (value or fallback)).strip("-")
    while "--" in cleaned:
        cleaned = cleaned.replace("--", "-")
    return cleaned or fallback


def _draw_wrapped_text(pdf: canvas.Canvas, text: str, x: float, y: float, max_width: float, line_height: float = 13):
    words = str(text).split()
    line = ""
    current_y = y
    for word in words:
        candidate = f"{line} {word}".strip()
        if pdf.stringWidth(candidate, "Helvetica", 10) <= max_width:
            line = candidate
        else:
            pdf.drawString(x, current_y, line)
            line = word
            current_y -= line_height
    if line:
        pdf.drawString(x, current_y, line)
        current_y -= line_height
    return current_y


def _thumbnail_bytes_from_data_url(data_url: str) -> bytes:
    if not data_url or "," not in data_url:
        return b""
    return base64.b64decode(data_url.split(",", 1)[1])


def _build_pdf_report(result: AnalysisResult) -> io.BytesIO:
    data = result.to_dict()
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    margin = 40
    y = height - margin

    def start_page_header(page_title: str = "Textile Image Analysis Report"):
        nonlocal y
        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(margin, y, page_title)
        y -= 18
        pdf.setStrokeColorRGB(0.85, 0.85, 0.85)
        pdf.line(margin, y, width - margin, y)
        y -= 12

    def ensure_space(required_height: float):
        nonlocal y
        if y - required_height < margin:
            pdf.showPage()
            y = height - margin
            start_page_header("Textile Image Analysis Report (continued)")

    def draw_section_title(title: str):
        nonlocal y
        ensure_space(24)
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(margin, y, title)
        y -= 14

    def draw_label_value(label: str, value, value_x: float = 220):
        nonlocal y
        ensure_space(20)
        safe_value = "-" if value is None or value == "" else str(value)
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(margin + 4, y, label)
        pdf.setFont("Helvetica", 10)
        y = _draw_wrapped_text(pdf, safe_value, value_x, y, (width - margin) - value_x)
        y -= 2

    def fmt_bool(value: bool) -> str:
        return "Yes" if bool(value) else "No"

    def fmt_confidence(value) -> str:
        return f"{round((value or 0) * 100)}%"

    generated = datetime.utcnow().isoformat() + "Z"
    start_page_header()

    pdf.setFont("Helvetica", 9)
    pdf.drawString(margin, y, f"Generated at: {generated}")
    y -= 12
    pdf.drawString(margin, y, f"Report ID: {data.get('id')}")
    y -= 14

    thumb_raw = _thumbnail_bytes_from_data_url(data.get("thumbnail_base64"))
    if thumb_raw:
        ensure_space(130)
        try:
            img_reader = ImageReader(io.BytesIO(thumb_raw))
            pdf.drawImage(img_reader, margin, y - 110, width=110, height=110, preserveAspectRatio=True, mask="auto")
            pdf.setFont("Helvetica", 8)
            pdf.drawString(margin, y - 118, "Uploaded image preview")
        except Exception:
            pass

        summary_x = margin + 125
        summary_y = y
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(summary_x, summary_y, "Summary")
        summary_y -= 14
        pdf.setFont("Helvetica", 10)
        summary_y = _draw_wrapped_text(pdf, f"Predicted material: {data.get('predicted_material', '-')}", summary_x, summary_y, width - margin - summary_x)
        summary_y = _draw_wrapped_text(pdf, f"Confidence: {fmt_confidence(data.get('confidence'))}", summary_x, summary_y, width - margin - summary_x)
        summary_y = _draw_wrapped_text(pdf, f"Waste category: {data.get('waste_category', '-')}", summary_x, summary_y, width - margin - summary_x)
        summary_y = _draw_wrapped_text(pdf, f"Recyclability score: {data.get('recyclability_score', '-')}/100", summary_x, summary_y, width - margin - summary_x)
        y -= 140

    # 4. Material Classification
    draw_section_title("4. Material Classification")
    composition = data.get("fiber_composition") or {}
    composition_text = ", ".join([f"{k} {v}%" for k, v in composition.items()]) if composition else "-"

    draw_label_value("Predicted material", data.get("predicted_material"))
    draw_label_value("Confidence", fmt_confidence(data.get("confidence")))
    draw_label_value("Fiber category", data.get("fiber_category"))
    draw_label_value("Blend type", data.get("blend_type"))
    draw_label_value("Quality estimate", data.get("quality_estimate"))
    draw_label_value("Fiber composition", composition_text)

    y -= 6

    # 5 & 6. Waste Classification & Recycling Recommendation
    draw_section_title("5 & 6. Waste Classification & Recycling Recommendation")
    draw_label_value("Waste category", data.get("waste_category"))
    draw_label_value("Recyclability score", f"{data.get('recyclability_score', '-')}/100")
    draw_label_value("Reuse potential", data.get("reuse_potential"))
    draw_label_value("Contamination detected", fmt_bool(data.get("contamination_detected")))
    draw_label_value("Damage detected", fmt_bool(data.get("damage_detected")))
    draw_label_value("Disposal recommendation", data.get("disposal_recommendation"))

    routes = data.get("recommended_recycling_routes") or []
    routes_text = ", ".join(routes) if routes else "-"
    draw_label_value("Recommended routes", routes_text)

    y -= 6

    # Visual features section keeps all additional outcomes neatly visible.
    draw_section_title("Visual Features")
    features = data.get("features") or {}
    feature_order = [
        "brightness",
        "saturation",
        "texture_roughness",
        "edge_density",
        "pattern_regularity",
        "damage_score",
        "contamination_score",
    ]

    for key in feature_order:
        if key in features:
            draw_label_value(key.replace("_", " ").title(), features.get(key))

    for key, value in features.items():
        if key not in feature_order:
            draw_label_value(key.replace("_", " ").title(), value)

    pdf.save()
    buffer.seek(0)
    return buffer


@analysis_bp.route("/upload", methods=["POST"])
@token_required
def upload_and_analyze():
    data = request.get_json(silent=True) or {}

    try:
        raw_bytes = _decode_upload(data)
        img = load_image_from_bytes(raw_bytes)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "Uploaded file is not a readable image"}), 400

    condition_hint = data.get("condition_hint")

    features = extract_features(img)
    material_result = classify_material(features)
    waste_result = classify_waste(material_result, features, condition_hint=condition_hint)
    thumbnail = _make_thumbnail(img)

    result = AnalysisResult(
        thumbnail_base64=thumbnail,
        predicted_material=material_result["predicted_material"],
        confidence=material_result["confidence"],
        fiber_category=material_result["fiber_category"],
        blend_type=material_result["blend_type"],
        fiber_composition_json=json.dumps(material_result["fiber_composition"]),
        quality_estimate=material_result["quality_estimate"],
        quality_score=material_result["quality_score"],
        waste_category=waste_result["waste_category"],
        recyclability_score=waste_result["recyclability_score"],
        reuse_potential=waste_result["reuse_potential"],
        contamination_detected=waste_result["contamination_detected"],
        damage_detected=waste_result["damage_detected"],
        disposal_recommendation=waste_result["disposal_recommendation"],
        recommended_routes_json=json.dumps(waste_result["recommended_recycling_routes"]),
        features_json=json.dumps(features),
        created_by=request.current_user.get("user_id"),
    )
    db.session.add(result)
    db.session.commit()

    # Milestone 3: run the sustainability assessment immediately with a
    # default 1kg quantity so it's visible right away; the Sustainability
    # page lets the user re-run it with a real quantity_kg later.
    sustainability_assessment = run_assessment_for_result(
        result, quantity_kg=1.0, created_by=request.current_user.get("user_id")
    )

    response = result.to_dict()
    response["material_analysis"] = material_result
    response["waste_analysis"] = waste_result
    response["sustainability"] = sustainability_assessment.to_dict()
    return jsonify({"message": "Analysis complete", "result": response}), 201


def _with_sustainability_summary(result_dict: dict, result_id: int) -> dict:
    """Attaches a lightweight Milestone 3 summary (circularity score +
    category) to an AnalysisResult dict, if an assessment exists."""
    from app.models.sustainability import SustainabilityAssessment

    assessment = SustainabilityAssessment.query.filter_by(analysis_result_id=result_id).first()
    result_dict["circularity_score"] = assessment.circularity_score if assessment else None
    result_dict["circularity_category"] = assessment.circularity_category if assessment else None
    return result_dict


@analysis_bp.route("/history", methods=["GET"])
@token_required
def history():
    limit = min(int(request.args.get("limit", 20)), 100)
    results = AnalysisResult.query.order_by(AnalysisResult.created_at.desc()).limit(limit).all()
    payload = [_with_sustainability_summary(r.to_dict(), r.id) for r in results]
    return jsonify({"results": payload, "count": len(payload)}), 200


@analysis_bp.route("/<int:result_id>", methods=["GET"])
@token_required
def get_result(result_id):
    result = AnalysisResult.query.get(result_id)
    if not result:
        return jsonify({"error": "Analysis result not found"}), 404
    return jsonify({"result": _with_sustainability_summary(result.to_dict(), result.id)}), 200


@analysis_bp.route("/<int:result_id>/report.pdf", methods=["GET"])
@token_required
def download_result_report_pdf(result_id):
    result = AnalysisResult.query.get(result_id)
    if not result:
        return jsonify({"error": "Analysis result not found"}), 404

    material = _safe_filename_part(result.predicted_material or "material")
    filename = f"analysis-report-{result.id}-{material}.pdf"
    pdf_buffer = _build_pdf_report(result)
    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename,
    )


@analysis_bp.route("/<int:result_id>/create-item", methods=["POST"])
@token_required
@role_required("admin", "staff")
def create_item_from_result(result_id):
    result = AnalysisResult.query.get(result_id)
    if not result:
        return jsonify({"error": "Analysis result not found"}), 404

    data = request.get_json(silent=True) or {}

    item = InventoryItem(
        item_name=data.get("item_name") or f"{result.predicted_material} item (analyzed)",
        fabric_type=result.predicted_material,
        waste_category=data.get("waste_category") or "Other",
        quantity_kg=float(data.get("quantity_kg", 0) or 0),
        condition="Contaminated" if result.contamination_detected else (
            "Degraded" if result.damage_detected else "Reusable"
        ),
        source_location=data.get("source_location"),
        recycling_status="Pending",
        predicted_class=result.waste_category,
        notes=f"Auto-linked from analysis #{result.id}: {result.disposal_recommendation}",
        created_by=request.current_user.get("user_id"),
    )
    db.session.add(item)
    db.session.flush()

    result.inventory_item_id = item.id
    db.session.commit()

    return jsonify({"message": "Inventory item created from analysis", "item": item.to_dict(), "result": result.to_dict()}), 201


@analysis_bp.route("/materials", methods=["GET"])
@token_required
def materials_reference():
    return jsonify({
        "materials": list(MATERIALS),
        "natural_fibers": sorted(NATURAL_FIBERS),
        "synthetic_fibers": sorted(SYNTHETIC_FIBERS),
    }), 200


@analysis_bp.route("/waste-categories", methods=["GET"])
@token_required
def waste_categories_reference():
    return jsonify({
        "waste_categories": list(WASTE_CATEGORIES),
        "recycling_routes": list(RECYCLING_ROUTES),
    }), 200
