from datetime import date
from decimal import Decimal

from sqlalchemy import select

from app.database import SessionLocal
from app.models import (
    Classification,
    Facility,
    ImpactEstimate,
    Organization,
    Recommendation,
    Role,
    User,
    WasteBatch,
    WasteImage,
    WasteScore,
)


def test_database_relationships() -> None:
    db = SessionLocal()

    try:
        # -------------------------------------------------
        # 1. Get existing OPERATOR role
        # -------------------------------------------------
        operator_role = db.scalar(
            select(Role).where(Role.name == "OPERATOR")
        )

        assert operator_role is not None

        # -------------------------------------------------
        # 2. Organization
        # -------------------------------------------------
        organization = Organization(
            name="Database Integration Test Organization",
            organization_type="TEXTILE_MANUFACTURER",
            email="integration@test.local",
            city="Pune",
            state="Maharashtra",
            country="India",
        )

        db.add(organization)
        db.flush()

        # -------------------------------------------------
        # 3. Facility
        # -------------------------------------------------
        facility = Facility(
            organization_id=organization.id,
            name="Test Textile Facility",
            facility_code="TEST-FAC-001",
            facility_type="MANUFACTURING",
            city="Pune",
            state="Maharashtra",
            country="India",
        )

        db.add(facility)
        db.flush()

        # -------------------------------------------------
        # 4. User
        # -------------------------------------------------
        user = User(
            organization_id=organization.id,
            role_id=operator_role.id,
            full_name="Database Test User",
            email="database-test@local.test",
            password_hash="TEST_ONLY_NOT_REAL_PASSWORD_HASH",
            is_active=True,
            is_verified=True,
        )

        db.add(user)
        db.flush()

        # -------------------------------------------------
        # 5. Waste Batch
        # -------------------------------------------------
        batch = WasteBatch(
            batch_code="TW-TEST-000001",
            organization_id=organization.id,
            facility_id=facility.id,
            created_by=user.id,
            source="Production Cutting Waste",
            quantity_kg=Decimal("25.50"),
            declared_material="Cotton",
            color="Blue",
            condition="Good",
            collection_date=date.today(),
            processing_status="REGISTERED",
            notes="Temporary database integration test.",
        )

        db.add(batch)
        db.flush()

        # -------------------------------------------------
        # 6. Waste Image metadata
        # -------------------------------------------------
        image = WasteImage(
            batch_id=batch.id,
            original_filename="test_textile.jpg",
            stored_filename="test_textile_unique.jpg",
            file_path="uploads/test/test_textile_unique.jpg",
            mime_type="image/jpeg",
            file_size_bytes=102400,
            is_primary=True,
        )

        db.add(image)
        db.flush()

        # -------------------------------------------------
        # 7. Classification
        # -------------------------------------------------
        classification = Classification(
            batch_id=batch.id,
            image_id=image.id,
            predicted_material="Cotton",
            confidence_score=0.94,
            alternative_predictions=[
                {"material": "Linen", "confidence": 0.04},
                {"material": "Polyester", "confidence": 0.02},
            ],
            predicted_condition="Good",
            condition_confidence=0.90,
            model_name="integration-test-model",
            model_version="1.0",
        )

        db.add(classification)
        db.flush()

        # -------------------------------------------------
        # 8. Waste Score
        # -------------------------------------------------
        score = WasteScore(
            classification_id=classification.id,
            recyclability_score=Decimal("90.00"),
            condition_score=Decimal("85.00"),
            reuse_potential_score=Decimal("80.00"),
            environmental_benefit_score=Decimal("92.00"),
            processing_feasibility_score=Decimal("88.00"),
            circularity_score=Decimal("87.00"),
            waste_category="RECYCLABLE",
        )

        db.add(score)

        # -------------------------------------------------
        # 9. Recommendation
        # -------------------------------------------------
        recommendation = Recommendation(
            classification_id=classification.id,
            action="Mechanical Recycling",
            rank=1,
            suitability_score=Decimal("91.00"),
            reason="Suitable cotton waste with good recovery potential.",
            is_primary=True,
        )

        db.add(recommendation)

        # -------------------------------------------------
        # 10. Environmental impact
        # -------------------------------------------------
        impact = ImpactEstimate(
            classification_id=classification.id,
            co2_avoided_kg=Decimal("18.50"),
            water_saved_liters=Decimal("1250.00"),
            landfill_avoided_kg=Decimal("25.50"),
            material_recovered_kg=Decimal("22.00"),
            diversion_percentage=Decimal("86.27"),
        )

        db.add(impact)

        db.flush()

        # -------------------------------------------------
        # 11. Read everything back through relationships
        # -------------------------------------------------
        loaded_batch = db.scalar(
            select(WasteBatch).where(
                WasteBatch.batch_code == "TW-TEST-000001"
            )
        )

        assert loaded_batch is not None
        assert loaded_batch.organization.name == organization.name
        assert loaded_batch.facility.facility_code == "TEST-FAC-001"
        assert loaded_batch.creator.email == "database-test@local.test"

        assert len(loaded_batch.images) == 1
        assert len(loaded_batch.classifications) == 1

        loaded_classification = loaded_batch.classifications[0]

        assert loaded_classification.predicted_material == "Cotton"
        assert loaded_classification.waste_score.circularity_score == Decimal(
            "87.00"
        )
        assert len(loaded_classification.recommendations) == 1
        assert (
            loaded_classification.recommendations[0].action
            == "Mechanical Recycling"
        )
        assert (
            loaded_classification.impact_estimate.water_saved_liters
            == Decimal("1250.00")
        )

        print("========================================")
        print("DATABASE INTEGRATION TEST PASSED")
        print("========================================")
        print(f"Organization : {loaded_batch.organization.name}")
        print(f"Facility     : {loaded_batch.facility.name}")
        print(f"User         : {loaded_batch.creator.full_name}")
        print(f"Batch        : {loaded_batch.batch_code}")
        print(
            f"Material     : "
            f"{loaded_classification.predicted_material}"
        )
        print(
            f"Circularity  : "
            f"{loaded_classification.waste_score.circularity_score}"
        )
        print(
            f"Recommendation: "
            f"{loaded_classification.recommendations[0].action}"
        )
        print(
            f"Water Saved  : "
            f"{loaded_classification.impact_estimate.water_saved_liters} L"
        )
        print("========================================")

    finally:
        # Nothing created by this test is permanently stored.
        db.rollback()
        db.close()


if __name__ == "__main__":
    test_database_relationships()