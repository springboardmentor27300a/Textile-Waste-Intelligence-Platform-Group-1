import requests, io
from PIL import Image, ImageDraw

# Generate a synthetic denim image (blue background with diagonal twill lines)
width, height = 400, 400
img = Image.new("RGB", (width, height), (30, 60, 130)) # Indigo blue
draw = ImageDraw.Draw(img)

# Draw diagonal twill weave pattern lines
for i in range(-height, width, 10):
    draw.line([(i, 0), (i + height, height)], fill=(70, 110, 180), width=3)
    draw.line([(i+4, 0), (i + 4 + height, height)], fill=(15, 40, 95), width=2)

img_bytes = io.BytesIO()
img.save(img_bytes, format="PNG")
img_bytes.seek(0)

# 1. Login to get token
resp = requests.post("http://127.0.0.1:8000/api/auth/token", data={"username": "admin@textilewaste.io", "password": "Admin@12345"})
if resp.status_code != 200:
    print("Login failed:", resp.text)
    exit(1)

token = resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Get list of batches
batches = requests.get("http://127.0.0.1:8000/api/inventory", headers=headers).json()
denim_batch = next((b for b in batches if b["fabric_type"] == "denim"), batches[0])

print(f"Testing image analysis on Batch: {denim_batch['batch_code']} ({denim_batch['id']})")

# 3. Post image analysis
files = {"file": ("test_denim.png", img_bytes.getvalue(), "image/png")}
analysis_resp = requests.post(f"http://127.0.0.1:8000/api/inventory/{denim_batch['id']}/analyze", headers=headers, files=files)

print("Analysis Status Code:", analysis_resp.status_code)
if analysis_resp.status_code == 201:
    res = analysis_resp.json()
    print("--------------------------------------------------")
    print("SUCCESSFULLY CLASSIFIED DENIM TEXTILE!")
    print(f"Predicted Fabric Type : {res['predicted_fabric_type'].upper()}")
    print(f"Fabric Confidence    : {res['fabric_confidence'] * 100:.1f}%")
    print(f"Dominant Color Hex   : {res['dominant_color_hex']}")
    print(f"Recyclability Score  : {res['recyclability_score']}/100")
    print(f"Recommended Category : {res['recommended_category'].upper()}")
    print(f"Material Rationale   : {res['material_rationale']}")
    print("--------------------------------------------------")
else:
    print("Analysis failed:", analysis_resp.text)
