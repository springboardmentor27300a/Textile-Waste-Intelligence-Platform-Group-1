from pathlib import Path
import shutil
import uuid

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.material_classifier.predictor import predict_material

router = APIRouter(
    prefix="/material-classifier",
    tags=["Material Classification"]
)

UPLOAD_FOLDER = Path("uploads")
UPLOAD_FOLDER.mkdir(exist_ok=True)


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Upload a textile image and predict its material.
    """

    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Only image files are allowed."
        )

    extension = Path(file.filename).suffix
    filename = f"{uuid.uuid4()}{extension}"
    filepath = UPLOAD_FOLDER / filename

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = predict_material(filepath)
        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if filepath.exists():
            filepath.unlink()