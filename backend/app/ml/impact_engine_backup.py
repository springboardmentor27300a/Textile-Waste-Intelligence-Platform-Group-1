IMPACT_FACTORS = {
    "COTTON": (2.5, 150),
    "POLYESTER": (1.8, 80),
    "DENIM": (2.8, 170),
    "WOOL": (3.1, 200),
    "BLENDED": (1.5, 70),
    "UNKNOWN": (1.0, 50),
}


def estimate_environmental_impact(material: str, quantity_kg: float):

    material = material.upper()

    if material not in IMPACT_FACTORS:
        material = "UNKNOWN"

    co2_factor, water_factor = IMPACT_FACTORS[material]

    return {
        "co2_avoided_kg": round(quantity_kg * co2_factor, 2),
        "water_saved_liters": round(quantity_kg * water_factor, 2),
        "landfill_avoided_kg": round(quantity_kg, 2),
        "material_recovered_kg": round(quantity_kg * 0.90, 2),
        "diversion_percentage": 90.0,
    }