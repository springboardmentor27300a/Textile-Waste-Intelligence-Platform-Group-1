import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date
from app.routes.material_classifier import router as material_router

from app.config import settings
from app.database.session import engine, SessionLocal, Base, get_db
from app.routes import auth, users, inventory, datasets, dashboard, health
from app.routes import predictions as predictions_router  # Milestone 2

# Milestone 3 — Sustainability Intelligence Routers
from app.sustainability import router as sustainability_router
from app.recommendations import router as recommendations_router
from app.environment import router as environment_router
from app.circularity import router as circularity_router

# Milestone 4 — Reports & Export System
from app.reports import router as reports_router

from app.auth.deps import RoleChecker
from app.models.support import ActivityLog


# Import models to ensure they are registered before creating tables
from app.models.user import Role, Organization, User
from app.models.dataset import Dataset
from app.models.waste_batch import WasteBatch, TextileInventory
from app.auth.security import get_password_hash

# Milestone 2 — AI Prediction Models
from app.models.prediction import UploadedImage, Prediction, ClassificationResult, PredictionReport

# Milestone 4 — Report Model
from app.models.report import Report

# Setup logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_database(db: Session):
    logger.info("Initializing database seeding...")
    
    # 1. Seed Roles
    roles_data = [
        {"name": "Administrator", "description": "Full access to user management and system configuration"},
        {"name": "Sustainability Manager", "description": "Access to environmental metrics and waste summaries"},
        {"name": "Recycling Facility Operator", "description": "Logs collections, updates batch processing state"},
        {"name": "Textile Manufacturer", "description": "Registers waste materials and tracks recycled inventory availability"}
    ]
    
    db_roles = {}
    for r in roles_data:
        role = db.query(Role).filter(Role.name == r["name"]).first()
        if not role:
            role = Role(name=r["name"], description=r["description"])
            db.add(role)
            db.commit()
            db.refresh(role)
            logger.info(f"Seeded role: {r['name']}")
        db_roles[r["name"]] = role

    # 2. Seed Default Organizations
    orgs_data = [
        {"name": "WeaveCycle HQ", "type": "Operator", "description": "HQ System Operator"},
        {"name": "EcoRecycle Solutions", "type": "Recycler", "description": "Partner textile sorting and shredding facility"},
        {"name": "Apex Apparel Corp", "type": "Manufacturer", "description": "Partner clothing and apparel factory"}
    ]
    db_orgs = {}
    for o in orgs_data:
        org = db.query(Organization).filter(Organization.name == o["name"]).first()
        if not org:
            org = Organization(
                name=o["name"],
                type=o["type"],
                description=o["description"],
                contact_email=f"info@{o['name'].lower().replace(' ', '')}.com"
            )
            db.add(org)
            db.commit()
            db.refresh(org)
            logger.info(f"Seeded organization: {o['name']}")
        db_orgs[o["name"]] = org

    # 3. Seed Default Users for each role
    users_data = [
        {
            "email": "admin@weavecycle.com",
            "password": "AdminPass123!",
            "full_name": "Sarah Jenkins (Admin)",
            "role_name": "Administrator",
            "org_name": "WeaveCycle HQ",
            "contact": "+1 (555) 100-2001"
        },
        {
            "email": "manager@weavecycle.com",
            "password": "ManagerPass123!",
            "full_name": "Dr. Marcus Vance (Sustainability Manager)",
            "role_name": "Sustainability Manager",
            "org_name": "WeaveCycle HQ",
            "contact": "+1 (555) 100-2002"
        },
        {
            "email": "operator@weavecycle.com",
            "password": "OperatorPass123!",
            "full_name": "Devin Carter (Recycling Operator)",
            "role_name": "Recycling Facility Operator",
            "org_name": "EcoRecycle Solutions",
            "contact": "+1 (555) 100-2003"
        },
        {
            "email": "manufacturer@weavecycle.com",
            "password": "ManufacturerPass123!",
            "full_name": "Clara Higgins (Apparel Factory Owner)",
            "role_name": "Textile Manufacturer",
            "org_name": "Apex Apparel Corp",
            "contact": "+1 (555) 100-2004"
        }
    ]
    
    admin_user = None
    for u in users_data:
        user = db.query(User).filter(User.email == u["email"]).first()
        if not user:
            role = db_roles[u["role_name"]]
            org = db_orgs[u["org_name"]]
            user = User(
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                full_name=u["full_name"],
                role_id=role.id,
                organization_id=org.id,
                contact_details=u["contact"],
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Seeded user: {u['email']} ({u['role_name']})")
        if u["role_name"] == "Administrator":
            admin_user = user

    from datetime import datetime
    # 4. Seed 4 Default Datasets
    datasets_data = [
        {
            "name": "DeepFashion",
            "description": "Large-scale clothes database containing over 800,000 diverse fashion images with rich annotations.",
            "format": "ZIP",
            "num_images": 800000,
            "size_bytes": 12884901888, # 12 GB
            "version": "1.0.0",
            "is_used_by_model": False,
            "training_date": None,
            "model_compatibility": None
        },
        {
            "name": "Fashion-MNIST",
            "description": "Dataset of Zalando's article images consisting of a training set of 60,000 examples and a test set of 10,000 examples.",
            "format": "ZIP",
            "num_images": 70000,
            "size_bytes": 31457280, # 30 MB
            "version": "1.0.0",
            "is_used_by_model": False,
            "training_date": None,
            "model_compatibility": None
        },
        {
            "name": "Fabric Image Dataset",
            "description": "High resolution industrial fabric weave sample images containing defect bounding box annotations.",
            "format": "ZIP",
            "num_images": 12500,
            "size_bytes": 4294967296, # 4 GB
            "version": "2.1.0",
            "is_used_by_model": True,
            "training_date": datetime(2026, 8, 1),
            "model_compatibility": "EfficientNet-B0 v1.0.0"
        },
        {
            "name": "Sustainable Fashion Dataset",
            "description": "Structured meta-data and garment catalog images describing environmental footprints and fabric percentages.",
            "format": "CSV",
            "num_images": 5200,
            "size_bytes": 52428800, # 50 MB
            "version": "1.2.0",
            "is_used_by_model": False,
            "training_date": None,
            "model_compatibility": None
        }
    ]
    
    if admin_user:
        for ds in datasets_data:
            dataset = db.query(Dataset).filter(Dataset.name == ds["name"]).first()
            if not dataset:
                dataset = Dataset(
                    name=ds["name"],
                    description=ds["description"],
                    format=ds["format"],
                    num_images=ds["num_images"],
                    size_bytes=ds["size_bytes"],
                    status="Ready",
                    version=ds["version"],
                    is_used_by_model=ds["is_used_by_model"],
                    training_date=ds["training_date"],
                    model_compatibility=ds["model_compatibility"],
                    uploaded_by=admin_user.id
                )
                db.add(dataset)
                db.commit()
                logger.info(f"Seeded dataset: {ds['name']}")

    # 5. Seed some initial waste batches to start with for CRUD dashboard
    from app.models.waste_batch import WasteBatch, TextileInventory
    batches_data = [
        {
            "fabric_type": "Cotton Blend",
            "source": "Apex Apparel Corp",
            "quantity": 420.5,
            "color": "Off-White",
            "condition": "Post-Industrial Scraps",
            "collection_date": date.today(),
            "status": "Sorting",
            "storage_location": "Aisle A - Bin 3",
            "remarks": "Clean waste pieces from cutouts"
        },
        {
            "fabric_type": "Polyester Knit",
            "source": "EcoCycle Donation Bin",
            "quantity": 180.2,
            "color": "Mixed Blue/Black",
            "condition": "Post-Consumer Garments",
            "collection_date": date.today(),
            "status": "Pending",
            "storage_location": "Receiving Dock B",
            "remarks": "Requires sorting for zippers/buttons"
        },
        {
            "fabric_type": "Denim / Indigo Cotton",
            "source": "Apex Apparel Corp",
            "quantity": 890.0,
            "color": "Indigo",
            "condition": "Reject Weaves",
            "collection_date": date.today(),
            "status": "Sorted",
            "storage_location": "Aisle C - Shelf 2",
            "remarks": "100% Cotton denim bolt rejects"
        }
    ]

    if admin_user:
        for index, b_in in enumerate(batches_data):
            batch_num = f"WB-{date.today().year}-000{index+1}"
            existing_batch = db.query(WasteBatch).filter(WasteBatch.batch_number == batch_num).first()
            if not existing_batch:
                new_batch = WasteBatch(
                    batch_number=batch_num,
                    fabric_type=b_in["fabric_type"],
                    source=b_in["source"],
                    quantity=b_in["quantity"],
                    color=b_in["color"],
                    condition=b_in["condition"],
                    collection_date=b_in["collection_date"],
                    status=b_in["status"],
                    storage_location=b_in["storage_location"],
                    remarks=b_in["remarks"],
                    creator_id=admin_user.id,
                    organization_id=db_orgs["Apex Apparel Corp"].id if "Apex" in b_in["source"] else db_orgs["EcoRecycle Solutions"].id
                )
                db.add(new_batch)
                db.commit()
                db.refresh(new_batch)
                logger.info(f"Seeded batch: {batch_num}")

                # Yield inventory item if not pending
                if new_batch.status not in ["Pending", "Disposed"]:
                    inv_item = TextileInventory(
                        batch_id=new_batch.id,
                        fabric_type=new_batch.fabric_type,
                        quantity=new_batch.quantity,
                        color=new_batch.color,
                        storage_location=new_batch.storage_location,
                        status="In Stock"
                    )
                    db.add(inv_item)
                    db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    logger.info("Initializing database schemas...")
    Base.metadata.create_all(bind=engine)
    
    # Run column migrations if needed
    logger.info("Checking database column migrations...")
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            if "postgresql" in str(engine.url):
                # reason column
                result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='recycling_recommendations' AND column_name='reason'"))
                if not result.scalar():
                    logger.info("Migrating: Adding column 'reason' to recycling_recommendations table...")
                    conn.execute(text("ALTER TABLE recycling_recommendations ADD COLUMN reason TEXT"))
                    conn.commit()
                # industry_applications column
                result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='recycling_recommendations' AND column_name='industry_applications'"))
                if not result.scalar():
                    logger.info("Migrating: Adding column 'industry_applications' to recycling_recommendations table...")
                    conn.execute(text("ALTER TABLE recycling_recommendations ADD COLUMN industry_applications TEXT"))
                    conn.commit()
                # environmental_benefit column
                result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='recycling_recommendations' AND column_name='environmental_benefit'"))
                if not result.scalar():
                    logger.info("Migrating: Adding column 'environmental_benefit' to recycling_recommendations table...")
                    conn.execute(text("ALTER TABLE recycling_recommendations ADD COLUMN environmental_benefit TEXT"))
                    conn.commit()
                # estimated_cost column
                result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='recycling_recommendations' AND column_name='estimated_cost'"))
                if not result.scalar():
                    logger.info("Migrating: Adding column 'estimated_cost' to recycling_recommendations table...")
                    conn.execute(text("ALTER TABLE recycling_recommendations ADD COLUMN estimated_cost VARCHAR(50)"))
                    conn.commit()
                # estimated_time column
                result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='recycling_recommendations' AND column_name='estimated_time'"))
                if not result.scalar():
                    logger.info("Migrating: Adding column 'estimated_time' to recycling_recommendations table...")
                    conn.execute(text("ALTER TABLE recycling_recommendations ADD COLUMN estimated_time VARCHAR(50)"))
                    conn.commit()

                # predictions table columns
                res_mv = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='predictions' AND column_name='model_version'"))
                if not res_mv.scalar():
                    logger.info("Migrating: Adding column 'model_version' to predictions table...")
                    conn.execute(text("ALTER TABLE predictions ADD COLUMN model_version VARCHAR(50)"))
                    conn.commit()
                res_pt = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='predictions' AND column_name='processing_time'"))
                if not res_pt.scalar():
                    logger.info("Migrating: Adding column 'processing_time' to predictions table...")
                    conn.execute(text("ALTER TABLE predictions ADD COLUMN processing_time INTEGER"))
                    conn.commit()

                # datasets table columns
                res_v = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='datasets' AND column_name='version'"))
                if not res_v.scalar():
                    logger.info("Migrating: Adding column 'version' to datasets table...")
                    conn.execute(text("ALTER TABLE datasets ADD COLUMN version VARCHAR(50) DEFAULT '1.0.0'"))
                    conn.commit()
                res_ium = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='datasets' AND column_name='is_used_by_model'"))
                if not res_ium.scalar():
                    logger.info("Migrating: Adding column 'is_used_by_model' to datasets table...")
                    conn.execute(text("ALTER TABLE datasets ADD COLUMN is_used_by_model BOOLEAN DEFAULT FALSE"))
                    conn.commit()
                res_td = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='datasets' AND column_name='training_date'"))
                if not res_td.scalar():
                    logger.info("Migrating: Adding column 'training_date' to datasets table...")
                    conn.execute(text("ALTER TABLE datasets ADD COLUMN training_date TIMESTAMP"))
                    conn.commit()
                res_mc = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='datasets' AND column_name='model_compatibility'"))
                if not res_mc.scalar():
                    logger.info("Migrating: Adding column 'model_compatibility' to datasets table...")
                    conn.execute(text("ALTER TABLE datasets ADD COLUMN model_compatibility VARCHAR(100)"))
                    conn.commit()
            else:
                # SQLite fallback
                # ── Milestone 4: reports_m4 table ──
                res_rpt = conn.execute(text("PRAGMA table_info(reports_m4)")).fetchall()
                if not res_rpt:
                    logger.info("Creating reports_m4 table for Milestone 4...")
                    conn.execute(text("""
                        CREATE TABLE IF NOT EXISTS reports_m4 (
                            id VARCHAR(36) PRIMARY KEY,
                            report_type VARCHAR(50) NOT NULL,
                            title VARCHAR(255) NOT NULL,
                            status VARCHAR(30) DEFAULT 'Generated',
                            prediction_id VARCHAR(36) REFERENCES predictions(id),
                            user_id VARCHAR(36) NOT NULL REFERENCES users(id),
                            organization_id VARCHAR(36) REFERENCES organizations(id),
                            report_data TEXT,
                            pdf_path VARCHAR(512),
                            excel_path VARCHAR(512),
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP
                        )
                    """))
                    conn.commit()

                result = conn.execute(text("PRAGMA table_info(recycling_recommendations)")).fetchall()
                columns = [r[1] for r in result]
                if "reason" not in columns:
                    logger.info("Migrating: Adding column 'reason' to recycling_recommendations table...")
                    conn.execute(text("ALTER TABLE recycling_recommendations ADD COLUMN reason TEXT"))
                if "industry_applications" not in columns:
                    logger.info("Migrating: Adding column 'industry_applications' to recycling_recommendations table...")
                    conn.execute(text("ALTER TABLE recycling_recommendations ADD COLUMN industry_applications TEXT"))
                if "environmental_benefit" not in columns:
                    logger.info("Migrating: Adding column 'environmental_benefit' to recycling_recommendations table...")
                    conn.execute(text("ALTER TABLE recycling_recommendations ADD COLUMN environmental_benefit TEXT"))
                if "estimated_cost" not in columns:
                    logger.info("Migrating: Adding column 'estimated_cost' to recycling_recommendations table...")
                    conn.execute(text("ALTER TABLE recycling_recommendations ADD COLUMN estimated_cost VARCHAR(50)"))
                if "estimated_time" not in columns:
                    logger.info("Migrating: Adding column 'estimated_time' to recycling_recommendations table...")
                    conn.execute(text("ALTER TABLE recycling_recommendations ADD COLUMN estimated_time VARCHAR(50)"))

                # predictions table
                res_p = conn.execute(text("PRAGMA table_info(predictions)")).fetchall()
                p_cols = [r[1] for r in res_p]
                if "model_version" not in p_cols:
                    logger.info("Migrating: Adding column 'model_version' to predictions table...")
                    conn.execute(text("ALTER TABLE predictions ADD COLUMN model_version VARCHAR(50)"))
                if "processing_time" not in p_cols:
                    logger.info("Migrating: Adding column 'processing_time' to predictions table...")
                    conn.execute(text("ALTER TABLE predictions ADD COLUMN processing_time INTEGER"))

                # datasets table
                res_d = conn.execute(text("PRAGMA table_info(datasets)")).fetchall()
                d_cols = [r[1] for r in res_d]
                if "version" not in d_cols:
                    logger.info("Migrating: Adding column 'version' to datasets table...")
                    conn.execute(text("ALTER TABLE datasets ADD COLUMN version VARCHAR(50) DEFAULT '1.0.0'"))
                if "is_used_by_model" not in d_cols:
                    logger.info("Migrating: Adding column 'is_used_by_model' to datasets table...")
                    conn.execute(text("ALTER TABLE datasets ADD COLUMN is_used_by_model BOOLEAN DEFAULT 0"))
                if "training_date" not in d_cols:
                    logger.info("Migrating: Adding column 'training_date' to datasets table...")
                    conn.execute(text("ALTER TABLE datasets ADD COLUMN training_date TIMESTAMP"))
                if "model_compatibility" not in d_cols:
                    logger.info("Migrating: Adding column 'model_compatibility' to datasets table...")
                    conn.execute(text("ALTER TABLE datasets ADD COLUMN model_compatibility VARCHAR(100)"))
    except Exception as e:
        logger.warning(f"Database migration check failed or skipped: {e}")

    # Run data seeds
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
    docs_url=f"{settings.API_V1_STR}/docs",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set CORS middleware rules
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route hooks
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(inventory.router, prefix=settings.API_V1_STR)
app.include_router(datasets.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(predictions_router.router, prefix=settings.API_V1_STR)  # Milestone 2

# Milestone 3 — Sustainability Intelligence Routers
app.include_router(sustainability_router.router, prefix=settings.API_V1_STR)
app.include_router(recommendations_router.router, prefix=settings.API_V1_STR)
app.include_router(environment_router.router, prefix=settings.API_V1_STR)
app.include_router(circularity_router.router, prefix=settings.API_V1_STR)

# Register aliases directly on /api for standalone API compatibility
app.include_router(sustainability_router.router, prefix="/api")
app.include_router(recommendations_router.router, prefix="/api")
app.include_router(environment_router.router, prefix="/api")
app.include_router(circularity_router.router, prefix="/api")

# Milestone 4 — Reports & Export System
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix="/api")
app.include_router(material_router)

# Serve uploaded images as static files
from fastapi.staticfiles import StaticFiles
import os
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.get("/api/activity-logs")
@app.get("/api/v1/activity-logs")
def get_activity_logs(
    db: Session = Depends(get_db),
    admin_user: User = Depends(RoleChecker(["Administrator"]))
):
    recent_activities = (
        db.query(ActivityLog)
        .order_by(ActivityLog.timestamp.desc())
        .all()
    )
    return [
        {
            "id": str(log.id),
            "user_name": log.user.full_name,
            "action": log.action,
            "details": log.details,
            "timestamp": log.timestamp.isoformat()
        }
        for log in recent_activities
    ]

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Weave Cycle API",
        "docs": f"{settings.API_V1_STR}/docs"
    }

