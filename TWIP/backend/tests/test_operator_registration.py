import requests

def test_operator_recycler_registration():
    # 1. Login specifically as Recycling Facility Operator
    login_url = "http://127.0.0.1:8000/api/auth/login"
    login_res = requests.post(login_url, json={"email": "operator@textilewaste.org", "password": "operator123"})
    assert login_res.status_code == 200, f"Operator login failed: {login_res.text}"
    user_data = login_res.json()["user"]
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("Logged in User Role:", user_data["role"]["name"])
    assert user_data["role"]["name"] == "Recycling Facility Operator"

    # 2. Post new recycler as Operator
    recyclers_url = "http://127.0.0.1:8000/api/recyclers"
    new_recycler_payload = {
        "name": "Operator Registered Surat Tex Recyclers",
        "accepted_materials": ["Cotton", "Polyester", "Denim"],
        "accepted_conditions": ["Clean", "Good", "Fair"],
        "min_quantity": 50.0,
        "max_contamination_level": 15.0,
        "location": "Surat, Gujarat",
        "contact_email": "operator-surat@recycler.org",
        "phone_number": "+91 98250 99887",
        "specialization": "Facility Operator Registered Recycler",
        "rating": 4.9
    }

    create_res = requests.post(recyclers_url, headers=headers, json=new_recycler_payload)
    print("Create Status:", create_res.status_code)
    assert create_res.status_code == 201, f"Operator registration failed: {create_res.text}"
    print("Created Recycler:", create_res.json()["name"])
    print("PASSED: Recycling Facility Operator can successfully register new recyclers!")

if __name__ == "__main__":
    test_operator_recycler_registration()
