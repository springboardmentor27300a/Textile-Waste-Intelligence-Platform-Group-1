"""
InventoryItem model - represents a unit of textile waste tracked
through the intake -> sorting -> recycling/disposal workflow.
"""

from datetime import datetime
from app import db

WASTE_CATEGORIES = ("Pre-consumer", "Post-consumer", "Industrial", "Other")
CONDITIONS = ("Reusable", "Degraded", "Contaminated")
RECYCLING_STATUSES = ("Pending", "In Process", "Recycled", "Rejected", "Disposed")


class InventoryItem(db.Model):
    __tablename__ = "inventory_items"

    id = db.Column(db.Integer, primary_key=True)
    item_name = db.Column(db.String(150), nullable=False)
    fabric_type = db.Column(db.String(80), nullable=False)
    waste_category = db.Column(db.String(40), nullable=False, default="Other")
    quantity_kg = db.Column(db.Float, nullable=False, default=0.0)
    condition = db.Column(db.String(40), nullable=False, default="Reusable")
    source_location = db.Column(db.String(150), nullable=True)
    recycling_status = db.Column(db.String(40), nullable=False, default="Pending")
    predicted_class = db.Column(db.String(80), nullable=True)  # set via classifier demo
    notes = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "item_name": self.item_name,
            "fabric_type": self.fabric_type,
            "waste_category": self.waste_category,
            "quantity_kg": self.quantity_kg,
            "condition": self.condition,
            "source_location": self.source_location,
            "recycling_status": self.recycling_status,
            "predicted_class": self.predicted_class,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
