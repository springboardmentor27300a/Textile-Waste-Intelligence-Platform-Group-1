import requests

def test_register_classified_batch_to_inventory():
    login_url = "http://127.0.0.1:8000/api/auth/login"
    login_res = requests.post(login_url, json={"email": "operator@textilewaste.org", "password": "operator123"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Analyze sample image
    img_path = r"C:\Users\Lenovo\.gemini\antigravity\brain\ea267b7f-ffd8-41a2-97a3-deeb9fb8d012\.user_uploaded\media_1787040530218.png"
    with open(img_path, "rb") as f:
        files = {"file": ("Classified_Fabric_Sample.png", f, "image/png")}
        res = requests.post("http://127.0.0.1:8000/api/classification/analyze", headers=headers, files=files)
        assert res.status_code == 200, f"Classification failed: {res.text}"
        data = res.json()

    # 2. Register classified batch to warehouse inventory
    color_name = data.get("dominant_color") or "Grey"
    payload = {
        "fabric_type": data.get("fabric_type", "Polyester"),
        "source": "Pre-consumer",
        "quantity": 150.0,
        "color": color_name,
        "condition": data.get("condition", "Clean"),
        "collection_date": "2026-08-18",
        "status": "Collected",
        "inventory_id": 1,
        "textile_wastes": [
            {
                "material_composition": data.get("composition", "100% Recycled Polyester (PET)"),
                "recyclability_rate": 0.94,
                "has_contaminants": False
            }
        ]
    }

    create_res = requests.post("http://127.0.0.1:8000/api/inventory", headers=headers, json=payload)
    assert create_res.status_code == 201, f"Failed to register batch: {create_res.text}"
    batch = create_res.json()
    print("\nREGISTERED BATCH SUCCESS:")
    print("Batch ID:", batch.get("id"))
    print("Fabric Type:", batch.get("fabric_type"))
    print("Quantity:", batch.get("quantity"))
    print("Status:", batch.get("status"))
    print("Inventory ID:", batch.get("inventory_id"))
    print("PASSED: Classified batch registered to warehouse inventory successfully!")

if __name__ == "__main__":
    test_register_classified_batch_to_inventory()
