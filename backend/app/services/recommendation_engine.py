class RecommendationEngine:
    """
    Recommendation Intelligence Engine

    Generates business recommendations using:

    • Material
    • Waste Category
    • Circularity
    • Sustainability
    • Environmental Metrics
    """

    @staticmethod
    def generate(
        material,
        waste,
        scores,
        sustainability,
    ):

        reuse_score = scores["reuse_score"]

        recovery_score = scores[
            "material_recovery_score"
        ]

        sustainability_score = scores[
            "sustainability_score"
        ]

        circularity = scores[
            "circularity_score"
        ]

        # -----------------------------------
        # Priority
        # -----------------------------------

        average = (
            reuse_score
            + recovery_score
            + sustainability_score
            + circularity
        ) / 4

        if average >= 85:
            priority = "High"

        elif average >= 65:
            priority = "Medium"

        else:
            priority = "Low"

        # -----------------------------------
        # Recovery Method
        # -----------------------------------

        if reuse_score >= 85:

            recovery_method = (
                "Direct Reuse"
            )

        elif recovery_score >= 75:

            recovery_method = (
                "Mechanical Recycling"
            )

        elif recovery_score >= 55:

            recovery_method = (
                "Chemical Recycling"
            )

        else:

            recovery_method = (
                "Energy Recovery"
            )

        # -----------------------------------
        # Business Recommendation
        # -----------------------------------

        if priority == "High":

            recommendation = (
                "Immediately process this textile "
                "for recycling or reuse."
            )

        elif priority == "Medium":

            recommendation = (
                "Store temporarily and process "
                "during the next recycling cycle."
            )

        else:

            recommendation = (
                "Evaluate alternative disposal or "
                "energy recovery options."
            )

        # -----------------------------------
        # Next Step
        # -----------------------------------

        if recovery_method == "Direct Reuse":

            next_step = (
                "Transfer batch to reuse inventory."
            )

        elif recovery_method == (
            "Mechanical Recycling"
        ):

            next_step = (
                "Send batch to mechanical recycling."
            )

        elif recovery_method == (
            "Chemical Recycling"
        ):

            next_step = (
                "Forward to chemical recycling plant."
            )

        else:

            next_step = (
                "Route batch for energy recovery."
            )

        # -----------------------------------
        # Expected Benefit
        # -----------------------------------

        if priority == "High":

            benefit = (
                "Maximum environmental and "
                "economic recovery."
            )

        elif priority == "Medium":

            benefit = (
                "Moderate resource recovery with "
                "good sustainability impact."
            )

        else:

            benefit = (
                "Minimal recovery; prioritize "
                "safe disposal."
            )

        # -----------------------------------
        # Circular Economy Status
        # -----------------------------------

        if circularity >= 85:

            circular_status = "Excellent"

        elif circularity >= 70:

            circular_status = "Good"

        elif circularity >= 55:

            circular_status = "Average"

        else:

            circular_status = "Poor"

        # -----------------------------------
        # Resource Recovery
        # -----------------------------------

        if recovery_score >= 85:

            recovery_status = "Excellent"

        elif recovery_score >= 70:

            recovery_status = "High"

        elif recovery_score >= 55:

            recovery_status = "Moderate"

        else:

            recovery_status = "Low"

        # -----------------------------------
        # Final Response
        # -----------------------------------

        return {

            "priority":
                priority,

            "recommendation":
                recommendation,

            "next_step":
                next_step,

            "expected_benefit":
                benefit,

            "recovery_method":
                recovery_method,

            "resource_recovery":
                recovery_status,

            "circular_status":
                circular_status,

            "overall_rating":
                sustainability[
                    "sustainability_rating"
                ],
        }