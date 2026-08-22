from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..deps import get_current_user
from ..excel_reports import build_full_export_workbook
from ..sustainability import assess_sustainability

router = APIRouter(prefix="/api/exports", tags=["Reports & Export"])


@router.get("/full-export.xlsx")
@router.get("/classification-report.xlsx")
@router.get("/sustainability-report.xlsx")
def download_full_excel_export(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    batches = db.query(models.WasteBatch).order_by(models.WasteBatch.created_at.desc()).all()
    analyses = (
        db.query(models.ImageAnalysis)
        .join(models.WasteBatch)
        .order_by(models.ImageAnalysis.created_at.desc())
        .all()
    )

    sustainability_rows = []
    for b in batches:
        result = assess_sustainability(b.fabric_type, b.condition, b.category, b.quantity_kg)
        sustainability_rows.append({
            "batch_code": b.batch_code,
            "fabric_type": b.fabric_type.value,
            "quantity_kg": b.quantity_kg,
            "category": b.category.value,
            "recommended_pathway": result.recommended_pathway,
            "co2_saved_kg": result.co2_saved_kg,
            "water_saved_liters": result.water_saved_liters,
            "landfill_diverted_kg": result.landfill_diverted_kg,
        })

    xlsx_bytes = build_full_export_workbook(batches, analyses, sustainability_rows)
    return Response(
        content=xlsx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=reloom-full-export.xlsx"},
    )
