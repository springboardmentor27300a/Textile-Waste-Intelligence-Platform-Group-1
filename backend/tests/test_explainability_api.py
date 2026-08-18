import requests
import io
from PIL import Image, ImageDraw

def test_explainability_endpoint():
    url_explain = "http://127.0.0.1:8000/api/classification/explain"
    url_alias = "http://127.0.0.1:8000/api/classify/explain"
    
    # 1. Login to retrieve bearer token
    login_url = "http://127.0.0.1:8000/api/auth/login"
    login_res = requests.post(login_url, json={"email": "operator@textilewaste.org", "password": "operator123"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create a synthetic cotton fabric image in memory
    img = Image.new("RGB", (300, 300), color=(220, 210, 195))
    draw = ImageDraw.Draw(img)
    # Draw cross-hatch fabric weave texture
    for x in range(0, 300, 10):
        draw.line([(x, 0), (x, 300)], fill=(180, 170, 155), width=2)
    for y in range(0, 300, 10):
        draw.line([(0, y), (300, y)], fill=(180, 170, 155), width=2)

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    # 3. Call POST /api/classification/explain
    files = {"file": ("test_cotton_weave.png", buf, "image/png")}
    response = requests.post(url_explain, headers=headers, files=files)
    print("Explain Endpoint Response Status:", response.status_code)
    assert response.status_code == 200, f"Explain endpoint failed: {response.text}"
    
    data = response.json()
    print("Predicted Class:", data.get("predicted_class"))
    print("Confidence:", data.get("confidence"))
    print("Is Uncertain:", data.get("is_uncertain"))
    print("Active Features:", data.get("active_features"))
    print("Heatmap Base64 Length:", len(data.get("heatmap_base64", "")))

    assert "predicted_class" in data
    assert "confidence" in data
    assert "heatmap_base64" in data
    assert data["heatmap_base64"].startswith("data:image/png;base64,")
    print("PASSED: POST /api/classification/explain test passed successfully!")

    # 4. Call Alias POST /api/classify/explain
    buf.seek(0)
    files_alias = {"file": ("test_cotton_weave.png", buf, "image/png")}
    alias_res = requests.post(url_alias, headers=headers, files=files_alias)
    print("Alias Endpoint Response Status:", alias_res.status_code)
    assert alias_res.status_code == 200, f"Alias endpoint failed: {alias_res.text}"
    print("PASSED: POST /api/classify/explain alias test passed successfully!")

if __name__ == "__main__":
    test_explainability_endpoint()
