from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import pandas as pd
import io
from app.database import get_db
from app.models.user import User
from app.models.waste_record import WasteRecord
from app.schemas import WasteRecordCreate, WasteRecordOut, WasteAnalytics
from app.services.auth_service import get_current_user, require_admin_or_analyst

router = APIRouter(prefix="/api/waste", tags=["Waste Records"])


@router.get("/records", response_model=List[WasteRecordOut])
def list_waste_records(
    skip: int = 0,
    limit: int = 50,
    waste_type: Optional[str] = Query(None),
    disposal_method: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List waste records with optional filters."""
    query = db.query(WasteRecord).filter(WasteRecord.recorded_by_id == current_user.id)
    if waste_type:
        query = query.filter(WasteRecord.waste_type == waste_type)
    if disposal_method:
        query = query.filter(WasteRecord.disposal_method == disposal_method)
    if year:
        query = query.filter(WasteRecord.period_year == year)
    return query.order_by(WasteRecord.recorded_at.desc()).offset(skip).limit(limit).all()


@router.post("/records", response_model=WasteRecordOut, status_code=201)
def create_waste_record(
    data: WasteRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_analyst),
):
    """Log a new waste record."""
    record = WasteRecord(**data.model_dump(), recorded_by_id=current_user.id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/analytics")
def get_analytics(
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return aggregated waste analytics."""
    query = db.query(WasteRecord).filter(WasteRecord.recorded_by_id == current_user.id)
    if year:
        query = query.filter(WasteRecord.period_year == year)

    records = query.all()
    if not records:
        return {
            "total_waste_kg": 0, "total_recycled_kg": 0, "recycling_rate": 0,
            "by_material": {}, "by_disposal": {}, "monthly_trend": [], "top_waste_type": "N/A"
        }

    total_waste = sum(r.quantity_kg for r in records)
    total_recycled = sum(r.quantity_kg * (r.recycled_percentage / 100) for r in records)
    recycling_rate = round((total_recycled / total_waste) * 100, 2) if total_waste else 0

    # By waste type
    by_type: dict[str, float] = {}
    for r in records:
        key = r.waste_type.value if hasattr(r.waste_type, 'value') else str(r.waste_type)
        by_type[key] = round(by_type.get(key, 0) + r.quantity_kg, 2)

    # By disposal method
    by_disposal: dict[str, float] = {}
    for r in records:
        key = r.disposal_method.value if hasattr(r.disposal_method, 'value') else str(r.disposal_method)
        by_disposal[key] = round(by_disposal.get(key, 0) + r.quantity_kg, 2)

    # Monthly trend (month 1-12)
    monthly: dict[int, float] = {}
    for r in records:
        if r.period_month:
            monthly[r.period_month] = round(monthly.get(r.period_month, 0) + r.quantity_kg, 2)
    monthly_trend = [{"month": m, "waste_kg": monthly.get(m, 0)} for m in range(1, 13)]

    top_waste_type = max(by_type, key=by_type.get) if by_type else "N/A"

    return {
        "total_waste_kg": round(total_waste, 2),
        "total_recycled_kg": round(total_recycled, 2),
        "recycling_rate": recycling_rate,
        "by_waste_type": by_type,
        "by_disposal": by_disposal,
        "monthly_trend": monthly_trend,
        "top_waste_type": top_waste_type,
    }


@router.get("/dashboard-stats")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Aggregated KPIs for the main dashboard."""
    from app.models.inventory import Inventory
    from app.models.supplier import Supplier

    total_inv_kg = db.query(func.sum(Inventory.quantity_kg)).filter(Inventory.created_by_id == current_user.id).scalar() or 0
    total_inv_items = db.query(func.count(Inventory.id)).filter(Inventory.created_by_id == current_user.id).scalar() or 0
    total_waste_kg = db.query(func.sum(WasteRecord.quantity_kg)).filter(WasteRecord.recorded_by_id == current_user.id).scalar() or 0
    active_suppliers = db.query(func.count(Supplier.id)).scalar() or 0
    recent_records = db.query(func.count(WasteRecord.id)).filter(WasteRecord.recorded_by_id == current_user.id).scalar() or 0

    all_waste = db.query(WasteRecord).filter(WasteRecord.recorded_by_id == current_user.id).all()
    if all_waste and total_waste_kg > 0:
        total_recycled = sum(r.quantity_kg * (r.recycled_percentage / 100) for r in all_waste)
        recycling_rate = round((total_recycled / total_waste_kg) * 100, 2)
    else:
        recycling_rate = 0

    return {
        "total_inventory_kg": round(total_inv_kg, 2),
        "total_inventory_items": total_inv_items,
        "total_waste_kg": round(total_waste_kg, 2),
        "recycling_rate": recycling_rate,
        "active_suppliers": active_suppliers,
        "recent_waste_records": recent_records,
    }


@router.post("/import", status_code=201)
async def import_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_analyst),
):
    """Bulk import waste records from CSV file."""
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    try:
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {str(e)}")

    required_cols = {"waste_type", "quantity_kg", "disposal_method"}
    if not required_cols.issubset(df.columns):
        raise HTTPException(status_code=400, detail=f"CSV must contain columns: {required_cols}")

    records_created = 0
    for _, row in df.iterrows():
        try:
            record = WasteRecord(
                waste_type=row["waste_type"],
                quantity_kg=float(row["quantity_kg"]),
                disposal_method=row["disposal_method"],
                recycled_percentage=float(row.get("recycled_percentage", 0)),
                co2_equivalent_kg=float(row.get("co2_equivalent_kg", 0)),
                notes=row.get("notes", ""),
                period_month=int(row["period_month"]) if "period_month" in row else None,
                period_year=int(row["period_year"]) if "period_year" in row else None,
                recorded_by_id=current_user.id,
            )
            db.add(record)
            records_created += 1
        except Exception:
            continue

    db.commit()
    return {"message": f"Successfully imported {records_created} records"}
