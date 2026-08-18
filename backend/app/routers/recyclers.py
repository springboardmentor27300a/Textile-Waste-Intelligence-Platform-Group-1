import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.models import Recycler, WasteBatch, User
from app.auth.dependencies import get_current_user, RoleChecker
from app.schemas.schemas import (
    RecyclerCreate, 
    RecyclerUpdate, 
    RecyclerResponse, 
    RecyclerMatchResponse
)

router = APIRouter(prefix="/api/recyclers", tags=["Recycler Marketplace"])
router_batches = APIRouter(prefix="/api", tags=["Recycler Marketplace"])

DEFAULT_RECYCLERS = [
  {
    "name": "Surat Eco-PET & Polymer Fibers",
    "accepted_materials": ["Polyester", "PET", "Synthetic", "Blend", "Nylon"],
    "accepted_conditions": ["Clean", "Good", "Fair", "Worn"],
    "min_quantity": 50.0,
    "max_contamination_level": 15.0,
    "location": "Surat, Gujarat",
    "contact_email": "sourcing@surat-ecopet.in",
    "phone_number": "+91 98250 11223",
    "specialization": "Melt Extrusion & Chemical Glycolysis rPET Pellets",
    "rating": 4.9
  },
  {
    "name": "Tirupur Organic Cotton Revitalizers",
    "accepted_materials": ["Cotton", "Denim", "Linen", "Organic Cotton", "Blend"],
    "accepted_conditions": ["Clean", "Good", "Fair"],
    "min_quantity": 25.0,
    "max_contamination_level": 10.0,
    "location": "Tirupur, Tamil Nadu",
    "contact_email": "recycle@tirupurcotton.org",
    "phone_number": "+91 94431 88776",
    "specialization": "Mechanical Garnetting & Ionic Cellulosic Dissolution",
    "rating": 4.8
  },
  {
    "name": "Panipat Shoddy Wool Spinning Mills",
    "accepted_materials": ["Wool", "Merino", "Wool Blends", "Knits", "Acrylic"],
    "accepted_conditions": ["Clean", "Good", "Fair", "Worn", "Damaged"],
    "min_quantity": 40.0,
    "max_contamination_level": 20.0,
    "location": "Panipat, Haryana",
    "contact_email": "procurement@panipatwool.co.in",
    "phone_number": "+91 98120 44556",
    "specialization": "Rag-Tearing & Needle-Punching Acoustic Wool Felts",
    "rating": 4.7
  },
  {
    "name": "Coimbatore Green Tex Circulars",
    "accepted_materials": ["Cotton", "Polyester", "Denim", "Nylon", "Silk", "Linen", "Blend"],
    "accepted_conditions": ["Clean", "Good", "Fair", "Worn", "Damaged"],
    "min_quantity": 20.0,
    "max_contamination_level": 25.0,
    "location": "Coimbatore, Tamil Nadu",
    "contact_email": "sustainability@coimbatoregreentex.com",
    "phone_number": "+91 94422 33445",
    "specialization": "Zero-Waste Patchwork & Textile Composite Board Pressing",
    "rating": 4.9
  },
  {
    "name": "Ahmedabad Hybrid Fibre Solutions",
    "accepted_materials": ["Blend", "Poly-Cotton", "Synthetic", "Denim", "Cotton"],
    "accepted_conditions": ["Clean", "Good", "Fair"],
    "min_quantity": 100.0,
    "max_contamination_level": 12.0,
    "location": "Ahmedabad, Gujarat",
    "contact_email": "info@ahmedabadhybrid.in",
    "phone_number": "+91 97277 55667",
    "specialization": "Solvent Hydrothermal Blend Separation & Bio-Fuel Pyrolysis",
    "rating": 4.6
  }
]

def seed_recyclers_if_empty(db: Session):
    count = db.query(Recycler).count()
    if count == 0:
        for r in DEFAULT_RECYCLERS:
            mat_str = json.dumps(r["accepted_materials"])
            cond_str = json.dumps(r["accepted_conditions"])
            db_recycler = Recycler(
                name=r["name"],
                accepted_materials=mat_str,
                accepted_conditions=cond_str,
                min_quantity=r["min_quantity"],
                max_contamination_level=r["max_contamination_level"],
                location=r["location"],
                contact_email=r["contact_email"],
                phone_number=r["phone_number"],
                specialization=r["specialization"],
                rating=r["rating"]
            )
            db.add(db_recycler)
        db.commit()

def parse_recycler_response(r: Recycler) -> Dict[str, Any]:
    try:
        mats = json.loads(r.accepted_materials)
    except Exception:
        mats = [m.strip() for m in r.accepted_materials.split(",") if m.strip()]

    try:
        conds = json.loads(r.accepted_conditions)
    except Exception:
        conds = [c.strip() for c in r.accepted_conditions.split(",") if c.strip()]

    return {
        "id": r.id,
        "name": r.name,
        "accepted_materials": mats,
        "accepted_conditions": conds,
        "min_quantity": r.min_quantity,
        "max_contamination_level": r.max_contamination_level,
        "location": r.location,
        "contact_email": r.contact_email,
        "phone_number": r.phone_number,
        "specialization": r.specialization,
        "rating": r.rating,
        "created_at": r.created_at
    }

# 1. GET /api/recyclers - List all recyclers
@router.get("", response_model=List[RecyclerResponse])
def get_all_recyclers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    seed_recyclers_if_empty(db)
    recyclers = db.query(Recycler).order_by(Recycler.rating.desc()).all()
    return [parse_recycler_response(r) for r in recyclers]

# 2. POST /api/recyclers - Create new recycler (Admin / Recycler / Manufacturer)
@router.post("", response_model=RecyclerResponse, status_code=status.HTTP_201_CREATED)
def create_recycler(
    recycler_in: RecyclerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_role = current_user.role.name if current_user and current_user.role else ""
    if user_role not in ["Administrator", "Recycling Facility Operator", "Textile Manufacturer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Only Administrators, Facility Operators, or Manufacturers can register recyclers."
        )

    mat_str = json.dumps(recycler_in.accepted_materials)
    cond_str = json.dumps(recycler_in.accepted_conditions)

    db_recycler = Recycler(
        name=recycler_in.name,
        accepted_materials=mat_str,
        accepted_conditions=cond_str,
        min_quantity=recycler_in.min_quantity,
        max_contamination_level=recycler_in.max_contamination_level,
        location=recycler_in.location,
        contact_email=recycler_in.contact_email,
        phone_number=recycler_in.phone_number,
        specialization=recycler_in.specialization,
        rating=recycler_in.rating or 4.8
    )
    db.add(db_recycler)
    db.commit()
    db.refresh(db_recycler)
    return parse_recycler_response(db_recycler)

# 3. GET /api/recyclers/{recycler_id}
@router.get("/{recycler_id}", response_model=RecyclerResponse)
def get_recycler_by_id(
    recycler_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recycler = db.query(Recycler).filter(Recycler.id == recycler_id).first()
    if not recycler:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recycler not found.")
    return parse_recycler_response(recycler)

# 4. PUT /api/recyclers/{recycler_id}
@router.put("/{recycler_id}", response_model=RecyclerResponse)
def update_recycler(
    recycler_id: int,
    recycler_in: RecyclerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_role = current_user.role.name if current_user and current_user.role else ""
    if user_role not in ["Administrator", "Recycling Facility Operator"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied.")

    recycler = db.query(Recycler).filter(Recycler.id == recycler_id).first()
    if not recycler:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recycler not found.")

    if recycler_in.name is not None: recycler.name = recycler_in.name
    if recycler_in.accepted_materials is not None: recycler.accepted_materials = json.dumps(recycler_in.accepted_materials)
    if recycler_in.accepted_conditions is not None: recycler.accepted_conditions = json.dumps(recycler_in.accepted_conditions)
    if recycler_in.min_quantity is not None: recycler.min_quantity = recycler_in.min_quantity
    if recycler_in.max_contamination_level is not None: recycler.max_contamination_level = recycler_in.max_contamination_level
    if recycler_in.location is not None: recycler.location = recycler_in.location
    if recycler_in.contact_email is not None: recycler.contact_email = recycler_in.contact_email
    if recycler_in.phone_number is not None: recycler.phone_number = recycler_in.phone_number
    if recycler_in.specialization is not None: recycler.specialization = recycler_in.specialization
    if recycler_in.rating is not None: recycler.rating = recycler_in.rating

    db.commit()
    db.refresh(recycler)
    return parse_recycler_response(recycler)

# 5. DELETE /api/recyclers/{recycler_id}
@router.delete("/{recycler_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recycler(
    recycler_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_role = current_user.role.name if current_user and current_user.role else ""
    if user_role != "Administrator":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Administrators can delete recyclers.")

    recycler = db.query(Recycler).filter(Recycler.id == recycler_id).first()
    if not recycler:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recycler not found.")

    db.delete(recycler)
    db.commit()
    return None

# 6. GET /api/batches/{batch_id}/matches (and alias /api/inventory/batches/{batch_id}/matches)
@router_batches.get("/batches/{batch_id}/matches", response_model=List[RecyclerMatchResponse])
@router_batches.get("/inventory/batches/{batch_id}/matches", response_model=List[RecyclerMatchResponse])
def get_batch_recycler_matches(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Recycler Matching Engine:
    Given a classified waste batch (fabric_type, condition, quantity, contamination, circularity_score),
    returns a ranked list of matched recyclers scored by fit percentage (0-100%) and why each matched.
    """
    seed_recyclers_if_empty(db)
    
    batch = db.query(WasteBatch).filter(WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Waste batch ID {batch_id} not found.")

    # Batch parameters
    batch_material = batch.fabric_type
    batch_condition = batch.condition
    batch_quantity = batch.quantity_kg
    
    # Check if batch has contaminants
    has_contam = any(tw.has_contaminants for tw in batch.textile_wastes) if batch.textile_wastes else False
    batch_contamination_pct = 12.0 if has_contam else 2.5

    # Circularity score
    circularity_score = 80
    if batch.sustainability_metrics and batch.sustainability_metrics.circularity_score:
        circularity_score = int(batch.sustainability_metrics.circularity_score)

    recyclers = db.query(Recycler).all()
    matches = []

    for r in recyclers:
        r_dict = parse_recycler_response(r)
        mats = [m.lower() for m in r_dict["accepted_materials"]]
        conds = [c.lower() for c in r_dict["accepted_conditions"]]

        # Material match
        material_match = any(m in batch_material.lower() or batch_material.lower() in m for m in mats)
        
        # Condition match
        condition_match = any(c in batch_condition.lower() or batch_condition.lower() in c for c in conds) or "good" in conds or "clean" in conds

        # Contamination check
        contamination_ok = batch_contamination_pct <= r.max_contamination_level

        # Quantity check
        quantity_ok = batch_quantity >= (r.min_quantity * 0.7)  # allow 30% flex margin

        is_eligible = material_match and condition_match and contamination_ok and quantity_ok

        # Calculate Fit Score (0 to 100)
        fit_score = 0
        why_matched = []

        if material_match:
            fit_score += 40
            why_matched.append(f"Accepts {batch_material} material streams")
        else:
            why_matched.append(f"Material {batch_material} does not directly align with facility specs")

        if condition_match:
            fit_score += 20
            why_matched.append(f"Accepts {batch_condition} physical condition grade")

        if contamination_ok:
            if batch_contamination_pct <= (r.max_contamination_level * 0.5):
                fit_score += 20
                why_matched.append(f"Low contamination ({batch_contamination_pct}%) is well within allowed limit ({r.max_contamination_level}%)")
            else:
                fit_score += 12
                why_matched.append(f"Contamination ({batch_contamination_pct}%) meets limit ({r.max_contamination_level}%)")
        else:
            why_matched.append(f"Exceeds max allowed contamination limit ({r.max_contamination_level}%)")

        if quantity_ok:
            if batch_quantity >= r.min_quantity:
                fit_score += 15
                why_matched.append(f"Batch quantity ({batch_quantity} kg) satisfies minimum order batch size ({r.min_quantity} kg)")
            else:
                fit_score += 8
                why_matched.append(f"Batch quantity ({batch_quantity} kg) is near minimum threshold ({r.min_quantity} kg)")

        # Bonus for circularity & rating
        circularity_bonus = int((circularity_score / 100.0) * 5)
        fit_score += circularity_bonus
        if circularity_score >= 80:
            why_matched.append(f"High circularity score ({circularity_score}/100) aligns with facility eco-sourcing criteria")

        fit_score = min(100, fit_score)

        if fit_score >= 85:
            fit_category = "Excellent Match"
        elif fit_score >= 70:
            fit_category = "Strong Match"
        elif fit_score >= 50:
            fit_category = "Moderate Match"
        else:
            fit_category = "Low Match"

        matches.append({
            "recycler": r_dict,
            "fit_score": fit_score,
            "fit_category": fit_category,
            "why_matched": why_matched,
            "is_eligible": is_eligible
        })

    # Sort matches by fit_score descending
    matches.sort(key=lambda x: x["fit_score"], reverse=True)
    return matches
