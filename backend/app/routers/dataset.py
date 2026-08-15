import os
import shutil

from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File
from fastapi import Depends
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..models import Dataset
from ..schemas import DatasetResponse
from ..auth import get_current_user

router = APIRouter(
    prefix="/api/dataset",
    tags=["Dataset"]
)

UPLOAD_FOLDER = "uploads/datasets"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.get(
    "/",
    response_model=list[DatasetResponse]
)
def get_datasets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    return db.query(Dataset).all()


@router.get("/recommended")
def get_recommended_datasets():
    """
    Milestone 1 Recommended Datasets (Document Page 9 & 10)
    """
    return [
        {
            "id": "tips",
            "name": "TIPS (Textile Image Dataset)",
            "purpose": ["Fabric classification", "Textile recognition"],
            "sample_count": 1250,
            "categories": ["Cotton", "Wool", "Polyester", "Linen", "Silk"],
            "accuracy_baseline": "94.2%",
            "description": "High-resolution texture and weave pattern dataset for fine-grained fabric classification.",
        },
        {
            "id": "deepfashion",
            "name": "DeepFashion Dataset",
            "purpose": ["Garment recognition", "Fabric category classification"],
            "sample_count": 8000,
            "categories": ["Apparel", "Outerwear", "Denim", "Knitwear"],
            "accuracy_baseline": "91.8%",
            "description": "Large-scale fashion dataset with detailed garment category and fabric attribute annotations.",
        },
        {
            "id": "fashion_mnist",
            "name": "Fashion-MNIST",
            "purpose": ["Clothing classification", "Image classification baseline"],
            "sample_count": 70000,
            "categories": ["T-shirt", "Trouser", "Pullover", "Dress", "Coat"],
            "accuracy_baseline": "92.5%",
            "description": "Benchmark dataset of 28x28 grayscale clothing images for core vision model validation.",
        },
        {
            "id": "fabric_kaggle",
            "name": "Fabric Image Dataset (Kaggle)",
            "purpose": ["Fabric texture recognition", "Material classification"],
            "sample_count": 3400,
            "categories": ["Woven", "Knitted", "Non-woven", "Synthetics"],
            "accuracy_baseline": "89.4%",
            "description": "Curated dataset for micro-surface texture analysis, fiber grain, and material composition.",
        },
        {
            "id": "sustainable_fashion",
            "name": "Sustainable Fashion Dataset",
            "purpose": ["Waste categorization", "Recycling recommendation support"],
            "sample_count": 2100,
            "categories": ["Recyclable", "Reusable", "Repairable", "Upcyclable", "Compostable", "Hazardous"],
            "accuracy_baseline": "95.0%",
            "description": "Circular economy dataset mapping textile waste condition to end-of-life recycling pathways.",
        },
    ]



@router.post("/upload")
def upload_dataset(

    file: UploadFile = File(...),

    db: Session = Depends(get_db),

    current_user: models.User = Depends(get_current_user),

):

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    dataset = Dataset(

        file_name=file.filename,

        file_path=file_path,

        uploaded_by=current_user.id

    )

    db.add(dataset)

    db.commit()

    db.refresh(dataset)

    return {
        "message": "Dataset Uploaded Successfully",
        "dataset": dataset
    }