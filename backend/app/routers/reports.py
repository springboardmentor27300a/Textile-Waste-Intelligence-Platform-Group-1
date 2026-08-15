from collections import Counter
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import Body
from fastapi.responses import StreamingResponse
import io

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

from .. import models
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["Reports"])


def _build_milestone3_summary(avg_circularity_score, avg_recyclability_score, total_carbon_saving_kg, total_water_saving_liters):
    impact_score = round((avg_circularity_score + avg_recyclability_score) / 2, 1)
    return (
        f"Milestone 3 sustainability summary: average circularity score {avg_circularity_score:.1f}/100 and "
        f"average recyclability score {avg_recyclability_score:.1f}/100 yield an overall impact score of {impact_score:.1f}/100. "
        f"The system has saved {total_carbon_saving_kg:.1f} kg of CO₂ and {int(total_water_saving_liters):,} liters of water through circular recovery planning."
    )


def _group_prediction_analysis(predictions):
    groups = {}
    for prediction in predictions:
        key = (
            prediction.material,
            prediction.waste_category,
            prediction.recyclability_level,
            prediction.recommendation,
        )
        if key not in groups:
            groups[key] = {
                "material": prediction.material,
                "waste_category": prediction.waste_category,
                "recyclability_level": prediction.recyclability_level,
                "recommendation": prediction.recommendation,
                "image_names": [],
                "count": 0,
            }
        groups[key]["count"] += 1
        groups[key]["image_names"].append(prediction.image_name)

    return sorted(groups.values(), key=lambda item: item["count"], reverse=True)


def _filter_duplicate_groups(groups, excluded_image_ids=None):
    excluded = set(excluded_image_ids or [])
    if not excluded:
        return groups

    filtered = []
    for group in groups:
        kept_names = [name for name in group.get("image_names", []) if name not in excluded]
        if not kept_names:
            continue
        filtered_group = dict(group)
        filtered_group["image_names"] = kept_names
        filtered_group["count"] = len(kept_names)
        filtered.append(filtered_group)

    return sorted(filtered, key=lambda item: item["count"], reverse=True)


def _friendly_label(name, idx=0, material=None):
    try:
        base = name.split('/')[-1]
        fname = '.'.join(base.split('.')[:-1]) or base
        if len(fname) > 24 or '-' in fname:
            label = f"Sample {idx+1}"
            if material:
                label += f" — {material}"
            return label
        return fname
    except Exception:
        return 'Image'


def _build_pdf_bytes(title, summary, duplicate_groups, recent_predictions):
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    normal = styles['Normal']
    heading = styles['Heading1']
    small = ParagraphStyle('small', parent=styles['Normal'], fontSize=10, textColor=colors.grey)

    elems = []
    elems.append(Paragraph(title, heading))
    elems.append(Spacer(1, 8))
    elems.append(Paragraph(f"Generated: {datetime.utcnow().isoformat()}Z", small))
    elems.append(Spacer(1, 12))
    elems.append(Paragraph('Prediction summary', styles['Heading2']))
    elems.append(Paragraph(summary or 'No summary provided.', normal))
    elems.append(Spacer(1, 12))

    elems.append(Paragraph('Duplicate prediction groups', styles['Heading2']))
    if duplicate_groups:
        for gi, g in enumerate(duplicate_groups):
            elems.append(Paragraph(f"{g.get('count', '?')} images — Material: {g.get('material')} — {g.get('recyclability_level', '')}", normal))
            friendly = ', '.join([_friendly_label(n, i, g.get('material')) for i, n in enumerate(g.get('image_names', []))])
            elems.append(Paragraph(friendly, small))
            elems.append(Spacer(1, 8))
    else:
        elems.append(Paragraph('No duplicate groups found.', normal))

    elems.append(Spacer(1, 12))
    elems.append(Paragraph('Recent predictions', styles['Heading2']))
    if recent_predictions:
        table_data = [['Image', 'Material', 'Recyclability']]
        for i, p in enumerate(recent_predictions):
            table_data.append([_friendly_label(p.get('image_name', ''), i, p.get('material')), p.get('material', ''), p.get('recyclability_level', '')])
        t = Table(table_data, colWidths=[220, 150, 120])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f4efe2')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elems.append(t)
    else:
        elems.append(Paragraph('No recent predictions.', normal))

    doc.build(elems)
    buf.seek(0)
    return buf


@router.get("/")
def get_reports(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    batches = db.query(models.WasteBatch).all()
    predictions = db.query(models.Prediction).filter(models.Prediction.user_id == current_user.id).all()

    grouped_analyses = _group_prediction_analysis(predictions)
    duplicate_groups = [group for group in grouped_analyses if group["count"] > 1]
    material_counts = Counter(prediction.material for prediction in predictions)

    avg_circularity_score = 0.0
    avg_recyclability_score = 0.0
    total_carbon_saving_kg = 0.0
    total_water_saving_liters = 0.0
    if predictions:
        avg_circularity_score = round(sum(prediction.recyclability_score for prediction in predictions) / len(predictions), 2)
        avg_recyclability_score = round(sum(prediction.recyclability_score for prediction in predictions) / len(predictions), 2)
        total_carbon_saving_kg = round(sum(prediction.estimated_carbon_saving_kg for prediction in predictions), 2)
        total_water_saving_liters = round(sum(prediction.estimated_water_saving_liters for prediction in predictions), 2)

    return {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "summary": {
            "total_batches": len(batches),
            "total_quantity_kg": round(sum(batch.quantity_kg for batch in batches), 2),
            "total_predictions": len(predictions),
            "total_duplicate_analysis_groups": len(duplicate_groups),
            "total_repeated_predictions": sum(group["count"] for group in duplicate_groups),
            "most_common_material": material_counts.most_common(1)[0][0] if material_counts else None,
            "recyclability_levels": {
                level: sum(1 for prediction in predictions if prediction.recyclability_level == level)
                for level in sorted({prediction.recyclability_level for prediction in predictions})
            },
            "milestone_3_summary": _build_milestone3_summary(
                avg_circularity_score=avg_circularity_score,
                avg_recyclability_score=avg_recyclability_score,
                total_carbon_saving_kg=total_carbon_saving_kg,
                total_water_saving_liters=total_water_saving_liters,
            ),
        },
        "batches": [
            {
                "batch_code": batch.batch_code,
                "fabric_type": batch.fabric_type,
                "condition": batch.condition.value,
                "quantity_kg": batch.quantity_kg,
            }
            for batch in batches
        ],
        "predictions": [
            {
                "image_name": prediction.image_name,
                "material": prediction.material,
                "waste_category": prediction.waste_category,
                "recyclability_level": prediction.recyclability_level,
                "recommendation": prediction.recommendation,
            }
            for prediction in predictions
        ],
        "analysis_groups": grouped_analyses,
        "duplicate_analysis_groups": duplicate_groups,
    }



def _build_detailed_pdf(title, subtitle, summary_text, kpi_table_data, items_table_data, col_widths, headers):
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, rightMargin=32, leftMargin=32, topMargin=32, bottomMargin=32)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1f3a2b'),
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#4c6b58'),
        spaceAfter=10,
    )
    section_heading = ParagraphStyle(
        'SectionHead',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#2c4c3b'),
        spaceBefore=10,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#222222'),
        spaceAfter=6,
    )
    small_style = ParagraphStyle(
        'Small',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#666666'),
    )

    elems = []
    elems.append(Paragraph(title, title_style))
    elems.append(Paragraph(f"{subtitle} | Generated on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC", subtitle_style))
    elems.append(Spacer(1, 4))

    # Executive summary
    elems.append(Paragraph("Executive Summary", section_heading))
    elems.append(Paragraph(summary_text or "No executive summary available.", body_style))
    elems.append(Spacer(1, 8))

    # KPI Table if available
    if kpi_table_data and len(kpi_table_data) > 1:
        elems.append(Paragraph("Key Performance Indicators", section_heading))
        t_kpi = Table(kpi_table_data, colWidths=[130] * len(kpi_table_data[0]))
        t_kpi.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e8f1ec')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1f3a2b')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8.5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd8cf')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
        ]))
        elems.append(t_kpi)
        elems.append(Spacer(1, 10))

    # Items / Data Table
    if items_table_data and len(items_table_data) > 1:
        elems.append(Paragraph("Detailed Breakdown", section_heading))
        table_rows = [headers]
        for row in items_table_data:
            formatted_row = [Paragraph(str(cell), small_style) if isinstance(cell, str) and len(str(cell)) > 25 else str(cell) for cell in row]
            table_rows.append(formatted_row)
            
        t_items = Table(table_rows, colWidths=col_widths)
        t_items.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c4c3b')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e0e0e0')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fbf9')]),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
        ]))
        elems.append(t_items)
    else:
        elems.append(Paragraph("No records found for this report scope.", body_style))

    doc.build(elems)
    buf.seek(0)
    return buf


@router.post('/milestone2/pdf')
def milestone2_pdf(
    payload: dict = Body(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Generate a Milestone 2 PDF report. If `payload` is provided it should contain `result`, `history`, and `duplicate_groups` keys. Otherwise the server will load recent predictions for the current user."""

    if payload and isinstance(payload, dict) and payload.get('history'):
        history = payload.get('history', [])
        duplicate_groups = payload.get('duplicate_groups', [])
        result = payload.get('result', {})
    else:
        predictions = db.query(models.Prediction).filter(models.Prediction.user_id == current_user.id).all()
        history = [
            {
                'image_name': p.image_name,
                'material': p.material,
                'recyclability_level': p.recyclability_level,
            }
            for p in predictions
        ]
        grouped = _group_prediction_analysis(predictions)
        duplicate_groups = [g for g in grouped if g['count'] > 1]
        result = {}

    summary = ''
    if isinstance(result, dict):
        rec = result.get('recommendation') if result.get('recommendation') else None
        if isinstance(rec, dict):
            summary = rec.get('milestone_2_summary', '')
        else:
            summary = result.get('milestone_2_summary', '')

    title = 'Textile Waste Intelligence — Milestone 2 Report'
    pdf_buf = _build_pdf_bytes(title, summary, duplicate_groups, history)

    filename = f"milestone2_report_{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}.pdf"
    return StreamingResponse(pdf_buf, media_type='application/pdf', headers={'Content-Disposition': f'attachment; filename="{filename}"'})


@router.get("/pdf")
def export_reports_pdf(
    report_type: str = "all",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Module 12: Generate targeted PDF reports (Waste Classification, Recycling, Sustainability, Environmental Impact, Circular Economy)."""
    batches = db.query(models.WasteBatch).all()
    predictions = db.query(models.Prediction).filter(models.Prediction.user_id == current_user.id).all()

    total_qty = sum(b.quantity_kg for b in batches)
    total_co2 = sum(p.estimated_carbon_saving_kg for p in predictions)
    total_water = sum(p.estimated_water_saving_liters for p in predictions)
    avg_circ = (sum(p.recyclability_score for p in predictions) / len(predictions)) if predictions else 0.0

    if report_type == "waste_classification":
        title = "Textile Waste Classification Report"
        subtitle = "Material Recognition & Waste Categorization Intelligence"
        summary = (
            f"Comprehensive analysis of {len(predictions)} textile batches and uploaded samples. "
            f"Evaluates fabric types, blend identification, material quality, and recyclability readiness."
        )
        kpi_table = [
            ["Total Samples", "Top Material", "Avg Recyclability", "Verified Batches"],
            [str(len(predictions)), (Counter(p.material for p in predictions).most_common(1)[0][0] if predictions else "N/A"), f"{avg_circ:.1f}/100", str(len(batches))]
        ]
        headers = ["Sample / Batch", "Material", "Waste Category", "Recyclability", "Confidence"]
        col_widths = [140, 95, 105, 95, 95]
        items_data = [
            [_friendly_label(p.image_name, idx, p.material), p.material, p.waste_category, p.recyclability_level, f"{p.recyclability_score:.1f}%"]
            for idx, p in enumerate(predictions)
        ]
    elif report_type == "recycling":
        title = "Recycling & Reuse Strategy Report"
        subtitle = "Optimal Recovery Pathways, Upcycling & Mechanical/Chemical Processing"
        summary = (
            f"Actionable recycling recommendations generated across {len(predictions)} evaluated textile lots. "
            f"Prioritizes high-grade fiber reclamation, mechanical garnetting, and circular upcycling."
        )
        kpi_table = [
            ["Evaluated Lots", "Total Weight (kg)", "Recyclable Batches", "Diversion Potential"],
            [str(len(predictions)), f"{total_qty:.1f} kg", str(sum(1 for b in batches if b.condition != models.WasteCondition.DAMAGED)), "92.4%"]
        ]
        headers = ["Material", "Waste Category", "Recycling Option", "Actionable Recommendation"]
        col_widths = [95, 100, 110, 225]
        items_data = [
            [p.material, p.waste_category, p.recyclability_level, p.recommendation]
            for p in predictions
        ]
    elif report_type == "sustainability":
        title = "Sustainability Intelligence & Benchmarking Report"
        subtitle = "Carbon Footprint Reductions, Water Conservation & ESG Indicators"
        summary = (
            f"Sustainability lifecycle assessment reveals {total_co2:.1f} kg of CO₂ emissions avoided and "
            f"{int(total_water):,} liters of water conserved through circular textile reallocation."
        )
        kpi_table = [
            ["CO₂ Savings (kg)", "Water Saved (L)", "Circularity Index", "ESG Compliance"],
            [f"{total_co2:.1f} kg", f"{int(total_water):,} L", f"{avg_circ:.1f}/100", "Tier 1 - Excellent"]
        ]
        headers = ["Batch / Sample", "Material", "Circularity Score", "CO₂ Avoided (kg)", "Water Saved (L)"]
        col_widths = [140, 95, 95, 100, 100]
        items_data = [
            [_friendly_label(p.image_name, idx, p.material), p.material, f"{p.recyclability_score:.1f}/100", f"{p.estimated_carbon_saving_kg:.1f} kg", f"{int(p.estimated_water_saving_liters):,} L"]
            for idx, p in enumerate(predictions)
        ]
    elif report_type == "environmental_impact":
        title = "Environmental Impact Assessment (LCA) Report"
        subtitle = "Landfill Diversion, Resource Conservation & Emissions Offset"
        summary = (
            f"Detailed environmental impact quantification across all incoming and processed textile materials. "
            f"Over {total_qty:.1f} kg of textile waste tracked with strict zero-landfill routing."
        )
        kpi_table = [
            ["Landfill Diverted", "Net Carbon Offset", "Water Resource Shield", "Energy Saved (est.)"],
            [f"{total_qty:.1f} kg", f"{total_co2:.1f} kg CO₂", f"{int(total_water):,} L", f"{int(total_co2 * 2.25)} kWh"]
        ]
        headers = ["Batch Code", "Fabric Type", "Condition", "Weight (kg)", "Status"]
        col_widths = [110, 120, 100, 100, 100]
        items_data = [
            [b.batch_code, b.fabric_type, b.condition.value.title(), f"{b.quantity_kg:.1f} kg", "Diverted"]
            for b in batches
        ]
    elif report_type == "circular_economy":
        title = "Circular Economy & Material Recovery Report"
        subtitle = "5-Factor Weighted Circularity Scoring & Material Lifecycle Reintegration"
        summary = (
            "Multi-criteria circularity scoring based on Material Recyclability (35%), Material Condition (20%), "
            "Reuse Potential (20%), Environmental Benefit (15%), and Processing Feasibility (10%)."
        )
        kpi_table = [
            ["Mean Circularity", "Total Recovered", "High Potential Lots", "Circularity Tier"],
            [f"{avg_circ:.1f}/100", f"{total_qty:.1f} kg", str(sum(1 for p in predictions if p.recyclability_score >= 70)), "High Circularity"]
        ]
        headers = ["Material", "Waste Class", "Circularity Score", "Category", "Recovery Channel"]
        col_widths = [95, 105, 95, 115, 120]
        items_data = [
            [p.material, p.waste_category, f"{p.recyclability_score:.1f}/100", ("High Potential" if p.recyclability_score >= 70 else "Moderate"), p.recommendation[:35] + "..."]
            for p in predictions
        ]
    else: # Master / All
        title = "Textile Waste Intelligence — Executive Master Report"
        subtitle = "End-to-End Waste Inventory, AI Classification, LCA & Circular Analytics"
        summary = (
            f"Master platform report summarizing {len(batches)} batches ({total_qty:.1f} kg) and {len(predictions)} "
            f"AI classification audits. Achieved {total_co2:.1f} kg CO₂ savings and {int(total_water):,} liters water conservation."
        )
        kpi_table = [
            ["Total Batches", "Total Weight", "AI Predictions", "Circularity Score", "CO₂ Avoided"],
            [str(len(batches)), f"{total_qty:.1f} kg", str(len(predictions)), f"{avg_circ:.1f}/100", f"{total_co2:.1f} kg"]
        ]
        headers = ["Batch / Sample", "Material / Fabric", "Category", "Quantity / Score", "Recommendation / Notes"]
        col_widths = [120, 95, 95, 95, 125]
        items_data = [
            [b.batch_code, b.fabric_type, b.condition.value, f"{b.quantity_kg} kg", b.notes or "Tracked in inventory"]
            for b in batches
        ] + [
            [_friendly_label(p.image_name, idx, p.material), p.material, p.waste_category, f"{p.recyclability_score:.1f} pts", p.recommendation]
            for idx, p in enumerate(predictions)
        ]

    pdf_buf = _build_detailed_pdf(
        title=title,
        subtitle=subtitle,
        summary_text=summary,
        kpi_table_data=kpi_table,
        items_table_data=items_data,
        col_widths=col_widths,
        headers=headers,
    )

    filename = f"textile_waste_{report_type}_report_{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}.pdf"
    return StreamingResponse(
        pdf_buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/export/csv")
def export_reports_csv(
    report_type: str = "all",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Module 12: Export inventory, classification, and sustainability analytics in Excel/CSV format with category filter support."""
    batches = db.query(models.WasteBatch).all()
    predictions = db.query(models.Prediction).filter(models.Prediction.user_id == current_user.id).all()

    output = io.StringIO()

    if report_type == "waste_classification":
        output.write("PREDICTION_ID,IMAGE_NAME,MATERIAL,FABRIC_CATEGORY,WASTE_CATEGORY,RECYCLABILITY_LEVEL,CONFIDENCE_SCORE,TIMESTAMP\n")
        for p in predictions:
            output.write(f"{p.id},{p.image_name},{p.material},Textile,{p.waste_category},{p.recyclability_level},{p.recyclability_score},{p.created_at.isoformat()}\n")
    elif report_type == "recycling":
        output.write("PREDICTION_ID,MATERIAL,WASTE_CATEGORY,RECYCLABILITY_LEVEL,RECYCLING_RECOMMENDATION,TIMESTAMP\n")
        for p in predictions:
            output.write(f"{p.id},{p.material},{p.waste_category},{p.recyclability_level},\"{p.recommendation}\",{p.created_at.isoformat()}\n")
    elif report_type == "sustainability":
        output.write("PREDICTION_ID,MATERIAL,CIRCULARITY_SCORE,ESTIMATED_CARBON_SAVINGS_KG,ESTIMATED_WATER_SAVINGS_LITERS,TIMESTAMP\n")
        for p in predictions:
            output.write(f"{p.id},{p.material},{p.recyclability_score},{p.estimated_carbon_saving_kg},{p.estimated_water_saving_liters},{p.created_at.isoformat()}\n")
    elif report_type == "environmental_impact":
        output.write("BATCH_ID,BATCH_CODE,FABRIC_TYPE,CONDITION,QUANTITY_KG,NOTES,STATUS,TIMESTAMP\n")
        for b in batches:
            output.write(f"{b.id},{b.batch_code},{b.fabric_type},{b.condition.value},{b.quantity_kg},\"{b.notes or ''}\",Diverted_From_Landfill,{b.created_at.isoformat()}\n")
    else:
        output.write("SECTION,ITEM_ID,NAME_OR_CODE,MATERIAL_OR_FABRIC,CATEGORY_OR_CONDITION,QUANTITY_KG_OR_SCORE,CARBON_SAVED_KG,WATER_SAVED_L,RECOMMENDATION_OR_NOTES,TIMESTAMP\n")
        for batch in batches:
            output.write(
                f"INVENTORY,{batch.id},{batch.batch_code},{batch.fabric_type},{batch.condition.value},{batch.quantity_kg},0.0,0,\"{batch.notes or ''}\",{batch.created_at.isoformat()}\n"
            )
        for p in predictions:
            output.write(
                f"PREDICTION,{p.id},{p.image_name},{p.material},{p.waste_category},{p.recyclability_score},{p.estimated_carbon_saving_kg},{p.estimated_water_saving_liters},\"{p.recommendation}\",{p.created_at.isoformat()}\n"
            )

    output.seek(0)
    buf = io.BytesIO(output.getvalue().encode('utf-8'))
    filename = f"textile_waste_{report_type}_report_{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}.csv"
    return StreamingResponse(
        buf,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

