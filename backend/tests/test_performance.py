import time
import pytest
from app.ai.scoring import WasteScoringEngine


def test_ai_scoring_engine_latency():
    scoring = WasteScoringEngine()
    start_time = time.perf_counter()
    for _ in range(50):
        scoring.compute_scores(
            material="Cotton",
            condition="good",
            carbon_saving_kg=3.8,
            water_saving_liters=2400.0,
        )
    elapsed = time.perf_counter() - start_time
    avg_ms = (elapsed / 50) * 1000
    assert avg_ms < 50.0  # Must be under 50ms per calculation


def test_api_summary_response_time(client, auth_headers):
    start_time = time.perf_counter()
    response = client.get("/api/inventory/stats/summary", headers=auth_headers)
    elapsed_ms = (time.perf_counter() - start_time) * 1000

    assert response.status_code == 200
    assert elapsed_ms < 500.0  # API response must be sub-500ms
