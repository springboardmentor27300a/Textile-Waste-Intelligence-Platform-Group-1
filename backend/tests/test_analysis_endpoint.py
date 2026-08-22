import io
from PIL import Image, ImageDraw

def test_analyze_endpoint_traceback(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 1. Register a batch
    batch_resp = client.post("/api/inventory", headers=headers, json={
        "fabric_type": "denim",
        "quantity_kg": 250.0,
        "condition": "new_surplus",
        "category": "reusable",
        "source": "Textile Mill",
        "source_type": "post_consumer",
        "collection_date": "2026-08-18",
        "contamination_level": "clean"
    })
    assert batch_resp.status_code == 201, batch_resp.text
    batch_id = batch_resp.json()["id"]
    
    # 2. Generate synthetic denim image
    img = Image.new("RGB", (400, 400), (30, 60, 130))
    draw = ImageDraw.Draw(img)
    for i in range(-400, 400, 10):
        draw.line([(i, 0), (i + 400, 400)], fill=(70, 110, 180), width=3)
    
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)
    
    files = {"file": ("test_denim.png", img_bytes.getvalue(), "image/png")}
    
    resp = client.post(f"/api/inventory/{batch_id}/analyze", headers=headers, files=files)
    print("RESPONSE STATUS:", resp.status_code)
    if resp.status_code != 201:
        print("RESPONSE BODY:", resp.text)
    assert resp.status_code == 201, resp.text
    data = resp.json()
    print("PREDICTED FABRIC:", data["predicted_fabric_type"])
    print("FABRIC CONFIDENCE:", data["fabric_confidence"])
    print("RECYCLABILITY SCORE:", data["recyclability_score"])
