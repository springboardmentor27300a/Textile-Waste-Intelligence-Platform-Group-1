import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date

from app.config import settings
from app.database.session import engine, SessionLocal, Base, get_db
from app.routes import auth, users, inventory, datasets, dashboard, health
from app.routes import predictions as predictions_router  # Milestone 2
from app.auth.deps import RoleChecker
from app.models.support import ActivityLog


# Import models to ensure they are registered before creating tables
from app.models.user import Role, Organization, User
from app.models.dataset import Dataset
from app.models.waste_batch import WasteBatch, TextileInventory
from app.auth.security import get_password_hash

# Milestone 2 — AI Prediction Models
from app.models.prediction import UploadedImage, Prediction, ClassificationResult, PredictionReport

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

    # 4. Seed 4 Default Datasets
    datasets_data = [
        {
            "name": "DeepFashion",
            "description": "Large-scale clothes database containing over 800,000 diverse fashion images with rich annotations.",
            "format": "ZIP",
            "num_images": 800000,
            "size_bytes": 12884901888 # 12 GB
        },
        {
            "name": "Fashion-MNIST",
            "description": "Dataset of Zalando's article images consisting of a training set of 60,000 examples and a test set of 10,000 examples.",
            "format": "ZIP",
            "num_images": 70000,
            "size_bytes": 31457280 # 30 MB
        },
        {
            "name": "Fabric Image Dataset",
            "description": "High resolution industrial fabric weave sample images containing defect bounding box annotations.",
            "format": "ZIP",
            "num_images": 12500,
            "size_bytes": 4294967296 # 4 GB
        },
        {
            "name": "Sustainable Fashion Dataset",
            "description": "Structured meta-data and garment catalog images describing environmental footprints and fabric percentages.",
            "format": "CSV",
            "num_images": 5200,
            "size_bytes": 52428800 # 50 MB
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

