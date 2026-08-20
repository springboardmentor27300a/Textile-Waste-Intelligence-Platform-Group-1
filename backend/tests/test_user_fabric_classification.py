import requests

def test_user_fabric_upload():
    login_url = "http://127.0.0.1:8000/api/auth/login"
    login_res = requests.post(login_url, json={"email": "operator@textilewaste.org", "password": "operator123"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Upload user's fabric screenshot
    img_path = r"C:\Users\Lenovo\.gemini\antigravity\brain\ea267b7f-ffd8-41a2-97a3-deeb9fb8d012\.user_uploaded\media_1787040530218.png"
    
    with open(img_path, "rb") as f:
        files = {"file": ("Screenshot_2026_Fabric_Sample.png", f, "image/png")}
        analyze_url = "http://127.0.0.1:8000/api/classification/analyze"
        res = requests.post(analyze_url, headers=headers, files=files)
        assert res.status_code == 200, f"Classification failed: {res.text}"
        data = res.json()
        print("CLASSIFICATION RESULT:")
        print("Is Fabric:", data.get("is_fabric"))
        print("Fabric Type:", data.get("fabric_type"))
        print("Composition:", data.get("composition"))
        print("Recyclability:", data.get("recyclability"))
        print("Confidence:", data.get("confidence_score"))
        
        assert data.get("is_fabric") == True, "Image should be identified as a valid fabric material!"
        print("PASSED: Fabric correctly identified and classified!")

if __name__ == "__main__":
    test_user_fabric_upload()
