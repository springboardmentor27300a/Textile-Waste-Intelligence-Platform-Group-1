from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.core.logger import logger
from app.database.database import get_db
from app.models.user import User
from app.schemas.analysis import AnalysisResponse
from app.services.analysis_service import AnalysisService


router = APIRouter(prefix="/analysis", tags=["Analysis"])

ANALYSIS_ROLES = (
    "administrator",
    "manager",
    "manufacturer",
    "recycler",
)


@router.post(
    "/upload",
    response_model=AnalysisResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_image_for_analysis(
    file: UploadFile = File(...),
    collection_id: int = Form(...),
    current_user: User = Depends(require_roles(*ANALYSIS_ROLES)),
    db: Session = Depends(get_db),
):
    analysis = AnalysisService.analyze_image(
        collection_id=collection_id,
        file=file,
        db=db,
    )

    logger.info(
        "%s analyzed image %s for collection %s",
        current_user.email,
        analysis.id,
        collection_id,
    )
    return analysis


@router.get(
    "/",
    response_model=list[AnalysisResponse],
)
def get_all_analysis(
    current_user: User = Depends(require_roles(*ANALYSIS_ROLES)),
    db: Session = Depends(get_db),
):
    return AnalysisService.get_all(db)


@router.get(
    "/{analysis_id}",
    response_model=AnalysisResponse,
)
def get_analysis(
    analysis_id: int,
    current_user: User = Depends(require_roles(*ANALYSIS_ROLES)),
    db: Session = Depends(get_db),
):
    return AnalysisService.get_by_id(analysis_id, db)


@router.delete(
    "/{analysis_id}",
)
def delete_analysis(
    analysis_id: int,
    current_user: User = Depends(
        require_roles("administrator")
    ),
    db: Session = Depends(get_db),
):
    return AnalysisService.delete(analysis_id, db)
