from fastapi import APIRouter, Depends, HTTPException, Header, status
from fastapi.responses import StreamingResponse
from typing import Optional, List
from sqlalchemy import func
from datetime import datetime, timedelta
from io import BytesIO
from db import get_db
from models import User, Inventory, AIAnalysis, ActivityLog, Notification
from routes.auth import get_current_user
from utils import hash_password, verify_password, generate_token, decode_token

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
except Exception:
    canvas = None
    letter = None

try:
    from openpyxl import Workbook
except Exception:
    Workbook = None

router = APIRouter(prefix="/api/admin", tags=["admin"])

def serialize_user(user: User):
    if not user:
        return None
    return {
        "id": user.id,
        "name": user.fullname,
        "email": user.email,
        "phone": user.phone,
        "organization": user.company,
        "role": user.role,
        "isActive": user.is_active if user.is_active is not None else True,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None
    }

def get_current_admin(current_user: User = Depends(get_current_user)):
    """
    Validates that the authenticated user possesses Administrator permissions.
    """
    if current_user.role not in ["Administrator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator administrative privileges required"
        )
    return current_user

@router.post("/login")
def admin_login(data: dict, db=Depends(get_db)):
    # Keep compatibility with both email/username and standard logins
    admin_id = data.get("admin_id") or data.get("email")
    password = data.get("password")
    
    if not admin_id or not password:
        raise HTTPException(status_code=400, detail="Missing credentials")
        
    admin_id_clean = admin_id.strip().lower()
    admin = db.query(User).filter(User.email == admin_id_clean, User.role == "Administrator").first()
    
    if not admin or not verify_password(password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid Admin credentials")
        
    token = generate_token({"id": str(admin.id), "role": "admin"})
    
    # Update last login timestamp
    admin.last_login = datetime.utcnow()
    db.commit()
    
    return {
        "success": True,
        "message": "Admin login successful",
        "token": token,
        "admin": {
            "admin_id": admin.email,
            "role": admin.role,
            "name": admin.fullname
        }
    }

@router.get("/dashboard-stats")
def get_dashboard_stats(current_admin: User = Depends(get_current_admin), db=Depends(get_db)):
    # 1. Dashboard KPI Cards (Live Database Values)
    total_users = db.query(User).count()
    total_records = db.query(Inventory).count()
    total_quantity = db.query(func.sum(Inventory.quantity)).scalar() or 0.0
    pending_waste = db.query(Inventory).filter(Inventory.status == "Pending").count()
    processing_waste = db.query(Inventory).filter(Inventory.status == "Processing").count()
    
    # Recycled weight (kg)
    recycled_waste = db.query(func.sum(Inventory.quantity)).filter(Inventory.status == "Recycled").scalar() or 0.0
    
    total_mfg = db.query(User).filter(User.role == "Textile Manufacturer").count()
    recycling_facilities = db.query(User).filter(User.role == "Recycling Facility Operator").count()
    sustainability_managers = db.query(User).filter(User.role == "Sustainability Manager").count()
    
    # Today's Collections (last 24 hours)
    cutoff_24h = datetime.utcnow() - timedelta(days=1)
    today_collections = db.query(func.sum(Inventory.quantity)).filter(Inventory.created_at >= cutoff_24h).scalar() or 0.0
    
    ai_analyses_count = db.query(AIAnalysis).count()

    # 2. Users by Role Distribution
    role_counts = db.query(User.role, func.count(User.id)).group_by(User.role).all()
    users_by_role = [{"name": role, "value": count} for role, count in role_counts]

    # 3. Monthly Registrations Trend
    # Calculate for the last 6 months
    monthly_regs = []
    for i in range(5, -1, -1):
        target_date = datetime.utcnow() - timedelta(days=i*30)
        year = target_date.year
        month = target_date.month
        month_name = target_date.strftime("%b")
        
        count = db.query(User).filter(
            func.extract('year', User.created_at) == year,
            func.extract('month', User.created_at) == month
        ).count()
        
        # Fallback for SQLite which doesn't support extract('year') out of the box in some environments
        if count == 0 and db.bind.dialect.name == "sqlite":
            # Manual filtering for SQLite fallback
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1)
            else:
                end_date = datetime(year, month + 1, 1)
            count = db.query(User).filter(User.created_at >= start_date, User.created_at < end_date).count()
            
        monthly_regs.append({"name": f"{month_name} {year}", "value": count})

    # 4. Inventory by User (Top Contributors)
    contrib_query = db.query(User.fullname, func.sum(Inventory.quantity)).join(Inventory).group_by(User.fullname).order_by(func.sum(Inventory.quantity).desc()).limit(5).all()
    inventory_by_user = [{"name": name, "value": round(qty, 1)} for name, qty in contrib_query]

    # 5. Waste Collection Trend (Monthly Waste Sum)
    monthly_waste = []
    for i in range(5, -1, -1):
        target_date = datetime.utcnow() - timedelta(days=i*30)
        year = target_date.year
        month = target_date.month
        month_name = target_date.strftime("%b")
        
        qty_sum = db.query(func.sum(Inventory.quantity)).filter(
            func.extract('year', Inventory.created_at) == year,
            func.extract('month', Inventory.created_at) == month
        ).scalar() or 0.0
        
        if qty_sum == 0.0 and db.bind.dialect.name == "sqlite":
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1)
            else:
                end_date = datetime(year, month + 1, 1)
            qty_sum = db.query(func.sum(Inventory.quantity)).filter(Inventory.created_at >= start_date, Inventory.created_at < end_date).scalar() or 0.0
            
        monthly_waste.append({"name": f"{month_name} {year}", "value": round(qty_sum, 1)})

    # 6. Material Distribution (Fabric Type Aggregation)
    fabric_query = db.query(Inventory.fabric_type, func.sum(Inventory.quantity)).group_by(Inventory.fabric_type).all()
    material_distribution = [{"name": ftype, "value": round(qty, 1)} for ftype, qty in fabric_query]

    # 7. Recent Registrations Widget (Latest 5 users)
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
    serialized_recent_users = [{
        "id": u.id,
        "name": u.fullname,
        "email": u.email,
        "role": u.role,
        "status": "Active" if (u.is_active is None or u.is_active) else "Inactive",
        "registration_date": u.created_at.isoformat() if u.created_at else None
    } for u in recent_users]

    # 8. Activity Log Widget (Latest 10 logs)
    recent_logs = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(10).all()
    serialized_logs = [{
        "id": log.id,
        "user_id": log.user_id,
        "username": log.username,
        "action": log.action,
        "detail": log.detail,
        "timestamp": log.timestamp.isoformat() if log.timestamp else None
    } for log in recent_logs]

    return {
        "success": True,
        "stats": {
            "totalUsers": total_users,
            "totalRecords": total_records,
            "totalInventory": total_records, # batch records count
            "pendingWaste": pending_waste,
            "processingWaste": processing_waste,
            "recycledWaste": round(recycled_waste, 1),
            "totalManufacturers": total_mfg,
            "recyclingFacilities": recycling_facilities,
            "sustainabilityManagers": sustainability_managers,
            "totalQuantity": round(total_quantity, 1),
            "todayCollections": round(today_collections, 1),
            "aiAnalyses": ai_analyses_count
        },
        "charts": {
            "users_by_role": users_by_role,
            "monthly_registrations": monthly_regs,
            "inventory_by_user": inventory_by_user,
            "collection_trends": monthly_waste,
            "material_distribution": material_distribution
        },
        "recent_registrations": serialized_recent_users,
        "activity_logs": serialized_logs
    }

@router.get("/logs")
def get_all_activity_logs(current_admin: User = Depends(get_current_admin), db=Depends(get_db)):
    logs = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).all()
    return {
        "success": True,
        "logs": [{
            "id": log.id,
            "username": log.username,
            "action": log.action,
            "detail": log.detail,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        } for log in logs]
    }


@router.get("/reports/recycling/pdf")
def get_recycling_dashboard_report_pdf(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    if canvas is None:
        raise HTTPException(status_code=500, detail="PDF export dependency is not installed")

    records = db.query(Inventory).filter(Inventory.user_id == current_user.id).all() if current_user.role == "Textile Manufacturer" else db.query(Inventory).all()
    summary = get_role_dashboard_summary(current_user, db)

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    pdf.setTitle("Recycling Facility Dashboard Report")
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(72, 740, "Textile Waste Intelligence Platform")
    pdf.setFont("Helvetica", 12)
    pdf.drawString(72, 720, f"User: {current_user.fullname}")
    pdf.drawString(72, 705, f"Company: {current_user.company}")
    pdf.drawString(72, 690, f"Role: {current_user.role}")
    pdf.drawString(72, 675, f"Reporting date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    pdf.drawString(72, 650, f"Total batches: {summary['metrics']['total_batches']}")
    pdf.drawString(72, 635, f"Total waste: {summary['metrics']['total_waste_kg']} kg")
    pdf.drawString(72, 620, f"Processed: {summary['metrics']['processed_weight_kg']} kg")
    pdf.drawString(72, 605, f"Recovery rate: {summary['metrics']['recovery_percentage']}%")

    y = 560
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(72, y, "Waste Inventory Summary")
    y -= 18
    pdf.setFont("Helvetica", 10)
    for row in records[:8]:
        if y < 120:
            pdf.showPage()
            y = 760
        pdf.drawString(72, y, f"{row.batch_id} | {row.fabric_type} | {row.quantity} kg | {row.source} | {row.status}")
        y -= 18

    pdf.save()
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=recycling_dashboard_report.pdf"})


@router.get("/reports/recycling/excel")
def get_recycling_dashboard_report_excel(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    if Workbook is None:
        raise HTTPException(status_code=500, detail="Excel export dependency is not installed")

    records = db.query(Inventory).filter(Inventory.user_id == current_user.id).all() if current_user.role == "Textile Manufacturer" else db.query(Inventory).all()
    summary = get_role_dashboard_summary(current_user, db)

    wb = Workbook()
    ws = wb.active
    ws.title = "Summary"
    ws.append(["Textile Waste Intelligence Platform Recycling Report"])
    ws.append([])
    ws.append(["User", current_user.fullname])
    ws.append(["Company", current_user.company])
    ws.append(["Role", current_user.role])
    ws.append(["Reporting Date", datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')])
    ws.append(["Total Batches", summary['metrics']['total_batches']])
    ws.append(["Total Waste (kg)", summary['metrics']['total_waste_kg']])
    ws.append(["Processed Waste (kg)", summary['metrics']['processed_weight_kg']])
    ws.append(["Recovery Rate (%)", summary['metrics']['recovery_percentage']])
    ws.append([])
    ws.append(["Batch ID", "Material", "Quantity (kg)", "Source", "Status", "Condition", "Date"])
    for record in records:
        ws.append([
            record.batch_id,
            record.fabric_type,
            record.quantity,
            record.source,
            record.status,
            record.condition,
            (record.collection_date.isoformat() if record.collection_date else ''),
        ])

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": "attachment; filename=recycling_dashboard_report.xlsx"})


def _summarize_inventory_records(records):
    total_batches = len(records)
    total_weight = round(sum(float(r.quantity or 0) for r in records), 1)
    pending_batches = sum(1 for r in records if str(r.status).lower() == 'pending')
    processed_weight = round(sum(float(r.quantity or 0) for r in records if str(r.status).lower() in {'processed', 'recycled', 'processing'}), 1)
    recyclable_weight = round(sum(float(r.quantity or 0) for r in records if str(r.condition).lower() in {'recyclable', 'reusable'}), 1)
    recycling_opportunities = sum(1 for r in records if str(r.condition).lower() in {'recyclable', 'reusable'})
    by_material = {}
    by_category = {}
    for record in records:
        by_material[record.fabric_type] = by_material.get(record.fabric_type, 0.0) + float(record.quantity or 0)
        by_category[record.condition] = by_category.get(record.condition, 0.0) + float(record.quantity or 0)

    return {
        "total_batches": total_batches,
        "total_weight_kg": total_weight,
        "pending_batches": pending_batches,
        "processed_weight_kg": processed_weight,
        "recyclable_weight_kg": recyclable_weight,
        "recycling_opportunities": recycling_opportunities,
        "material_breakdown": [{"name": name, "value": round(value, 1)} for name, value in sorted(by_material.items())],
        "category_breakdown": [{"name": name, "value": round(value, 1)} for name, value in sorted(by_category.items())],
    }


def get_role_dashboard_summary(current_user: User, db):
    if current_user.role == "Textile Manufacturer":
        records = db.query(Inventory).filter(Inventory.user_id == current_user.id).all()
    else:
        records = db.query(Inventory).all()

    summary = _summarize_inventory_records(records)
    total_weight = summary["total_weight_kg"]
    processed = summary["processed_weight_kg"]
    pending = summary["pending_batches"]
    if total_weight:
        recovery_percentage = round((processed / total_weight) * 100, 1)
    else:
        recovery_percentage = 0.0

    material_recovery = {
        "sustainability_score": round(min(100, (recovery_percentage * 1.4) + (summary["recyclable_weight_kg"] / max(total_weight, 1) * 100 * 0.8)), 1),
        "circularity_score": round(min(100, (summary["recycling_opportunities"] / max(summary["total_batches"], 1)) * 100 + recovery_percentage * 0.5), 1),
        "recyclability": round(min(100, (summary["recyclable_weight_kg"] / max(total_weight, 1) * 100) + 25), 1),
        "reuse_potential": round(min(100, (summary["recyclable_weight_kg"] / max(total_weight, 1) * 100) + 15), 1),
        "material_recovery": round(min(100, recovery_percentage + 20), 1),
        "resource_conservation": round(min(100, recovery_percentage + 10), 1),
    }

    summary_payload = {
        "user": {
            "name": current_user.fullname,
            "email": current_user.email,
            "role": current_user.role,
        },
        "metrics": {
            "total_batches": summary["total_batches"],
            "total_waste_kg": summary["total_weight_kg"],
            "available_waste_kg": summary["recyclable_weight_kg"],
            "pending_batches": pending,
            "processed_weight_kg": processed,
            "processing_rate": round((processed / max(total_weight, 1)) * 100, 1) if total_weight else 0.0,
            "recovery_percentage": recovery_percentage,
            "recovered_quantity_kg": processed,
            "waste_diverted_kg": processed,
            "sustainability_score": material_recovery["sustainability_score"],
            "circularity_score": material_recovery["circularity_score"],
            "recyclability": material_recovery["recyclability"],
            "reuse_potential": material_recovery["reuse_potential"],
            "material_recovery": material_recovery["material_recovery"],
            "resource_conservation": material_recovery["resource_conservation"],
        },
        "charts": {
            "waste_by_material": summary["material_breakdown"],
            "waste_by_category": summary["category_breakdown"],
            "recycling_opportunities": [{"name": "Recyclable", "value": summary["recycling_opportunities"]}, {"name": "Pending", "value": pending}],
            "recovery_statistics": [{"name": "Recovered", "value": processed}, {"name": "Remaining", "value": max(total_weight - processed, 0)}],
        }
    }
    return summary_payload


def get_platform_reports(db):
    inventory_records = db.query(Inventory).all()
    ai_records = db.query(AIAnalysis).all()
    summary = _summarize_inventory_records(inventory_records)
    sustainability_records = []
    for record in ai_records:
        metrics = record.sustainability_metrics or {}
        scores = metrics.get('scores', {})
        sustainability_records.append({
            "id": record.id,
            "fabric_type": record.fabric_type,
            "waste_category": record.waste_category,
            "sustainability_score": scores.get('sustainability_score', record.sustainability_score or 0),
            "circularity_score": scores.get('circularity_score', 0),
            "co2_savings_kg": (metrics.get('environmental_impact') or {}).get('co2_savings_kg', 0),
            "water_savings_liters": (metrics.get('environmental_impact') or {}).get('water_savings_liters', 0),
        })
    return {
        "summary": {
            "report_title": "Integrated Textile Waste Intelligence Report",
            "total_batches": summary["total_batches"],
            "total_waste_kg": summary["total_weight_kg"],
            "recyclable_weight_kg": summary["recyclable_weight_kg"],
            "pending_batches": summary["pending_batches"],
            "material_breakdown": summary["material_breakdown"],
            "category_breakdown": summary["category_breakdown"],
            "ai_analyses": len(ai_records),
            "generated_at": datetime.utcnow().isoformat(),
        },
        "waste_classification": [{
            "batch_id": record.batch_id,
            "material": record.fabric_type,
            "category": record.condition,
            "quantity": float(record.quantity or 0),
            "condition": record.condition,
            "status": record.status,
            "classification": 'AI Classified' if any(ai_record.fabric_type == record.fabric_type for ai_record in ai_records) else 'Manual'
        } for record in inventory_records],
        "sustainability_summary": sustainability_records,
        "recommendations": [
            {
                "title": "Recycling opportunity",
                "message": f"{summary['recycling_opportunities']} batches are suitable for recycling or reuse.",
                "type": "recycling",
            }
        ]
    }
