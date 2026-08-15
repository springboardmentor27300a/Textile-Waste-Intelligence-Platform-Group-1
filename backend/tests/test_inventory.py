import pytest
from app.models import WasteBatch, WasteCondition


def test_inventory_list(client, auth_headers, test_user, db_session):
    batch = WasteBatch(
        batch_code="BATCH-001",
        fabric_type="Cotton",
        source="Factory Spin Mill",
        quantity_kg=250.0,
        color="White",
        condition=WasteCondition.GOOD,
        notes="High grade virgin offcuts",
        owner_id=test_user.id,
    )
    db_session.add(batch)
    db_session.commit()

    response = client.get("/api/inventory/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["batch_code"] == "BATCH-001"


def test_inventory_create_batch(client, auth_headers):
    response = client.post(
        "/api/inventory/",
        headers=auth_headers,
        json={
            "batch_code": "BATCH-002",
            "fabric_type": "Denim",
            "source": "Denim Garment Factory",
            "quantity_kg": 150.0,
            "color": "Indigo Blue",
            "condition": "good",
            "notes": "100% cotton denim trimmings",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["batch_code"] == "BATCH-002"
    assert data["fabric_type"] == "Denim"


def test_inventory_stats_summary(client, auth_headers, test_user, db_session):
    batch = WasteBatch(
        batch_code="BATCH-STATS",
        fabric_type="Wool",
        source="Textile Mill",
        quantity_kg=320.0,
        color="Grey",
        condition=WasteCondition.GOOD,
        owner_id=test_user.id,
    )
    db_session.add(batch)
    db_session.commit()

    response = client.get("/api/inventory/stats/summary", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_batches"] >= 1
    assert data["total_quantity_kg"] >= 320.0
