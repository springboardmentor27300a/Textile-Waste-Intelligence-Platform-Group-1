from app.core.sustainability_data import (
    TEXTILE_SUSTAINABILITY_DATA,
    DEFAULT_SUSTAINABILITY_PROFILE,
)


class ScoringEngine:
    """
    Textile Waste Intelligence Platform
    ------------------------------------

    Milestone 3 - Waste Scoring Engine

    Calculates:

        - Recyclability Score
        - Reuse Score
        - Sustainability Score
        - Material Recovery Score
        - Environmental Score
        - Overall Circularity Score
        - Overall Score
        - Recovery Classification

    Milestone 3 Weighted Circularity Model:

        Material Recyclability   35%
        Material Condition       20%
        Reuse Potential          20%
        Environmental Benefit    15%
        Processing Feasibility   10%

    All scores are normalized to 0-100.
    """

    # --------------------------------------------------
    # Constants
    # --------------------------------------------------

    WEIGHTS = {
        "material_recyclability": 0.35,
        "material_condition": 0.20,
        "reuse_potential": 0.20,
        "environmental_benefit": 0.15,
        "processing_feasibility": 0.10,
    }

    PROCESSING_PENALTIES = {
        "Easy": 10.0,
        "Medium": 25.0,
        "Hard": 45.0,
        "Very Hard": 60.0,
    }

    # --------------------------------------------------
    # Helpers
    # --------------------------------------------------

    @staticmethod
    def _number(value, default=0.0):
        """
        Safely convert a value to float.
        """

        try:
            if value is None:
                return float(default)

            return float(value)

        except (
            TypeError,
            ValueError,
        ):
            return float(default)

    @staticmethod
    def _clamp(
        value,
        minimum=0.0,
        maximum=100.0,
    ):
        """
        Keep a score within 0-100.
        """

        value = ScoringEngine._number(
            value,
            minimum,
        )

        return max(
            minimum,
            min(
                maximum,
                value,
            ),
        )

    @staticmethod
    def _round_score(value):
        return round(
            ScoringEngine._clamp(value),
            2,
        )

    # --------------------------------------------------
    # Main scoring engine
    # --------------------------------------------------

    @staticmethod
    def calculate(
        material: dict,
        waste: dict,
    ):
        material = material or {}
        waste = waste or {}

        # --------------------------------------------------
        # Material Profile
        # --------------------------------------------------

        material_name = (
            material.get(
                "primary_material"
            )
            or material.get(
                "material"
            )
            or "Unknown"
        )

        material_name = str(
            material_name
        ).strip()

        profile = TEXTILE_SUSTAINABILITY_DATA.get(
            material_name,
            DEFAULT_SUSTAINABILITY_PROFILE,
        )

        # Defensive fallbacks in case a profile is incomplete.
        profile = profile or DEFAULT_SUSTAINABILITY_PROFILE

        recycling = profile.get(
            "recycling",
            {},
        )

        environment = profile.get(
            "environment",
            {},
        )

        manufacturing = profile.get(
            "manufacturing",
            {},
        )

        # --------------------------------------------------
        # Base Material Values
        # --------------------------------------------------

        recyclability_base = ScoringEngine._number(
            recycling.get(
                "recyclability",
                50,
            ),
            50,
        )

        reuse_base = ScoringEngine._number(
            recycling.get(
                "reuse_potential",
                50,
            ),
            50,
        )

        recovery_base = ScoringEngine._number(
            recycling.get(
                "recovery_efficiency",
                50,
            ),
            50,
        )

        circularity_base = ScoringEngine._number(
            environment.get(
                "circularity",
                50,
            ),
            50,
        )

        recyclability_base = ScoringEngine._clamp(
            recyclability_base
        )

        reuse_base = ScoringEngine._clamp(
            reuse_base
        )

        recovery_base = ScoringEngine._clamp(
            recovery_base
        )

        circularity_base = ScoringEngine._clamp(
            circularity_base
        )

        # --------------------------------------------------
        # Processing Difficulty
        # --------------------------------------------------

        processing_difficulty_label = str(
            recycling.get(
                "processing_difficulty",
                material.get(
                    "recycling_difficulty",
                    "Medium",
                ),
            )
        ).strip()

        normalized_difficulty = (
            processing_difficulty_label
            .title()
        )

        processing_penalty = (
            ScoringEngine.PROCESSING_PENALTIES.get(
                normalized_difficulty,
                25.0,
            )
        )

        processing_feasibility = ScoringEngine._clamp(
            100.0 - processing_penalty
        )

        # --------------------------------------------------
        # Waste Characteristics
        # --------------------------------------------------

        contamination = ScoringEngine._clamp(
            waste.get(
                "contamination_level",
                10,
            ),
            0,
            100,
        )

        condition = ScoringEngine._clamp(
            waste.get(
                "condition_score",
                85,
            ),
            0,
            100,
        )

        waste_score = ScoringEngine._clamp(
            waste.get(
                "waste_score",
                condition,
            ),
            0,
            100,
        )

        quantity = ScoringEngine._number(
            waste.get(
                "quantity",
                1,
            ),
            1,
        )

        quantity = max(
            quantity,
            0,
        )

        # --------------------------------------------------
        # Contamination Penalties
        # --------------------------------------------------

        contamination_recycling_penalty = (
            contamination * 0.40
        )

        contamination_reuse_penalty = (
            contamination * 0.50
        )

        contamination_recovery_penalty = (
            contamination * 0.25
        )

        # --------------------------------------------------
        # Recyclability Score
        # --------------------------------------------------

        recyclability_score = ScoringEngine._clamp(
            recyclability_base
            + condition * 0.10
            - contamination_recycling_penalty
        )

        # --------------------------------------------------
        # Reuse Score
        # --------------------------------------------------

        reuse_score = ScoringEngine._clamp(
            reuse_base
            + condition * 0.15
            - contamination_reuse_penalty
        )

        # --------------------------------------------------
        # Material Recovery Score
        # --------------------------------------------------

        material_recovery_score = ScoringEngine._clamp(
            (
                recovery_base * 0.50
                +
                waste_score * 0.30
                +
                condition * 0.20
            )
            - contamination_recovery_penalty
        )

        # --------------------------------------------------
        # Manufacturing Environmental Impact
        # --------------------------------------------------

        manufacturing_carbon_per_unit = (
            ScoringEngine._number(
                manufacturing.get(
                    "carbon_footprint",
                    0,
                ),
                0,
            )
        )

        manufacturing_water_per_unit = (
            ScoringEngine._number(
                manufacturing.get(
                    "water_consumption",
                    0,
                ),
                0,
            )
        )

        manufacturing_energy_per_unit = (
            ScoringEngine._number(
                manufacturing.get(
                    "energy_consumption",
                    0,
                ),
                0,
            )
        )

        manufacturing_carbon = (
            manufacturing_carbon_per_unit
            * quantity
        )

        manufacturing_water = (
            manufacturing_water_per_unit
            * quantity
        )

        manufacturing_energy = (
            manufacturing_energy_per_unit
            * quantity
        )

        # --------------------------------------------------
        # Environmental Benefit
        # --------------------------------------------------
        #
        # Higher circularity + recovery + recyclability
        # means greater environmental benefit.
        #
        # Carbon impact is normalized against the material's
        # own profile instead of using an arbitrary absolute
        # threshold.
        # --------------------------------------------------

        carbon_savings_factor = ScoringEngine._number(
            environment.get(
                "carbon_savings",
                0,
            ),
            0,
        )

        water_savings_factor = ScoringEngine._number(
            environment.get(
                "water_savings",
                0,
            ),
            0,
        )

        resource_conservation_factor = (
            ScoringEngine._number(
                environment.get(
                    "resource_conservation",
                    circularity_base,
                ),
                circularity_base,
            )
        )

        carbon_savings_factor = ScoringEngine._clamp(
            carbon_savings_factor
        )

        water_savings_factor = ScoringEngine._clamp(
            water_savings_factor
        )

        resource_conservation_factor = (
            ScoringEngine._clamp(
                resource_conservation_factor
            )
        )

        environmental_benefit = ScoringEngine._clamp(
            (
                circularity_base * 0.30
                +
                material_recovery_score * 0.30
                +
                recyclability_score * 0.20
                +
                carbon_savings_factor * 0.10
                +
                water_savings_factor * 0.10
            )
        )

        # --------------------------------------------------
        # Milestone 3 Weighted Circularity Score
        # --------------------------------------------------

        material_recyclability = (
            recyclability_score
        )

        material_condition = (
            condition
        )

        reuse_potential = (
            reuse_score
        )

        circularity_score = (
            material_recyclability
            * ScoringEngine.WEIGHTS[
                "material_recyclability"
            ]
            +
            material_condition
            * ScoringEngine.WEIGHTS[
                "material_condition"
            ]
            +
            reuse_potential
            * ScoringEngine.WEIGHTS[
                "reuse_potential"
            ]
            +
            environmental_benefit
            * ScoringEngine.WEIGHTS[
                "environmental_benefit"
            ]
            +
            processing_feasibility
            * ScoringEngine.WEIGHTS[
                "processing_feasibility"
            ]
        )

        circularity_score = ScoringEngine._round_score(
            circularity_score
        )

        # --------------------------------------------------
        # Sustainability Score
        # --------------------------------------------------

        sustainability_score = ScoringEngine._clamp(
            (
                circularity_score * 0.35
                +
                material_recovery_score * 0.25
                +
                reuse_score * 0.20
                +
                recyclability_score * 0.20
            )
        )

        sustainability_score = ScoringEngine._round_score(
            sustainability_score
        )

        # --------------------------------------------------
        # Environmental Score
        # --------------------------------------------------

        environmental_score = ScoringEngine._clamp(
            (
                environmental_benefit * 0.40
                +
                sustainability_score * 0.30
                +
                circularity_score * 0.30
            )
        )

        environmental_score = ScoringEngine._round_score(
            environmental_score
        )

        # --------------------------------------------------
        # Overall Score
        # --------------------------------------------------

        overall_score = ScoringEngine._clamp(
            (
                sustainability_score
                +
                environmental_score
                +
                circularity_score
            )
            / 3
        )

        overall_score = ScoringEngine._round_score(
            overall_score
        )

        # --------------------------------------------------
        # Circularity Category
        # --------------------------------------------------

        if circularity_score >= 90:

            circularity_category = (
                "Excellent Recovery Potential"
            )

        elif circularity_score >= 75:

            circularity_category = (
                "High Recovery Potential"
            )

        elif circularity_score >= 60:

            circularity_category = (
                "Moderate Recovery Potential"
            )

        elif circularity_score >= 40:

            circularity_category = (
                "Limited Recovery Potential"
            )

        else:

            circularity_category = (
                "Disposal Recommended"
            )

        # --------------------------------------------------
        # Overall Grade
        # --------------------------------------------------

        if overall_score >= 90:

            overall_grade = "A+"
            overall_rating = "Excellent"

        elif overall_score >= 80:

            overall_grade = "A"
            overall_rating = "Very Good"

        elif overall_score >= 70:

            overall_grade = "B"
            overall_rating = "Good"

        elif overall_score >= 60:

            overall_grade = "C"
            overall_rating = "Average"

        else:

            overall_grade = "D"
            overall_rating = "Needs Improvement"

        # --------------------------------------------------
        # Environmental Rating
        # --------------------------------------------------

        if environmental_score >= 90:

            environmental_rating = "Excellent"

        elif environmental_score >= 75:

            environmental_rating = "Good"

        elif environmental_score >= 60:

            environmental_rating = "Average"

        else:

            environmental_rating = "Poor"

        # --------------------------------------------------
        # Reuse Level
        # --------------------------------------------------

        if reuse_score >= 85:

            reuse_level = "High"

        elif reuse_score >= 70:

            reuse_level = "Medium"

        elif reuse_score >= 50:

            reuse_level = "Low"

        else:

            reuse_level = "Very Low"

        # --------------------------------------------------
        # Recovery Level
        # --------------------------------------------------

        if material_recovery_score >= 85:

            recovery_level = "High"

        elif material_recovery_score >= 70:

            recovery_level = "Medium"

        elif material_recovery_score >= 50:

            recovery_level = "Low"

        else:

            recovery_level = "Very Low"

        recovery_percentage = ScoringEngine._round_score(
            material_recovery_score
        )

        # --------------------------------------------------
        # Summary
        # --------------------------------------------------

        score_values = [
            recyclability_score,
            reuse_score,
            material_recovery_score,
            circularity_score,
            sustainability_score,
        ]

        best_score = max(
            score_values
        )

        lowest_score = min(
            score_values
        )

        average_score = round(
            sum(score_values)
            / len(score_values),
            2,
        )

        # --------------------------------------------------
        # Final Output
        # --------------------------------------------------

        return {

            # ==================================================
            # Core Scores
            # ==================================================

            "recyclability_score":
                ScoringEngine._round_score(
                    recyclability_score
                ),

            "reuse_score":
                ScoringEngine._round_score(
                    reuse_score
                ),

            "material_recovery_score":
                ScoringEngine._round_score(
                    material_recovery_score
                ),

            "recovery_percentage":
                recovery_percentage,

            "circularity_score":
                circularity_score,

            "sustainability_score":
                sustainability_score,

            "environmental_score":
                environmental_score,

            "overall_score":
                overall_score,

            # ==================================================
            # Weighted Scoring Model
            # ==================================================

            "weighted_model": {

                "material_recyclability": {
                    "value": round(
                        material_recyclability,
                        2,
                    ),
                    "weight": 35,
                },

                "material_condition": {
                    "value": round(
                        material_condition,
                        2,
                    ),
                    "weight": 20,
                },

                "reuse_potential": {
                    "value": round(
                        reuse_potential,
                        2,
                    ),
                    "weight": 20,
                },

                "environmental_benefit": {
                    "value": round(
                        environmental_benefit,
                        2,
                    ),
                    "weight": 15,
                },

                "processing_feasibility": {
                    "value": round(
                        processing_feasibility,
                        2,
                    ),
                    "weight": 10,
                },
            },

            # ==================================================
            # Circularity Classification
            # ==================================================

            "circularity_category":
                circularity_category,

            # ==================================================
            # Grades & Ratings
            # ==================================================

            "overall_grade":
                overall_grade,

            "overall_rating":
                overall_rating,

            "environmental_rating":
                environmental_rating,

            "reuse_level":
                reuse_level,

            "recovery_level":
                recovery_level,

            # ==================================================
            # Material / Processing Intelligence
            # ==================================================

            "processing_difficulty":
                processing_difficulty_label,

            "processing_difficulty_penalty":
                round(
                    processing_penalty,
                    2,
                ),

            "processing_feasibility":
                round(
                    processing_feasibility,
                    2,
                ),

            "condition_score":
                round(
                    condition,
                    2,
                ),

            "contamination_level":
                round(
                    contamination,
                    2,
                ),

            "quantity":
                quantity,

            # ==================================================
            # Environmental Base Values
            # ==================================================

            "manufacturing_carbon":
                round(
                    manufacturing_carbon,
                    2,
                ),

            "manufacturing_water":
                round(
                    manufacturing_water,
                    2,
                ),

            "manufacturing_energy":
                round(
                    manufacturing_energy,
                    2,
                ),

            "environmental_benefit":
                round(
                    environmental_benefit,
                    2,
                ),

            "carbon_savings_factor":
                round(
                    carbon_savings_factor,
                    2,
                ),

            "water_savings_factor":
                round(
                    water_savings_factor,
                    2,
                ),

            "resource_conservation_factor":
                round(
                    resource_conservation_factor,
                    2,
                ),

            # ==================================================
            # Dashboard Summary
            # ==================================================

            "summary": {

                "best_score":
                    round(
                        best_score,
                        2,
                    ),

                "lowest_score":
                    round(
                        lowest_score,
                        2,
                    ),

                "average_score":
                    average_score,

            },
        }