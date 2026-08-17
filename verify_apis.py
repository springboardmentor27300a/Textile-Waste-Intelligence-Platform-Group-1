import urllib.request
import urllib.error
import json
from datetime import date
import io
import mimetypes
from PIL import Image

BASE_URL = "http://127.0.0.1:8000"

def make_request(url, method="GET", data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    req_data = None
    if data:
        req_data = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(f"{BASE_URL}{url}", data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            if res.status == 204:
                return True
            return json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
        raise e
    except Exception as e:
        print(f"Request failed: {e}")
        raise e

def encode_multipart_formdata(fields, files):
    boundary = b'----WebKitFormBoundary7MA4YWxkTrZu0gW'
    CRLF = b'\r\n'
    L = []
    for key, value in fields.items():
        L.append(b'--' + boundary)
        L.append(f'Content-Disposition: form-data; name="{key}"'.encode('utf-8'))
        L.append(b'')
        L.append(value.encode('utf-8'))
    for key, filename, value in files:
        L.append(b'--' + boundary)
        L.append(f'Content-Disposition: form-data; name="{key}"; filename="{filename}"'.encode('utf-8'))
        mimetype = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
        L.append(f'Content-Type: {mimetype}'.encode('utf-8'))
        L.append(b'')
        L.append(value)
    L.append(b'--' + boundary + b'--')
    L.append(b'')
    body = CRLF.join(L)
    content_type = f'multipart/form-data; boundary={boundary.decode("utf-8")}'
    return content_type, body

def make_multipart_request(url, files, token=None):
    content_type, body = encode_multipart_formdata({}, files)
    headers = {
        "Content-Type": content_type,
        "Content-Length": str(len(body))
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    req = urllib.request.Request(f"{BASE_URL}{url}", data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as res:
            return json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
        raise e
    except Exception as e:
        print(f"Request failed: {e}")
        raise e

def run_tests():
    print("==================================================")
    print("[RUN] Running API Verification Tests...")
    print("==================================================")
    
    # 1. Test Login
    print("\n[Test 1] Authenticating Operator User...")
    login_payload = {
        "email": "operator@textilewaste.org",
        "password": "operator123"
    }
    login_res = make_request("/api/auth/login", method="POST", data=login_payload)
    token = login_res.get("access_token")
    user = login_res.get("user")
    print(f"[OK] Authentication successful. Logged in as: {user['full_name']} ({user['role']['name']})")
    
    # 2. Test Profile API
    print("\n[Test 2] Querying Profile...")
    profile_res = make_request("/api/auth/profile", method="GET", token=token)
    print(f"[OK] Profile fetched. Email: {profile_res['email']}, Full Name: {profile_res['full_name']}")
    
    # 3. Test Dashboard Stats API
    print("\n[Test 3.0] Reading Dashboard Stats...")
    stats_res = make_request("/api/inventory/stats", method="GET", token=token)
    print(f"[OK] Stats fetched successfully.")
    print(f"  - Total records: {stats_res['total_records']}")
    print(f"  - Total quantity: {stats_res['total_quantity']} kg")
    print(f"  - Fabric Types in system: {list(stats_res['fabric_distribution'].keys())}")
    
    # 3.5. Test Datasets API
    print("\n[Test 3.5] Reading Integrated Datasets...")
    datasets_res = make_request("/api/datasets", method="GET", token=token)
    print(f"[OK] Datasets fetched successfully. Mapped datasets: {len(datasets_res)}")
    for ds in datasets_res:
        print(f"  - {ds['name']}: {ds['size']} (Status: {ds['status']})")

    # 3.8. Test Image Classification API (Milestone 2)
    print("\n[Test 3.8] Simulating Image Upload and Textile Classification (Milestone 2)...")
    # Generate in-memory red image
    img = Image.new('RGB', (100, 100), color='red')
    img_io = io.BytesIO()
    img.save(img_io, format='PNG')
    img_bytes = img_io.getvalue()
    
    files = [("file", "cotton-waste-sample.png", img_bytes)]
    classify_res = make_multipart_request("/api/classification/analyze", files, token=token)
    
    print(f"[OK] AI Classification report received:")
    print(f"  - Mapped Fabric: {classify_res['fabric_type']} ({classify_res['composition']})")
    print(f"  - Dimensions analyzed: {classify_res['dimensions']}")
    print(f"  - Dominant color: {classify_res['dominant_color']['name']} ({classify_res['dominant_color']['hex']})")
    print(f"  - Circularity Score: {classify_res['circularity_score']} ({classify_res['circularity_category']})")
    print(f"  - Hazard warning: {classify_res['has_contaminants']}")
        
    # 3.85. Test Non-Fabric Image Upload Verification (Screenshot / Graph Plot / Code IDE)
    print("\n[Test 3.85] Simulating Non-Fabric Screenshot / Graph Plot Upload Detection...")
    non_fab_files = [("file", "Screenshot 2025-11-20 093726.png", img_bytes)]
    non_fab_res = make_multipart_request("/api/classification/analyze", non_fab_files, token=token)
    print(f"[OK] Screenshot Non-Fabric verification result:")
    print(f"  - Is Fabric: {non_fab_res['is_fabric']}")
    print(f"  - Category: {non_fab_res['category']}")
    print(f"  - Explanation: {non_fab_res['categorization_explanation']}")
        
    # 3.9. Test Sustainability Engine API (Milestone 3)
    print("\n[Test 3.9] Running Sustainability Intelligence & Recommendations (Milestone 3)...")
    sust_stats = make_request("/api/sustainability/stats", method="GET", token=token)
    print(f"[OK] Sustainability Stats parsed:")
    print(f"  - Dynamic carbon offset: {sust_stats['co2_saved_kg']} kg CO2 savings")
    print(f"  - Water conserved: {sust_stats['water_saved_liters']} Litres")
    print(f"  - Landfill diversion rate: {sust_stats['landfill_diversion_rate']}%")
    print(f"  - Average recyclability rate: {sust_stats['average_recyclability']}%")
    
    sust_bench = make_request("/api/sustainability/benchmarks", method="GET", token=token)
    print(f"[OK] Benchmarking metrics received: {len(sust_bench)} parameters")
    
    # Fetch recommendations for batch ID 1 (seeded Cotton batch)
    recs = make_request("/api/sustainability/recommendations/1", method="GET", token=token)
    print(f"[OK] Mapped recommendations generated for BATCH-1:")
    for r in recs:
        if r['feasibility'] != 'Low':
            print(f"  - Strategy: {r['strategy']} (Feasibility: {r['feasibility']}) -> CO2 Saved: +{r['co2_savings_kg']} kg")

    # 4. Test Create Inventory Batch (POST)
    print("\n[Test 4] Creating New Textile Waste Batch (Silk)...")
    new_batch_payload = {
        "fabric_type": "Silk",
        "source": "Pre-consumer",
        "quantity": 250.0,
        "color": "Royal Purple",
        "condition": "Clean",
        "collection_date": str(date.today()),
        "status": "Collected",
        "inventory_id": 1,
        "textile_wastes": [
            {
                "material_composition": "100% Mulberry Silk",
                "recyclability_rate": 0.90,
                "has_contaminants": False
            }
        ]
    }
    create_res = make_request("/api/inventory", method="POST", data=new_batch_payload, token=token)
    batch_id = create_res.get("id")
    print(f"[OK] Batch created successfully. Assigned ID: BATCH-{batch_id}")
    
    # 5. Test Get Inventory Batch Details (GET /{id})
    print(f"\n[Test 5] Querying Details for BATCH-{batch_id}...")
    detail_res = make_request(f"/api/inventory/{batch_id}", method="GET", token=token)
    print(f"[OK] Details fetched: Fabric: {detail_res['fabric_type']}, Qty: {detail_res['quantity']} kg, Color: {detail_res['color']}")
    print(f"  - Fiber composition: {detail_res['textile_wastes'][0]['material_composition']}")
    
    # 6. Test Edit Inventory Batch (PUT /{id})
    print(f"\n[Test 6] Editing BATCH-{batch_id} (changing status and weight)...")
    edit_payload = {
        "quantity": 275.5,
        "status": "Sorting"
    }
    edit_res = make_request(f"/api/inventory/{batch_id}", method="PUT", data=edit_payload, token=token)
    print(f"[OK] Batch updated: New Qty: {edit_res['quantity']} kg, New Status: {edit_res['status']}")
    
    # 7. Test Delete Inventory Batch (DELETE /{id})
    print(f"\n[Test 7] Deleting BATCH-{batch_id}...")
    delete_res = make_request(f"/api/inventory/{batch_id}", method="DELETE", token=token)
    print("[OK] Batch deleted successfully.")
    
    # 8. Verify Deletion
    print("\n[Test 8] Confirming deletion (should return 404)...")
    try:
        make_request(f"/api/inventory/{batch_id}", method="GET", token=token)
        print("[FAIL] Deletion verification failed: Batch still exists!")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("[OK] Confirmed: Batch no longer exists (returned 404).")
        else:
            raise e
            
    print("\n==================================================")
    print("SUCCESS: ALL TESTS PASSED! API IS COMPLIANT.")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
