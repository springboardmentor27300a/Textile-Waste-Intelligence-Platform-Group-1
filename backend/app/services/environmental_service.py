class EnvironmentalService:

    def generate(self, sustainability):

        score = sustainability.get("score", 0)
        co2 = sustainability.get("co2_saved", 0)
        water = sustainability.get("water_saved", 0)
        landfill = sustainability.get("landfill_saved", 0)

        # -----------------------------
        # Environmental Impact
        # -----------------------------
        if score >= 90:
            impact = "Excellent"

        elif score >= 80:
            impact = "High"

        elif score >= 70:
            impact = "Moderate"

        else:
            impact = "Low"

        # -----------------------------
        # Eco Rating (1-5 Stars)
        # -----------------------------
        if score >= 90:
            eco_rating = 5

        elif score >= 80:
            eco_rating = 4

        elif score >= 70:
            eco_rating = 3

        elif score >= 60:
            eco_rating = 2

        else:
            eco_rating = 1

        # -----------------------------
        # Environmental Summary
        # -----------------------------
        summary = (
            f"Recycling this textile can reduce approximately "
            f"{co2} kg of CO₂ emissions, conserve about "
            f"{water} liters of water, and divert "
            f"{landfill} kg of waste from landfills."
        )

        return {

           

                "carbon_reduction": co2,

                "water_conservation": water,

                "landfill_diversion": landfill,

                "environmental_impact": impact,

                "eco_rating": eco_rating,

                "summary": summary

            

        }