from app.ml.material_taxonomy import get_material_group


RECOMMENDATIONS = {
    "COTTON": [
        ("Mechanical Recycling", 95, "Cotton fibers can be mechanically recycled."),
        ("Reuse", 90, "Garments in good condition can be reused."),
        ("Donation", 82, "Reusable garments can be donated."),
    ],
    "POLYESTER": [
        ("Chemical Recycling", 95, "Polyester supports chemical recycling."),
        ("Mechanical Recycling", 88, "Can be mechanically recycled after sorting."),
        ("Energy Recovery", 72, "Recover energy if recycling is not feasible."),
    ],
    "DENIM": [
        ("Upcycling", 95, "Denim is suitable for upcycling."),
        ("Reuse", 90, "Reusable denim garments retain value."),
        ("Fiber Recovery", 80, "Recover fibers for insulation products."),
    ],
    "WOOL": [
        ("Textile Recycling", 94, "Wool fibers can be regenerated."),
        ("Donation", 86, "Good-condition wool garments are reusable."),
    ],
    "BLENDED": [
        ("Fiber Separation", 90, "Separate blended fibers before recycling."),
        ("Energy Recovery", 70, "Fallback when separation isn't possible."),
    ],
    "UNKNOWN": [
        ("Manual Inspection", 100, "Material could not be identified."),
    ],
}


def generate_recommendations(material: str):
    material = material.upper()

    if material not in RECOMMENDATIONS:
        material = "UNKNOWN"

    recommendations = []

    for index, (action, score, reason) in enumerate(RECOMMENDATIONS[material], start=1):
        recommendations.append(
            {
                "action": action,
                "rank": index,
                "score": score,
                "reason": reason,
                "primary": index == 1,
            }
        )

    return recommendations