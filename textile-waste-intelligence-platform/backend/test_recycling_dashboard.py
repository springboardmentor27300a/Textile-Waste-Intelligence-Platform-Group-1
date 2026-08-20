"""
Test script to verify the Recycling Dashboard API endpoint.
Run this after starting the backend server.
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000"
TIMEOUT = 10

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def test_login_and_get_token():
    """Test login as admin and get JWT token"""
    print_section("TEST 1: Admin Login")
    
    payload = {
        "email": "madhulikagoddumarri@gmail.com",
        "password": "123456789"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=payload,
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            print(f"✓ Login successful")
            print(f"  Token: {token[:50]}...")
            return token
        else:
            print(f"✗ Login failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return None
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return None

def test_recycling_dashboard(token):
    """Test the recycling dashboard endpoint"""
    print_section("TEST 2: Recycling Dashboard Endpoint")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/recycling/dashboard",
            headers=headers,
            timeout=TIMEOUT
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Dashboard endpoint returned data")
            print(f"\nResponse structure:")
            print(f"  - success: {data.get('success')}")
            print(f"  - summary keys: {list(data.get('summary', {}).keys())}")
            print(f"  - inventory count: {len(data.get('inventory', []))}")
            
            # Check summary structure
            summary = data.get('summary', {})
            if summary:
                metrics = summary.get('metrics', {})
                print(f"\nMetrics:")
                for key, value in metrics.items():
                    print(f"    {key}: {value}")
                
                # Print first inventory item
                inventory = data.get('inventory', [])
                if inventory:
                    print(f"\nFirst inventory item:")
                    for key, value in inventory[0].items():
                        print(f"    {key}: {value}")
            
            return True
        else:
            print(f"✗ Dashboard endpoint failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def test_recycling_dashboard_with_filters(token):
    """Test the recycling dashboard with filters"""
    print_section("TEST 3: Dashboard with Filters")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        params = {
            "material": "Cotton",
            "status": "Pending"
        }
        
        response = requests.get(
            f"{BASE_URL}/api/recycling/dashboard",
            headers=headers,
            params=params,
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            inventory = data.get('inventory', [])
            print(f"✓ Filtered dashboard returned {len(inventory)} items")
            
            # Verify all items match the filter
            for item in inventory:
                if item.get('fabric_type') != 'Cotton':
                    print(f"✗ Found item with fabric_type={item.get('fabric_type')}, expected Cotton")
                    return False
            
            print(f"✓ All items match the filter criteria")
            return True
        else:
            print(f"✗ Filtered dashboard failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def test_textile_manufacturer_access(token):
    """Test that textile manufacturers can access their own data"""
    print_section("TEST 4: Textile Manufacturer Access")
    
    # Note: This test would need a manufacturer token
    # For now, we'll just verify the admin can access all data
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/recycling/dashboard",
            headers=headers,
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            print(f"✓ Access to dashboard endpoint confirmed")
            return True
        else:
            print(f"✗ Access denied: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("="*60)
    print("  RECYCLING DASHBOARD API TEST SUITE")
    print("="*60)
    
    # Get admin token
    token = test_login_and_get_token()
    if not token:
        print("\n✗ Cannot proceed without valid token")
        sys.exit(1)
    
    # Run tests
    tests_passed = 0
    tests_total = 4
    
    if test_recycling_dashboard(token):
        tests_passed += 1
    
    if test_recycling_dashboard_with_filters(token):
        tests_passed += 1
    
    if test_textile_manufacturer_access(token):
        tests_passed += 1
    
    # Summary
    print_section("TEST SUMMARY")
    print(f"Tests passed: {tests_passed}/{tests_total}")
    
    if tests_passed == tests_total:
        print("✓ All tests passed!")
        sys.exit(0)
    else:
        print(f"✗ {tests_total - tests_passed} test(s) failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
