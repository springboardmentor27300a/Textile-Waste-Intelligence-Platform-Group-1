import pathlib
import sys

sys.path.append(str(pathlib.Path(__file__).resolve().parent))

from sustainability_engine import analyze_sustainability, get_circularity_category


def test_sustainability_changes_by_fabric_and_condition():
    cotton_no_defect = analyze_sustainability(
        fabric_type="Cotton",
        defect_status="NoDefect",
        fabric_confidence=95.0,
        defect_confidence=92.0,
    )
    cotton_defect = analyze_sustainability(
        fabric_type="Cotton",
        defect_status="Defect",
        fabric_confidence=95.0,
        defect_confidence=88.0,
    )
    silk_no_defect = analyze_sustainability(
        fabric_type="Silk",
        defect_status="NoDefect",
        fabric_confidence=91.0,
        defect_confidence=90.0,
    )
    wool_defect = analyze_sustainability(
        fabric_type="Wool",
        defect_status="Defect",
        fabric_confidence=89.0,
        defect_confidence=84.0,
    )

    assert cotton_no_defect["scores"]["circularity_score"] > cotton_defect["scores"]["circularity_score"]
    assert cotton_no_defect["scores"]["recyclability_score"] >= silk_no_defect["scores"]["recyclability_score"]
    assert wool_defect["scores"]["reuse_score"] <= cotton_no_defect["scores"]["reuse_score"]
    assert cotton_no_defect["scores"]["sustainability_score"] != silk_no_defect["scores"]["sustainability_score"]
    assert len(cotton_no_defect["recommendations"]) >= 2
    assert cotton_no_defect["recommendations"][0]["name"] != wool_defect["recommendations"][0]["name"]


def test_circularity_category_mapping():
    assert get_circularity_category(95) == "Excellent Recovery Potential"
    assert get_circularity_category(84.8) == "Excellent Recovery Potential"
    assert get_circularity_category(78) == "High Recovery Potential"
    assert get_circularity_category(60) == "Moderate Recovery Potential"
    assert get_circularity_category(40) == "Limited Recovery Potential"
    assert get_circularity_category(10) == "Disposal Recommended"
