import http.client
import json

def run_tests():
    print("=====================================================")
    print("STARTING ADVANCED ROLE & PERMISSIONS VERIFICATION TEST")
    print("=====================================================")
    
    conn = http.client.HTTPConnection("localhost", 8000)
    headers = {"Content-type": "application/json"}
    
    # 1. Health check
    conn.request("GET", "/")
    r = conn.getcall = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"[TEST 1] Health status: {body.get('status')}")
    assert r.status == 200
    
    # 2. Administrator Login using email
    print("\n[TEST 2] Logging in as Default Administrator...")
    admin_payload = {
        "email": "madhulikagoddumarri@gmail.com",
        "password": "123456789"
    }
    conn.request("POST", "/api/auth/login", json.dumps(admin_payload), headers)
    r = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"Status: {r.status}, Success: {body.get('success')}")
    assert r.status == 200
    admin_token = body.get('token')
    admin_user_id = body.get('user', {}).get('id')
    admin_headers = {
        "Content-type": "application/json",
        "Authorization": f"Bearer {admin_token}"
    }
    
    # 3. Block role modification on primary administrator
    print("\n[TEST 3] Testing role lock on primary admin account...")
    role_change_payload = {
        "role": "Textile Manufacturer"
    }
    conn.request("PUT", f"/api/admin/users/{admin_user_id}", json.dumps(role_change_payload), admin_headers)
    r = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"Status: {r.status}, Error Message: {body.get('detail')}")
    assert r.status == 400
    assert "Cannot change the role" in body.get('detail')

    # 4. Register a Manufacturer, Recycler, and Manager
    print("\n[TEST 4] Registering Manufacturer, Recycler, and Manager...")
    roles_setup = [
        {"name": "M1", "email": "mfg@twip.org", "role": "Textile Manufacturer"},
        {"name": "R1", "email": "recycler@twip.org", "role": "Recycling Facility Operator"},
        {"name": "SM1", "email": "manager@twip.org", "role": "Sustainability Manager"}
    ]
    
    for idx, actor in enumerate(roles_setup):
        reg_payload = {
            "name": actor["name"],
            "email": actor["email"],
            "phone": f"900000000{idx}",
            "organization": "Test Org",
            "password": "Password123",
            "confirm_password": "Password123"
        }
        conn.request("POST", "/api/auth/register", json.dumps(reg_payload), headers)
        r = conn.getresponse()
        r.read() # drain
        
        # Log in to get standard user document ID
        login_pay = {"email": actor["email"], "password": "Password123"}
        conn.request("POST", "/api/auth/login", json.dumps(login_pay), headers)
        login_res = conn.getcall = conn.getresponse()
        login_body = json.loads(login_res.read().decode())
        user_db_id = login_body.get('user', {}).get('id')
        
        # Admin updates role from default "user" to the required role
        conn.request("PUT", f"/api/admin/users/{user_db_id}", json.dumps({"role": actor["role"]}), admin_headers)
        r = conn.getresponse()
        r.read() # drain
        print(f"Verified & updated role of {actor['email']} to {actor['role']}")

    # 5. Manufacturer Logs in & Submits inventory
    print("\n[TEST 5] Manufacturer logs in and registers inventory...")
    conn.request("POST", "/api/auth/login", json.dumps({"email": "mfg@twip.org", "password": "Password123"}), headers)
    r = conn.getresponse()
    body = json.loads(r.read().decode())
    mfg_token = body.get('token')
    mfg_headers = {"Content-type": "application/json", "Authorization": f"Bearer {mfg_token}"}
    
    textile_payload = {
        "batchId": "B-MFG001",
        "fabricType": "Cotton",
        "source": "Cutting scraps",
        "quantity": 150.0,
        "color": "Red",
        "condition": "Reusable",
        "collectionDate": "2026-07-11T12:00:00Z",
        "processingStatus": "Pending"
    }
    conn.request("POST", "/api/textile", json.dumps(textile_payload), mfg_headers)
    r = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"Register status: {r.status}, Success: {body.get('success')}")
    assert r.status == 201
    batch_db_id = body.get('record', {}).get('_id')
    
    # 6. Recycler attempts to modify restricted fields
    print("\n[TEST 6] Recycler logs in and attempts restricted updates...")
    conn.request("POST", "/api/auth/login", json.dumps({"email": "recycler@twip.org", "password": "Password123"}), headers)
    r = conn.getcall = conn.getresponse()
    body = json.loads(r.read().decode())
    recycler_token = body.get('token')
    recycler_headers = {"Content-type": "application/json", "Authorization": f"Bearer {recycler_token}"}
    
    # Try updating weight (should fail or only status updates)
    conn.request("PUT", f"/api/textile/{batch_db_id}", json.dumps({"quantity": 500.0, "processingStatus": "Processing"}), recycler_headers)
    r = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"Status update status: {r.status}, Message: {body.get('message', body.get('detail'))}")
    assert r.status == 200
    # Quantity must remain 150.0 as recyclers cannot change quantity
    assert body.get('record', {}).get('quantity') == 150.0
    assert body.get('record', {}).get('processingStatus') == "Processing"
    
    # Try deleting batch (should fail with 403)
    conn.request("DELETE", f"/api/textile/{batch_db_id}", None, recycler_headers)
    r = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"Delete attempt by Recycler status: {r.status}, Detail: {body.get('detail')}")
    assert r.status == 403
    
    # 7. Sustainability Manager logs in and tries to modify inventory
    print("\n[TEST 7] Sustainability Manager attempts modifications...")
    conn.request("POST", "/api/auth/login", json.dumps({"email": "manager@twip.org", "password": "Password123"}), headers)
    r = conn.getresponse()
    body = json.loads(r.read().decode())
    manager_token = body.get('token')
    manager_headers = {"Content-type": "application/json", "Authorization": f"Bearer {manager_token}"}
    
    # Create batch (should fail with 403)
    conn.request("POST", "/api/textile", json.dumps(textile_payload), manager_headers)
    r = conn.getcall = conn.getcall = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"Create attempt by Manager status: {r.status}, Detail: {body.get('detail')}")
    assert r.status == 403

    # Edit batch (should fail with 403)
    conn.request("PUT", f"/api/textile/{batch_db_id}", json.dumps({"processingStatus": "Recycled"}), manager_headers)
    r = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"Edit attempt by Manager status: {r.status}, Detail: {body.get('detail')}")
    assert r.status == 403
    
    # 8. Manufacturer deletes own batch
    print("\n[TEST 8] Manufacturer deletes own batch...")
    conn.request("DELETE", f"/api/textile/{batch_db_id}", None, mfg_headers)
    r = conn.getresponse()
    body = json.loads(r.read().decode())
    print(f"Delete own batch status: {r.status}, Success: {body.get('success')}")
    assert r.status == 200
    
    print("\n=====================================================")
    print("ALL TESTS PASSED SUCCESSFULLY! 8/8 ADVANCED ACCESS VERIFIED")
    print("=====================================================")

if __name__ == "__main__":
    run_tests()
