from typing import Dict, Any


class WasteScoringEngine:
    """
    Module 9: Waste Scoring Engine (Document Page 6 & 7)

    Weighted Scoring Model:
    ----------------------
    Circularity Score =
      Material Recyclability (35%) +
      Material Condition (20%) +
      Reuse Potential (20%) +
      Environmental Benefit (15%) +
      Processing Feasibility (10%)

    Circularity Categories:
    -----------------------
    - Excellent Recovery Potential (>= 85)
    - High Recovery Potential (70 - 84)
    - Moderate Recovery Potential (50 - 69)
    - Limited Recovery Potential (30 - 49)
    - Disposal Recommended (< 30)
    """

    WEIGHTS = {
        "material_recyclability": 0.35,
        "material_condition": 0.20,
        "reuse_potential": 0.20,
        "environmental_benefit": 0.15,
        "processing_feasibility": 0.10,
    }

    MATERIAL_RECYCLABILITY_SCORES = {
        "Cotton": 95,
        "Polyester": 90,
        "Wool": 85,
        "Silk": 80,
        "Linen": 88,
        "Denim": 82,
        "Nylon": 78,
        "Rayon": 72,
        "Acrylic": 60,
        "Mixed Fabrics": 40,
    }

    CONDITION_SCORES = {
        "new": 100,
        "good": 85,
        "worn": 65,
        "damaged": 45,
        "contaminated": 25,
    }

    REUSE_SCORES = {
        "Very High": 95,
        "High": 85,
        "Medium": 65,
        "Low": 40,
        "Very Low": 20,
    }

    def compute_scores(
        self,
        material: str,
        condition: str = "good",
        reuse_potential_label: str = "High",
        carbon_saving_kg: float = 2.0,
        water_saving_liters: float = 1200.0,
    ) -> Dict[str, Any]:
        """
        Calculates individual sub-scores and overall circularity score.
        """
        normalized_material = material.strip().title() if isinstance(material, str) else "Cotton"
        normalized_condition = condition.lower() if isinstance(condition, str) else "good"

        # 1. Material Recyclability Score (0-100)
        recyclability_score = float(self.MATERIAL_RECYCLABILITY_SCORES.get(normalized_material, 70))

        # 2. Material Condition Score (0-100)
        condition_score = float(self.CONDITION_SCORES.get(normalized_condition, 80))

        # 3. Reuse Score (0-100)
        reuse_score = float(self.REUSE_SCORES.get(reuse_potential_label, 75))

        # 4. Environmental Benefit Score (0-100)
        # Carbon benchmark: 2.5 kg = 100%, Water benchmark: 1800 L = 100%
        carbon_component = min(100.0, (carbon_saving_kg / 2.5) * 100.0)
        water_component = min(100.0, (water_saving_liters / 1800.0) * 100.0)
        environmental_benefit_score = round(0.5 * carbon_component + 0.5 * water_component, 2)

        # 5. Processing Feasibility Score (0-100)
        processing_feasibility_score = round(
            0.6 * recyclability_score + 0.4 * condition_score, 2
        )

        # Material Recovery Score (0-100)
        material_recovery_score = round(
            0.5 * recyclability_score + 0.3 * processing_feasibility_score + 0.2 * condition_score, 2
        )

        # Weighted Circularity Score Calculation
        overall_circularity_score = round(
            recyclability_score * self.WEIGHTS["material_recyclability"]
            + condition_score * self.WEIGHTS["material_condition"]
            + reuse_score * self.WEIGHTS["reuse_potential"]
            + environmental_benefit_score * self.WEIGHTS["environmental_benefit"]
            + processing_feasibility_score * self.WEIGHTS["processing_feasibility"],
            2,
        )

        # Sustainability Score (composite index)
        sustainability_score = round(
            0.6 * overall_circularity_score + 0.4 * environmental_benefit_score, 2
        )

        # Circularity Category Assignment
        if overall_circularity_score >= 85.0:
            circularity_category = "Excellent Recovery Potential"
        elif overall_circularity_score >= 70.0:
            circularity_category = "High Recovery Potential"
        elif overall_circularity_score >= 50.0:
            circularity_category = "Moderate Recovery Potential"
        elif overall_circularity_score >= 30.0:
            circularity_category = "Limited Recovery Potential"
        else:
            circularity_category = "Disposal Recommended"

        return {
            "recyclability_score": recyclability_score,
            "reuse_score": reuse_score,
            "sustainability_score": sustainability_score,
            "material_recovery_score": material_recovery_score,
            "environmental_benefit_score": environmental_benefit_score,
            "processing_feasibility_score": processing_feasibility_score,
            "overall_circularity_score": overall_circularity_score,
            "circularity_category": circularity_category,
        }
