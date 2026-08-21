import requests

API_BASE = "https://ai-textile-waste-intelligence-platform.onrender.com"

# Login
res = requests.post(f"{API_BASE}/api/auth/login", json={"email": "admin@texwaste.com", "password": "admin123"})
if not res.ok:
    print(f"Login failed: {res.status_code} {res.text}")
    exit(1)

token = res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

endpoints = [
    "/api/inventory/summary",
    "/api/waste/dashboard-stats",
    "/api/waste/analytics",
    "/api/sustainability",
    "/api/environmental",
    "/api/recommendation",
    "/api/circular-analytics/latest"
]

for ep in endpoints:
    url = f"{API_BASE}{ep}"
    r = requests.get(url, headers=headers)
    print(f"{ep}: {r.status_code}")
    if not r.ok:
        print(f"Error for {ep}: {r.text}")
