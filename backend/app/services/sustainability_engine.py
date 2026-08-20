class SustainabilityEngine:
    """
    =========================================================
        Textile Waste Intelligence Platform

            Sustainability Intelligence Engine

    =========================================================

    Combines Waste Scoring and Environmental Assessment
    results into a unified sustainability intelligence layer.

    Calculates
    ----------

    Sustainability
        • Sustainability Score
        • Overall Sustainability Index
        • Sustainability Rating
        • Sustainability Status

    Circular Economy
        • Circular Economy Index
        • Circular Economy Status

    Recycling Targets
        • Recycling Target
        • Recycling Progress
        • Target Gap
        • Target Achievement
        • Target Status

    ESG
        • ESG Score
        • ESG Readiness

    Benchmarking
        • Company Benchmark
        • Company Level
        • Benchmark Score

    Environmental Intelligence
        • Carbon Footprint
        • Carbon Savings
        • Water Savings
        • Energy Savings
        • Landfill Diversion
        • Resource Conservation

    Recommendations
        • Sustainability Recommendation

    =========================================================
    """

    DEFAULT_RECYCLING_TARGET = 90.0

    # --------------------------------------------------
    # Helpers
    # --------------------------------------------------

    @staticmethod
    def _number(value, default=0.0):
        """
        Safely convert values to float.
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
        Keep scores and percentages within 0-100.
        """

        value = SustainabilityEngine._number(
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
    def _round(value, digits=2):
        return round(
            SustainabilityEngine._number(
                value,
                0,
            ),
            digits,
        )

    # --------------------------------------------------
    # Main Calculation
    # --------------------------------------------------

    @staticmethod
    def calculate(
        environmental: dict,
        scores: dict,
    ):
        environmental = environmental or {}
        scores = scores or {}

        # ==================================================
        # Waste Scoring Inputs
        # ==================================================

        recyclability_score = SustainabilityEngine._clamp(
            scores.get(
                "recyclability_score",
                0,
            )
        )

        reuse_score = SustainabilityEngine._clamp(
            scores.get(
                "reuse_score",
                0,
            )
        )

        material_recovery_score = (
            SustainabilityEngine._clamp(
                scores.get(
                    "material_recovery_score",
                    0,
                )
            )
        )

        circularity_score = SustainabilityEngine._clamp(
            scores.get(
                "circularity_score",
                0,
            )
        )

        sustainability_score_input = (
            SustainabilityEngine._clamp(
                scores.get(
                    "sustainability_score",
                    0,
                )
            )
        )

        environmental_score = SustainabilityEngine._clamp(
            scores.get(
                "environmental_score",
                0,
            )
        )

        overall_score_input = SustainabilityEngine._clamp(
            scores.get(
                "overall_score",
                0,
            )
        )

        # ==================================================
        # Environmental Inputs
        # ==================================================

        carbon_footprint = SustainabilityEngine._number(
            environmental.get(
                "carbon_footprint",
                0,
            )
        )

        carbon_savings = SustainabilityEngine._number(
            environmental.get(
                "carbon_savings",
                0,
            )
        )

        water_savings = SustainabilityEngine._number(
            environmental.get(
                "water_savings",
                0,
            )
        )

        energy_savings = SustainabilityEngine._number(
            environmental.get(
                "energy_savings",
                0,
            )
        )

        landfill_diversion = SustainabilityEngine._number(
            environmental.get(
                "landfill_diversion",
                0,
            )
        )

        landfill_diversion_rate = SustainabilityEngine._clamp(
            environmental.get(
                "landfill_diversion_rate",
                environmental.get(
                    "waste_diversion",
                    0,
                ),
            )
        )

        resource_conservation = SustainabilityEngine._clamp(
            environmental.get(
                "resource_conservation",
                0,
            )
        )

        recovered_material_quantity = (
            SustainabilityEngine._number(
                environmental.get(
                    "recovered_material_quantity",
                    0,
                )
            )
        )

        circular_economy_contribution = (
            SustainabilityEngine._clamp(
                environmental.get(
                    "circular_economy_contribution",
                    0,
                )
            )
        )

        pollution_reduction = SustainabilityEngine._clamp(
            environmental.get(
                "pollution_reduction",
                0,
            )
        )

        environmental_benefit = SustainabilityEngine._clamp(
            environmental.get(
                "environmental_benefit",
                environmental_score,
            )
        )

        environmental_impact = environmental.get(
            "environmental_impact",
            "Moderate",
        )

        environmental_status = environmental.get(
            "environmental_status",
            "Average",
        )

        # ==================================================
        # Sustainability Index
        # ==================================================
        #
        # Sustainability is deliberately calculated from
        # several independent dimensions instead of simply
        # copying one score.
        #
        # Weights:
        #
        # Sustainability performance  35%
        # Circularity                 25%
        # Material recovery           20%
        # Environmental benefit       20%
        #
        # ==================================================

        sustainability_index = (
            sustainability_score_input * 0.35
            +
            circularity_score * 0.25
            +
            material_recovery_score * 0.20
            +
            environmental_benefit * 0.20
        )

        sustainability_index = SustainabilityEngine._clamp(
            sustainability_index
        )

        sustainability_index = SustainabilityEngine._round(
            sustainability_index
        )

        # ==================================================
        # Sustainability Rating
        # ==================================================

        if sustainability_index >= 90:

            sustainability_rating = "Excellent"

        elif sustainability_index >= 80:

            sustainability_rating = "Very Good"

        elif sustainability_index >= 70:

            sustainability_rating = "Good"

        elif sustainability_index >= 60:

            sustainability_rating = "Average"

        elif sustainability_index >= 40:

            sustainability_rating = "Needs Improvement"

        else:

            sustainability_rating = "Poor"

        # ==================================================
        # Sustainability Status
        # ==================================================

        if sustainability_index >= 85:

            sustainability_status = "Leader"

        elif sustainability_index >= 70:

            sustainability_status = "On Target"

        elif sustainability_index >= 55:

            sustainability_status = "Needs Improvement"

        else:

            sustainability_status = "Critical"

        # ==================================================
        # Circular Economy Index
        # ==================================================

        circular_economy_index = (
            circularity_score * 0.40
            +
            material_recovery_score * 0.30
            +
            circular_economy_contribution * 0.20
            +
            reuse_score * 0.10
        )

        circular_economy_index = SustainabilityEngine._clamp(
            circular_economy_index
        )

        circular_economy_index = SustainabilityEngine._round(
            circular_economy_index
        )

        # ==================================================
        # Circular Economy Status
        # ==================================================

        if circular_economy_index >= 90:

            circular_economy_status = "Excellent"

        elif circular_economy_index >= 75:

            circular_economy_status = "Good"

        elif circular_economy_index >= 60:

            circular_economy_status = "Average"

        elif circular_economy_index >= 40:

            circular_economy_status = "Limited"

        else:

            circular_economy_status = "Poor"

        # ==================================================
        # Recycling Target
        # ==================================================

        recycling_target = (
            SustainabilityEngine.DEFAULT_RECYCLING_TARGET
        )

        recycling_progress = (
            material_recovery_score
        )

        recycling_progress = SustainabilityEngine._round(
            recycling_progress
        )

        target_gap = max(
            recycling_target
            - recycling_progress,
            0,
        )

        target_gap = SustainabilityEngine._round(
            target_gap
        )

        # ==================================================
        # Target Achievement
        # ==================================================

        if recycling_target > 0:

            target_achievement = (
                recycling_progress
                / recycling_target
            ) * 100

        else:

            target_achievement = 0

        target_achievement = SustainabilityEngine._clamp(
            target_achievement
        )

        target_achievement = SustainabilityEngine._round(
            target_achievement
        )

        # ==================================================
        # Target Status
        # ==================================================

        if recycling_progress >= recycling_target:

            target_status = "Achieved"

        elif recycling_progress >= 75:

            target_status = "On Track"

        elif recycling_progress >= 50:

            target_status = "Needs Improvement"

        else:

            target_status = "Critical"

        # ==================================================
        # ESG Score
        # ==================================================
        #
        # ESG is derived from:
        #
        # Sustainability        40%
        # Environmental         30%
        # Circular Economy      30%
        #
        # ==================================================

        esg_score = (
            sustainability_index * 0.40
            +
            environmental_score * 0.30
            +
            circular_economy_index * 0.30
        )

        esg_score = SustainabilityEngine._clamp(
            esg_score
        )

        esg_score = SustainabilityEngine._round(
            esg_score
        )

        # ==================================================
        # ESG Readiness
        # ==================================================

        if esg_score >= 90:

            esg_readiness = "Excellent"

        elif esg_score >= 75:

            esg_readiness = "Good"

        elif esg_score >= 60:

            esg_readiness = "Moderate"

        elif esg_score >= 40:

            esg_readiness = "Needs Improvement"

        else:

            esg_readiness = "Low"

        # ==================================================
        # Benchmark Score
        # ==================================================
        #
        # This is an internal performance benchmark.
        #
        # IMPORTANT:
        # It is NOT a real-world company ranking unless
        # historical/company database data is supplied.
        #
        # This keeps the current engine honest instead of
        # inventing external company performance data.
        #
        # ==================================================

        benchmark_score = (
            sustainability_index
        )

        benchmark_score = SustainabilityEngine._round(
            benchmark_score
        )

        # ==================================================
        # Benchmark Classification
        # ==================================================

        # Internal performance classification only; not an external industry ranking.
        if benchmark_score >= 90:

            company_benchmark = "Excellent Performance"

            company_level = "Gold"

        elif benchmark_score >= 80:

            company_benchmark = "Strong Performance"

            company_level = "Silver"

        elif benchmark_score >= 70:

            company_benchmark = "Good Performance"

            company_level = "Bronze"

        elif benchmark_score >= 55:

            company_benchmark = "Below Target"

            company_level = "Improvement Required"

        else:

            company_benchmark = "Low Performance"

            company_level = "Critical Improvement Required"

        # ==================================================
        # Benchmark Interpretation
        # ==================================================

        if benchmark_score >= 90:

            benchmark_status = (
                "Leading sustainability performance"
            )

        elif benchmark_score >= 80:

            benchmark_status = (
                "Strong sustainability performance"
            )

        elif benchmark_score >= 70:

            benchmark_status = (
                "Good internal sustainability performance"
            )

        elif benchmark_score >= 55:

            benchmark_status = (
                "Performance is below the internal target"
            )

        else:

            benchmark_status = (
                "Significant sustainability improvement required"
            )

        # ==================================================
        # Sustainability Recommendation
        # ==================================================

        recommendations = []

        # Recycling recommendation

        if recycling_progress < recycling_target:

            recommendations.append(
                "Increase material recovery to close "
                f"the {target_gap}% recycling target gap."
            )

        # Reuse recommendation

        if reuse_score < 70:

            recommendations.append(
                "Increase textile reuse, repair, donation "
                "and resale before recycling."
            )

        # Contamination / environmental recommendation

        if pollution_reduction < 60:

            recommendations.append(
                "Improve sorting, contamination control "
                "and recovery processes to reduce environmental impact."
            )

        # Circular economy recommendation

        if circular_economy_index < 70:

            recommendations.append(
                "Strengthen closed-loop recycling and "
                "circular material recovery pathways."
            )

        # Resource recommendation

        if resource_conservation < 70:

            recommendations.append(
                "Increase recovery of textile materials "
                "to reduce dependence on virgin resources."
            )

        # Strong performance

        if not recommendations:

            recommendations.append(
                "Maintain current sustainability performance "
                "and continue maximizing closed-loop recovery."
            )

        recommendation = " ".join(
            recommendations
        )

        # ==================================================
        # Executive Summary
        # ==================================================

        summary = {

            "overall_score":
                sustainability_index,

            "sustainability_rating":
                sustainability_rating,

            "sustainability_status":
                sustainability_status,

            "carbon_footprint":
                SustainabilityEngine._round(
                    carbon_footprint
                ),

            "carbon_savings":
                SustainabilityEngine._round(
                    carbon_savings
                ),

            "water_savings":
                SustainabilityEngine._round(
                    water_savings
                ),

            "energy_savings":
                SustainabilityEngine._round(
                    energy_savings
                ),

            "landfill_diversion":
                SustainabilityEngine._round(
                    landfill_diversion
                ),

            "resource_conservation":
                SustainabilityEngine._round(
                    resource_conservation
                ),

            "recovered_material_quantity":
                SustainabilityEngine._round(
                    recovered_material_quantity
                ),

            "circularity_score":
                SustainabilityEngine._round(
                    circularity_score
                ),

            "material_recovery_score":
                SustainabilityEngine._round(
                    material_recovery_score
                ),

            "environmental_score":
                SustainabilityEngine._round(
                    environmental_score
                ),

            "esg_score":
                SustainabilityEngine._round(
                    esg_score
                ),

            "recycling_target":
                recycling_target,

            "recycling_progress":
                recycling_progress,

            "target_status":
                target_status,

            "company_level":
                company_level,

        }

        # ==================================================
        # Final Output
        # ==================================================

        return {

            # --------------------------------------------------
            # Overall Sustainability
            # --------------------------------------------------

            "overall_score":
                sustainability_index,

            "sustainability_score":
                sustainability_score_input,

            "sustainability_rating":
                sustainability_rating,

            "sustainability_status":
                sustainability_status,

            # --------------------------------------------------
            # Environmental Intelligence
            # --------------------------------------------------

            "carbon_footprint":
                SustainabilityEngine._round(
                    carbon_footprint
                ),

            "carbon_savings":
                SustainabilityEngine._round(
                    carbon_savings
                ),

            "water_savings":
                SustainabilityEngine._round(
                    water_savings
                ),

            "energy_savings":
                SustainabilityEngine._round(
                    energy_savings
                ),

            "landfill_diversion":
                SustainabilityEngine._round(
                    landfill_diversion
                ),

            "landfill_diversion_rate":
                landfill_diversion_rate,

            "resource_conservation":
                SustainabilityEngine._round(
                    resource_conservation
                ),

            "recovered_material_quantity":
                SustainabilityEngine._round(
                    recovered_material_quantity
                ),

            "environmental_benefit":
                SustainabilityEngine._round(
                    environmental_benefit
                ),

            "pollution_reduction":
                SustainabilityEngine._round(
                    pollution_reduction
                ),

            "environmental_impact":
                environmental_impact,

            "environmental_status":
                environmental_status,

            # --------------------------------------------------
            # Circular Economy
            # --------------------------------------------------

            "circular_economy_index":
                circular_economy_index,

            "circular_economy_status":
                circular_economy_status,

            "circular_economy_contribution":
                circular_economy_contribution,

            # --------------------------------------------------
            # Recycling Target
            # --------------------------------------------------

            "recycling_target":
                recycling_target,

            "recycling_progress":
                recycling_progress,

            "target_gap":
                target_gap,

            "target_achievement":
                target_achievement,

            "target_status":
                target_status,

            # --------------------------------------------------
            # ESG
            # --------------------------------------------------

            "esg_score":
                esg_score,

            "esg_readiness":
                esg_readiness,

            # --------------------------------------------------
            # Benchmarking
            # --------------------------------------------------

            "benchmark":
                company_benchmark,

            "company_benchmark":
                company_benchmark,

            "benchmark_score":
                benchmark_score,

            "benchmark_status":
                benchmark_status,

            "company_level":
                company_level,

            # --------------------------------------------------
            # Recommendation
            # --------------------------------------------------

            "recommendation":
                recommendation,

            # --------------------------------------------------
            # Summary
            # --------------------------------------------------

            "summary":
                summary,
        }