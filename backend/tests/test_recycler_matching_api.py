import requests

def test_recycler_matching():
    # 1. Login as Administrator
    login_url = "http://127.0.0.1:8000/api/auth/login"
    login_res = requests.post(login_url, json={"email": "admin@textilewaste.org", "password": "admin123"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get list of recyclers (should seed default Indian facilities)
    recyclers_url = "http://127.0.0.1:8000/api/recyclers"
    res_list = requests.get(recyclers_url, headers=headers)
    assert res_list.status_code == 200, f"Get recyclers failed: {res_list.text}"
    recyclers = res_list.json()
    print("Fetched Recyclers Count:", len(recyclers))
    assert len(recyclers) >= 5, "Recyclers table should have at least 5 seeded records"

    # 3. Create a test Recycler
    new_recycler_payload = {
        "name": "Coimbatore Bio-Tex Fiber Mills",
        "accepted_materials": ["Cotton", "Denim", "Linen"],
        "accepted_conditions": ["Clean", "Good"],
        "min_quantity": 30.0,
        "max_contamination_level": 10.0,
        "location": "Coimbatore, Tamil Nadu",
        "contact_email": "sourcing@coimbatorebiotex.in",
        "phone_number": "+91 94433 11224",
        "specialization": "Enzymatic Bio-Recycling",
        "rating": 4.9
    }
    create_res = requests.post(recyclers_url, headers=headers, json=new_recycler_payload)
    assert create_res.status_code == 201, f"Create recycler failed: {create_res.text}"
    created_rec = create_res.json()
    print("Created Recycler ID:", created_rec["id"])

    # 4. Get Waste Batches list to pick batch ID for matching
    batches_url = "http://127.0.0.1:8000/api/inventory"
    batches_res = requests.get(batches_url, headers=headers)
    assert batches_res.status_code == 200, f"Get batches failed: {batches_res.text}"
    batches_data = batches_res.json()
    items = batches_data.get("items", [])
    assert len(items) > 0, "Should have at least 1 waste batch in inventory"
    batch_id = items[0]["id"]
    print("Selected Waste Batch ID for Matching:", batch_id)

    # 5. Test Matching Engine: GET /api/batches/{batch_id}/matches
    matches_url = f"http://127.0.0.1:8000/api/batches/{batch_id}/matches"
    matches_res = requests.get(matches_url, headers=headers)
    assert matches_res.status_code == 200, f"Get matches failed: {matches_res.text}"
    matches = matches_res.json()
    print("Returned Matches Count:", len(matches))
    assert len(matches) > 0, "Matching engine should return ranked matches"

    top_match = matches[0]
    print("Top Match Recycler:", top_match["recycler"]["name"])
    print("Fit Score:", top_match["fit_score"], "%")
    print("Why Matched:", top_match["why_matched"])

    assert "fit_score" in top_match
    assert "why_matched" in top_match
    print("PASSED: Recycler Marketplace & Batch Matching Engine API tests completed successfully!")

if __name__ == "__main__":
    test_recycler_matching()
