from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.dependencies import CurrentUser

from app.services.analysis_service import analyze_batch

router = APIRouter(
    prefix="/api/analysis",
    tags=["Analysis"],
)


@router.post("/{batch_id}")
def analyze(
    batch_id: int,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):

    try:

        result = analyze_batch(
            db=db,
            current_user=current_user,
            batch_id=batch_id,
        )

        return result

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )