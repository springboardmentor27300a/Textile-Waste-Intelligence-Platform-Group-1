from fastapi import APIRouter

from app.services.dataset_loader import dataset_loader

router = APIRouter(
    prefix="/dataset",
    tags=["Dataset"],
)


@router.get("/summary")
def dataset_summary():
    """
    Get overall dataset information.
    """
    return dataset_loader.summary()


@router.get("/classes")
def dataset_classes():
    """
    Get all available fabric classes.
    """
    return {
        "classes": dataset_loader.get_classes()
    }


@router.get("/distribution")
def dataset_distribution():
    """
    Get number of images in each class.
    """
    return dataset_loader.class_distribution()