# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session

# from app.database import get_db
# from app.core.dependencies import CurrentUser

# # from app.services.analysis_service import analyze_batch
# from app.services.analysis_service import (
#     analyze_batch,
#     get_latest_analysis,
# )

# router = APIRouter(
#     prefix="/api/analysis",
#     tags=["Analysis"],
# )


# @router.post("/{batch_id}")
# def analyze(
#     batch_id: int,
#     current_user: CurrentUser,
#     db: Session = Depends(get_db),
# ):

#     try:

#         result = analyze_batch(
#             db=db,
#             current_user=current_user,
#             batch_id=batch_id,
#         )

#         return result

#     except Exception as e:
#         raise HTTPException(
#             status_code=400,
#             detail=str(e),
#         )
    
# @router.get("/{batch_id}")
# def get_analysis(
#     batch_id: int,
#     current_user: CurrentUser,
#     db: Session = Depends(get_db),
# ):
#     try:
#         result = get_latest_analysis(
#             db=db,
#             batch_id=batch_id,
#         )

#         return result

#     except Exception as e:
#         raise HTTPException(
#             status_code=404,
#             detail=str(e),
#         )


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.dependencies import CurrentUser

from app.services.analysis_service import (
    analyze_batch,
    get_latest_analysis,
)

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
        return analyze_batch(
            db=db,
            current_user=current_user,
            batch_id=batch_id,
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.get("/{batch_id}")
def get_analysis(
    batch_id: int,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    try:
        return get_latest_analysis(
            db=db,
            current_user=current_user,
            batch_id=batch_id,
        )

    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )