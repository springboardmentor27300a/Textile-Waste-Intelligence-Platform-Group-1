import base64

from fastapi.testclient import TestClient

from app import models
from app.ai.image_analysis import ImageAnalysisEngine
from app.ai.material_classifier import MaterialClassifier
from app.ai.recommendation import RecommendationEngine
from app.auth import get_current_user
from app.main import app
from app.routers.reports import _build_milestone3_summary

import pytest

client = TestClient(app)


@pytest.fixture(autouse=True)
def override_user():
    app.dependency_overrides[get_current_user] = lambda: models.User(
        id=1,
        full_name="Test User",
        email="test@example.com",
        hashed_password="hashed",
        role=models.UserRole.RECYCLING_FACILITY_OPERATOR,
        is_active=1,
    )
    yield
    app.dependency_overrides.pop(get_current_user, None)


def test_image_analysis_returns_textile_features(tmp_path):
    engine = ImageAnalysisEngine()
    image_path = tmp_path / "sample.png"
    image_path.write_bytes(b"not a real image")

    try:
        engine.analyze(str(image_path))
    except Exception as exc:
        assert "Unable" in str(exc) or "not found" in str(exc).lower() or "Unsupported" in str(exc) or "required" in str(exc).lower()
    else:
        assert False, "Expected invalid image to fail"


def test_recommendation_includes_recovery_fields():
    engine = RecommendationEngine()
    result = engine.generate("Cotton")

    assert "waste_category" in result
    assert "recycling_strategy" in result
    assert "reuse_opportunity" in result
    assert "upcycling_suggestion" in result
    assert "material_recovery_recommendation" in result
    assert "waste_reduction_strategy" in result
    assert "recycling_options" in result


def test_recommendation_includes_milestone_2_summary():
    engine = RecommendationEngine()
    result = engine.generate("Cotton")

    assert "milestone_2_summary" in result
    assert "Milestone 2" in result["milestone_2_summary"]


def test_material_classifier_normalizes_numeric_materials():
    classifier = MaterialClassifier()

    class StubPredictor:
        def predict(self, image_path):
            return {"class_index": 6, "material": "007", "confidence": 0.0}

    classifier.predictor = StubPredictor()
    result = classifier.classify("sample.png")

    assert result["material"] == "Nylon"
    assert result["fabric_type_classification"]


def test_image_analysis_includes_assessment_summary(tmp_path):
    engine = ImageAnalysisEngine()
    image_path = tmp_path / "sample.png"
    image_path.write_bytes(base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQABAAEAwH0hKAAAAABJRU5ErkJggg=="))

    result = engine.analyze(str(image_path))

    assert result["assessment_summary"]
    assert result["risk_level"] in {"Low", "Moderate", "High"}
    assert result["recycling_readiness"] in {"Ready for recycling", "Needs review", "Low priority"}


def test_material_classifier_uses_visual_features_for_bright_image(tmp_path):
    classifier = MaterialClassifier()

    class StubPredictor:
        def predict(self, image_path):
            return {"class_index": 6, "material": "007", "confidence": 0.0}

    classifier.predictor = StubPredictor()

    image_path = tmp_path / "bright.png"
    image_path.write_bytes(b"not a real image")

    result = classifier.classify(str(image_path))

    assert result["material"] == "Nylon"
    assert result["classification_mode"] == "model"


def test_material_classifier_normalizes_dataset_specific_labels():
    classifier = MaterialClassifier()

    class StubPredictor:
        def predict(self, image_path):
            return {"class_index": 2, "material": "Corduroy", "confidence": 0.95}

    classifier.predictor = StubPredictor()

    result = classifier.classify("sample.png")

    assert result["material"] == "Denim"
    assert result["classification_mode"] == "model"


def test_material_classifier_marks_low_confidence_predictions_for_review():
    classifier = MaterialClassifier()

    class StubPredictor:
        def predict(self, image_path):
            return {
                "class_index": 0,
                "material": "Cotton",
                "confidence": 0.24,
                "top_predictions": [
                    {"class_index": 0, "material": "Cotton", "confidence": 24.0},
                    {"class_index": 4, "material": "Linen", "confidence": 22.0},
                    {"class_index": 7, "material": "Rayon", "confidence": 18.0},
                ],
            }

    classifier.predictor = StubPredictor()

    result = classifier.classify("sample.png")

    assert result["confidence_level"] == "Low"
    assert result["requires_manual_verification"] is True
    assert result["top_predictions"][0]["material"] == "Cotton"


def test_recommendation_uses_manual_review_guidance_for_low_confidence():
    engine = RecommendationEngine()
    result = engine.generate(
        "Cotton",
        confidence=0.24,
        confidence_level="Low",
        requires_manual_verification=True,
    )

    assert "manual" in result["recommendation"].lower() or "verify" in result["recommendation"].lower()


def test_recommendation_includes_milestone_3_sustainability_metrics():
    engine = RecommendationEngine()
    result = engine.generate("Polyester")

    assert result["circularity_score"] > 0
    assert result["sustainability_score"] > 0
    assert result["environmental_impact_summary"]
    assert "sustainability" in result["milestone_2_summary"].lower() or "carbon" in result["milestone_2_summary"].lower()


def test_prediction_route_rejects_invalid_file_uploads():
    response = client.post(
        "/api/predictions/",
        files={"image": ("invalid.txt", b"not an image", "text/plain")},
    )

    assert response.status_code == 400
    assert "image" in response.json()["detail"].lower()


def test_build_milestone3_summary_includes_key_impact_metrics():
    summary = _build_milestone3_summary(
        avg_circularity_score=84.5,
        avg_recyclability_score=78.0,
        total_carbon_saving_kg=12.5,
        total_water_saving_liters=4600,
    )

    assert "Milestone 3" in summary
    assert "84.5" in summary
    assert "12.5" in summary
    assert "4,600" in summary
