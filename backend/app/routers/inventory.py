import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import current_user
from ..models import BatchStatus, Notification, Role, User, WasteBatch
from ..schemas import BatchCreate, BatchOut, BatchUpdate

router = APIRouter(prefix="/api/batches", tags=["inventory"])

LOW_STOCK_KG = 25


def _visible(db: Session, user: User):
    query = db.query(WasteBatch)
    if user.role in (Role.admin, Role.sustainability):
        return query  # oversight roles see the whole facility
    return query.filter(WasteBatch.owner_id == user.id)


def _serialise(batch: WasteBatch) -> BatchOut:
    out = BatchOut.model_validate(batch)
    if batch.analyses:
        from ..schemas import AnalysisOut
        out.latest_analysis = AnalysisOut.model_validate(batch.analyses[0])
    return out


@router.post("", response_model=BatchOut, status_code=201)
def register_batch(payload: BatchCreate, db: Session = Depends(get_db),
                   user: User = Depends(current_user)):
    batch = WasteBatch(
        batch_code=f"TWB-{datetime.now(timezone.utc):%Y%m}-{secrets.token_hex(3).upper()}",
        owner_id=user.id,
        collection_date=payload.collection_date or datetime.now(timezone.utc),
        **payload.model_dump(exclude={"collection_date"}),
    )
    db.add(batch)
    db.flush()
    if batch.quantity_kg and batch.quantity_kg < LOW_STOCK_KG:
        db.add(Notification(
            user_id=user.id, kind="inventory",
            title=f"{batch.batch_code} is below the processing minimum",
            body=f"{batch.quantity_kg:.0f} kg registered. Consolidate with a similar batch "
                 f"before scheduling a run.",
        ))
    db.commit()
    db.refresh(batch)
    return _serialise(batch)


@router.get("", response_model=list[BatchOut])
def list_batches(db: Session = Depends(get_db), user: User = Depends(current_user),
                 status: BatchStatus | None = None, fabric_type: str | None = None,
                 search: str | None = None, limit: int = Query(100, le=500)):
    query = _visible(db, user)
    if status:
        query = query.filter(WasteBatch.status == status)
    if fabric_type:
        query = query.filter(WasteBatch.fabric_type == fabric_type)
    if search:
        like = f"%{search}%"
        query = query.filter(WasteBatch.batch_code.ilike(like) | WasteBatch.source.ilike(like))
    batches = query.order_by(WasteBatch.created_at.desc()).limit(limit).all()
    return [_serialise(b) for b in batches]


@router.get("/{batch_id}", response_model=BatchOut)
def get_batch(batch_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    batch = _visible(db, user).filter(WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="No batch with that id in your inventory.")
    return _serialise(batch)


@router.patch("/{batch_id}", response_model=BatchOut)
def update_batch(batch_id: int, payload: BatchUpdate, db: Session = Depends(get_db),
                 user: User = Depends(current_user)):
    batch = _visible(db, user).filter(WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="No batch with that id in your inventory.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(batch, field, value)
    db.commit()
    db.refresh(batch)
    return _serialise(batch)


@router.delete("/{batch_id}", status_code=204)
def delete_batch(batch_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    batch = _visible(db, user).filter(WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="No batch with that id in your inventory.")
    db.delete(batch)
    db.commit()
