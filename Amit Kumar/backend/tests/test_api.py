"""
Unit and API Integration Tests for TWIP Backend
Milestone 4 - Automated Testing & Validation Suite with Authentication
"""
import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestTWIPApi(unittest.TestCase):
    client = TestClient(app)
    auth_headers = {}

    def test_01_root_and_health_check(self):
        """Test API root and health check endpoints."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "running")

        health_res = self.client.get("/health")
        self.assertEqual(health_res.status_code, 200)
        self.assertEqual(health_res.json()["status"], "healthy")

    def test_02_auth_login(self):
        """Test authentication and obtain Bearer token."""
        payload = {
            "email": "admin@textile.com",
            "password": "admin123"
        }
        response = self.client.post("/api/auth/login", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        token = data["access_token"]
        TestTWIPApi.auth_headers = {"Authorization": f"Bearer {token}"}

    def test_03_sustainability_calculate(self):
        """Test Sustainability calculation engine API."""
        params = {
            "fabric_type": "Cotton",
            "quantity": 500.0,
            "waste_category": "Pre-consumer",
            "condition": "Clean"
        }
        response = self.client.post("/api/sustainability/calculate", params=params, headers=TestTWIPApi.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("sustainability_score", data)
        self.assertIn("circular_analytics", data)
        self.assertIn("circular_economy_score", data)

    def test_04_recommendations_generate(self):
        """Test AI Recycling Recommendation engine."""
        params = {
            "fabric_type": "Denim",
            "quantity": 250.0,
            "waste_category": "Post-consumer",
            "condition": "Fair"
        }
        response = self.client.post("/api/recommendations/generate", params=params, headers=TestTWIPApi.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("recommendations", data)
        self.assertTrue(len(data["recommendations"]) > 0)

    def test_05_environmental_calculate(self):
        """Test Environmental Impact Assessment calculation API."""
        params = {
            "material": "Polyester",
            "quantity": 1000.0,
            "recovery_method": "Chemical Recycling"
        }
        response = self.client.post("/api/environmental/calculate", params=params, headers=TestTWIPApi.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("co2_saved_kg", data)
        self.assertIn("water_saved_liters", data)

    def test_06_inventory_list(self):
        """Test inventory list fetching."""
        response = self.client.get("/api/inventory/", headers=TestTWIPApi.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("items", data)
        self.assertIsInstance(data["items"], list)

    def test_07_dashboard_stats(self):
        """Test dashboard statistics endpoint."""
        response = self.client.get("/api/dashboard/stats", headers=TestTWIPApi.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_waste_kg", data)
        self.assertIn("sustainability_score", data)

    def test_08_reports_list(self):
        """Test listing available reports."""
        response = self.client.get("/api/reports/", headers=TestTWIPApi.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertTrue(len(data) >= 5)

if __name__ == "__main__":
    unittest.main()
