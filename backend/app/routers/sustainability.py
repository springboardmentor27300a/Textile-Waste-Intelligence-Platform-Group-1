import io
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user
from ..sustainability import assess_sustainability, DIVERSION_CREDIT

router = APIRouter(prefix="/api/sustainability", tags=["Sustainability Intelligence"])

BRAND_GREEN = colors.HexColor("#1F6F52")
INK = colors.HexColor("#1B2420")
MUTED = colors.HexColor("#5B6B60")
LINE = colors.HexColor("#D8DED2")


@router.get("/batches/{batch_id}", response_model=schemas.SustainabilityAssessmentOut)
def get_batch_sustainability(
    batch_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    batch = db.query(models.WasteBatch).filter(models.WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Waste batch not found.")

    result = assess_sustainability(batch.fabric_type, batch.condition, batch.category, batch.quantity_kg)
    return schemas.SustainabilityAssessmentOut(
        batch_id=batch.id,
        batch_code=batch.batch_code,
        fabric_type=batch.fabric_type,
        quantity_kg=batch.quantity_kg,
        category=batch.category,
        recommended_pathway=result.recommended_pathway,
        pathway_options=result.pathway_options,
        co2_saved_kg=result.co2_saved_kg,
        water_saved_liters=result.water_saved_liters,
        landfill_diverted_kg=result.landfill_diverted_kg,
        recyclability_component=result.recyclability_component,
        condition_component=result.condition_component,
        reuse_component=result.reuse_component,
        environmental_component=result.environmental_component,
        feasibility_component=result.feasibility_component,
        circularity_score=result.circularity_score,
        circularity_category=result.circularity_category,
        rationale=result.rationale,
    )


def _compute_summary(db: Session) -> schemas.CircularEconomySummary:
    batches = db.query(models.WasteBatch).all()

    total_qty = sum(b.quantity_kg for b in batches)
    total_co2 = 0.0
    total_water = 0.0
    total_diverted = 0.0
    by_pathway: dict[str, float] = {}
    by_category_qty: dict[str, float] = {}

    for b in batches:
        result = assess_sustainability(b.fabric_type, b.condition, b.category, b.quantity_kg)
        total_co2 += result.co2_saved_kg
        total_water += result.water_saved_liters
        total_diverted += result.landfill_diverted_kg
        by_pathway[result.recommended_pathway] = by_pathway.get(result.recommended_pathway, 0) + b.quantity_kg
        cat_key = b.category.value
        by_category_qty[cat_key] = by_category_qty.get(cat_key, 0) + b.quantity_kg

    diversion_rate = round((total_diverted / total_qty) * 100, 1) if total_qty > 0 else 0.0

    return schemas.CircularEconomySummary(
        total_batches=len(batches),
        total_quantity_kg=round(total_qty, 2),
        diverted_quantity_kg=round(total_diverted, 2),
        diversion_rate_pct=diversion_rate,
        total_co2_saved_kg=round(total_co2, 2),
        total_water_saved_liters=round(total_water, 1),
        total_landfill_diverted_kg=round(total_diverted, 2),
        by_pathway={k: round(v, 2) for k, v in by_pathway.items()},
        by_category_quantity_kg={k: round(v, 2) for k, v in by_category_qty.items()},
    )


@router.get("/circular-economy-summary", response_model=schemas.CircularEconomySummary)
def circular_economy_summary(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return _compute_summary(db)


@router.get("/circular-economy-report.pdf")
def download_circular_economy_report(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    summary = _compute_summary(db)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2 * cm, bottomMargin=2 * cm, leftMargin=2 * cm, rightMargin=2 * cm)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("T", parent=styles["Title"], textColor=INK, fontSize=20)
    sub_style = ParagraphStyle("S", parent=styles["Normal"], textColor=MUTED, fontSize=10, spaceAfter=14)
    heading_style = ParagraphStyle("H", parent=styles["Heading2"], textColor=BRAND_GREEN, fontSize=13, spaceBefore=16, spaceAfter=8)
    body_style = ParagraphStyle("B", parent=styles["Normal"], textColor=INK, fontSize=9, leading=12)

    elements = [
        Paragraph("Reloom — Circular Economy & Sustainability Report", title_style),
        Paragraph(f"Generated {datetime.utcnow().strftime('%d %B %Y, %H:%M UTC')} · {summary.total_batches} batch(es) across the workspace", sub_style),
    ]

    elements.append(Paragraph("Summary", heading_style))
    rows = [
        ["Total quantity tracked", f"{summary.total_quantity_kg} kg"],
        ["Diverted from landfill", f"{summary.diverted_quantity_kg} kg ({summary.diversion_rate_pct}%)"],
        ["Estimated CO2e avoided", f"{summary.total_co2_saved_kg} kg"],
        ["Estimated water avoided", f"{summary.total_water_saved_liters:,.0f} L"],
    ]
    t = Table(rows, colWidths=[8 * cm, 6 * cm])
    t.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 10), ("TEXTCOLOR", (0, 0), (0, -1), MUTED),
        ("TEXTCOLOR", (1, 0), (1, -1), INK), ("FONTNAME", (1, 0), (1, -1), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -2), 0.5, LINE),
    ]))
    elements.append(t)

    elements.append(Paragraph("Quantity by recommended pathway", heading_style))
    pathway_rows = [["Pathway", "Quantity (kg)"]] + [[k, f"{v}"] for k, v in sorted(summary.by_pathway.items(), key=lambda x: -x[1])]
    pt = Table(pathway_rows, colWidths=[10 * cm, 4 * cm])
    pt.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 9.5), ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("BACKGROUND", (0, 0), (-1, 0), BRAND_GREEN),
        ("TEXTCOLOR", (0, 1), (-1, -1), INK), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#EEF1EA")]),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 6), ("GRID", (0, 0), (-1, -1), 0.5, LINE),
    ]))
    elements.append(pt)

    elements.append(Paragraph(
        "CO2 and water figures are industry-average reference estimates per fibre type, not measured "
        "values for individual batches - see app/sustainability.py for the exact method and its limits.",
        ParagraphStyle("F", parent=styles["Normal"], textColor=MUTED, fontSize=8, spaceBefore=14),
    ))

    doc.build(elements)
    return Response(
        content=buffer.getvalue(), media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=circular-economy-report.pdf"},
    )
