"""
Recommendation Engine Service — Milestone 2

Provides comprehensive, rule-based recycling recommendations based on material,
waste category, damage level, and contamination level. Returns full sentence
recommendations suitable for direct display in the UI and reports.
"""

from typing import Dict, List, Any

# ── Per-material recommendation libraries ────────────────────────────────────
# Each key maps to a list of actionable recommendation sentences.

MATERIAL_RECS: Dict[str, Dict[str, List[str]]] = {
    "cotton": {
        "clean": [
            "Donate to local textile charity drives — cotton in good condition has a 95% chance of reuse.",
            "Bundle and send to a certified mechanical recycling facility for fibre recovery.",
            "Use as cleaning rags, industrial wipers, or household cloths to extend its lifecycle.",
            "Partner with upcycling designers to transform into quilts, patchwork, or new garments.",
            "Shred and compress into acoustic insulation panels for construction use.",
        ],
        "damaged": [
            "Send to mechanical recycling — cotton fibres are fully recoverable even from damaged textiles.",
            "Industrial shredding into cotton flock is suitable for mattress stuffing and padding.",
            "Compost in an industrial composting facility — cotton is 100% biodegradable in 1–5 months.",
            "Use as bio-based mulch for agricultural applications after shredding.",
        ],
    },
    "polyester": {
        "clean": [
            "Process through chemical recycling (glycolysis) to recover PET monomers for new fibre production.",
            "Route to specialist synthetic fibre recyclers — polyester can be repelletised and respun.",
            "Donate functional polyester garments to second-hand programmes — it has a long wear lifespan.",
            "Convert into recycled polyester fill for pillows, sleeping bags, and insulation.",
        ],
        "damaged": [
            "Route to industrial recovery facilities for chemical depolymerisation.",
            "Do not landfill — polyester takes 200+ years to decompose and releases microplastics.",
            "Partner with specialist plastic-to-fuel converters as an energy recovery option.",
            "Segregate from natural fibres before sending to waste-to-energy incineration.",
        ],
    },
    "wool": {
        "clean": [
            "Sell or donate through wool-specific resale platforms — quality wool retains high value.",
            "Send to mechanical wool recyclers (shoddy industry) for reprocessing into new yarn.",
            "Use for premium insulation — wool's natural crimp provides excellent thermal properties.",
            "Upcycle into felt for craft, arts, or industrial gasket applications.",
        ],
        "damaged": [
            "Send to shoddy mills for garnetting and re-spinning into recycled wool blended yarns.",
            "Compost in industrial facilities — wool is protein-based and biodegrades within 1–2 years.",
            "Use as natural slow-release fertiliser — wool fibres are rich in nitrogen and keratin.",
        ],
    },
    "silk": {
        "clean": [
            "Sell through luxury second-hand platforms — silk garments retain 60–80% of original value.",
            "Partner with high-end fashion designers for upcycling into luxury accessories.",
            "Use in artisan crafts — silk is ideal for hand-weaving, painting, and embroidery.",
            "Repair minor damage professionally; a single repair can extend life by 5+ years.",
        ],
        "damaged": [
            "Send to specialist silk recyclers for fibre extraction and premium yarn production.",
            "Use as natural compost additive — silk is a protein fibre and biodegrades within 4 years.",
            "Repurpose smaller pieces as luxury gift packaging, ribbons, or lining material.",
        ],
    },
    "denim": {
        "clean": [
            "Donate to denim-specific programmes such as Blue Jeans Go Green for cotton recovery.",
            "Upcycle into bags, patches, aprons, or home décor — denim is highly versatile.",
            "Resell through vintage and second-hand platforms — denim has strong pre-loved demand.",
            "Repair using visible mending techniques (boro or sashiko) to extend garment life.",
        ],
        "damaged": [
            "Shred into denim insulation — companies like Bonded Logic recycle denim into acoustic panels.",
            "Send to cotton recyclers since denim is primarily a cotton-based twill fabric.",
            "Use as landscaping weed-barrier fabric after shredding and matting.",
        ],
    },
    "nylon": {
        "clean": [
            "Route to nylon-specific chemical recycling — Econyl and similar processes recover caprolactam.",
            "Donate functional nylon sportswear or outerwear to second-hand athletic gear programmes.",
            "Separate carefully from other synthetics before sending to specialist recyclers.",
        ],
        "damaged": [
            "Send to licensed hazardous/specialist waste contractors — do NOT landfill or incinerate without permits.",
            "Contact specialist synthetic textile recyclers equipped for nylon depolymerisation.",
            "Store safely segregated until a certified collection event or facility is available.",
        ],
    },
    "rayon": {
        "clean": [
            "Donate wearable rayon garments to textile charity collections for direct reuse.",
            "Send to cellulose-based recyclers — rayon's viscose fibres are recoverable.",
            "Compost in industrial composting — rayon is derived from cellulose and is biodegradable.",
        ],
        "damaged": [
            "Industrial composting is the preferred route — rayon decomposes within 6–12 months.",
            "Avoid landfill — even damaged rayon is 100% biodegradable and compostable.",
            "Use as garden mulch or soil amendment after shredding.",
        ],
    },
    "linen": {
        "clean": [
            "Donate to textile charity programmes — linen in good condition is highly sought after.",
            "Sell through sustainable fashion platforms as linen commands premium second-hand prices.",
            "Upcycle into napkins, dishcloths, or tote bags — linen is extremely durable.",
        ],
        "damaged": [
            "Compost directly — linen is a natural bast fibre and fully biodegrades within 2–4 weeks.",
            "Use as landscaping weed barrier or biodegradable plant stakes.",
            "Shred and use as eco-friendly animal bedding material.",
        ],
    },
    "acrylic": {
        "clean": [
            "Route to specialist acrylic recyclers equipped for petrochemical recovery processes.",
            "Donate functional acrylic knitwear to cold-weather clothing drives.",
            "Explore energy recovery via waste-to-energy incineration as a last resort.",
        ],
        "damaged": [
            "Send to a licensed hazardous waste handler — acrylic releases toxic fumes if burned improperly.",
            "Do NOT compost or landfill — acrylic is petroleum-based and non-biodegradable.",
            "Contact specialist chemical waste contractors for safe depolymerisation options.",
        ],
    },
    "mixed fabric": {
        "clean": [
            "Sort by primary fibre type if possible before routing to specific recyclers.",
            "Donate wearable mixed-fibre garments — second-hand shops accept blended fabrics.",
            "Route to general textile recyclers who handle blended materials through sorting.",
        ],
        "damaged": [
            "Sort and separate fibres where possible to maximise recycling value.",
            "Route unseparated blends to textile energy recovery facilities.",
            "Explore mechanical shredding into industrial wipers or sound-dampening insulation.",
        ],
    },
}

# ── Category-level recommendation overrides ──────────────────────────────────
CATEGORY_RECS: Dict[str, List[str]] = {
    "hazardous": [
        "URGENT: Segregate immediately from all other waste streams.",
        "Contact a licensed hazardous textile waste contractor before any disposal action.",
        "Do NOT landfill, incinerate, or compost — specialist treatment is legally required.",
        "Store in a sealed, labelled container in a ventilated area until collection.",
        "Document the material type and quantity for compliance reporting.",
    ],
    "compostable": [
        "Confirm no synthetic blend components before composting — even 5% synthetic content hinders decomposition.",
        "Use certified industrial composting (not home composting) for faster, cleaner breakdown.",
        "Shred or cut into small pieces (under 5cm) to accelerate the composting process.",
        "Partner with municipal green waste operators or commercial composting facilities.",
    ],
    "upcyclable": [
        "Reach out to local artisans, fashion designers, or maker communities for high-value creative reuse.",
        "List surplus upcyclable material on platforms such as Fibretrace or Material Exchange.",
        "Consider internal design team involvement to create branded or limited-edition upcycled products.",
    ],
}

# ── Condition-level additions ─────────────────────────────────────────────────
DAMAGE_ADDITIONS: Dict[str, str] = {
    "heavy":    "Major structural damage detected — repair is not cost-effective; prioritise material recovery.",
    "moderate": "Moderate damage detected — professional repair assessment recommended before disposal decision.",
    "minimal":  "Minimal damage detected — consider repair or donation before routing to recycling.",
}

CONTAMINATION_ADDITIONS: Dict[str, str] = {
    "high":   "HIGH contamination level — cleaning/decontamination is required before any recycling or donation.",
    "medium": "Medium contamination detected — industrial wash or solvent treatment required before processing.",
    "low":    "Low contamination — standard commercial cleaning is sufficient before donation or recycling.",
}


def get_recommendations(
    material: str,
    category: str,
    damage: str = "Unknown",
    contamination: str = "Unknown",
    recyclability: str = "Unknown",
    reuse_potential: str = "Unknown",
) -> Dict[str, Any]:
    """
    Generate a rich set of actionable recycling recommendations for a textile item.

    Args:
        material:       Fabric type (e.g. 'Cotton', 'Polyester').
        category:       Waste category (e.g. 'Recyclable', 'Hazardous').
        damage:         Damage level string from image analysis (e.g. 'None Detected', 'Heavy').
        contamination:  Contamination level string (e.g. 'None', 'Medium').
        recyclability:  Recyclability assessment label (e.g. 'High', 'Low').
        reuse_potential: Reuse potential label (e.g. 'High', 'None').

    Returns:
        dict with keys: material, waste_category, recyclability, reuse_potential, recommendations (List[str])
    """
    mat_key  = material.strip().lower()
    cat_key  = category.strip().lower()
    dam_key  = damage.strip().lower()
    cont_key = contamination.strip().lower()

    recommendations: List[str] = []

    # ── 1. Category overrides take priority (hazardous, compostable, upcyclable) ──
    if cat_key in CATEGORY_RECS:
        recommendations.extend(CATEGORY_RECS[cat_key])

    # ── 2. Material-specific recs ─────────────────────────────────────────────
    mat_recs = MATERIAL_RECS.get(mat_key)
    if mat_recs:
        is_damaged = any(d in dam_key for d in ("heavy", "moderate", "wear", "moderate"))
        recs = mat_recs["damaged"] if is_damaged else mat_recs["clean"]
        for rec in recs:
            if rec not in recommendations:
                recommendations.append(rec)

    # ── 3. Fallback for unknown materials ────────────────────────────────────
    if not recommendations:
        if cat_key in ("reusable", "repairable"):
            recommendations.append("Donate functional items to certified textile charity collections.")
            recommendations.append("Assess repair feasibility — even minor repairs can restore resale value.")
        elif cat_key == "recyclable":
            recommendations.append("Route to a certified mechanical textile recycling facility.")
            recommendations.append("Ensure fibres are clean and dry before baling for collection.")
        else:
            recommendations.append("Contact your local authority for textile waste disposal guidance.")

    # ── 4. Damage-level addition ──────────────────────────────────────────────
    for dam_level, msg in DAMAGE_ADDITIONS.items():
        if dam_level in dam_key and msg not in recommendations:
            recommendations.insert(0, msg)
            break

    # ── 5. Contamination addition ─────────────────────────────────────────────
    for cont_level, msg in CONTAMINATION_ADDITIONS.items():
        if cont_level in cont_key and msg not in recommendations:
            recommendations.insert(0 if "high" in cont_key else 1, msg)
            break

    return {
        "material":        material.strip(),
        "waste_category":  category.strip(),
        "recyclability":   recyclability,
        "reuse_potential": reuse_potential,
        "recommendations": recommendations,
    }
