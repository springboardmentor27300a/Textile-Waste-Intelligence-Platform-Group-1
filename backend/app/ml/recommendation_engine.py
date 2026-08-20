RECOMMENDATIONS = {
    "COTTON": [
        ("Mechanical Recycling", 95, "Cotton fibers are suitable for mechanical recycling."),
        ("Reuse", 90, "Good-condition cotton textiles can be reused."),
        ("Donation", 82, "Reusable cotton garments can be donated."),
    ],
    "POLYESTER": [
        ("Chemical Recycling", 95, "Polyester can be processed through chemical recycling."),
        ("Mechanical Recycling", 88, "Sorted polyester can be mechanically recycled."),
        ("Reuse", 75, "Good-condition polyester textiles may be reused."),
    ],
    "DENIM": [
        ("Upcycling", 95, "Denim is highly suitable for upcycling."),
        ("Reuse", 90, "Good-condition denim can retain significant reuse value."),
        ("Fiber Recovery", 85, "Denim fibers can be recovered for secondary applications."),
    ],
    "WOOL": [
        ("Textile Recycling", 94, "Wool fibers can be regenerated for textile applications."),
        ("Reuse", 88, "Good-condition wool garments can be reused."),
        ("Donation", 82, "Reusable wool garments can be donated."),
    ],
    "SILK": [
        ("Reuse", 90, "Good-condition silk has high reuse value."),
        ("Donation", 80, "Reusable silk garments can be donated."),
        ("Upcycling", 75, "Damaged silk can be repurposed through upcycling."),
    ],
    "LINEN": [
        ("Mechanical Recycling", 90, "Linen fibers can be mechanically recovered."),
        ("Reuse", 88, "Good-condition linen can be reused."),
        ("Upcycling", 80, "Linen can be repurposed into secondary products."),
    ],
    "NYLON": [
        ("Chemical Recycling", 90, "Nylon can be recovered through suitable chemical recycling processes."),
        ("Mechanical Recycling", 80, "Sorted nylon can be mechanically recycled."),
        ("Reuse", 70, "Good-condition nylon textiles may be reused."),
    ],
    "RAYON": [
        ("Reuse", 82, "Good-condition rayon textiles can be reused."),
        ("Fiber Recovery", 75, "Rayon fibers may be recovered for secondary applications."),
        ("Upcycling", 70, "Rayon can be repurposed when direct recycling is unsuitable."),
    ],
    "ACRYLIC": [
        ("Mechanical Recycling", 75, "Acrylic textiles may be mechanically recovered."),
        ("Reuse", 65, "Good-condition acrylic garments may be reused."),
        ("Energy Recovery", 50, "Energy recovery can be considered when material recovery is not feasible."),
    ],
    "BLENDED": [
        ("Fiber Separation", 90, "Blended fabrics should be separated before material recovery."),
        ("Upcycling", 80, "Blended textiles can often be repurposed through upcycling."),
        ("Energy Recovery", 60, "Energy recovery may be considered when separation is not feasible."),
    ],
    "UNKNOWN": [
        ("Manual Inspection", 100, "Material could not be confidently identified and requires inspection."),
    ],
}


def generate_recommendations(
    material: str,
    condition: str = "UNKNOWN",
    waste_category: str = "RECYCLABLE",
    recyclability: float = 50,
    reuse_potential: float = 50,
    processing_feasibility: float = 50,
):
    """
    Generate recommendations using material and waste-assessment information.

    Optional parameters preserve backward compatibility with the existing
    application while allowing the analysis pipeline to provide richer inputs.
    """

    material = (material or "UNKNOWN").upper()
    condition = (condition or "UNKNOWN").upper()
    waste_category = (waste_category or "RECYCLABLE").upper()

    if material not in RECOMMENDATIONS:
        material = "UNKNOWN"

    recommendations = []

    for index, (action, base_score, reason) in enumerate(
        RECOMMENDATIONS[material],
        start=1,
    ):
        score = float(base_score)

        # Good condition increases reuse-oriented recommendations.
        if condition == "GOOD" and action in {
            "Reuse",
            "Donation",
        }:
            score += 5

        # Damaged material should favour recovery/upcycling rather than reuse.
        if condition in {"DAMAGED", "POOR"} and action in {
            "Reuse",
            "Donation",
        }:
            score -= 20

        if condition in {"DAMAGED", "POOR"} and action in {
            "Fiber Recovery",
            "Mechanical Recycling",
            "Chemical Recycling",
            "Upcycling",
            "Textile Recycling",
            "Fiber Separation",
        }:
            score += 5

        # Reusability affects reuse-oriented actions.
        if action in {"Reuse", "Donation"}:
            score += (float(reuse_potential) - 50) * 0.10

        # Low processing feasibility reduces technical recycling options.
        if action in {
            "Mechanical Recycling",
            "Chemical Recycling",
            "Textile Recycling",
            "Fiber Recovery",
            "Fiber Separation",
        }:
            score += (float(processing_feasibility) - 50) * 0.08

        # Low recyclability reduces recycling-oriented actions.
        if action in {
            "Mechanical Recycling",
            "Chemical Recycling",
            "Textile Recycling",
            "Fiber Recovery",
            "Fiber Separation",
        }:
            score += (float(recyclability) - 50) * 0.08

        # Waste category provides an additional business rule.
        if waste_category == "REUSABLE" and action in {
            "Reuse",
            "Donation",
        }:
            score += 8

        if waste_category == "REPAIRABLE" and action in {
            "Reuse",
            "Upcycling",
        }:
            score += 5

        if waste_category == "UPCYCLABLE" and action == "Upcycling":
            score += 10

        score = max(0, min(100, round(score, 2)))

        recommendations.append(
            {
                "action": action,
                "rank": index,
                "score": score,
                "reason": reason,
                "primary": False,
            }
        )

    # Highest suitability becomes primary.
    recommendations.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    for index, recommendation in enumerate(
        recommendations,
        start=1,
    ):
        recommendation["rank"] = index
        recommendation["primary"] = index == 1

    return recommendations