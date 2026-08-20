from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.inventory import Inventory
from app.models.collection import Collection
from app.schemas.inventory import InventoryCreate, InventoryUpdate


class InventoryService:
    @staticmethod
    def generate_batch_id(db: Session) -> str:
        latest = db.query(Inventory).order_by(Inventory.id.desc()).first()
        if latest is None:
            return "WB-1001"
        try:
            last_number = int(latest.batch_id.split("-")[1])
        except Exception:
            last_number = 1000
        return f"WB-{last_number + 1}"

    @staticmethod
    def get_all(db: Session):
        return db.query(Inventory).order_by(Inventory.id.desc()).all()

    @staticmethod
    def get_by_id(inventory_id: int, db: Session):
        item = db.query(Inventory).filter(Inventory.id == inventory_id).first()
        if item is None:
            raise HTTPException(status_code=404, detail="Inventory item not found.")
        return item

    @staticmethod
    def _validate_collection(collection_id: int | None, db: Session):
        if collection_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please select a collection before saving the inventory batch.",
            )
        collection = db.query(Collection).filter(Collection.id == collection_id).first()
        if collection is None:
            raise HTTPException(status_code=404, detail="Selected collection not found.")
        existing = db.query(Inventory).filter(Inventory.collection_id == collection_id).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="This collection is already linked to an inventory batch.",
            )
        return collection

    @staticmethod
    def create(inventory: InventoryCreate, db: Session):
        InventoryService._validate_collection(inventory.collection_id, db)
        batch_id = InventoryService.generate_batch_id(db)
        data = inventory.model_dump()
        new_inventory = Inventory(batch_id=batch_id, **data)
        db.add(new_inventory)
        db.commit()
        db.refresh(new_inventory)
        return new_inventory

    @staticmethod
    def update(inventory_id: int, inventory: InventoryUpdate, db: Session):
        existing = InventoryService.get_by_id(inventory_id, db)
        if inventory.collection_id != existing.collection_id:
            if inventory.collection_id is not None:
                other = db.query(Inventory).filter(
                    Inventory.collection_id == inventory.collection_id,
                    Inventory.id != inventory_id,
                ).first()
                if other:
                    raise HTTPException(status_code=400, detail="Selected collection is already linked to another inventory batch.")
                collection = db.query(Collection).filter(Collection.id == inventory.collection_id).first()
                if collection is None:
                    raise HTTPException(status_code=404, detail="Selected collection not found.")
        for field, value in inventory.model_dump().items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing

    @staticmethod
    def delete(inventory_id: int, db: Session):
        item = InventoryService.get_by_id(inventory_id, db)
        db.delete(item)
        db.commit()
        return {"message": "Inventory deleted successfully."}

    @staticmethod
    def get_statistics(db: Session):
        inventory = db.query(Inventory).all()
        return {
            "total_batches": len(inventory),
            "total_quantity": sum(item.quantity for item in inventory),
            "recyclable_quantity": sum(item.quantity for item in inventory if item.condition in ["Excellent", "Good", "Fair"]),
            "pending_review": sum(1 for item in inventory if item.condition == "Poor"),
        }
