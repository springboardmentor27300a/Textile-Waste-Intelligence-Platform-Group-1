"""
Waste classification report generator (Milestone 2). Builds real PDFs from
whatever ImageAnalysis rows actually exist - empty state is handled
honestly rather than showing fabricated rows.
"""
import io
import os
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
)

BRAND_GREEN = colors.HexColor("#1F6F52")
INK = colors.HexColor("#1B2420")
MUTED = colors.HexColor("#5B6B60")
LINE = colors.HexColor("#D8DED2")


def build_classification_report_pdf(analyses: list) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm, leftMargin=2*cm, rightMargin=2*cm)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("TitleStyle", parent=styles["Title"], textColor=INK, fontSize=20)
    sub_style = ParagraphStyle("SubStyle", parent=styles["Normal"], textColor=MUTED, fontSize=10, spaceAfter=14)
    heading_style = ParagraphStyle("HeadingStyle", parent=styles["Heading2"], textColor=BRAND_GREEN, fontSize=13, spaceBefore=16, spaceAfter=8)
    body_style = ParagraphStyle("BodyStyle", parent=styles["Normal"], textColor=INK, fontSize=9, leading=12)

    elements = [
        Paragraph("Reloom — Waste Classification Report", title_style),
        Paragraph(f"Generated {datetime.utcnow().strftime('%d %B %Y, %H:%M UTC')} · {len(analyses)} photo analysis record(s) on file", sub_style),
    ]

    if not analyses:
        elements.append(Paragraph("No batches have been photo-analyzed yet.", body_style))
        doc.build(elements)
        return buffer.getvalue()

    category_counts, fabric_counts, scores = {}, {}, []
    high_contam = high_damage = 0
    for a in analyses:
        if a.recommended_category:
            k = a.recommended_category.value; category_counts[k] = category_counts.get(k, 0) + 1
        if a.predicted_fabric_type:
            k = a.predicted_fabric_type.value; fabric_counts[k] = fabric_counts.get(k, 0) + 1
        if a.recyclability_score is not None: scores.append(a.recyclability_score)
        if (a.contamination_score or 0) > 0.5: high_contam += 1
        if (a.damage_score or 0) > 0.5: high_damage += 1
    avg_score = round(sum(scores) / len(scores), 1) if scores else "—"

    elements.append(Paragraph("Summary", heading_style))
    summary_data = [
        ["Batches analyzed", str(len(analyses))],
        ["Average recyclability score", f"{avg_score}/100" if avg_score != "—" else "—"],
        ["Flagged for high contamination", str(high_contam)],
        ["Flagged for high damage", str(high_damage)],
    ]
    summary_table = Table(summary_data, colWidths=[8*cm, 6*cm])
    summary_table.setStyle(TableStyle([
        ("FONTSIZE", (0,0), (-1,-1), 10), ("TEXTCOLOR", (0,0), (0,-1), MUTED),
        ("TEXTCOLOR", (1,0), (1,-1), INK), ("FONTNAME", (1,0), (1,-1), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6), ("TOPPADDING", (0,0), (-1,-1), 6),
        ("LINEBELOW", (0,0), (-1,-2), 0.5, LINE),
    ]))
    elements.append(summary_table)

    elements.append(Paragraph("Recommended category breakdown", heading_style))
    cat_rows = [["Category", "Batches"]] + [[k.replace("_"," ").title(), str(v)] for k, v in sorted(category_counts.items(), key=lambda x: -x[1])]
    cat_table = Table(cat_rows, colWidths=[10*cm, 4*cm])
    cat_table.setStyle(TableStyle([
        ("FONTSIZE", (0,0), (-1,-1), 9.5), ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white), ("BACKGROUND", (0,0), (-1,0), BRAND_GREEN),
        ("TEXTCOLOR", (0,1), (-1,-1), INK), ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#EEF1EA")]),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6), ("TOPPADDING", (0,0), (-1,-1), 6), ("GRID", (0,0), (-1,-1), 0.5, LINE),
    ]))
    elements.append(cat_table)

    elements.append(Paragraph("Batch-level detail", heading_style))
    detail_rows = [["Batch", "Fabric", "Category", "Score", "Contamination", "Damage", "Analyzed"]]
    for a in analyses:
        batch_code = a.batch.batch_code if a.batch else "—"
        detail_rows.append([
            batch_code,
            a.predicted_fabric_type.value.replace("_"," ").title() if a.predicted_fabric_type else "—",
            a.recommended_category.value.replace("_"," ").title() if a.recommended_category else "—",
            f"{a.recyclability_score:.0f}" if a.recyclability_score is not None else "—",
            f"{(a.contamination_score or 0)*100:.0f}%", f"{(a.damage_score or 0)*100:.0f}%",
            a.created_at.strftime("%Y-%m-%d") if a.created_at else "—",
        ])
    detail_table = Table(detail_rows, colWidths=[2.6*cm,2.4*cm,2.6*cm,1.6*cm,2.6*cm,1.8*cm,2.4*cm], repeatRows=1)
    detail_table.setStyle(TableStyle([
        ("FONTSIZE", (0,0), (-1,-1), 8), ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white), ("BACKGROUND", (0,0), (-1,0), BRAND_GREEN),
        ("TEXTCOLOR", (0,1), (-1,-1), INK), ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#EEF1EA")]),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5), ("TOPPADDING", (0,0), (-1,-1), 5),
        ("GRID", (0,0), (-1,-1), 0.4, LINE), ("ALIGN", (3,0), (5,-1), "CENTER"),
    ]))
    elements.append(detail_table)
    doc.build(elements)
    return buffer.getvalue()


def build_single_analysis_report_pdf(analysis) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm, leftMargin=2*cm, rightMargin=2*cm)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("TitleStyle", parent=styles["Title"], textColor=INK, fontSize=18)
    sub_style = ParagraphStyle("SubStyle", parent=styles["Normal"], textColor=MUTED, fontSize=10, spaceAfter=14)
    heading_style = ParagraphStyle("HeadingStyle", parent=styles["Heading2"], textColor=BRAND_GREEN, fontSize=12.5, spaceBefore=14, spaceAfter=6)
    body_style = ParagraphStyle("BodyStyle", parent=styles["Normal"], textColor=INK, fontSize=9.5, leading=13)

    batch = analysis.batch
    elements = [
        Paragraph(f"Reloom — Classification Report: {batch.batch_code if batch else 'Batch'}", title_style),
        Paragraph(f"Analyzed {analysis.created_at.strftime('%d %B %Y, %H:%M UTC')}", sub_style),
    ]

    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    if analysis.image_path:
        photo_path = os.path.join(upload_dir, analysis.image_path)
        if os.path.exists(photo_path):
            try:
                elements.append(RLImage(photo_path, width=6*cm, height=6*cm, kind="proportional"))
                elements.append(Spacer(1, 10))
            except Exception:
                pass

    elements.append(Paragraph("Batch details", heading_style))
    batch_rows = [
        ["Fabric type declared", batch.fabric_type.value.replace("_"," ").title() if batch else "—"],
        ["Source", batch.source if batch else "—"],
        ["Quantity", f"{batch.quantity_kg} kg" if batch else "—"],
        ["Condition", batch.condition.value.replace("_"," ").title() if batch else "—"],
    ]
    t1 = Table(batch_rows, colWidths=[6*cm, 9*cm])
    t1.setStyle(TableStyle([("FONTSIZE",(0,0),(-1,-1),9.5), ("TEXTCOLOR",(0,0),(0,-1),MUTED), ("TEXTCOLOR",(1,0),(1,-1),INK),
                             ("BOTTOMPADDING",(0,0),(-1,-1),5), ("TOPPADDING",(0,0),(-1,-1),5), ("LINEBELOW",(0,0),(-1,-2),0.4,LINE)]))
    elements.append(t1)

    elements.append(Paragraph("Image analysis engine — real, computed signals", heading_style))
    signal_rows = [
        ["Dominant color", analysis.dominant_color_hex or "—"],
        ["Brightness", f"{(analysis.brightness or 0)*100:.0f}%"],
        ["Texture score", f"{(analysis.texture_score or 0)*100:.0f}%"],
        ["Contamination score", f"{(analysis.contamination_score or 0)*100:.0f}%"],
        ["Damage score", f"{(analysis.damage_score or 0)*100:.0f}%"],
    ]
    t2 = Table(signal_rows, colWidths=[6*cm, 9*cm])
    t2.setStyle(TableStyle([("FONTSIZE",(0,0),(-1,-1),9.5), ("TEXTCOLOR",(0,0),(0,-1),MUTED), ("TEXTCOLOR",(1,0),(1,-1),INK),
                             ("BOTTOMPADDING",(0,0),(-1,-1),5), ("TOPPADDING",(0,0),(-1,-1),5), ("LINEBELOW",(0,0),(-1,-2),0.4,LINE)]))
    elements.append(t2)

    elements.append(Paragraph("Material classification engine", heading_style))
    elements.append(Paragraph(f"<b>Declared at registration:</b> {batch.fabric_type.value.replace('_',' ').title() if batch else '—'}", body_style))
    if analysis.predicted_fabric_type:
        elements.append(Paragraph(
            f"<b>Suggested from photo:</b> {analysis.predicted_fabric_type.value.replace('_',' ').title()} ({(analysis.fabric_confidence or 0)*100:.0f}% confidence)",
            body_style))
        if analysis.material_rationale:
            elements.append(Paragraph(analysis.material_rationale, body_style))

    elements.append(Paragraph("Waste categorization & recyclability assessment", heading_style))
    if analysis.recommended_category:
        elements.append(Paragraph(
            f"<b>Recommended category:</b> {analysis.recommended_category.value.replace('_',' ').title()} "
            f"&nbsp;&nbsp; <b>Recyclability score:</b> {analysis.recyclability_score:.0f}/100", body_style))
    if analysis.rationale:
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(analysis.rationale, body_style))

    doc.build(elements)
    return buffer.getvalue()
