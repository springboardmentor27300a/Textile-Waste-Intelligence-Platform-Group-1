"""
Textile inventory management routes.

GET    /api/inventory/            - list items (any authenticated role)
GET    /api/inventory/<id>        - get single item
POST   /api/inventory/            - create item (admin, staff)
PUT    /api/inventory/<id>        - update item (admin, staff)
DELETE /api/inventory/<id>        - delete item (admin only)
GET    /api/inventory/summary     - aggregate stats for dashboard
"""

from flask import Blueprint, request, jsonify
from app import db
from app.models.inventory import InventoryItem, WASTE_CATEGORIES, CONDITIONS, RECYCLING_STATUSES
from app.utils.security import token_required, role_required

inventory_bp = Blueprint("inventory", __name__)


@inventory_bp.route("/", methods=["GET"])
@token_required
def list_items():
    category = request.args.get("category")
    status = request.args.get("status")

    query = InventoryItem.query
    if category:
        query = query.filter_by(waste_category=category)
    if status:
        query = query.filter_by(recycling_status=status)

    items = query.order_by(InventoryItem.created_at.desc()).all()
    return jsonify({"items": [i.to_dict() for i in items], "count": len(items)}), 200


@inventory_bp.route("/<int:item_id>", methods=["GET"])
@token_required
def get_item(item_id):
    item = InventoryItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404
    return jsonify({"item": item.to_dict()}), 200


@inventory_bp.route("/", methods=["POST"])
@token_required
@role_required("admin", "staff")
def create_item():
    data = request.get_json(silent=True) or {}

    item_name = (data.get("item_name") or "").strip()
    fabric_type = (data.get("fabric_type") or "").strip()
    if not item_name or not fabric_type:
        return jsonify({"error": "item_name and fabric_type are required"}), 400

    item = InventoryItem(
        item_name=item_name,
        fabric_type=fabric_type,
        waste_category=data.get("waste_category", "Other"),
        quantity_kg=float(data.get("quantity_kg", 0) or 0),
        condition=data.get("condition", "Reusable"),
        source_location=data.get("source_location"),
        recycling_status=data.get("recycling_status", "Pending"),
        notes=data.get("notes"),
        created_by=request.current_user.get("user_id"),
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({"message": "Item created", "item": item.to_dict()}), 201


@inventory_bp.route("/<int:item_id>", methods=["PUT"])
@token_required
@role_required("admin", "staff")
def update_item(item_id):
    item = InventoryItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404

    data = request.get_json(silent=True) or {}
    for field in (
        "item_name", "fabric_type", "waste_category", "condition",
        "source_location", "recycling_status", "notes", "predicted_class",
    ):
        if field in data:
            setattr(item, field, data[field])
    if "quantity_kg" in data:
        item.quantity_kg = float(data["quantity_kg"] or 0)

    db.session.commit()
    return jsonify({"message": "Item updated", "item": item.to_dict()}), 200


@inventory_bp.route("/<int:item_id>", methods=["DELETE"])
@token_required
@role_required("admin")
def delete_item(item_id):
    item = InventoryItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted"}), 200


@inventory_bp.route("/summary", methods=["GET"])
@token_required
def summary():
    items = InventoryItem.query.all()
    total_kg = sum(i.quantity_kg for i in items)

    by_category = {}
    by_status = {}
    by_fabric = {}
    for i in items:
        by_category[i.waste_category] = by_category.get(i.waste_category, 0) + i.quantity_kg
        by_status[i.recycling_status] = by_status.get(i.recycling_status, 0) + i.quantity_kg
        by_fabric[i.fabric_type] = by_fabric.get(i.fabric_type, 0) + i.quantity_kg

    return jsonify({
        "total_items": len(items),
        "total_kg": round(total_kg, 2),
        "by_category_kg": {k: round(v, 2) for k, v in by_category.items()},
        "by_status_kg": {k: round(v, 2) for k, v in by_status.items()},
        "by_fabric_kg": {k: round(v, 2) for k, v in by_fabric.items()},
        "categories_available": WASTE_CATEGORIES,
        "conditions_available": CONDITIONS,
        "statuses_available": RECYCLING_STATUSES,
    }), 200
