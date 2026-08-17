"""
PDF Report Generator — Milestone 4
=====================================
Generates professional PDF reports using ReportLab.

Features:
- Platform logo + header
- Report title and metadata
- Summary stat cards (simulated with colored boxes)
- Data tables per report section
- AI recommendation text
- Footer with page numbers
- Proper styling with WeaveCycle brand colors
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# ─── Color Palette ────────────────────────────────────────────────────────────
BRAND_GREEN = (0.10, 0.60, 0.40)          # #1a9966 approx
BRAND_DARK  = (0.07, 0.10, 0.14)          # dark slate
BRAND_LIGHT = (0.96, 0.98, 0.97)          # near white
ACCENT_BLUE = (0.13, 0.45, 0.75)
ACCENT_AMBER = (0.85, 0.55, 0.10)
NEUTRAL_GRAY = (0.55, 0.60, 0.65)
TABLE_HEADER = (0.12, 0.18, 0.24)
TABLE_ROW_ALT = (0.95, 0.97, 0.96)

REPORT_TYPE_COLORS = {
    "waste_classification": BRAND_GREEN,
    "recycling":            ACCENT_BLUE,
    "sustainability":       (0.15, 0.65, 0.45),
    "environmental_impact": (0.10, 0.50, 0.35),
    "circular_economy":     (0.30, 0.20, 0.75),
    "esg_summary":          BRAND_GREEN,
}

REPORT_TYPE_LABELS = {
    "waste_classification": "Waste Classification Report",
    "recycling":            "Recycling Report",
    "sustainability":       "Sustainability Report",
    "environmental_impact": "Environmental Impact Report",
    "circular_economy":     "Circular Economy Report",
    "esg_summary":          "ESG Summary Report",
}


def _rgb(t):
    """Convert 0-1 tuple to 0-255 Color."""
    from reportlab.lib.colors import Color
    return Color(t[0], t[1], t[2])


def _make_styles():
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name="ReportTitle",
        fontSize=22,
        leading=28,
        textColor=_rgb(BRAND_DARK),
        fontName="Helvetica-Bold",
        spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        name="SubTitle",
        fontSize=10,
        leading=14,
        textColor=_rgb(NEUTRAL_GRAY),
        fontName="Helvetica",
        spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        name="SectionHeader",
        fontSize=13,
        leading=18,
        textColor=_rgb(BRAND_GREEN),
        fontName="Helvetica-Bold",
        spaceBefore=16,
        spaceAfter=6,
        borderPad=4,
    ))
    styles.add(ParagraphStyle(
        name="BodyText2",
        fontSize=9,
        leading=13,
        textColor=_rgb(BRAND_DARK),
        fontName="Helvetica",
        spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        name="Caption",
        fontSize=8,
        leading=11,
        textColor=_rgb(NEUTRAL_GRAY),
        fontName="Helvetica-Oblique",
        spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        name="FooterText",
        fontSize=8,
        textColor=_rgb(NEUTRAL_GRAY),
        fontName="Helvetica",
        alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        name="ValueBig",
        fontSize=20,
        leading=24,
        textColor=_rgb(BRAND_GREEN),
        fontName="Helvetica-Bold",
        alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        name="ValueLabel",
        fontSize=8,
        leading=11,
        textColor=_rgb(NEUTRAL_GRAY),
        fontName="Helvetica",
        alignment=TA_CENTER,
    ))
    return styles


def _header_footer(canvas, doc, report_type: str, report_title: str, org_name: str):
    """Draw header band and footer on every page."""
    from reportlab.lib.units import cm, mm
    from reportlab.lib.colors import white

    W = doc.pagesize[0]
    H = doc.pagesize[1]

    canvas.saveState()

    # ── Top header band ──
    color = REPORT_TYPE_COLORS.get(report_type, BRAND_GREEN)
    canvas.setFillColor(_rgb(color))
    canvas.rect(0, H - 2.8 * cm, W, 2.8 * cm, fill=True, stroke=False)

    # Logo text
    canvas.setFillColor(_rgb(BRAND_LIGHT))
    canvas.setFont("Helvetica-Bold", 14)
    canvas.drawString(1.5 * cm, H - 1.7 * cm, "WeaveCycle")

    # Platform label
    canvas.setFont("Helvetica", 8)
    canvas.drawString(1.5 * cm, H - 2.3 * cm, "Textile Waste Intelligence Platform")

    # Report type label on right
    canvas.setFont("Helvetica-Bold", 10)
    label = REPORT_TYPE_LABELS.get(report_type, "Report")
    canvas.drawRightString(W - 1.5 * cm, H - 1.7 * cm, label)

    # Date on right
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(W - 1.5 * cm, H - 2.3 * cm, datetime.utcnow().strftime("Generated: %d %b %Y %H:%M UTC"))

    # ── Footer band ──
    canvas.setFillColor(_rgb((0.93, 0.95, 0.94)))
    canvas.rect(0, 0, W, 1.5 * cm, fill=True, stroke=False)

    canvas.setFillColor(_rgb(NEUTRAL_GRAY))
    canvas.setFont("Helvetica", 8)
    canvas.drawString(1.5 * cm, 0.6 * cm, f"Organization: {org_name}")
    canvas.drawCentredString(W / 2, 0.6 * cm, report_title[:80])
    canvas.drawRightString(W - 1.5 * cm, 0.6 * cm, f"Page {doc.page}")

    # Separator line
    canvas.setStrokeColor(_rgb(BRAND_GREEN))
    canvas.setLineWidth(0.5)
    canvas.line(1.5 * cm, 1.5 * cm, W - 1.5 * cm, 1.5 * cm)

    canvas.restoreState()


def _stat_card_row(elements, stats: list, styles):
    """
    Render a row of stat cards using a Table.
    stats: list of (value, label, color_tuple) dicts
    """
    from reportlab.platypus import Table, TableStyle
    from reportlab.lib.units import cm
    from reportlab.lib.colors import white

    col_count = len(stats)
    col_width = 16.5 * cm / col_count

    header_row = []
    value_row = []
    label_row = []

    for stat in stats:
        from reportlab.platypus import Paragraph
        bg = _rgb(stat.get("color", BRAND_GREEN))
        val = str(stat.get("value", "—"))
        lbl = str(stat.get("label", ""))

        header_row.append("")
        value_row.append(Paragraph(f'<font color="white"><b>{val}</b></font>', styles["ValueBig"]))
        label_row.append(Paragraph(f'<font color="#aaaaaa">{lbl}</font>', styles["ValueLabel"]))

    data = [header_row, value_row, label_row]
    t = Table(data, colWidths=[col_width] * col_count, rowHeights=[8, 32, 20])

    # Build background colors per column
    style_cmds = [
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("ROUNDEDCORNERS", [6, 6, 6, 6]),
        ("GRID", (0, 0), (-1, -1), 0.25, _rgb(BRAND_LIGHT)),
    ]
    for i, stat in enumerate(stats):
        bg = _rgb(stat.get("color", BRAND_GREEN))
        style_cmds.append(("BACKGROUND", (i, 0), (i, 2), bg))

    t.setStyle(TableStyle(style_cmds))
    elements.append(t)


def _section_table(elements, title: str, rows: list, styles, color=None):
    """
    Render a labeled two-column key-value table.
    rows: list of (key, value) tuples
    """
    from reportlab.platypus import Paragraph, Table, TableStyle, Spacer
    from reportlab.lib.units import cm

    color = color or BRAND_GREEN

    elements.append(Paragraph(title, styles["SectionHeader"]))

    if not rows:
        elements.append(Paragraph("No data available for this section.", styles["Caption"]))
        return

    data = [[Paragraph(f"<b>{k}</b>", styles["BodyText2"]), Paragraph(str(v), styles["BodyText2"])]
            for k, v in rows]

    t = Table(data, colWidths=[6 * cm, 10.5 * cm])
    style_cmds = [
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.3, _rgb(BRAND_LIGHT)),
    ]
    # Alternate row shading
    for i in range(len(data)):
        if i % 2 == 0:
            style_cmds.append(("BACKGROUND", (0, i), (-1, i), _rgb(TABLE_ROW_ALT)))

    t.setStyle(TableStyle(style_cmds))
    elements.append(t)
    elements.append(Paragraph(" ", styles["Caption"]))


def generate_pdf(report_data: Dict[str, Any], output_dir: str) -> str:
    """
    Generate a PDF report and save to output_dir.
    Returns the saved file path.
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import cm
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, HRFlowable,
            Table, TableStyle
        )
        from reportlab.lib.colors import white
        import functools
    except ImportError:
        raise RuntimeError("reportlab is not installed. Run: pip install reportlab>=4.0.0")

    styles = _make_styles()
    report_type = report_data.get("report_type", "waste_classification")
    report_title = report_data.get("title", "WeaveCycle Report")
    report_id = report_data.get("report_id", "UNKNOWN")
    org_name = report_data.get("organization_name", "N/A")
    user_name = report_data.get("user_name", "N/A")
    generated_date = report_data.get("generated_date", datetime.utcnow().isoformat())

    # Sanitise title for filename
    safe_title = "".join(c if c.isalnum() or c in "-_ " else "_" for c in report_title)[:50]
    filename = f"{report_type}_{safe_title}_{report_id[:8]}.pdf".replace(" ", "_")
    output_path = os.path.join(output_dir, filename)

    os.makedirs(output_dir, exist_ok=True)

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=3.5 * cm,
        bottomMargin=2.0 * cm,
    )

    _hf = functools.partial(
        _header_footer,
        report_type=report_type,
        report_title=report_title,
        org_name=org_name,
    )

    elements = []

    # ── Report Identity Block ──
    elements.append(Paragraph(report_title, styles["ReportTitle"]))
    elements.append(Paragraph(
        f"Report ID: <b>{report_id}</b> &nbsp;|&nbsp; "
        f"Generated: {generated_date[:10]} &nbsp;|&nbsp; "
        f"By: {user_name} &nbsp;|&nbsp; Org: {org_name}",
        styles["SubTitle"]
    ))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=_rgb(BRAND_GREEN), spaceAfter=12))

    # ─────────────────────────────────────────────────────────────────────────
    # Report-type-specific content
    # ─────────────────────────────────────────────────────────────────────────

    if report_type == "waste_classification":
        _pdf_waste_classification(elements, report_data, styles)

    elif report_type == "recycling":
        _pdf_recycling(elements, report_data, styles)

    elif report_type == "sustainability":
        _pdf_sustainability(elements, report_data, styles)

    elif report_type == "environmental_impact":
        _pdf_environmental(elements, report_data, styles)

    elif report_type == "circular_economy":
        _pdf_circular(elements, report_data, styles)

    elif report_type == "esg_summary":
        _pdf_esg_summary(elements, report_data, styles)

    # Build PDF
    doc.build(elements, onFirstPage=_hf, onLaterPages=_hf)
    logger.info(f"PDF generated: {output_path}")
    return output_path


# ─── Per-Type PDF Builders ────────────────────────────────────────────────────

def _pdf_waste_classification(elements, data, styles):
    from reportlab.platypus import Paragraph, Spacer
    ai = data.get("ai_results", {}) or {}
    img = data.get("image_info", {}) or {}

    # Summary stat cards
    _stat_card_row(elements, [
        {"value": f"{ai.get('recyclability_score', 0):.0f}%", "label": "Recyclability", "color": BRAND_GREEN},
        {"value": f"{ai.get('material_confidence', 0):.0f}%", "label": "AI Confidence", "color": ACCENT_BLUE},
        {"value": f"{ai.get('reuse_potential', 0):.0f}%", "label": "Reuse Potential", "color": ACCENT_AMBER},
        {"value": ai.get("overall_rating", "—"), "label": "Overall Rating", "color": NEUTRAL_GRAY},
    ], styles)
    elements.append(Spacer(1, 12))

    # AI Classification Results
    _section_table(elements, "AI Classification Results", [
        ("Material Type", ai.get("material", "—")),
        ("Material Confidence", f"{ai.get('material_confidence', 0):.1f}%"),
        ("Fabric Category", ai.get("fabric_category", "—")),
        ("Detected Color", ai.get("detected_color", "—")),
        ("Waste Category", ai.get("waste_category", "—")),
        ("Waste Confidence", f"{ai.get('waste_confidence', 0):.1f}%"),
        ("Recyclable", "✓ Yes" if ai.get("is_recyclable") else "✗ No"),
        ("Reusable", "✓ Yes" if ai.get("is_reusable") else "✗ No"),
        ("Repairable", "✓ Yes" if ai.get("is_repairable") else "✗ No"),
        ("Hazardous", "✓ Yes" if ai.get("is_hazardous") else "✗ No"),
        ("Mixed Material", "✓ Yes" if ai.get("is_mixed") else "✗ No"),
        ("Contamination Status", ai.get("contamination_status", "—")),
        ("Damage Detection", ai.get("damage_detection", "—")),
        ("Image Quality", ai.get("image_quality", "—")),
        ("AI Confidence (Overall)", f"{ai.get('overall_confidence', 0):.1f}%"),
        ("Model Version", ai.get("model_version", "v1.0.0")),
    ], styles, color=BRAND_GREEN)

    # Image Information
    _section_table(elements, "Image Analysis Details", [
        ("Filename", img.get("filename", "—")),
        ("Dimensions", f"{img.get('width', '—')} × {img.get('height', '—')} px" if img.get("width") else "—"),
        ("Surface Quality", img.get("surface_quality", "—")),
        ("Fabric Pattern", img.get("fabric_pattern", "—")),
        ("Dominant Colors", ", ".join(img.get("dominant_colors", []) or ["—"])),
        ("Visible Damage", "Yes" if img.get("visible_damage") else "No"),
        ("Contamination", "Detected" if img.get("contamination_detected") else "None"),
    ], styles, color=ACCENT_BLUE)

    # AI Recommendation Summary
    summary = data.get("ai_recommendation_summary", "")
    if summary:
        elements.append(Paragraph("AI Recommendation Summary", styles["SectionHeader"]))
        elements.append(Paragraph(summary, styles["BodyText2"]))


def _pdf_recycling(elements, data, styles):
    from reportlab.platypus import Paragraph, Spacer
    rec = data.get("recycling", {}) or {}
    all_recs = rec.get("all_recommendations", []) or []

    _stat_card_row(elements, [
        {"value": f"{rec.get('material_recovery_pct', 0):.0f}%", "label": "Material Recovery", "color": ACCENT_BLUE},
        {"value": rec.get("success_rate", "—"), "label": "Success Rate", "color": BRAND_GREEN},
        {"value": rec.get("estimated_cost", "—"), "label": "Est. Cost", "color": ACCENT_AMBER},
        {"value": rec.get("estimated_time", "—"), "label": "Est. Time", "color": NEUTRAL_GRAY},
    ], styles)
    elements.append(Spacer(1, 12))

    _section_table(elements, "Recycling Recommendation", [
        ("Recommended Method", rec.get("recommended_method", "—")),
        ("Technique", rec.get("technique", "—")),
        ("Recovery Recommendation", rec.get("recovery_recommendation", "—")),
        ("Recovery Difficulty", rec.get("recovery_difficulty", "—")),
        ("Material Recovery %", f"{rec.get('material_recovery_pct', 0):.0f}%"),
        ("Success Rate", rec.get("success_rate", "—")),
        ("Estimated Cost", rec.get("estimated_cost", "—")),
        ("Estimated Time", rec.get("estimated_time", "—")),
        ("Environmental Benefit", rec.get("environmental_benefit", "—")),
        ("Industry Applications", rec.get("industry_applications", "—")),
    ], styles, color=ACCENT_BLUE)

    # Status Timeline
    elements.append(Paragraph("Processing Status Timeline", styles["SectionHeader"]))
    timeline = rec.get("status_timeline", []) or []
    for step in timeline:
        done_label = "✓" if step.get("done") else "○"
        elements.append(Paragraph(
            f"<b>{done_label} {step.get('step', '')}</b> — {step.get('desc', '')}",
            styles["BodyText2"]
        ))


def _pdf_sustainability(elements, data, styles):
    from reportlab.platypus import Paragraph, Spacer
    sus = data.get("sustainability", {}) or {}

    rating = sus.get("sustainability_rating", "Average")
    rating_colors = {"Excellent": BRAND_GREEN, "Good": ACCENT_BLUE, "Average": ACCENT_AMBER, "Needs Improvement": (0.75, 0.15, 0.15)}

    _stat_card_row(elements, [
        {"value": f"{sus.get('sustainability_score', 0):.0f}", "label": "Sustainability Score", "color": BRAND_GREEN},
        {"value": f"{sus.get('environmental_benefit_score', 0):.0f}", "label": "Env. Benefit", "color": ACCENT_BLUE},
        {"value": f"{sus.get('resource_recovery_score', 0):.0f}", "label": "Resource Recovery", "color": ACCENT_AMBER},
        {"value": rating, "label": "Rating", "color": rating_colors.get(rating, NEUTRAL_GRAY)},
    ], styles)
    elements.append(Spacer(1, 12))

    _section_table(elements, "Sustainability Metrics", [
        ("Sustainability Score", f"{sus.get('sustainability_score', 0):.1f} / 100"),
        ("Environmental Benefit Score", f"{sus.get('environmental_benefit_score', 0):.1f} / 100"),
        ("Resource Recovery Score", f"{sus.get('resource_recovery_score', 0):.1f} / 100"),
        ("Material Longevity Score", f"{sus.get('material_longevity_score', 0):.1f} / 100"),
        ("Waste Diversion Score", f"{sus.get('waste_diversion_score', 0):.1f} / 100"),
        ("Carbon Footprint", sus.get("carbon_footprint", "—")),
        ("Sustainability Rating", rating),
    ], styles, color=BRAND_GREEN)

    # Insights
    insights = sus.get("insights", []) or []
    if insights:
        elements.append(Paragraph("AI-Generated Insights", styles["SectionHeader"]))
        for insight in insights[:5]:
            elements.append(Paragraph(f"• {insight}", styles["BodyText2"]))


def _pdf_environmental(elements, data, styles):
    from reportlab.platypus import Paragraph, Spacer
    env = data.get("environmental", {}) or {}

    _stat_card_row(elements, [
        {"value": f"{env.get('co2_saved', 0):.1f} kg", "label": "CO₂ Saved", "color": BRAND_GREEN},
        {"value": f"{env.get('water_saved', 0):.0f} L", "label": "Water Saved", "color": ACCENT_BLUE},
        {"value": f"{env.get('landfill_diversion', 0):.1f} kg", "label": "Landfill Diverted", "color": ACCENT_AMBER},
        {"value": f"{env.get('resource_conservation', 0):.1f} kg", "label": "Resources Conserved", "color": NEUTRAL_GRAY},
    ], styles)
    elements.append(Spacer(1, 12))

    _section_table(elements, "Environmental Impact Estimation", [
        ("CO₂ Saved", f"{env.get('co2_saved', 0):.2f} kg"),
        ("Water Saved", f"{env.get('water_saved', 0):.0f} Liters"),
        ("Energy Saved", f"{env.get('energy_saved', 0):.1f} kWh"),
        ("Landfill Diversion", f"{env.get('landfill_diversion', 0):.2f} kg"),
        ("Resource Conservation", f"{env.get('resource_conservation', 0):.2f} kg"),
        ("Equivalent Trees Planted", f"{env.get('equivalent_trees', 0):.1f}"),
        ("Equivalent kWh Electricity", f"{env.get('equivalent_electricity', 0):.1f} kWh"),
        ("Equivalent Water Bottles", f"{env.get('equivalent_water_bottles', 0):.0f}"),
        ("Equivalent Household Energy Days", f"{env.get('equivalent_household_energy', 0):.1f}"),
    ], styles, color=BRAND_GREEN)


def _pdf_circular(elements, data, styles):
    from reportlab.platypus import Paragraph, Spacer
    circ = data.get("circularity", {}) or {}

    rating = circ.get("overall_rating", "Average")
    _stat_card_row(elements, [
        {"value": f"{circ.get('circularity_score', 0):.0f}", "label": "Circularity Score", "color": (0.30, 0.20, 0.75)},
        {"value": f"{circ.get('reuse_potential', 0):.0f}%", "label": "Reuse Potential", "color": BRAND_GREEN},
        {"value": f"{circ.get('recovery_efficiency', 0):.0f}%", "label": "Recovery Efficiency", "color": ACCENT_BLUE},
        {"value": rating, "label": "Overall Rating", "color": NEUTRAL_GRAY},
    ], styles)
    elements.append(Spacer(1, 12))

    _section_table(elements, "Circular Economy Metrics", [
        ("Circularity Score", f"{circ.get('circularity_score', 0):.1f} / 100"),
        ("Reuse Potential", f"{circ.get('reuse_potential', 0):.1f}%"),
        ("Recovery Efficiency", f"{circ.get('recovery_efficiency', 0):.1f}%"),
        ("Material Retention", f"{circ.get('material_retention', 0):.1f}%"),
        ("Lifecycle Extension", f"{circ.get('lifecycle_extension', 0):.1f}%"),
        ("Circularity Index", f"{circ.get('circularity_index', 0):.2f}"),
        ("Classification", circ.get("classification", "—")),
        ("Overall Rating", rating),
    ], styles, color=(0.30, 0.20, 0.75))


def _pdf_esg_summary(elements, data, styles):
    from reportlab.platypus import Paragraph, Spacer
    esg = data.get("esg", {}) or {}

    # Executive ESG Summary
    elements.append(Paragraph("Executive ESG Summary", styles["SectionHeader"]))
    elements.append(Paragraph(esg.get("executive_summary", "—"), styles["BodyText2"]))
    elements.append(Spacer(1, 8))

    # Summary KPI Cards
    _stat_card_row(elements, [
        {"value": f"{esg.get('esg_score', 0):.0f}", "label": "ESG Score", "color": BRAND_GREEN},
        {"value": esg.get("esg_rating", "—"), "label": "ESG Rating", "color": ACCENT_BLUE},
        {"value": f"{esg.get('sustainability_score', 0):.0f}", "label": "Sustainability", "color": (0.15, 0.65, 0.45)},
        {"value": f"{esg.get('circularity_score', 0):.0f}", "label": "Circularity", "color": (0.30, 0.20, 0.75)},
    ], styles)
    elements.append(Spacer(1, 12))

    # E Pillar
    _section_table(elements, "Environmental (E) Metrics", [
        ("Sustainability Score", f"{esg.get('sustainability_score', 0):.1f} / 100"),
        ("Environmental Rating", esg.get("sustainability_rating", "—")),
        ("Carbon Footprint", esg.get("carbon_footprint", "—")),
        ("CO₂ Savings", f"{esg.get('co2_saved', 0):.2f} kg"),
        ("Water Savings", f"{esg.get('water_saved', 0):.0f} L"),
        ("Landfill Diversion", f"{esg.get('landfill_diversion', 0):.2f} kg"),
        ("Resource Recovery Score", f"{esg.get('resource_recovery_score', 0):.1f} / 100"),
        ("Circularity Score", f"{esg.get('circularity_score', 0):.1f} / 100"),
        ("Waste Diversion Score", f"{esg.get('waste_diversion_score', 0):.1f} / 100"),
        ("Recycling Recommendation", esg.get("recycling_recommendation", "—")),
        ("Material Recovery Score", f"{esg.get('material_recovery_score', 0):.1f}%"),
    ], styles, color=BRAND_GREEN)

    # S Pillar
    _section_table(elements, "Social (S) Indicators", [
        ("Compliance Status", esg.get("compliance_status", "Not Available")),
        ("Waste Handling Safety", esg.get("waste_handling_safety", "Not Available")),
        ("Hazardous Material Detection", esg.get("hazardous_material_detection", "Not Available")),
        ("Contamination Risk", esg.get("contamination_risk", "Not Available")),
        ("Supply Chain Transparency", esg.get("supply_chain_transparency", "Not Available")),
    ], styles, color=ACCENT_BLUE)

    # G Pillar
    _section_table(elements, "Governance (G) Metadata", [
        ("Prediction Confidence", f"{esg.get('prediction_confidence', 0):.1f}%" if esg.get("prediction_confidence") else "—"),
        ("AI Model Version", esg.get("model_version", "Not Available")),
        ("Dataset Used", esg.get("dataset_used", "Not Available")),
        ("Report Generated By", esg.get("generated_by", "—")),
        ("Report Generated On", esg.get("generated_on", "—")),
        ("Prediction ID", esg.get("prediction_id", "—")),
        ("Waste Batch ID", esg.get("waste_batch_id", "—")),
        ("Dataset Traceability", esg.get("dataset_traceability", "Not Available")),
        ("Audit Timestamp", esg.get("audit_timestamp", "—")),
    ], styles, color=ACCENT_AMBER)
