import unittest

from fastapi.testclient import TestClient

from app.main import app


class NetworkApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_root_endpoint_reports_project_status(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("Internet Backbone & IXP Map", payload.get("name", ""))
        self.assertEqual(payload.get("status"), "running")

    def test_summary_endpoint_returns_network_metrics(self):
        response = self.client.get("/api/network/summary")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertGreater(payload.get("backbone_nodes", 0), 0)
        self.assertGreater(payload.get("ixp_sites", 0), 0)
        self.assertGreater(payload.get("regions", 0), 0)

    def test_facilities_endpoint_returns_cards(self):
        response = self.client.get("/api/network/facilities")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertGreater(len(payload), 0)
        first = payload[0]
        self.assertIn("facility_name", first)
        self.assertIn("country", first)
        self.assertIn("operator", first)
        self.assertIn("connected_networks", first)
        self.assertIn("capacity", first)
        self.assertIn("importance_score", first)

    def test_simulation_endpoint_returns_impacted_metrics(self):
        response = self.client.get(
            "/api/network/route-simulation?ixp=London&facility=Equinix LD8&cable=SEA-ME-WE-3"
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("affected_traffic", payload)
        self.assertIn("impacted_facilities", payload)
        self.assertIn("status", payload)


if __name__ == "__main__":
    unittest.main()
