# ==========================================
# Sustainability Engine
# ==========================================

FABRIC_DATA = {

    "Cotton": {
        "carbon_factor": 5.5,
        "water_usage": "High",
        "impact": "Moderate",
        "category": "Reusable"
    },

    "Silk": {
        "carbon_factor": 6.2,
        "water_usage": "Medium",
        "impact": "Low",
        "category": "Reusable"
    },

    "Linen": {
        "carbon_factor": 4.2,
        "water_usage": "Low",
        "impact": "Low",
        "category": "Reusable"
    },

    "Wool": {
        "carbon_factor": 7.5,
        "water_usage": "Medium",
        "impact": "Moderate",
        "category": "Recyclable"
    },

    "Hessian": {
        "carbon_factor": 4.8,
        "water_usage": "Low",
        "impact": "Low",
        "category": "Recyclable"
    },

    "Abaca": {
        "carbon_factor": 3.2,
        "water_usage": "Very Low",
        "impact": "Very Low",
        "category": "Biodegradable"
    }

}


def calculate_sustainability(fabric, quantity=1):

    data = FABRIC_DATA.get(fabric)

    if not data:
        return {}

    carbon_saved = round(
        data["carbon_factor"] * quantity,
        2
    )

    diversion_rate = 80

    if data["category"] == "Reusable":
        score = 95

    elif data["category"] == "Recyclable":
        score = 85

    else:
        score = 75

    return {

        "carbon_saved": carbon_saved,

        "estimated_emission":
        round(carbon_saved + 4, 2),

        "waste_diversion": diversion_rate,

        "circular_economy":
        "Reuse → Recycling → Fiber Recovery",

        "sustainability_score": score,

        "environmental_impact":
        data["impact"],

        "water_usage":
        data["water_usage"]

    }