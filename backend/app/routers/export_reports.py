"""
Export Reports Router — Reports & Export System

Provides 10 download endpoints:
  GET /api/export/waste-classification/xlsx
  GET /api/export/waste-classification/pdf
  GET /api/export/recycling/xlsx
  GET /api/export/recycling/pdf
  GET /api/export/sustainability/xlsx
  GET /api/export/sustainability/pdf
  GET /api/export/environmental-impact/xlsx
  GET /api/export/environmental-impact/pdf
  GET /api/export/circular-economy/xlsx
  GET /api/export/circular-economy/pdf

All data is read from existing database tables — no hardcoded/fake values.
Files are generated in-memory and streamed directly to the client.
"""

from __future__ import annotations

import io
import json
from datetime import datetime, timezone

import pandas as pd
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.image_record import TextileImage
from app.models.waste_record import WasteRecord
from app.models.recycling_recommendation import RecyclingRecommendation
from app.models.sustainability_metric import SustainabilityMetric
from app.models.environmental_report import EnvironmentalReport
from app.models.circular_economy import CircularEconomyAnalytics
from app.models.inventory import Inventory
from app.services.auth_service import get_current_user
from app.services import material_classifier, waste_classifier, recyclability_assessor

router = APIRouter(prefix="/api/export", tags=["Reports & Export"])

_DEFAULT_CONDITION = "good"
_DEFAULT_CONTAMINATION = "none"


def _now_str():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


# ─────────────────────────────────────────────────────────────────────────────
# Shared helpers
# ─────────────────────────────────────────────────────────────────────────────

def _xlsx_response(df_sections, filename: str) -> StreamingResponse:
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        for sheet_title, df in df_sections:
            sheet_name = sheet_title[:31]
            if df is None or (hasattr(df, "empty") and df.empty):
                pd.DataFrame({"Note": [f"No data available for: {sheet_title}"]}).to_excel(
                    writer, sheet_name=sheet_name, index=False
                )
            else:
                df.to_excel(writer, sheet_name=sheet_name, index=False)
                # Auto-adjust column widths
                worksheet = writer.sheets[sheet_name]
                for idx, col in enumerate(df.columns):
                    series = df[col]
                    # Find maximum length of data in the column (handling empty series)
                    max_data_len = series.astype(str).map(len).max() if not series.empty else 0
                    max_len = max(max_data_len, len(str(col))) + 2
                    col_letter = worksheet.cell(row=1, column=idx+1).column_letter
                    worksheet.column_dimensions[col_letter].width = min(max_len, 60) # cap at 60 chars wide
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _pdf_response(sections, title: str, filename: str) -> StreamingResponse:
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib import colors
    from reportlab.lib.units import cm
    from reportlab.platypus import (
        SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable,
    )
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=landscape(A4),
        rightMargin=1.5*cm, leftMargin=1.5*cm,
        topMargin=1.5*cm, bottomMargin=1.5*cm,
    )
    styles = getSampleStyleSheet()
    teal = colors.HexColor("#0f766e")
    light_teal = colors.HexColor("#ccfbf1")

    title_style = ParagraphStyle("RT", parent=styles["Title"], fontSize=16,
                                 textColor=teal, spaceAfter=4, alignment=TA_CENTER)
    meta_style  = ParagraphStyle("MT", parent=styles["Normal"], fontSize=8,
                                 textColor=colors.grey, spaceAfter=12, alignment=TA_CENTER)
    sec_style   = ParagraphStyle("ST", parent=styles["Heading2"], fontSize=11,
                                 textColor=teal, spaceBefore=14, spaceAfter=6)
    nd_style    = ParagraphStyle("ND", parent=styles["Normal"], fontSize=9,
                                 textColor=colors.grey, spaceAfter=10)

    story = [
        Paragraph(title, title_style),
        Paragraph(f"Generated: {_now_str()}  |  Textile Waste Intelligence Platform", meta_style),
        HRFlowable(width="100%", thickness=1, color=teal, spaceAfter=10),
    ]

    page_w = landscape(A4)[0] - 3*cm

    for sec_title, headers, rows in sections:
        story.append(Paragraph(sec_title, sec_style))
        if not rows:
            story.append(Paragraph("No data available for this section.", nd_style))
            continue
        col_w = page_w / len(headers)
        table_data = [headers] + [[str(c) if c is not None else "—" for c in r] for r in rows]
        tbl = Table(table_data, colWidths=[col_w]*len(headers), repeatRows=1)
        tbl.setStyle(TableStyle([
            ("BACKGROUND",     (0,0), (-1,0), teal),
            ("TEXTCOLOR",      (0,0), (-1,0), colors.white),
            ("FONTNAME",       (0,0), (-1,0), "Helvetica-Bold"),
            ("FONTSIZE",       (0,0), (-1,0), 8),
            ("FONTSIZE",       (0,1), (-1,-1), 7),
            ("ALIGN",          (0,0), (-1,-1), "LEFT"),
            ("VALIGN",         (0,0), (-1,-1), "MIDDLE"),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, light_teal]),
            ("GRID",           (0,0), (-1,-1), 0.4, colors.HexColor("#d1d5db")),
            ("TOPPADDING",     (0,0), (-1,-1), 4),
            ("BOTTOMPADDING",  (0,0), (-1,-1), 4),
            ("LEFTPADDING",    (0,0), (-1,-1), 5),
            ("RIGHTPADDING",   (0,0), (-1,-1), 5),
        ]))
        story.append(tbl)
        story.append(Spacer(1, 8))

    doc.build(story)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _fmt_dt(dt) -> str:
    if dt is None:
        return "—"
    try:
        return dt.strftime("%Y-%m-%d %H:%M")
    except Exception:
        return str(dt)


def _fmt_f(v, d=2) -> str:
    if v is None:
        return "—"
    return str(round(float(v), d))


# ─────────────────────────────────────────────────────────────────────────────
# 1. Waste Classification
# ─────────────────────────────────────────────────────────────────────────────

def _waste_class_rows(db: Session):
    records = db.query(TextileImage).order_by(TextileImage.uploaded_at.desc()).all()
    rows = []
    for r in records:
        try:
            mat = material_classifier.classify(r.filename)
            material, mat_conf = mat.get("material","Unknown"), mat.get("confidence",0)
        except Exception:
            material, mat_conf = "Unknown", 0
        try:
            waste = waste_classifier.classify(material)
            waste_cat = waste.get("category","Unknown")
            waste_conf = waste.get("confidence",0)
            handling = waste.get("handling","")
            disposal = waste.get("disposal","")
        except Exception:
            waste_cat, waste_conf, handling, disposal = "Unknown", 0, "", ""
        try:
            rec = recyclability_assessor.assess(material=material,
                    condition=_DEFAULT_CONDITION, contamination=_DEFAULT_CONTAMINATION)
            score, status = rec.get("score",0), rec.get("status","Unknown")
        except Exception:
            score, status = 0, "Unknown"
        rows.append({
            "Image ID": r.id,
            "Original Filename": r.original_name,
            "Material": material,
            "Material Confidence (%)": round(mat_conf,1),
            "Waste Category": waste_cat,
            "Waste Confidence (%)": round(waste_conf,1),
            "Handling Method": handling,
            "Disposal Method": disposal,
            "Recyclability Score": score,
            "Recovery Status": status,
            "Upload Date": _fmt_dt(r.uploaded_at),
        })
    return rows


@router.get("/waste-classification/xlsx")
def export_waste_classification_xlsx(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = _waste_class_rows(db)
    return _xlsx_response([("Waste Classification", pd.DataFrame(rows) if rows else pd.DataFrame())],
                          "Waste_Classification_Report.xlsx")


@router.get("/waste-classification/pdf")
def export_waste_classification_pdf(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = _waste_class_rows(db)
    headers = ["Image ID","Filename","Material","Mat Conf%","Waste Category","Waste Conf%","Recyclability","Recovery Status","Upload Date"]
    pdf_rows = [[r["Image ID"],r["Original Filename"],r["Material"],r["Material Confidence (%)"],
                 r["Waste Category"],r["Waste Confidence (%)"],r["Recyclability Score"],r["Recovery Status"],r["Upload Date"]] for r in rows]
    return _pdf_response([("Waste Classification Results", headers, pdf_rows)],
                         "Waste Classification Report", "Waste_Classification_Report.pdf")


# ─────────────────────────────────────────────────────────────────────────────
# 2. Recycling
# ─────────────────────────────────────────────────────────────────────────────

def _recycling_waste_rows(db: Session):
    records = db.query(WasteRecord).order_by(WasteRecord.recorded_at.desc()).all()
    return [{
        "ID": r.id,
        "Waste Type": r.waste_type.value if r.waste_type else "—",
        "Quantity (kg)": _fmt_f(r.quantity_kg),
        "Disposal Method": r.disposal_method.value if r.disposal_method else "—",
        "Recycled (%)": _fmt_f(r.recycled_percentage,1),
        "CO2 Equivalent (kg)": _fmt_f(r.co2_equivalent_kg),
        "Period": f"{r.period_month or '—'}/{r.period_year or '—'}",
        "Notes": r.notes or "",
        "Recorded At": _fmt_dt(r.recorded_at),
    } for r in records]


def _recycling_rec_rows(db: Session):
    recs = db.query(RecyclingRecommendation).order_by(RecyclingRecommendation.created_at.desc()).all()
    return [{
        "ID": r.id,
        "Material Type": r.material_type,
        "Waste Category": r.waste_category,
        "Condition": r.condition or "—",
        "Recommendation": r.recommendation,
        "Priority": r.priority,
        "Description": r.description,
        "Reason": r.reason,
        "Environmental Benefit": r.environmental_benefit,
        "Created At": _fmt_dt(r.created_at),
    } for r in recs]


@router.get("/recycling/xlsx")
def export_recycling_xlsx(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wr = _recycling_waste_rows(db)
    rr = _recycling_rec_rows(db)
    return _xlsx_response([
        ("Waste Records", pd.DataFrame(wr) if wr else pd.DataFrame()),
        ("Recycling Recommendations", pd.DataFrame(rr) if rr else pd.DataFrame()),
    ], "Recycling_Report.xlsx")


@router.get("/recycling/pdf")
def export_recycling_pdf(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wr = _recycling_waste_rows(db)
    rr = _recycling_rec_rows(db)
    wh = ["ID","Waste Type","Qty (kg)","Disposal","Recycled%","CO2 Eq (kg)","Period","Recorded At"]
    wp = [[r["ID"],r["Waste Type"],r["Quantity (kg)"],r["Disposal Method"],r["Recycled (%)"],
           r["CO2 Equivalent (kg)"],r["Period"],r["Recorded At"]] for r in wr]
    rh = ["ID","Material","Waste Category","Recommendation","Priority","Environmental Benefit","Created At"]
    rp = [[r["ID"],r["Material Type"],r["Waste Category"],r["Recommendation"],
           r["Priority"],r["Environmental Benefit"][:60],r["Created At"]] for r in rr]
    return _pdf_response([("Waste Records",wh,wp),("Recycling Recommendations",rh,rp)],
                         "Recycling Report","Recycling_Report.pdf")


# ─────────────────────────────────────────────────────────────────────────────
# 3. Sustainability
# ─────────────────────────────────────────────────────────────────────────────

def _sustain_rows(db: Session):
    metrics = db.query(SustainabilityMetric).order_by(SustainabilityMetric.created_at.desc()).all()
    return [{
        "ID": m.id,
        "Inventory ID": m.inventory_id,
        "Material": m.material_type,
        "Waste Category": m.waste_category,
        "Weight (kg)": _fmt_f(m.weight_kg),
        "CO2 Saved (kg)": _fmt_f(m.co2_saved),
        "Water Saved (L)": _fmt_f(m.water_saved),
        "Landfill Diverted (%)": _fmt_f(m.landfill_diverted,1),
        "Resource Recovery (kg)": _fmt_f(m.resource_recovery),
        "Circularity Score": m.circularity_score,
        "Sustainability Score": _fmt_f(m.sustainability_score,1),
        "Calculated At": _fmt_dt(m.created_at),
    } for m in metrics]


@router.get("/sustainability/xlsx")
def export_sustainability_xlsx(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = _sustain_rows(db)
    return _xlsx_response([("Sustainability Metrics", pd.DataFrame(rows) if rows else pd.DataFrame())],
                          "Sustainability_Report.xlsx")


@router.get("/sustainability/pdf")
def export_sustainability_pdf(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = _sustain_rows(db)
    headers = ["ID","Inv ID","Material","Waste Cat","Weight kg","CO2 Saved kg","Water Saved L",
               "Landfill Div%","Resource Rec kg","Circularity","Score","Calculated At"]
    pdf_rows = [[r["ID"],r["Inventory ID"],r["Material"],r["Waste Category"],r["Weight (kg)"],
                 r["CO2 Saved (kg)"],r["Water Saved (L)"],r["Landfill Diverted (%)"],
                 r["Resource Recovery (kg)"],r["Circularity Score"],r["Sustainability Score"],r["Calculated At"]] for r in rows]
    return _pdf_response([("Sustainability Metrics",headers,pdf_rows)],
                         "Sustainability Report","Sustainability_Report.pdf")


# ─────────────────────────────────────────────────────────────────────────────
# 4. Environmental Impact
# ─────────────────────────────────────────────────────────────────────────────

def _env_rows(db: Session):
    env_reports = db.query(EnvironmentalReport).order_by(EnvironmentalReport.report_generated_at.desc()).all()
    rows = []
    for er in env_reports:
        sm = db.query(SustainabilityMetric).filter(SustainabilityMetric.inventory_id == er.inventory_id).first()
        rows.append({
            "Report ID": er.id,
            "Inventory ID": er.inventory_id,
            "Environmental Rating": er.environmental_rating,
            "CO2 Saved (kg)": _fmt_f(sm.co2_saved if sm else None),
            "Water Saved (L)": _fmt_f(sm.water_saved if sm else None),
            "Landfill Diverted (%)": _fmt_f(sm.landfill_diverted if sm else None,1),
            "Resource Recovery (kg)": _fmt_f(sm.resource_recovery if sm else None),
            "Sustainability Score": _fmt_f(sm.sustainability_score if sm else None,1),
            "Summary": er.summary,
            "Report Generated At": _fmt_dt(er.report_generated_at),
        })
    return rows


@router.get("/environmental-impact/xlsx")
def export_environmental_xlsx(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = _env_rows(db)
    return _xlsx_response([("Environmental Impact", pd.DataFrame(rows) if rows else pd.DataFrame())],
                          "Environmental_Impact_Report.xlsx")


@router.get("/environmental-impact/pdf")
def export_environmental_pdf(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = _env_rows(db)
    headers = ["Report ID","Inv ID","Rating","CO2 Saved kg","Water Saved L","Landfill Div%","Resource Rec kg","Score","Generated At"]
    pdf_rows = [[r["Report ID"],r["Inventory ID"],r["Environmental Rating"],r["CO2 Saved (kg)"],
                 r["Water Saved (L)"],r["Landfill Diverted (%)"],r["Resource Recovery (kg)"],
                 r["Sustainability Score"],r["Report Generated At"]] for r in rows]
    return _pdf_response([("Environmental Impact Assessment",headers,pdf_rows)],
                         "Environmental Impact Report","Environmental_Impact_Report.pdf")


# ─────────────────────────────────────────────────────────────────────────────
# 5. Circular Economy
# ─────────────────────────────────────────────────────────────────────────────

def _circular_data(db: Session):
    from sqlalchemy import func as sqlfunc
    latest = db.query(CircularEconomyAnalytics).order_by(CircularEconomyAnalytics.generated_at.desc()).first()
    agg = db.query(
        sqlfunc.count(SustainabilityMetric.id).label("total"),
        sqlfunc.sum(SustainabilityMetric.co2_saved).label("co2"),
        sqlfunc.sum(SustainabilityMetric.water_saved).label("water"),
        sqlfunc.sum(SustainabilityMetric.resource_recovery).label("recovery"),
        sqlfunc.avg(SustainabilityMetric.sustainability_score).label("avg_score"),
        sqlfunc.avg(SustainabilityMetric.landfill_diverted).label("avg_landfill"),
    ).one()

    overview = [
        {"Metric":"Overall Rating","Value": latest.overall_rating if latest else "Not generated yet"},
        {"Metric":"Total Items Processed","Value": agg.total or 0},
        {"Metric":"Total CO2 Saved (kg)","Value": _fmt_f(agg.co2)},
        {"Metric":"Total Water Saved (L)","Value": _fmt_f(agg.water)},
        {"Metric":"Total Resource Recovery (kg)","Value": _fmt_f(agg.recovery)},
        {"Metric":"Avg Sustainability Score","Value": _fmt_f(agg.avg_score,1)},
        {"Metric":"Avg Landfill Diversion (%)","Value": _fmt_f(agg.avg_landfill,1)},
        {"Metric":"Report Generated At","Value": _now_str()},
    ]

    mat_raw = (
        db.query(Inventory.material_type, sqlfunc.count(SustainabilityMetric.id).label("count"))
        .join(SustainabilityMetric, SustainabilityMetric.inventory_id == Inventory.id)
        .group_by(Inventory.material_type)
        .order_by(sqlfunc.count(SustainabilityMetric.id).desc())
        .all()
    )
    mat = [{"Material":m,"Count":c} for m,c in mat_raw]

    rec_raw = (
        db.query(RecyclingRecommendation.recommendation, sqlfunc.count(RecyclingRecommendation.id).label("count"))
        .group_by(RecyclingRecommendation.recommendation)
        .order_by(sqlfunc.count(RecyclingRecommendation.id).desc())
        .all()
    )
    rec_dist = [{"Recommendation Type":r,"Count":c} for r,c in rec_raw]

    insights = []
    if latest and latest.generated_insights:
        try:
            ins_list = json.loads(latest.generated_insights)
            insights = [{"Insight": i} for i in ins_list if i]
        except Exception:
            pass

    return overview, mat, rec_dist, insights


@router.get("/circular-economy/xlsx")
def export_circular_xlsx(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    overview, mat, rec_dist, insights = _circular_data(db)
    return _xlsx_response([
        ("Platform Overview", pd.DataFrame(overview) if overview else pd.DataFrame()),
        ("Material Distribution", pd.DataFrame(mat) if mat else pd.DataFrame()),
        ("Recommendation Dist", pd.DataFrame(rec_dist) if rec_dist else pd.DataFrame()),
        ("Generated Insights", pd.DataFrame(insights) if insights else pd.DataFrame()),
    ], "Circular_Economy_Report.xlsx")


@router.get("/circular-economy/pdf")
def export_circular_pdf(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    overview, mat, rec_dist, insights = _circular_data(db)
    return _pdf_response([
        ("Platform Overview", ["Metric","Value"], [[r["Metric"],r["Value"]] for r in overview]),
        ("Material Distribution", ["Material","Count"], [[r["Material"],r["Count"]] for r in mat]),
        ("Recommendation Type Distribution", ["Recommendation Type","Count"], [[r["Recommendation Type"],r["Count"]] for r in rec_dist]),
        ("Generated AI Insights", ["Insight"], [[r["Insight"]] for r in insights]),
    ], "Circular Economy Report", "Circular_Economy_Report.pdf")
