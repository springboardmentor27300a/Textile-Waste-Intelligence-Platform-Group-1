import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict
from uuid import UUID

from app.database.session import get_db
from app.config import settings
from app.models.user import User
from app.models.dataset import Dataset
from app.models.support import ActivityLog
from app.schemas.dataset import DatasetRegister, DatasetResponse, DatasetStats
from app.auth.deps import get_current_user, RoleChecker

router = APIRouter(prefix="/datasets", tags=["Datasets"])

# Register a dataset
@router.post("/register", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
def register_dataset(
    dataset_in: DatasetRegister,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Administrator", "Sustainability Manager"]))
):
    # Check duplicate name
    existing = db.query(Dataset).filter(Dataset.name == dataset_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Dataset '{dataset_in.name}' is already registered.")

    new_dataset = Dataset(
        name=dataset_in.name,
        description=dataset_in.description,
        format=dataset_in.format,
        num_images=dataset_in.num_images or 0,
        size_bytes=dataset_in.size_bytes or 0,
        status="Ready" if dataset_in.size_bytes > 0 else "Pending",
        version=dataset_in.version or "1.0.0",
        is_used_by_model=dataset_in.is_used_by_model or False,
        training_date=dataset_in.training_date,
        model_compatibility=dataset_in.model_compatibility,
        uploaded_by=current_user.id
    )
    
    db.add(new_dataset)
    db.commit()
    db.refresh(new_dataset)

    # Activity Log
    log = ActivityLog(
        user_id=current_user.id,
        action="REGISTER_DATASET",
        details=f"Registered dataset metadata for {new_dataset.name}"
    )
    db.add(log)
    db.commit()

    return new_dataset

# File Upload for a dataset
@router.post("/upload/{dataset_id}", response_model=DatasetResponse)
def upload_dataset_file(
    dataset_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Administrator", "Sustainability Manager"]))
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    # Create target upload directory
    dataset_dir = os.path.join(settings.UPLOAD_DIR, "datasets", str(dataset.id))
    os.makedirs(dataset_dir, exist_ok=True)
    
    file_path = os.path.join(dataset_dir, file.filename)
    
    # Save file locally
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write file locally: {e}")
        
    # Read size
    size_bytes = os.path.getsize(file_path)
    
    # Update dataset model
    dataset.size_bytes = size_bytes
    dataset.upload_path = file_path
    dataset.status = "Ready"
    
    # Simulate count for mock datasets
    if "mnist" in dataset.name.lower():
        dataset.num_images = 70000
    elif "fashion" in dataset.name.lower() or "fabric" in dataset.name.lower():
        dataset.num_images = 12000
    else:
        dataset.num_images = 2500
        
    db.add(dataset)
    
    # Log Action
    log = ActivityLog(
        user_id=current_user.id,
        action="UPLOAD_DATASET",
        details=f"Uploaded file '{file.filename}' ({size_bytes / 1024 / 1024:.2f} MB) for dataset {dataset.name}"
    )
    db.add(log)
    db.commit()
    db.refresh(dataset)
    
    return dataset

# List datasets
@router.get("/", response_model=List[DatasetResponse])
def list_datasets(db: Session = Depends(get_db)):
    return db.query(Dataset).all()

# Dataset statistics summary
@router.get("/summary/stats", response_model=DatasetStats)
def get_dataset_stats(db: Session = Depends(get_db)):
    datasets = db.query(Dataset).all()
    
    total_datasets = len(datasets)
    total_images = sum(d.num_images for d in datasets)
    total_size = sum(d.size_bytes for d in datasets)
    
    # Calculate formats distribution
    formats = {}
    for d in datasets:
        formats[d.format] = formats.get(d.format, 0) + 1
        
    return {
        "total_datasets": total_datasets,
        "total_images": total_images,
        "total_size_bytes": total_size,
        "format_distribution": formats
    }

# Get single dataset
@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(dataset_id: UUID, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset

# Get dataset preview images metadata (returns mockup metadata)
@router.get("/{dataset_id}/preview")
def get_dataset_preview(dataset_id: UUID, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    # Generate mock preview items depending on dataset type
    name_lower = dataset.name.lower()
    
    if "mnist" in name_lower:
        samples = [
            {"id": 1, "label": "T-shirt/top", "resolution": "28x28", "split": "Train", "channels": "Grayscale"},
            {"id": 2, "label": "Trouser", "resolution": "28x28", "split": "Train", "channels": "Grayscale"},
            {"id": 3, "label": "Pullover", "resolution": "28x28", "split": "Train", "channels": "Grayscale"},
            {"id": 4, "label": "Dress", "resolution": "28x28", "split": "Test", "channels": "Grayscale"},
            {"id": 5, "label": "Ankle boot", "resolution": "28x28", "split": "Test", "channels": "Grayscale"}
        ]
    elif "deepfashion" in name_lower:
        samples = [
            {"id": 1, "label": "Floral Dress", "resolution": "512x512", "split": "Train", "channels": "RGB", "category": "Dresses"},
            {"id": 2, "label": "Denim Jacket", "resolution": "512x512", "split": "Train", "channels": "RGB", "category": "Jackets"},
            {"id": 3, "label": "Casual Shorts", "resolution": "512x512", "split": "Val", "channels": "RGB", "category": "Shorts"},
            {"id": 4, "label": "Striped T-Shirt", "resolution": "512x512", "split": "Train", "channels": "RGB", "category": "Tops"},
            {"id": 5, "label": "Woolen Blazer", "resolution": "512x512", "split": "Test", "channels": "RGB", "category": "Outerwear"}
        ]
    elif "fabric" in name_lower:
        samples = [
            {"id": 1, "label": "Cotton Knitted Scraps", "resolution": "1024x1024", "split": "Train", "channels": "RGB", "defect": "None"},
            {"id": 2, "label": "Polyester Weave Tears", "resolution": "1024x1024", "split": "Train", "channels": "RGB", "defect": "Tear"},
            {"id": 3, "label": "Denim Edge Shreds", "resolution": "1024x1024", "split": "Val", "channels": "RGB", "defect": "Fraying"},
            {"id": 4, "label": "Linen Color Blotches", "resolution": "1024x1024", "split": "Train", "channels": "RGB", "defect": "Stain"},
            {"id": 5, "label": "Synthetic Blend Holes", "resolution": "1024x1024", "split": "Test", "channels": "RGB", "defect": "Hole"}
        ]
    else:
        samples = [
            {"id": 1, "label": "Organic Cotton Yarn", "resolution": "640x480", "split": "Train", "channels": "RGB", "material": "Cotton"},
            {"id": 2, "label": "Recycled Polyester Fibers", "resolution": "640x480", "split": "Train", "channels": "RGB", "material": "Polyester"},
            {"id": 3, "label": "Hemp Knitted Weft", "resolution": "640x480", "split": "Train", "channels": "RGB", "material": "Hemp"},
            {"id": 4, "label": "Post-Consumer Wool Shred", "resolution": "640x480", "split": "Val", "channels": "RGB", "material": "Wool"},
            {"id": 5, "label": "Recycled Nylon Blend", "resolution": "640x480", "split": "Test", "channels": "RGB", "material": "Nylon"}
        ]
        
    return {
        "dataset_id": dataset.id,
        "dataset_name": dataset.name,
        "preview_items": samples
    }
