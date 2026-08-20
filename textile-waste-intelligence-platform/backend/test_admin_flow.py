import http.client
import json

def run_admin_tests():
    print("=====================================================")
    print("STARTING ADMIN CONTROL PANEL & USER CRUD FLOW TESTS")
    print("=====================================================")
    
    conn = http.client.HTTPConnection("localhost", 8000)
    headers = {"Content-type": "application/json"}
    
    # 1. Login as default Administrator to fetch token
    print("\n[TEST 1] Logging in as Admin...")
    admin_payload = {
        "email": "madhulikagoddumarri@gmail.com",
        "password": "123456789"
    }
    conn.request("POST", "/api/auth/login", json.dumps(admin_payload), headers)
    r = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"Admin login status: {r.status}, Success: {body.get('success')}")
    assert r.status == 200
    admin_token = body.get('token')
    admin_id = body.get('user', {}).get('id')
    admin_headers = {
        "Content-type": "application/json",
        "Authorization": f"Bearer {admin_token}"
    }
    
    # 2. Get registered users list from PRIMARY API
    print("\n[TEST 2] Fetching registered users list from /api/users...")
    conn.request("GET", "/api/users?page=1&limit=10", None, admin_headers)
    r = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"List users status: {r.status}, Success: {body.get('success')}")
    assert r.status == 200
    users_list = body.get("users", [])
    pagination = body.get("pagination", {})
    print(f"Total registered users found in DB: {pagination.get('total')}")
    print(f"Current page list size: {len(users_list)}")
    assert len(users_list) >= 1
    
    # Get a secondary user to test edits
    target_user = None
    for u in users_list:
        if u.get("email") != "madhulikagoddumarri@gmail.com":
            target_user = u
            break
            
    if not target_user:
        # Create a test manufacturer user
        print("\n[TEST 2b] Creating test manufacturer...")
        create_payload = {
            "name": "Test Manufacturer Corp",
            "email": "testmfg@test.org",
            "phone": "9998887770",
            "organization": "Test Corp",
            "password": "Password123",
            "role": "Textile Manufacturer"
        }
        conn.request("POST", "/api/users", json.dumps(create_payload), admin_headers)
        r = conn.getresponse()
        body = json.loads(r.read().decode())
        print(f"Create user status: {r.status}, Success: {body.get('success')}")
        assert r.status == 201
        target_user = body.get("user")

    # 3. Fetch specific user detail audit records
    print(f"\n[TEST 3] Fetching specific user detail profile for ID: {target_user.get('id')}...")
    conn.request("GET", f"/api/users/{target_user.get('id')}", None, admin_headers)
    r = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"Get user detail status: {r.status}, Success: {body.get('success')}")
    assert r.status == 200
    profile = body.get("profile", {})
    print(f"Name in details: {profile.get('name')}")
    print(f"Batches uploaded by user: {body.get('stats', {}).get('total_batches')}")
    assert profile.get("email") == target_user.get("email")
    
    # 4. Toggle active status patch endpoint
    print(f"\n[TEST 4] Toggling user status to inactive...")
    status_payload = {"status": False}
    conn.request("PATCH", f"/api/users/{target_user.get('id')}/status", json.dumps(status_payload), admin_headers)
    r = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"Toggle status response status: {r.status}, Message: {body.get('message')}")
    assert r.status == 200
    assert body.get("user", {}).get("isActive") is False

    # Restore active status
    status_payload = {"status": True}
    conn.request("PATCH", f"/api/users/{target_user.get('id')}/status", json.dumps(status_payload), admin_headers)
    r = conn.getresponse()
    r.read()
    assert r.status == 200

    # 5. Modify user role patch endpoint
    print(f"\n[TEST 5] Updating user role to Sustainability Manager...")
    role_payload = {"role": "Sustainability Manager"}
    conn.request("PATCH", f"/api/users/{target_user.get('id')}/role", json.dumps(role_payload), admin_headers)
    r = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"Role change response status: {r.status}, New Role: {body.get('user', {}).get('role')}")
    assert r.status == 200
    assert body.get("user", {}).get('role') == "Sustainability Manager"
    
    # 6. Fetch dashboard stats showing synchronized values
    print("\n[TEST 6] Fetching dashboard stats...")
    conn.request("GET", "/api/admin/dashboard-stats", None, admin_headers)
    r = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"Get dashboard stats status: {r.status}, Success: {body.get('success')}")
    assert r.status == 200
    stats = body.get("stats", {})
    charts = body.get("charts", {})
    print(f"Stats - Total Users: {stats.get('totalUsers')}")
    print(f"Stats - Today's Collections: {stats.get('todayCollections')} kg")
    print(f"Stats - AI Analysis scans: {stats.get('aiAnalyses')}")
    assert "totalUsers" in stats
    assert "material_distribution" in charts
    assert len(body.get("recent_registrations", [])) >= 1
    assert len(body.get("activity_logs", [])) >= 1
    
    # 7. Fetch full system audit logs
    print("\n[TEST 7] Fetching activity logs list...")
    conn.request("GET", "/api/admin/logs", None, admin_headers)
    r = conn.getresponse()
    body = json.loads(r.read().decode())
    logs_list = body.get("logs", [])
    print(f"Activity logs count: {len(logs_list)}")
    assert r.status == 200
    assert len(logs_list) >= 1
    
    print("\n=====================================================")
    print("ALL ADMIN FLOW TESTS PASSED SUCCESSFULLY! 7/7 VERIFIED")
    print("=====================================================")

if __name__ == "__main__":
    run_admin_tests()
