import os
import requests
import json

API_BASE = os.getenv("API_BASE", "http://localhost:8000")

def test_deployment():
    print("--- STARTING PRODUCTION DEPLOYMENT VERIFICATION ---")
    results = {}

    # 1. Authentication
    print("Testing Authentication...")
    try:
        res = requests.post(f"{API_BASE}/api/auth/login", json={"email": "admin@texwaste.com", "password": "admin123"})
        if res.ok:
            token = res.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            me_res = requests.get(f"{API_BASE}/api/auth/me", headers=headers)
            results["Authentication (Login & Session)"] = "PASS" if me_res.ok else "FAIL"
            print("  Login: OK")
        else:
            results["Authentication (Login & Session)"] = f"FAIL ({res.status_code})"
            print("  Login: FAIL")
            return results
    except Exception as e:
        results["Authentication (Login & Session)"] = f"ERROR: {e}"
        return results

    # 2. Dashboard
    print("Testing Dashboard Endpoints...")
    endpoints = {
        "Inventory Summary": "/api/inventory/summary",
        "Dashboard Stats": "/api/waste/dashboard-stats",
        "Waste Analytics": "/api/waste/analytics",
        "Active Suppliers": "/api/suppliers"
    }
    for name, ep in endpoints.items():
        try:
            r = requests.get(f"{API_BASE}{ep}", headers=headers)
            results[f"Dashboard - {name}"] = "PASS" if r.ok else f"FAIL ({r.status_code})"
            print(f"  {name}: {'OK' if r.ok else 'FAIL'}")
        except Exception as e:
            results[f"Dashboard - {name}"] = "ERROR"
            
    # 3. Inventory
    print("Testing Inventory...")
    try:
        r = requests.get(f"{API_BASE}/api/inventory", headers=headers)
        results["Inventory List"] = "PASS" if r.ok else "FAIL"
        
        # Test Create
        create_res = requests.post(
            f"{API_BASE}/api/inventory", 
            headers=headers,
            json={"material_type": "Cotton", "weight_kg": 150.0, "status": "Available"}
        )
        if create_res.ok:
            inv_id = create_res.json()["id"]
            results["Inventory Create"] = "PASS"
            
            # Test Delete
            del_res = requests.delete(f"{API_BASE}/api/inventory/{inv_id}", headers=headers)
            results["Inventory Delete"] = "PASS" if del_res.ok else "FAIL"
        else:
            results["Inventory Create"] = "FAIL"
            results["Inventory Delete"] = "SKIPPED"
        print("  Inventory CRUD: OK")
    except Exception as e:
        results["Inventory Tests"] = "ERROR"
        
    # 4. Waste
    print("Testing Waste Records...")
    try:
        r = requests.get(f"{API_BASE}/api/waste/records", headers=headers)
        results["Waste Records List"] = "PASS" if r.ok else "FAIL"
        print("  Waste List: OK")
    except Exception:
        results["Waste Records List"] = "ERROR"
        
    # 5. Sustainability & Reports
    print("Testing Sustainability & Reports...")
    reports = {
        "Sustainability Data": "/api/sustainability",
        "Recommendations": "/api/recommendation",
        "Environmental Reports": "/api/environmental",
        "Circular Analytics": "/api/circular-analytics/latest"
    }
    for name, ep in reports.items():
        try:
            r = requests.get(f"{API_BASE}{ep}", headers=headers)
            results[name] = "PASS" if r.ok else f"FAIL ({r.status_code})"
            print(f"  {name}: {'OK' if r.ok else 'FAIL'}")
        except Exception:
            results[name] = "ERROR"

    print("\n--- SUMMARY ---")
    for k, v in results.items():
        print(f"{k.ljust(40)} : {v}")

test_deployment()
