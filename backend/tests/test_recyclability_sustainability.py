from app.models import FabricType, WasteCondition, WasteCategory
from app.vision import ImageFeatures
from app.recyclability import classify
from app.sustainability import assess_sustainability, recommend_pathway


def test_clean_new_cotton_is_highly_recyclable():
    features = ImageFeatures("#ffffff", 0.8, 0.1, 0.0, 0.0)
    result = classify(FabricType.COTTON, WasteCondition.NEW_SURPLUS, features)
    assert result.recommended_category == WasteCategory.RECYCLABLE
    assert result.recyclability_score >= 70


def test_heavily_contaminated_batch_is_hazardous():
    features = ImageFeatures("#333333", 0.3, 0.4, 0.75, 0.3)
    result = classify(FabricType.MIXED, WasteCondition.CONTAMINATED, features)
    assert result.recommended_category == WasteCategory.HAZARDOUS


def test_damaged_item_scores_lower_than_undamaged_of_same_fabric():
    clean = ImageFeatures("#556677", 0.5, 0.3, 0.0, 0.0)
    damaged = ImageFeatures("#556677", 0.5, 0.3, 0.0, 0.8)
    r_clean = classify(FabricType.POLYESTER, WasteCondition.WORN, clean)
    r_damaged = classify(FabricType.POLYESTER, WasteCondition.WORN, damaged)
    assert r_damaged.recyclability_score < r_clean.recyclability_score


def test_recyclability_score_always_in_valid_range():
    features = ImageFeatures("#000000", 0.0, 1.0, 1.0, 1.0)
    result = classify(FabricType.MIXED, WasteCondition.CONTAMINATED, features)
    assert 0 <= result.recyclability_score <= 100


def test_natural_fibres_route_to_mechanical_recycling():
    pathway, _ = recommend_pathway(WasteCategory.RECYCLABLE, FabricType.COTTON, WasteCondition.WORN)
    assert pathway == "Mechanical Recycling"


def test_synthetic_fibres_route_to_chemical_recycling():
    pathway, _ = recommend_pathway(WasteCategory.RECYCLABLE, FabricType.POLYESTER, WasteCondition.WORN)
    assert pathway == "Chemical Recycling"


def test_hazardous_waste_gets_zero_environmental_credit():
    result = assess_sustainability(FabricType.MIXED, WasteCondition.CONTAMINATED, WasteCategory.HAZARDOUS, 20)
    assert result.co2_saved_kg == 0.0
    assert result.water_saved_liters == 0.0
    assert result.landfill_diverted_kg == 0.0


def test_reusable_batch_gets_full_diversion_credit():
    result = assess_sustainability(FabricType.WOOL, WasteCondition.LIGHTLY_WORN, WasteCategory.REUSABLE, 10)
    assert result.landfill_diverted_kg == 10.0  # 100% credit


def test_environmental_impact_scales_with_quantity():
    small = assess_sustainability(FabricType.COTTON, WasteCondition.WORN, WasteCategory.RECYCLABLE, 10)
    large = assess_sustainability(FabricType.COTTON, WasteCondition.WORN, WasteCategory.RECYCLABLE, 100)
    assert large.co2_saved_kg == small.co2_saved_kg * 10
