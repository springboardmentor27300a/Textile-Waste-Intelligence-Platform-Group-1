from fastapi import FastAPI, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

import shutil
import os
from datetime import datetime

from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER

from model.predict import predict_fabric

from database import Base, engine, get_db
import models
import crud

from schemas import (
    RegisterUser,
    LoginUser,
    InventoryItem,
)

from security import verify_password

Base.metadata.create_all(bind=engine)
latest_prediction = {}

app = FastAPI()

# ---------------- CORS ---------------- #

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Home ---------------- #

@app.get("/")
def home():
    return {
        "message": "Welcome to Textile Waste Intelligence Platform"
    }

# ---------------- Register ---------------- #

@app.post("/register")
def register(
    user: RegisterUser,
    db: Session = Depends(get_db)
):

    existing_user = crud.get_user_by_email(
        db,
        user.email
    )

    if existing_user:
        return {
            "success": False,
            "message": "Email already registered"
        }
    
    crud.create_user(
        db,
        user.name,
        user.email,
        user.password
    )

    return {
        "success": True,
        "message": "Registration Successful"
    }

# ---------------- Login ---------------- #

@app.post("/login")
def login(
    user: LoginUser,
    db: Session = Depends(get_db)
):

    db_user = crud.get_user_by_email(
        db,
        user.email
    )

    if db_user and verify_password(
        user.password,
        db_user.password
    ):
        return {
            "success": True,
            "message": f"Welcome {db_user.name}"
        }

    return {
        "success": False,
        "message": "Invalid Email or Password"
    }

# ---------------- Inventory ---------------- #

@app.get("/inventory")
def get_inventory(
    db: Session = Depends(get_db)
):
    return crud.get_inventory(db)


@app.post("/inventory")
def add_inventory(
    item: InventoryItem,
    db: Session = Depends(get_db)
):

    new_item = crud.add_inventory(
        db,
        item.fabric,
        item.weight
    )

    return {
        "success": True,
        "message": "Fabric Added Successfully",
        "data": {
            "id": new_item.id,
            "fabric": new_item.fabric,
            "weight": new_item.weight,
            "status": new_item.status,
        }
    }

# ---------------- Users ---------------- #

@app.get("/users")
def get_users(
    db: Session = Depends(get_db)
):
    return db.query(models.User).all()

# ---------------- Dataset ---------------- #

@app.post("/dataset")
def upload_dataset(
    file: UploadFile = File(...),
    fabric_type: str = Form(...),
    db: Session = Depends(get_db)
):

    os.makedirs("uploads", exist_ok=True)

    file_path = os.path.join(
        "uploads",
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    dataset = crud.add_dataset(
        db,
        file.filename,
        fabric_type
    )

    return {
        "success": True,
        "message": "Dataset Uploaded Successfully",
        "data": {
            "id": dataset.id,
            "filename": dataset.filename,
            "fabric_type": dataset.fabric_type,
            "status": dataset.status
        }
    }


@app.get("/dataset")
def get_dataset(
    db: Session = Depends(get_db)
):
    return crud.get_datasets(db)

# ---------------- Dashboard ---------------- #

@app.get("/dashboard")
def dashboard_stats(
    db: Session = Depends(get_db)
):
    return crud.get_dashboard_stats(db)

# ---------------- Sustainability Dashboard ---------------- #

@app.get("/sustainability-dashboard")
def sustainability_dashboard(
    db: Session = Depends(get_db)
):
    return crud.get_sustainability_dashboard(db)



@app.post("/predict")
def predict_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    global latest_prediction

    os.makedirs("temp", exist_ok=True)

    temp_path = os.path.join("temp", file.filename)

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = predict_fabric(temp_path)

    latest_prediction = result

    crud.add_prediction_history(db, result)

    os.remove(temp_path)

    return {
        "success": True,
        "prediction": result
    }

    
@app.get("/prediction-history")
def prediction_history(
    db: Session = Depends(get_db)
):

    history = crud.get_prediction_history(db)

    return history
@app.get("/report")
def get_report():

    return {
    "project": "Textile Waste Intelligence Platform",
    "status": "Completed",
    "material_recognition": True,
    "waste_classification": True,
    "recyclability_analysis": True,
    "model": "MobileNetV2",
    "accuracy": f"{latest_prediction.get('confidence',0)}%",
    "recommendation": latest_prediction.get("recommendation","-")
}

@app.get("/download-report")
def download_report():

    if not latest_prediction:
        return {
            "success": False,
            "message": "No prediction available."
        }

    os.makedirs("reports", exist_ok=True)

    filename = f"reports/Textile_AI_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

    doc = SimpleDocTemplate(filename)

    styles = getSampleStyleSheet()

    title = styles["Heading1"]
    title.alignment = TA_CENTER
    title.textColor = HexColor("#2563eb")

    heading = styles["Heading2"]

    normal = styles["BodyText"]

    elements = []

    elements.append(
        Paragraph("Textile Waste Intelligence Platform", title)
    )

    elements.append(Spacer(1, 20))

    elements.append(
        Paragraph("AI Material Recognition Report", heading)
    )

    elements.append(Spacer(1, 15))

    elements.append(
        Paragraph(
            f"<b>Date :</b> {datetime.now().strftime('%d-%m-%Y %H:%M:%S')}",
            normal
        )
    )

    elements.append(Spacer(1, 12))

    elements.append(
        Paragraph(
            f"<b>Fabric :</b> {latest_prediction['fabric']}",
            normal
        )
    )

    elements.append(
        Paragraph(
            f"<b>Confidence :</b> {latest_prediction['confidence']}%",
            normal
        )
    )

    elements.append(
        Paragraph(
            f"<b>Category :</b> {latest_prediction['category']}",
            normal
        )
    )

    elements.append(
        Paragraph(
            f"<b>Recyclability :</b> {latest_prediction['recyclability']}",
            normal
        )
    )

    elements.append(
        Paragraph(
            f"<b>Recommendation :</b> {latest_prediction['recommendation']}",
            normal
        )
    )

    elements.append(Spacer(1, 25))

    elements.append(
        Paragraph(
            "<b>Model :</b> MobileNetV2 (Transfer Learning)",
            normal
        )
    )

    elements.append(
        Paragraph(
            "<b>Status :</b> Material Recognition Completed",
            normal
        )
    )

    elements.append(
        Paragraph(
            "<b>Project :</b> Textile Waste Intelligence Platform",
            normal
        )
    )

    doc.build(elements)

    return FileResponse(
        filename,
        filename=os.path.basename(filename),
        media_type="application/pdf"
    )
