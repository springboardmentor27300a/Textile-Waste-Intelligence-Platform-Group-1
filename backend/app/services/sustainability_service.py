class SustainabilityService:
    """
    Sustainability and Environmental Reference Factors

    The values below are approximate reference values used for
    educational sustainability estimation within the
    Textile Waste Intelligence Platform.

    CO2 Saved represents estimated emissions avoided through
    textile recovery or reuse.

    Carbon Footprint represents the estimated greenhouse-gas
    emissions associated with producing the textile material
    and is expressed as kg CO2e per kg of textile.

    These values are intended for decision-support and should
    not be treated as a certified Life Cycle Assessment (LCA).
    """

    MATERIAL_DATA = {

        "Cotton": {
            "carbon_footprint": 5.8,
            "co2_saved": 5.2,
            "water_saved": 8500,
            "landfill_saved": 1.0,
            "resource_conservation": "High",
            "score": 92
        },

        "Polyester": {
            "carbon_footprint": 9.5,
            "co2_saved": 5.4,
            "water_saved": 95,
            "landfill_saved": 1.0,
            "resource_conservation": "Medium",
            "score": 85
        },

        "Polyamide": {
            "carbon_footprint": 6.8,
            "co2_saved": 6.8,
            "water_saved": 120,
            "landfill_saved": 1.0,
            "resource_conservation": "Medium",
            "score": 87
        },

        "Acrylic": {
            "carbon_footprint": 8.3,
            "co2_saved": 8.3,
            "water_saved": 180,
            "landfill_saved": 1.0,
            "resource_conservation": "Medium",
            "score": 84
        },

        "Wool": {
            "carbon_footprint": 19.5,
            "co2_saved": 19.5,
            "water_saved": 1450,
            "landfill_saved": 1.0,
            "resource_conservation": "High",
            "score": 88
        },

        "Silk": {
            "carbon_footprint": 15.5,
            "co2_saved": 155.0,
            "water_saved": 1100,
            "landfill_saved": 1.0,
            "resource_conservation": "Very High",
            "score": 95
        },

        "Denim": {
            "carbon_footprint": 6.0,
            "co2_saved": 6.0,
            "water_saved": 9200,
            "landfill_saved": 1.0,
            "resource_conservation": "High",
            "score": 94
        },

        "Linen": {
            "carbon_footprint": 4.8,
            "co2_saved": 4.8,
            "water_saved": 6500,
            "landfill_saved": 1.0,
            "resource_conservation": "High",
            "score": 91
        },

        "Rayon": {
            "carbon_footprint": 4.6,
            "co2_saved": 4.6,
            "water_saved": 2100,
            "landfill_saved": 1.0,
            "resource_conservation": "High",
            "score": 88
        },

        "Mixed Fabrics": {
            "carbon_footprint": 4.0,
            "co2_saved": 4.0,
            "water_saved": 1700,
            "landfill_saved": 1.0,
            "resource_conservation": "Medium",
            "score": 80
        }
    }

    def calculate(self, material, recommendation):

        material_name = material.get(
            "label",
            "Cotton"
        )

        data = self.MATERIAL_DATA.get(
            material_name,
            self.MATERIAL_DATA["Cotton"]
        )

        score = data["score"]

        action = recommendation.get(
            "recommended_action",
            ""
        )

        if action == "Reuse":
            score += 5

        elif action == "Recycle":
            score += 4

        elif action == "Repair":
            score += 3

        elif action == "Donate":
            score += 4

        elif action == "Upcycle":
            score += 5

        elif action == "Dispose":
            score -= 5

        if score > 100:
            score = 100

        if score >= 90:
            rating = "Excellent"

        elif score >= 80:
            rating = "Good"

        elif score >= 70:
            rating = "Average"

        else:
            rating = "Poor"

        return {

            "score": score,

            "environmental_rating": rating,

            "carbon_footprint": data[
                "carbon_footprint"
            ],

            "co2_saved": data[
                "co2_saved"
            ],

            "water_saved": data[
                "water_saved"
            ],

            "landfill_saved": data[
                "landfill_saved"
            ],

            "resource_conservation": data[
                "resource_conservation"
            ]
        }