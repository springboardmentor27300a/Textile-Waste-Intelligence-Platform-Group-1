import requests
API_BASE = "https://ai-textile-waste-intelligence-platform.onrender.com"
res = requests.post(f"{API_BASE}/api/auth/login", json={"email": "admin@texwaste.com", "password": "admin123"})
token = res.json()["access_token"]
r = requests.get(f"{API_BASE}/api/notifications/unread-count", headers={"Authorization": f"Bearer {token}"})
print(r.status_code)
print(r.text)
