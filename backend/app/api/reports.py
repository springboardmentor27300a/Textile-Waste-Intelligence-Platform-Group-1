from collections import Counter
from datetime import datetime, timedelta
from io import BytesIO
from types import SimpleNamespace

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.analysis import Analysis
from app.models.collection import Collection
from app.models.inventory import Inventory
from app.models.waste_source import WasteSource

from app.services.reports.csv_service import CSVService
from app.services.reports.excel_service import ExcelService
from app.services.reports.pdf_service import PDFService
from app.services.reports.report_analytics import ReportAnalytics


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


DURATIONS = {
    "7days": 7,
    "30days": 30,
    "3months": 90,
    "6months": 180,
    "1year": 365,
}


REPORTS = {
    "analysis": "AI Analysis Report",
    "material": "Material Intelligence Report",
    "waste": "Waste Classification Report",
    "recycling": "Recycling Report",
    "sustainability": "Sustainability Report",
    "environmental_impact": "Environmental Impact Report",
    "circular_economy": "Circular Economy Report",
    "collection": "Collection Report",
    "inventory": "Inventory Report",
    "waste_source": "Waste Source Report",
    "dashboard": "Executive Dashboard Report",
    "comprehensive": "Comprehensive Sustainability Report",
}


# ============================================================
# Helpers
# ============================================================

def _start(duration):
    if duration not in DURATIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid duration. Use 7days, 30days, "
                "3months, 6months or 1year."
            ),
        )

    return datetime.now() - timedelta(
        days=DURATIONS[duration]
    )


def _analyses(db, duration):
    rows = (
        db.query(Analysis)
        .filter(
            Analysis.created_at >= _start(duration)
        )
        .order_by(
            desc(Analysis.created_at)
        )
        .all()
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No analysis records found for "
                f"the selected period ({duration})."
            ),
        )

    return rows


def _num(obj, field):
    try:
        return float(
            getattr(obj, field, 0) or 0
        )
    except (TypeError, ValueError):
        return 0.0


def _avg(rows, field):
    if not rows:
        return 0.0

    return (
        sum(
            _num(row, field)
            for row in rows
        )
        / len(rows)
    )


def _sum(rows, field):
    return sum(
        _num(row, field)
        for row in rows
    )


# ============================================================
# Analysis Aggregation
# ============================================================

def _aggregate(rows):

    latest = rows[0]

    values = {
        "analysis_count": len(rows),

        "material":
            latest.material or "Not Available",

        "confidence":
            _avg(rows, "confidence"),

        "primary_material":
            latest.primary_material,

        "secondary_material":
            latest.secondary_material,

        "composition":
            latest.composition,

        "material_category":
            latest.material_category,

        "material_quality":
            latest.material_quality,

        "biodegradable":
            latest.biodegradable,

        "recyclable":
            latest.recyclable,

        "recycled_content":
            _avg(rows, "recycled_content"),

        "waste_category":
            latest.waste_category,

        "waste_subcategory":
            latest.waste_subcategory,

        "reuse_potential":
            latest.reuse_potential,

        "recycling_method":
            latest.recycling_method,
    }

    average_fields = [
        "recyclability_score",
        "reuse_score",
        "material_recovery_score",
        "circularity_score",
        "environmental_score",
        "sustainability_score",
        "overall_score",
        "resource_conservation",
        "circular_economy_index",
        "recycling_target",
        "recycling_progress",
        "esg_score",
    ]

    for field in average_fields:
        values[field] = _avg(
            rows,
            field,
        )

    total_fields = [
        "carbon_footprint",
        "carbon_savings",
        "water_consumption",
        "water_savings",
        "energy_consumption",
        "energy_savings",
        "landfill_diversion",
    ]

    for field in total_fields:
        values[field] = _sum(
            rows,
            field,
        )

    values.update(
        {
            "sustainability_rating":
                latest.sustainability_rating
                or "Not Available",

            "sustainability_status":
                latest.sustainability_status
                or "Not Available",

            "environmental_impact":
                latest.environmental_impact
                or "Not Available",

            "esg_readiness":
                latest.esg_readiness
                or "Not Available",

            "priority":
                latest.priority
                or "Medium",

            "recommendation":
                latest.recommendation
                or (
                    "Prioritize reuse, material recovery "
                    "and recycling where technically feasible."
                ),

            "next_step":
                latest.next_step
                or (
                    "Continue segregation and "
                    "recovery assessment."
                ),

            "expected_benefit":
                latest.expected_benefit
                or (
                    "Improved recovery and reduced "
                    "environmental impact."
                ),
        }
    )

    return SimpleNamespace(**values)


# ============================================================
# Material Report Data
# ============================================================

def _material_data(a):

    return {
        "material": a.material,

        "material_category":
            a.material_category,

        "confidence":
            a.confidence,

        "biodegradable":
            a.biodegradable,

        "recyclable":
            a.recyclable,

        "recycled_content":
            a.recycled_content,

        "reuse_potential":
            a.reuse_potential,

        "recycling_method":
            a.recycling_method,

        "material_recovery_score":
            a.material_recovery_score,

        "circularity_score":
            a.circularity_score,

        "sustainability_score":
            a.sustainability_score,

        "recommendation":
            a.recommendation,

        "next_step":
            a.next_step,

        "expected_benefit":
            a.expected_benefit,
    }


# ============================================================
# Waste Report Data
# ============================================================

def _waste_data(a):

    return {
        "waste_category":
            a.waste_category,

        "waste_subcategory":
            a.waste_subcategory,

        "reuse_potential":
            a.reuse_potential,

        "recycling_method":
            a.recycling_method,

        "priority":
            a.priority,

        "reuse_score":
            a.reuse_score,

        "material_recovery_score":
            a.material_recovery_score,

        "circularity_score":
            a.circularity_score,

        "sustainability_score":
            a.sustainability_score,

        "recommendation":
            a.recommendation,

        "next_step":
            a.next_step,

        "expected_benefit":
            a.expected_benefit,
    }


# ============================================================
# Collection Data
# ============================================================

def _collection_data(collection):

    if collection is None:

        return {
            "collection_code": "N/A",
            "collection_date": "N/A",
            "collected_by": "N/A",
            "vehicle_number": "-",
            "collection_method": "N/A",
            "collection_status": "N/A",
            "total_weight": 0,
            "recovered_weight": 0,
            "rejected_weight": 0,
            "recovery_percentage": 0,
            "remarks":
                "No collection record available.",
            "material_summary":
                "No collection data available.",
            "operational_summary":
                "No collection data available.",
            "recommendation":
                "Create collection records to enable "
                "operational reporting.",
        }

    data = ReportAnalytics.collection(
        collection
    )

    data["recovered_weight"] = data.get(
        "recyclable_weight",
        0,
    )

    data.setdefault(
        "remarks",
        "-",
    )

    return data


# ============================================================
# Waste Source Data
# ============================================================

def _source_data(source, a):

    if source is None:

        return {
            "organization_name":
                "Not Available",

            "industry":
                "Not Available",

            "status":
                "Not Available",

            "source_type":
                "Not Available",

            "organization_size":
                "Not Available",

            "city":
                "Not Available",

            "state":
                "Not Available",

            "country":
                "Not Available",

            "collection_frequency":
                "Not Available",

            "total_collections":
                0,

            "total_waste":
                0,

            "recovered_waste":
                0,

            "recovery_rate":
                0,

            "rejected_waste":
                0,

            "average_monthly_waste":
                0,

            "carbon_saved":
                a.carbon_savings,

            "water_saved":
                a.water_savings,

            "energy_saved":
                a.energy_savings,

            "landfill_diversion":
                a.landfill_diversion,

            "sustainability_score":
                a.sustainability_score,

            "circularity_score":
                a.circularity_score,

            "company_rank":
                1,

            "summary":
                "No waste source record available.",

            "recommendation":
                a.recommendation,
        }

    data = ReportAnalytics.waste_source(
        source
    )

    data.update(
        {
            "source_type":
                data.get(
                    "organization_type",
                    "Not Available",
                ),

            "organization_size":
                "Not Available",

            "collection_frequency":
                "Not Available",

            "total_waste":
                data.get(
                    "total_waste_received",
                    0,
                ),

            "recovered_waste":
                data.get(
                    "total_recycled",
                    0,
                ),

            "rejected_waste":
                max(
                    data.get(
                        "total_waste_received",
                        0,
                    )
                    - data.get(
                        "total_recycled",
                        0,
                    ),
                    0,
                ),

            "average_monthly_waste":
                data.get(
                    "total_waste_received",
                    0,
                ),

            "landfill_diversion":
                a.landfill_diversion,

            "sustainability_score":
                a.sustainability_score,

            "circularity_score":
                a.circularity_score,

            "company_rank":
                1,

            "summary":
                data.get(
                    "performance_summary",
                    "Organization performance summary.",
                ),

            "recommendation":
                data.get(
                    "recommendation",
                    a.recommendation,
                ),
        }
    )

    return data


# ============================================================
# Dashboard Data
# ============================================================

def _dashboard_data(
    db,
    rows,
    duration,
):

    collections = (
        db.query(Collection)
        .filter(
            Collection.created_at >= _start(duration)
        )
        .all()
    )

    inventory = (
        db.query(Inventory)
        .all()
    )

    sources = (
        db.query(WasteSource)
        .all()
    )

    a = _aggregate(rows)

    material_counts = Counter(
        (
            x.material
            or "Unknown"
        )
        for x in rows
    )

    waste_counts = Counter(
        (
            x.waste_category
            or "Unknown"
        )
        for x in rows
    )

    best_source = max(
        sources,
        key=lambda x: _num(
            x,
            "company_sustainability_score",
        ),
        default=None,
    )

    total_weight = sum(
        _num(
            c,
            "total_weight",
        )
        for c in collections
    )

    recyclable_weight = sum(
        _num(
            c,
            "recyclable_weight",
        )
        for c in collections
    )

    recovery_rate = (
        recyclable_weight
        / total_weight
        * 100
        if total_weight
        else 0
    )

    return {
        "total_companies":
            len(sources),

        "total_collections":
            len(collections),

        "total_inventory":
            len(inventory),

        "best_company":
            getattr(
                best_source,
                "organization_name",
                "Not Available",
            ),

        "average_sustainability":
            a.sustainability_score,

        "recovery_rate":
            recovery_rate,

        "carbon_saved":
            a.carbon_savings,

        "water_saved":
            a.water_savings,

        "energy_saved":
            a.energy_savings,

        "material_summary":
            ", ".join(
                f"{k}: {v}"
                for k, v
                in material_counts.most_common(8)
            )
            or "No material data available.",

        "waste_summary":
            ", ".join(
                f"{k}: {v}"
                for k, v
                in waste_counts.most_common(8)
            )
            or "No waste data available.",

        "recommendation":
            a.recommendation,
    }


# ============================================================
# CSV / Excel Data
# ============================================================

def _rows_for_csv(
    rows,
    report_type,
):

    result = []

    for x in rows:

        result.append(
            {
                "analysis_id":
                    x.id,

                "material":
                    x.material,

                "confidence":
                    x.confidence,

                "waste_category":
                    x.waste_category,

                "waste_subcategory":
                    x.waste_subcategory,

                "recycling_method":
                    x.recycling_method,

                "recyclability_score":
                    x.recyclability_score,

                "reuse_score":
                    x.reuse_score,

                "material_recovery_score":
                    x.material_recovery_score,

                "circularity_score":
                    x.circularity_score,

                "sustainability_score":
                    x.sustainability_score,

                "environmental_score":
                    x.environmental_score,

                "overall_score":
                    x.overall_score,

                "carbon_footprint":
                    x.carbon_footprint,

                "carbon_savings":
                    x.carbon_savings,

                "water_consumption":
                    x.water_consumption,

                "water_savings":
                    x.water_savings,

                "energy_consumption":
                    x.energy_consumption,

                "energy_savings":
                    x.energy_savings,

                "landfill_diversion":
                    x.landfill_diversion,

                "resource_conservation":
                    x.resource_conservation,

                "esg_score":
                    x.esg_score,

                "recycling_target":
                    x.recycling_target,

                "recycling_progress":
                    x.recycling_progress,

                "created_at":
                    x.created_at,
            }
        )

    return result


# ============================================================
# PDF Builder
# ============================================================

def _build_pdf(
    report_type,
    rows,
    db,
    duration,
):

    a = _aggregate(rows)

    if report_type == "analysis":

        return PDFService.analysis(a)

    if report_type == "material":

        return PDFService.material(
            _material_data(a)
        )

    if report_type == "waste":

        return PDFService.waste(
            _waste_data(a)
        )

    if report_type == "sustainability":

        return PDFService.sustainability(
            a
        )

    if report_type in {
        "recycling",
        "environmental_impact",
        "circular_economy",
    }:

        focused = vars(a).copy()

        focused["recycling_methods"] = (
            ", ".join(
                str(x.recycling_method)
                for x in rows
                if x.recycling_method
            )
            or "Not Available"
        )

        focused["recyclable_count"] = sum(
            1
            for r in rows
            if bool(r.recyclable)
        )

        focused["executive_summary"] = (
            f"{REPORTS[report_type]} generated "
            f"from {len(rows)} analyses covering "
            f"{duration}."
        )

        return PDFService.focused(
            focused,
            report_type,
            REPORTS[report_type],
        )

    if report_type == "collection":

        collection = (
            db.query(Collection)
            .filter(
                Collection.created_at
                >= _start(duration)
            )
            .order_by(
                desc(Collection.created_at)
            )
            .first()
        )

        return PDFService.collection(
            _collection_data(collection)
        )

    if report_type == "inventory":

        inventories = (
            db.query(Inventory)
            .all()
        )

        inventory = (
            sorted(
                inventories,
                key=lambda x:
                    getattr(
                        x,
                        "created_at",
                        None,
                    )
                    or datetime.min,
                reverse=True,
            )[0]
            if inventories
            else None
        )

        if inventory is None:
            raise HTTPException(
                status_code=404,
                detail="No inventory records available.",
            )

        return PDFService.inventory(
            inventory
        )

    if report_type == "waste_source":

        source = (
            db.query(WasteSource)
            .order_by(
                desc(WasteSource.id)
            )
            .first()
        )

        return PDFService.waste_source(
            _source_data(
                source,
                a,
            )
        )

    dashboard = _dashboard_data(
        db,
        rows,
        duration,
    )

    if report_type == "dashboard":

        return PDFService.dashboard(
            dashboard
        )

    if report_type == "comprehensive":

        collection = (
            db.query(Collection)
            .filter(
                Collection.created_at
                >= _start(duration)
            )
            .order_by(
                desc(Collection.created_at)
            )
            .first()
        )

        inventories = (
            db.query(Inventory)
            .all()
        )

        inventory = (
            sorted(
                inventories,
                key=lambda x:
                    getattr(
                        x,
                        "created_at",
                        None,
                    )
                    or datetime.min,
                reverse=True,
            )[0]
            if inventories
            else None
        )

        source = (
            db.query(WasteSource)
            .order_by(
                desc(WasteSource.id)
            )
            .first()
        )

        if inventory:

            inv_data = (
                ReportAnalytics.inventory(
                    inventory
                )
            )

        else:

            inv_data = {
                "batch_id": "N/A",
                "fabric": a.material,
                "source": "N/A",
                "color": "N/A",
                "condition": "N/A",
                "quantity": 0,
                "collection_date": "N/A",
                "storage_location": "N/A",
                "rack_number": "N/A",
                "status": "N/A",
            }

        collection_data = (
            _collection_data(
                collection
            )
        )

        source_data = (
            _source_data(
                source,
                a,
            )
        )

        material_data = (
            _material_data(a)
        )

        waste_data = (
            _waste_data(a)
        )

        return PDFService.comprehensive(
            {
                "executive_summary":
                    (
                        f"Comprehensive report for "
                        f"{duration}: {len(rows)} "
                        f"analyses were included."
                    ),

                "dashboard":
                    dashboard,

                "company":
                    source_data,

                "collection":
                    collection_data,

                "material":
                    material_data,

                "waste":
                    waste_data,

                "inventory":
                    inv_data,

                "sustainability":
                    a,

                "recommendation":
                    a.recommendation,
            }
        )

    raise HTTPException(
        status_code=400,
        detail="Unsupported report type.",
    )


# ============================================================
# Report Types
# ============================================================

@router.get("/types")
def report_types():

    return {
        "reports": [
            {
                "value": key,
                "label": value,
            }
            for key, value
            in REPORTS.items()
        ],

        "durations":
            list(DURATIONS.keys()),
    }


# ============================================================
# Generate Report
# ============================================================

@router.get("/generate")
def generate_report(

    report_type: str = Query(
        "sustainability"
    ),

    duration: str = Query(
        "30days"
    ),

    format: str = Query(
        "pdf"
    ),

    db: Session = Depends(
        get_db
    ),
):

    if report_type not in REPORTS:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported report type. "
                f"Allowed values: "
                f"{', '.join(REPORTS)}"
            ),
        )

    rows = _analyses(
        db,
        duration,
    )

    format = format.lower()

    # -------------------------------
    # PDF
    # -------------------------------

    if format == "pdf":

        pdf = _build_pdf(
            report_type,
            rows,
            db,
            duration,
        )

        return StreamingResponse(
            BytesIO(pdf),
            media_type="application/pdf",
            headers={
                "Content-Disposition":
                    (
                        f'attachment; '
                        f'filename="TWIP_'
                        f'{report_type}_'
                        f'{duration}.pdf"'
                    )
            },
        )

    # -------------------------------
    # CSV / Excel
    # -------------------------------

    data = _rows_for_csv(
        rows,
        report_type,
    )

    if format == "csv":

        buffer = CSVService.export(
            data
        )

        return StreamingResponse(
            buffer,
            media_type="text/csv",
            headers={
                "Content-Disposition":
                    (
                        f'attachment; '
                        f'filename="TWIP_'
                        f'{report_type}_'
                        f'{duration}.csv"'
                    )
            },
        )

    if format in {
        "xlsx",
        "excel",
    }:

        buffer = ExcelService.export(
            report_type[:31],
            data,
        )

        return StreamingResponse(
            buffer,
            media_type=(
                "application/vnd.openxmlformats-"
                "officedocument.spreadsheetml.sheet"
            ),
            headers={
                "Content-Disposition":
                    (
                        f'attachment; '
                        f'filename="TWIP_'
                        f'{report_type}_'
                        f'{duration}.xlsx"'
                    )
            },
        )

    raise HTTPException(
        status_code=400,
        detail=(
            "Unsupported format. "
            "Use pdf, csv or xlsx."
        ),
    )


# ============================================================
# AI / Report Summary
# ============================================================

@router.get("/summary")
def report_summary(

    report_type: str = Query(
        "sustainability"
    ),

    duration: str = Query(
        "30days"
    ),

    db: Session = Depends(
        get_db
    ),
):

    if report_type not in REPORTS:

        raise HTTPException(
            status_code=400,
            detail="Unsupported report type.",
        )

    rows = _analyses(
        db,
        duration,
    )

    a = _aggregate(rows)

    return {
        "report_type":
            report_type,

        "title":
            REPORTS[report_type],

        "duration":
            duration,

        "analysis_count":
            len(rows),

        "summary":
            (
                f"{REPORTS[report_type]} covers "
                f"{len(rows)} analyses for "
                f"{duration}. Average "
                f"sustainability is "
                f"{a.sustainability_score:.1f}, "
                f"circularity is "
                f"{a.circularity_score:.1f}, "
                f"and overall performance is "
                f"{a.overall_score:.1f}."
            ),

        "recommendation":
            a.recommendation,

        "metrics": {
            "sustainability":
                round(
                    a.sustainability_score,
                    2,
                ),

            "circularity":
                round(
                    a.circularity_score,
                    2,
                ),

            "recyclability":
                round(
                    a.recyclability_score,
                    2,
                ),

            "carbon_savings":
                round(
                    a.carbon_savings,
                    2,
                ),

            "water_savings":
                round(
                    a.water_savings,
                    2,
                ),

            "energy_savings":
                round(
                    a.energy_savings,
                    2,
                ),
        },
    }