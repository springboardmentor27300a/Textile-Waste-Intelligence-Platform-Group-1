from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.dependencies import CurrentUser
from app.models.report import Report
from app.services.report_service import (
    generate_pdf_report,
    generate_excel_report,
)

router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)


@router.post("/generate/{batch_id}/pdf")
def generate_pdf(
    batch_id: int,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    try:
        return generate_pdf_report(
            db=db,
            current_user=current_user,
            batch_id=batch_id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.post("/generate/{batch_id}/excel")
def generate_excel(
    batch_id: int,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    try:
        return generate_excel_report(
            db=db,
            current_user=current_user,
            batch_id=batch_id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.get("/download/{report_id}")
def download_report(
    report_id: int,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    report = (
        db.query(Report)
        .filter(
            Report.id == report_id,
            Report.generated_by == current_user.id,
        )
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found",
        )

    path = Path(report.file_path)

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="Report file not found",
        )

    return FileResponse(
        path=str(path),
        filename=report.file_name,
        media_type=(
            "application/pdf"
            if report.file_format == "PDF"
            else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ),
    )


@router.get("")
def list_reports(
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    reports = (
        db.query(Report)
        .filter(Report.generated_by == current_user.id)
        .order_by(Report.created_at.desc())
        .all()
    )

    return [
        {
            "id": report.id,
            "title": report.title,
            "report_type": report.report_type,
            "file_name": report.file_name,
            "file_format": report.file_format,
            "created_at": report.created_at,
        }
        for report in reports
    ]