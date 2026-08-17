"""
Reports Router — Milestone 4 (Audited & Fixed)
=================================================
Fix applied: Export routes are now registered BEFORE the /{report_id}
wildcard to prevent FastAPI from shadowing them.

Routes:
  GET  /report-hub              — List all reports (paginated, filtered, sortable)
  GET  /report-hub/history      — Alias for list
  GET  /report-hub/types        — Report types for current role
  POST /report-hub/generate     — Generate a new report
  GET  /report-hub/export/pdf/{id}   — Download PDF  ← MUST be before /{id}
  GET  /report-hub/export/excel/{id} — Download Excel ← MUST be before /{id}
  GET  /report-hub/{id}         — Single report detail  ← wildcard, must be last
  DELETE /report-hub/{id}       — Archive report
"""

import json
import logging
import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.report import Report
from app.auth.deps import get_current_user
from app.config import settings

from app.reports.schemas import (
    GenerateReportRequest, ReportListItem, ReportListResponse,
    ReportDetailResponse, ReportData
)
from app.reports.service import (
    get_allowed_report_types, can_access_report, generate_report,
    get_report_by_id, get_reports, update_report_paths
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/report-hub", tags=["Reports & Export (M4)"])

EXPORTS_DIR = os.path.join("exports")
os.makedirs(EXPORTS_DIR, exist_ok=True)


# ─── Helper ───────────────────────────────────────────────────────────────────

def _to_list_item(rpt: Report) -> ReportListItem:
    return ReportListItem(
        id=str(rpt.id),
        report_type=rpt.report_type,
        title=rpt.title,
        status=rpt.status,
        prediction_id=str(rpt.prediction_id) if rpt.prediction_id else None,
        user_name=rpt.user.full_name if rpt.user else None,
        organization_name=rpt.user.organization.name if (rpt.user and rpt.user.organization) else None,
        has_pdf=bool(rpt.pdf_path and os.path.exists(rpt.pdf_path)),
        has_excel=bool(rpt.excel_path and os.path.exists(rpt.excel_path)),
        created_at=rpt.created_at,
    )


# ─── GET /report-hub/types  (must be before /{report_id}) ────────────────────

@router.get("/types")
def get_report_types(current_user: User = Depends(get_current_user)):
    """Return report types accessible to the current user's role."""
    allowed = get_allowed_report_types(current_user.role.name)
    type_meta = {
        "waste_classification": {
            "label": "Waste Classification Report",
            "description": "AI material classification, waste category, recyclability, and image analysis",
            "icon": "Brain", "color": "emerald",
        },
        "recycling": {
            "label": "Recycling Report",
            "description": "Recommended recycling pathways, techniques, timelines, and processing details",
            "icon": "Recycle", "color": "blue",
        },
        "sustainability": {
            "label": "Sustainability Report",
            "description": "Sustainability scores, resource recovery, carbon footprint and AI insights",
            "icon": "Leaf", "color": "green",
        },
        "environmental_impact": {
            "label": "Environmental Impact Report",
            "description": "CO₂ savings, water conservation, landfill diversion, and ecological equivalents",
            "icon": "Globe", "color": "teal",
        },
        "circular_economy": {
            "label": "Circular Economy Report",
            "description": "Circularity index, reuse potential, lifecycle extension, and economy metrics",
            "icon": "RotateCcw", "color": "purple",
        },
        "esg_summary": {
            "label": "ESG Summary Report",
            "description": "Comprehensive ESG metrics analysis, dynamic executive summary, and pillar breakdowns",
            "icon": "TrendingUp", "color": "emerald",
        },
    }
    return [{"type": t, **type_meta[t]} for t in allowed if t in type_meta]


# ─── GET /report-hub/history  (must be before /{report_id}) ──────────────────

@router.get("/history", response_model=ReportListResponse)
def get_report_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    report_type: Optional[str] = Query(None),
    sort: Optional[str] = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """History of generated reports — sortable, filterable, paginated."""
    return _list_reports_impl(
        page=page, per_page=per_page, report_type=report_type,
        sort=sort, db=db, current_user=current_user
    )


# ─── GET /report-hub/export/pdf/{id}  (must be before /{report_id}) ──────────

@router.get("/export/pdf/{report_id}")
def export_pdf(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate (if needed) and stream the PDF for a report."""
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if not can_access_report(current_user.role.name, report.report_type,
                              str(report.user_id), str(current_user.id)):
        raise HTTPException(status_code=403, detail="Access denied")

    if not report.pdf_path or not os.path.exists(report.pdf_path):
        if not report.report_data:
            raise HTTPException(status_code=422, detail="Report data missing — cannot generate PDF")
        try:
            from app.reports.generators.pdf_generator import generate_pdf
            data = json.loads(report.report_data)
            pdf_path = generate_pdf(data, EXPORTS_DIR)
            update_report_paths(db, report, pdf_path=pdf_path)
        except Exception as e:
            logger.error(f"PDF generation failed for {report_id}: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

    safe_name = report.title.replace(" ", "_")[:40]
    return FileResponse(
        path=report.pdf_path,
        media_type="application/pdf",
        filename=f"WeaveCycle_{safe_name}.pdf",
    )


# ─── GET /report-hub/export/excel/{id}  (must be before /{report_id}) ────────

@router.get("/export/excel/{report_id}")
def export_excel(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate (if needed) and stream the Excel workbook for a report."""
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if not can_access_report(current_user.role.name, report.report_type,
                              str(report.user_id), str(current_user.id)):
        raise HTTPException(status_code=403, detail="Access denied")

    if not report.excel_path or not os.path.exists(report.excel_path):
        if not report.report_data:
            raise HTTPException(status_code=422, detail="Report data missing — cannot generate Excel")
        try:
            from app.reports.generators.excel_generator import generate_excel
            data = json.loads(report.report_data)
            excel_path = generate_excel(data, EXPORTS_DIR)
            update_report_paths(db, report, excel_path=excel_path)
        except Exception as e:
            logger.error(f"Excel generation failed for {report_id}: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Excel generation failed: {str(e)}")

    safe_name = report.title.replace(" ", "_")[:40]
    return FileResponse(
        path=report.excel_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=f"WeaveCycle_{safe_name}.xlsx",
    )


# ─── POST /report-hub/generate  (before /{report_id}) ────────────────────────

@router.post("/generate", status_code=status.HTTP_201_CREATED)
def generate_new_report(
    request: GenerateReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a new report from existing platform data (no manual entry)."""
    allowed = get_allowed_report_types(current_user.role.name)
    if request.report_type not in allowed:
        raise HTTPException(
            status_code=403,
            detail=f"Your role '{current_user.role.name}' cannot generate '{request.report_type}' reports"
        )
    if not request.prediction_id:
        raise HTTPException(status_code=422, detail="prediction_id is required")

    try:
        report = generate_report(
            db=db,
            report_type=request.report_type,
            prediction_id=request.prediction_id,
            user=current_user,
            title=request.title,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Report generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

    return {
        "id": str(report.id),
        "report_type": report.report_type,
        "title": report.title,
        "status": report.status,
        "prediction_id": str(report.prediction_id) if report.prediction_id else None,
        "created_at": report.created_at.isoformat() if report.created_at else None,
        "message": "Report generated successfully",
    }


# ─── GET /report-hub  (list) ──────────────────────────────────────────────────

def _list_reports_impl(
    page: int, per_page: int,
    report_type: Optional[str],
    sort: Optional[str],
    db: Session,
    current_user: User,
) -> ReportListResponse:
    allowed = get_allowed_report_types(current_user.role.name)
    scope_user_id = None
    if current_user.role.name not in ["Administrator", "Sustainability Manager"]:
        scope_user_id = str(current_user.id)

    if report_type and report_type not in allowed:
        raise HTTPException(
            status_code=403,
            detail=f"Your role does not have access to '{report_type}' reports"
        )

    result = get_reports(
        db=db, user_id=scope_user_id,
        report_type=report_type,
        page=page, per_page=per_page,
        sort=sort or "desc",
    )
    items = [_to_list_item(r) for r in result["items"] if r.report_type in allowed]
    return ReportListResponse(
        items=items, total=result["total"], page=result["page"],
        per_page=result["per_page"], pages=result["pages"],
    )


@router.get("", response_model=ReportListResponse)
@router.get("/", response_model=ReportListResponse)
def list_reports(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    report_type: Optional[str] = Query(None),
    sort: Optional[str] = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List generated reports — role-scoped, paginated, sortable."""
    return _list_reports_impl(
        page=page, per_page=per_page, report_type=report_type,
        sort=sort, db=db, current_user=current_user
    )


# ─── GET /report-hub/{id}  (wildcard — MUST stay last) ───────────────────────

@router.get("/{report_id}", response_model=ReportDetailResponse)
def get_report_detail(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single report with full assembled data payload."""
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if not can_access_report(current_user.role.name, report.report_type,
                              str(report.user_id), str(current_user.id)):
        raise HTTPException(status_code=403, detail="Access denied to this report")

    report_data_dict = None
    if report.report_data:
        try:
            raw = json.loads(report.report_data)
            report_data_dict = ReportData(**raw)
        except Exception as e:
            logger.warning(f"Failed to parse report_data for {report_id}: {e}")

    return ReportDetailResponse(
        id=str(report.id),
        report_type=report.report_type,
        title=report.title,
        status=report.status,
        prediction_id=str(report.prediction_id) if report.prediction_id else None,
        user_name=report.user.full_name if report.user else None,
        organization_name=report.user.organization.name if (report.user and report.user.organization) else None,
        has_pdf=bool(report.pdf_path and os.path.exists(report.pdf_path)),
        has_excel=bool(report.excel_path and os.path.exists(report.excel_path)),
        report_data=report_data_dict,
        created_at=report.created_at,
    )


# ─── DELETE /report-hub/{id}  ────────────────────────────────────────────────

@router.delete("/{report_id}", status_code=status.HTTP_200_OK)
def archive_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Archive (soft-delete) a report."""
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if current_user.role.name != "Administrator" and str(report.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    report.status = "Archived"
    db.commit()
    return {"message": "Report archived successfully", "id": report_id}
