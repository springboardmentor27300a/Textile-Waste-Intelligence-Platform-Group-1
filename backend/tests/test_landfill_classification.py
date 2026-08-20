import requests

def test_landfill_heap_classification():
    login_url = "http://127.0.0.1:8000/api/auth/login"
    login_res = requests.post(login_url, json={"email": "operator@textilewaste.org", "password": "operator123"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Upload user's landfill dump photo
    img_path = r"C:\Users\Lenovo\.gemini\antigravity\brain\ea267b7f-ffd8-41a2-97a3-deeb9fb8d012\.user_uploaded\media_1787048909108.jpg"
    
    with open(img_path, "rb") as f:
        files = {"file": ("Landfill_Unsegregated_Waste_Heap.jpg", f, "image/jpeg")}
        analyze_url = "http://127.0.0.1:8000/api/classification/analyze"
        res = requests.post(analyze_url, headers=headers, files=files)
        assert res.status_code == 200, f"Classification failed: {res.text}"
        data = res.json()
        print("\n--- LANDFILL CLASSIFICATION RESULT ---")
        print("Is Fabric:", data.get("is_fabric"))
        print("Fabric Type:", data.get("fabric_type"))
        print("Composition:", data.get("composition"))
        print("Circularity Score:", data.get("circularity_score"))
        print("Condition:", data.get("condition"))
        print("Has Contaminants:", data.get("has_contaminants"))
        print("Category:", data.get("category"))
        
        assert data.get("has_contaminants") == True, "Landfill waste heap should flag contaminants!"
        assert data.get("circularity_score") < 60, "Landfill waste heap score should be realistic (35-50%), not 89%!"
        print("PASSED: Landfill waste heap correctly classified with realistic recovery score & contamination flags!")

if __name__ == "__main__":
    test_landfill_heap_classification()
