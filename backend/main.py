from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from datetime import datetime

from database import get_db, engine, Base, db_session
from models import User, Inventory, UserRegister, UserLogin, ProfileUpdate, TextileRecordCreate, TextileRecordEdit
from routes import auth, admin, inventory_routes, ai_routes, users
from routes import recycling, sustainability
from routes.auth import get_current_user, serialize_user
from routes.admin import get_current_admin
from routes.inventory_routes import get_current_user_from_token
from auth_helpers import hash_password

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Textile Waste Intelligence Platform API")

# Configure CORS to allow communication from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(inventory_routes.router)
app.include_router(ai_routes.router)
app.include_router(users.router)
app.include_router(recycling.router)
app.include_router(sustainability.router)

# Request scoped DB session cleanup middleware
@app.middleware("http")
async def db_session_cleanup_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    finally:
        db_session.remove()

@app.on_event("startup")
def startup_db_client():
    print("Initializing Textile Waste Intelligence Platform SQL Database...")
    try:
        # Create all tables if they don't exist
        Base.metadata.create_all(bind=engine)
        print("SQLAlchemy: Database tables verified/created.")
        
        db = get_db()
        
        # Seed exactly one default Administrator account
        admin_email = "hritikt147@gmail.com"
        admin_password_hash = hash_password("Admin@1234")
        
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            admin_user = User(
                fullname="Hritik",
                email=admin_email,
                phone="0000000000",
                company="Textile Waste Intelligence Platform",
                password_hash=admin_password_hash,
                role="Administrator"
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"Successfully seeded default admin: {admin_email}")
        else:
            print("Default administrator verified.")
            
        # Seed default textile inventory records if table is empty
        if db.query(Inventory).count() == 0:
            mfg_email = "mfg@twip.org"
            mfg_user = db.query(User).filter(User.email == mfg_email).first()
            if not mfg_user:
                mfg_user = User(
                    fullname="Eco Manufacturer Node",
                    email=mfg_email,
                    phone="9999999999",
                    company="Eco Fabrics Ltd",
                    password_hash=hash_password("Password123"),
                    role="Textile Manufacturer"
                )
                db.add(mfg_user)
                db.commit()
                db.refresh(mfg_user)
                
            seed_records = [
                Inventory(
                    user_id=mfg_user.id,
                    batch_id="B-COT88",
                    fabric_type="Cotton",
                    source="Cutting Scraps A",
                    quantity=250.0,
                    color="Emerald Green",
                    condition="Reusable",
                    collection_date=datetime(2026, 7, 9, 10, 0, 0),
                    status="Recycled",
                    remarks="Seeded batch cotton"
                ),
                Inventory(
                    user_id=mfg_user.id,
                    batch_id="B-DEN45",
                    fabric_type="Denim",
                    source="Post-Consumer Returns",
                    quantity=180.0,
                    color="Indigo Blue",
                    condition="Recyclable",
                    collection_date=datetime(2026, 7, 10, 11, 30, 0),
                    status="Collected",
                    remarks="Seeded batch denim"
                ),
                Inventory(
                    user_id=mfg_user.id,
                    batch_id="B-POL02",
                    fabric_type="Polyester",
                    source="Defective Yarn rolls",
                    quantity=120.0,
                    color="Charcoal Black",
                    condition="Damaged",
                    collection_date=datetime(2026, 7, 11, 9, 0, 0),
                    status="Processing",
                    remarks="Seeded batch polyester"
                ),
                Inventory(
                    user_id=mfg_user.id,
                    batch_id="B-WOO71",
                    fabric_type="Wool",
                    source="Spinning Waste B",
                    quantity=90.0,
                    color="Mustard Yellow",
                    condition="Reusable",
                    collection_date=datetime(2026, 7, 11, 10, 30, 0),
                    status="Pending",
                    remarks="Seeded batch wool"
                )
            ]
            db.add_all(seed_records)
            db.commit()
            print("Successfully seeded default inventory dataset.")

        from models import Notification
        if db.query(Notification).count() == 0:
            inventory_records = db.query(Inventory).all()
            alerts = []
            alerts.append(Notification(title='Waste collection alert', message='A batch requires collection and review before downstream processing.', notification_type='Waste Collection Alerts', is_read=False, user_id=None, context={'source': 'inventory'}))
            alerts.append(Notification(title='Recycling opportunity', message='High recyclability batch detected in the current inventory.', notification_type='Recycling Opportunity Notifications', is_read=False, user_id=None, context={'source': 'inventory'}))
            alerts.append(Notification(title='Sustainability milestone', message='Material recovery target is trending above the previous month baseline.', notification_type='Sustainability Milestone Alerts', is_read=False, user_id=None, context={'source': 'ai'}))
            if inventory_records:
                pending_count = sum(1 for record in inventory_records if str(record.status).lower() == 'pending')
                big_batch = max(inventory_records, key=lambda r: float(r.quantity or 0), default=None)
                if pending_count:
                    alerts.append(Notification(title='Processing backlog', message=f'{pending_count} waste batches are waiting for processing.', notification_type='Inventory Warnings', is_read=False, user_id=None, context={'source': 'inventory'}))
                if big_batch:
                    alerts.append(Notification(title='Large untreated waste batch', message=f'Batch {big_batch.batch_id} contains {big_batch.quantity} kg of untreated waste.', notification_type='Inventory Warnings', is_read=False, user_id=None, context={'source': 'inventory'}))
            db.add_all(alerts)
            db.commit()
            print('Seeded default platform notifications.')
    except Exception as e:
        print(f"Error during startup seeding: {e}")

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "AI Textile Waste Intelligence Platform Backend API",
        "version": "1.0.0"
    }

# =====================================================================
# REST API Path Aliases (Matching exact prompt endpoints)
# =====================================================================

@app.post("/register", status_code=201)
def register_alias(data: UserRegister, db=Depends(get_db)):
    from routes.auth import register
    return register(data, db)

@app.post("/login")
def login_alias(data: UserLogin, db=Depends(get_db)):
    from routes.auth import login
    return login(data, db)

@app.post("/logout")
def logout_alias():
    return {"success": True, "message": "Logout successful"}

@app.get("/profile")
def profile_get_alias(current_user=Depends(get_current_user)):
    return {"success": True, "user": serialize_user(current_user)}

@app.put("/profile")
def profile_put_alias(data: ProfileUpdate, current_user=Depends(get_current_user), db=Depends(get_db)):
    from routes.auth import update_profile
    return update_profile(data, current_user, db)

@app.post("/inventory", status_code=201)
def create_inventory_alias(data: TextileRecordCreate, auth_data=Depends(get_current_user_from_token), db=Depends(get_db)):
    from routes.inventory_routes import create_textile_record
    return create_textile_record(data, auth_data, db)

@app.get("/inventory")
def list_inventory_alias(
    search: Optional[str] = None,
    fabricType: Optional[str] = None,
    condition: Optional[str] = None,
    processingStatus: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    auth_data=Depends(get_current_user_from_token),
    db=Depends(get_db)
):
    from routes.inventory_routes import list_textile_records
    return list_textile_records(search, fabricType, condition, processingStatus, page, limit, auth_data, db)

@app.get("/inventory/{id}")
def get_inventory_alias(id: int, auth_data=Depends(get_current_user_from_token), db=Depends(get_db)):
    from routes.inventory_routes import get_textile_record
    return get_textile_record(id, auth_data, db)

@app.put("/inventory/{id}")
def update_inventory_alias(id: int, data: TextileRecordEdit, auth_data=Depends(get_current_user_from_token), db=Depends(get_db)):
    from routes.inventory_routes import update_textile_record
    return update_textile_record(id, data, auth_data, db)

@app.delete("/inventory/{id}")
def delete_inventory_alias(id: int, auth_data=Depends(get_current_user_from_token), db=Depends(get_db)):
    from routes.inventory_routes import delete_textile_record
    return delete_textile_record(id, auth_data, db)

@app.get("/admin/users")
def admin_users_alias(search: Optional[str] = None, role: Optional[str] = None, current_admin=Depends(get_current_admin), db=Depends(get_db)):
    from routes.admin import get_users
    return get_users(search, role, current_admin, db)

@app.delete("/admin/users/{id}")
def admin_delete_user_alias(id: int, current_admin=Depends(get_current_admin), db=Depends(get_db)):
    from routes.admin import delete_user
    return delete_user(id, current_admin, db)

@app.get("/admin/inventory")
def admin_inventory_alias(search: Optional[str] = None, current_admin=Depends(get_current_admin), db=Depends(get_db)):
    from routes.admin import get_admin_inventory
    return get_admin_inventory(search, current_admin, db)

@app.delete("/admin/inventory/{id}")
def admin_delete_inventory_alias(id: int, current_admin=Depends(get_current_admin), db=Depends(get_db)):
    from routes.admin import delete_admin_inventory
    return delete_admin_inventory(id, current_admin, db)

@app.get("/dashboard")
def dashboard_alias(auth_data=Depends(get_current_user_from_token), db=Depends(get_db)):
    from routes.inventory_routes import get_stats
    return get_stats(auth_data, db)

@app.get("/analytics")
def analytics_alias(auth_data=Depends(get_current_user_from_token), db=Depends(get_db)):
    from routes.inventory_routes import get_stats
    return get_stats(auth_data, db)


# /health is an alias for the root endpoint — kept for infrastructure health checks
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Textile Waste Intelligence Platform API", "version": "1.0.0"}


@app.get("/api/notifications")
def list_notifications(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    from models import Notification

    notifications = db.query(Notification).filter(Notification.user_id.in_([None, current_user.id])).order_by(Notification.created_at.desc()).all()
    items = [{
        "id": item.id,
        "title": item.title,
        "message": item.message,
        "type": item.notification_type,
        "read": bool(item.is_read),
        "created_at": item.created_at.isoformat() if item.created_at else None,
        "context": item.context or {},
    } for item in notifications]
    return {"success": True, "notifications": items}


@app.patch("/api/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    from models import Notification
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.user_id not in (None, current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to access this notification")
    notification.is_read = True
    db.commit()
    return {"success": True, "message": "Notification marked as read"}


@app.patch("/api/notifications/read-all")
def mark_all_notifications_read(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    from models import Notification
    db.query(Notification).filter(Notification.user_id.in_([None, current_user.id]), Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"success": True, "message": "All notifications marked as read"}


@app.get("/api/dashboard/summary")
def dashboard_summary(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    from routes.admin import get_role_dashboard_summary
    payload = get_role_dashboard_summary(current_user, db)
    return {"success": True, **payload}


@app.get("/api/reports/summary")
def reports_summary(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    from routes.admin import get_platform_reports
    payload = get_platform_reports(db)
    return {"success": True, **payload}


@app.get("/api/reports/recycling/pdf")
def recycling_report_pdf_alias(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    from routes.admin import get_recycling_dashboard_report_pdf
    return get_recycling_dashboard_report_pdf(current_user, db)


@app.get("/api/reports/recycling/excel")
def recycling_report_excel_alias(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    from routes.admin import get_recycling_dashboard_report_excel
    return get_recycling_dashboard_report_excel(current_user, db)

