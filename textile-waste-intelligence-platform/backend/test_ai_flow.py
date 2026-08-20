import http.client
import json

def run_ai_tests():
    print("=====================================================")
    print("STARTING AI IMAGE RECOGNITION & CLASSIFICATION TESTS")
    print("=====================================================")
    
    conn = http.client.HTTPConnection("localhost", 8000)
    headers = {"Content-type": "application/json"}
    
    # 1. Login as default Administrator to verify API documentation and settings
    print("\n[TEST 1] Logging in as Admin...")
    admin_payload = {
        "email": "madhulikagoddumarri@gmail.com",
        "password": "123456789"
    }
    conn.request("POST", "/api/auth/login", json.dumps(admin_payload), headers)
    r = conn.getcall = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"Admin login status: {r.status}, Success: {body.get('success')}")
    assert r.status == 200
    admin_token = body.get('token')
    
    # 2. Login as Textile Manufacturer (seeded on startup)
    print("\n[TEST 2] Logging in as Textile Manufacturer...")
    mfg_payload = {
        "email": "mfg@twip.org",
        "password": "Password123"
    }
    conn.request("POST", "/api/auth/login", json.dumps(mfg_payload), headers)
    r = conn.getcall = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"Mfg login status: {r.status}, Success: {body.get('success')}")
    assert r.status == 200
    mfg_token = body.get('token')
    mfg_headers = {
        "Content-type": "application/json",
        "Authorization": f"Bearer {mfg_token}"
    }

    # 3. Submit a mock image for AI recognition
    print("\n[TEST 3] Uploading textile image base64 for AI analysis...")
    # Base64 string for a mock pixel (red dot)
    mock_image_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
    
    analyze_payload = {
        "image": mock_image_base64
    }
    conn.request("POST", "/api/ai/analyze", json.dumps(analyze_payload), mfg_headers)
    r = conn.getcall = conn.getcall = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"Analyze status: {r.status}, Success: {body.get('success')}")
    assert r.status == 201
    
    analysis = body.get("analysis", {})
    print(f"Fabric detected: {analysis.get('fabric_type')}")
    print(f"Confidence score: {analysis.get('confidence_score')}%")
    print(f"Recycling category: {analysis.get('waste_category')}")
    assert analysis.get("fabric_type") in ["Cotton", "Denim", "Polyester", "Wool", "Silk"]
    assert "material_prediction" in analysis
    assert "sustainability_metrics" in analysis
    
    # 4. Fetch User AI history
    print("\n[TEST 4] Fetching logged-in user AI history...")
    conn.request("GET", "/api/ai/history", None, mfg_headers)
    r = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"History list size: {len(body.get('history', []))}")
    assert r.status == 200
    assert len(body.get("history", [])) >= 1
    
    # 5. Fetch AI dashboard stats
    print("\n[TEST 5] Fetching AI stats and aggregations...")
    conn.request("GET", "/api/ai/stats", None, mfg_headers)
    r = conn.getresponse()
    body = json.loads(r.read().decode())
    stats = body.get("stats", {})
    print(f"Total analyzed in stats: {stats.get('total_analyzed')}")
    print(f"Average Sustainability: {stats.get('average_sustainability')}%")
    assert r.status == 200
    assert stats.get("total_analyzed") >= 1
    assert len(stats.get("material_distribution", [])) >= 1

    print("\n=====================================================")
    print("ALL AI MODULE TESTS PASSED SUCCESSFULLY! 5/5 VERIFIED")
    print("=====================================================")

if __name__ == "__main__":
    run_ai_tests()
