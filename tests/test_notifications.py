"""Milestone 4 tests: Notification & Alert System."""

from datetime import datetime, timedelta

from app.models.inventory import InventoryItem
from app import db as _db


def test_notifications_always_include_announcement(client, staff_headers):
    res = client.get("/api/notifications/", headers=staff_headers)
    assert res.status_code == 200
    data = res.get_json()
    types = [n["type"] for n in data["notifications"]]
    assert "announcement" in types


def test_stale_pending_inventory_triggers_warning(client, app, staff_headers):
    with app.app_context():
        item = InventoryItem(
            item_name="Old Batch", fabric_type="Cotton", waste_category="Pre-consumer",
            quantity_kg=25.0, condition="Reusable", recycling_status="Pending",
        )
        _db.session.add(item)
        _db.session.commit()
        item.created_at = datetime.utcnow() - timedelta(days=10)
        _db.session.commit()

    res = client.get("/api/notifications/", headers=staff_headers)
    types = [n["type"] for n in res.get_json()["notifications"]]
    assert "inventory_warning" in types


def test_notifications_require_auth(client):
    res = client.get("/api/notifications/")
    assert res.status_code == 401
