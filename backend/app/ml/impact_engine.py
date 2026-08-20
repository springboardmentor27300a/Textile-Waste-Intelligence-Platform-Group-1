# IMPACT_FACTORS = {
#     "COTTON": (2.5, 150),
#     "POLYESTER": (1.8, 80),
#     "DENIM": (2.8, 170),
#     "WOOL": (3.1, 200),
#     "BLENDED": (1.5, 70),
#     "UNKNOWN": (1.0, 50),
# }


# def estimate_environmental_impact(material: str, quantity_kg: float):

#     material = material.upper()

#     if material not in IMPACT_FACTORS:
#         material = "UNKNOWN"

#     co2_factor, water_factor = IMPACT_FACTORS[material]

#     return {
#         "co2_avoided_kg": round(quantity_kg * co2_factor, 2),
#         "water_saved_liters": round(quantity_kg * water_factor, 2),
#         "landfill_avoided_kg": round(quantity_kg, 2),
#         "material_recovered_kg": round(quantity_kg * 0.90, 2),
#         "diversion_percentage": 90.0,
#     }

IMPACT_FACTORS = {
    "COTTON": (2.5, 150),
    "POLYESTER": (1.8, 80),
    "DENIM": (2.8, 170),
    "WOOL": (3.1, 200),
    "SILK": (2.2, 120),
    "RAYON": (1.9, 100),
    "ACRYLIC": (1.4, 70),
    "NYLON": (2.0, 90),
    "LINEN": (2.3, 140),
    "BLENDED": (1.5, 70),
    "UNKNOWN": (1.0, 50),
}


def estimate_environmental_impact(
    material: str,
    quantity_kg: float,
    waste_category: str = "RECYCLABLE",
    condition: str = "UNKNOWN",
):
    material = (
        material or "UNKNOWN"
    ).upper()

    waste_category = (
        waste_category or "RECYCLABLE"
    ).upper()

    condition = (
        condition or "UNKNOWN"
    ).upper()

    if material not in IMPACT_FACTORS:
        material = "UNKNOWN"

    co2_factor, water_factor = (
        IMPACT_FACTORS[material]
    )

    # Recovery/diversion depends on the assessed outcome.
    recovery_rates = {
        "REUSABLE": 0.95,
        "REPAIRABLE": 0.85,
        "UPCYCLABLE": 0.80,
        "RECYCLABLE": 0.90,
        "COMPOSTABLE": 0.75,
        "HAZARDOUS_TEXTILE_WASTE": 0.20,
    }

    diversion_rates = {
        "REUSABLE": 95.0,
        "REPAIRABLE": 85.0,
        "UPCYCLABLE": 80.0,
        "RECYCLABLE": 90.0,
        "COMPOSTABLE": 75.0,
        "HAZARDOUS_TEXTILE_WASTE": 20.0,
    }

    recovery_rate = recovery_rates.get(
        waste_category,
        0.70,
    )

    diversion_percentage = diversion_rates.get(
        waste_category,
        70.0,
    )

    # Damaged/poor material has lower effective recovery.
    if condition in {"DAMAGED", "POOR"}:
        recovery_rate *= 0.85
        diversion_percentage *= 0.90

    recovery_rate = max(
        0.0,
        min(1.0, recovery_rate),
    )

    diversion_percentage = max(
        0.0,
        min(100.0, diversion_percentage),
    )

    material_recovered = (
        quantity_kg * recovery_rate
    )

    landfill_avoided = (
        quantity_kg
        * diversion_percentage
        / 100
    )

    co2_avoided = (
        quantity_kg
        * co2_factor
        * recovery_rate
    )

    water_saved = (
        quantity_kg
        * water_factor
        * recovery_rate
    )

    return {
        "co2_avoided_kg": round(
            co2_avoided,
            2,
        ),
        "water_saved_liters": round(
            water_saved,
            2,
        ),
        "landfill_avoided_kg": round(
            landfill_avoided,
            2,
        ),
        "material_recovered_kg": round(
            material_recovered,
            2,
        ),
        "diversion_percentage": round(
            diversion_percentage,
            2,
        ),
    }