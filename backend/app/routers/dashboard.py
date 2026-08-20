from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import CurrentUser
from app.database import get_db
from app.services.dashboard_service import (
    get_dashboard_analytics,
)


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get("/analytics")
def dashboard_analytics(
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    try:
        return get_dashboard_analytics(
            db=db,
            current_user=current_user,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc