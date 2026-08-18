class CircularEconomyService:

    def generate(
        self,
        recommendation,
        sustainability,
        waste_scoring
    ):

        action = recommendation.get(
            "recommended_action",
            "Recycle"
        )

        sustainability_score = sustainability.get(
            "score",
            80
        )

        circularity_score = waste_scoring.get(
            "circularity_score",
            80
        )

        # --------------------------------
        # Recycling Efficiency
        # --------------------------------

        if action == "Reuse":
            recycling_efficiency = 98

        elif action == "Recycle":
            recycling_efficiency = 90

        elif action == "Repair":
            recycling_efficiency = 85

        else:
            recycling_efficiency = 60

        # --------------------------------
        # Waste Diversion Rate
        # --------------------------------

        waste_diversion_rate = round(
            sustainability_score * 0.95,
            1
        )

        # --------------------------------
        # Resource Recovery Rate
        # --------------------------------

        resource_recovery_rate = round(
            circularity_score * 0.92,
            1
        )

        # --------------------------------
        # Circular Economy Index
        # --------------------------------

        circular_economy_index = round(

            (

                recycling_efficiency * 0.30 +

                waste_diversion_rate * 0.30 +

                resource_recovery_rate * 0.40

            ),

            1

        )

        # --------------------------------
        # Circular Economy Rating
        # --------------------------------

        if circular_economy_index >= 90:

            rating = "Excellent"

        elif circular_economy_index >= 80:

            rating = "High"

        elif circular_economy_index >= 70:

            rating = "Good"

        elif circular_economy_index >= 60:

            rating = "Average"

        else:

            rating = "Needs Improvement"

        return {

            "recycling_efficiency": recycling_efficiency,

            "waste_diversion_rate": waste_diversion_rate,

            "resource_recovery_rate": resource_recovery_rate,

            "circular_economy_index": circular_economy_index,

            "rating": rating

        }