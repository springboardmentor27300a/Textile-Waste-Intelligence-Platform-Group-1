import json
from pathlib import Path

from fastapi import APIRouter, Depends

from ..config import settings
from ..deps import require_roles
from ..ml import defect as defect_module
from ..ml import garment as garment_module
from ..ml.engines import reload_models
from ..ml.materials import IMPACT, MATERIALS
from ..models import Role, User

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("/metrics")
def metrics():
    path = Path(settings.model_dir) / "metrics.json"
    if not path.exists():
        return {"trained": False, "detail": "Models haven't been trained yet. Run `python -m app.ml.train`."}
    return {"trained": True, **json.loads(path.read_text())}


@router.get("/datasets")
def datasets():
    """Status of the two dataset-backed models, for the Admin screen."""
    model_dir = Path(settings.model_dir)

    def block(name, filename, trained):
        path = model_dir / filename
        payload = {"trained": trained, "model": name}
        if path.exists():
            payload.update(json.loads(path.read_text()))
        return payload

    return {
        "defect_detection": {
            **block("AITEX defect detection", "defect_metrics.json", defect_module.available()),
            "dataset": "AITEX Fabric Image Database",
            "supports": "Damage and contamination detection (spec module 3)",
            "command": "python scripts/train_on_datasets.py defect --aitex data",
        },
        "garment_recognition": {
            **block("Fashion-MNIST garment recognition", "garment_metrics.json",
                    garment_module.available()),
            "dataset": "Fashion-MNIST",
            "supports": "Clothing classification / image-classification baseline",
            "command": "python scripts/train_on_datasets.py garment --fashion data",
        },
    }


@router.get("/materials")
def materials():
    return [{"material": m, **IMPACT[m]} for m in MATERIALS]


@router.post("/reload")
def reload(_: User = Depends(require_roles(Role.admin))):
    reload_models()
    return {"status": "reloaded"}
