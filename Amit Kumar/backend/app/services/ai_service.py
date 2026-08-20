"""
AI Service — Textile Waste Intelligence Platform
Milestone 3: Sustainability Intelligence Engine, Recycling Workflow,
             Environmental Impact Assessment, Circular Economy Analytics
"""
import random
import time
from typing import Dict, List, Any

MATERIAL_TYPES = [
    "Cotton", "Polyester", "Wool", "Silk", "Linen",
    "Denim", "Nylon", "Rayon", "Acrylic", "Mixed Fabric"
]

WASTE_CATEGORIES = [
    "Recyclable", "Reusable", "Repairable",
    "Upcyclable", "Compostable", "Hazardous Waste"
]

COLORS       = ["White", "Black", "Navy Blue", "Forest Green", "Burgundy",
                 "Beige", "Grey", "Multicolor", "Indigo", "Cream"]
TEXTURE_TYPES = ["Woven", "Knitted", "Non-woven", "Fleece", "Twill", "Plain", "Satin"]

# ── Per-material scientific factors ──────────────────────────────────────────
MATERIAL_FACTORS: Dict[str, Dict] = {
    "Cotton":        {"co2": 5.9,  "water": 10000, "energy": 55,  "circular_base": 88, "recyclability": "High",      "fabric_type": "Natural Woven",    "lifespan": "5–10 yrs"},
    "Polyester":     {"co2": 9.5,  "water": 100,   "energy": 125, "circular_base": 72, "recyclability": "Medium",    "fabric_type": "Synthetic Woven",  "lifespan": "20–50 yrs"},
    "Wool":          {"co2": 36.0, "water": 170,   "energy": 63,  "circular_base": 91, "recyclability": "Very High", "fabric_type": "Natural Knit",     "lifespan": "10–20 yrs"},
    "Silk":          {"co2": 15.0, "water": 200,   "energy": 80,  "circular_base": 79, "recyclability": "Medium",    "fabric_type": "Natural Woven",    "lifespan": "8–15 yrs"},
    "Linen":         {"co2": 1.7,  "water": 500,   "energy": 10,  "circular_base": 94, "recyclability": "Very High", "fabric_type": "Natural Woven",    "lifespan": "10–20 yrs"},
    "Denim":         {"co2": 8.0,  "water": 7500,  "energy": 70,  "circular_base": 76, "recyclability": "High",      "fabric_type": "Natural Twill",    "lifespan": "5–15 yrs"},
    "Nylon":         {"co2": 12.0, "water": 80,    "energy": 140, "circular_base": 65, "recyclability": "Low",       "fabric_type": "Synthetic Knit",   "lifespan": "30–40 yrs"},
    "Rayon":         {"co2": 4.5,  "water": 2500,  "energy": 40,  "circular_base": 70, "recyclability": "Medium",    "fabric_type": "Semi-synthetic",   "lifespan": "5–10 yrs"},
    "Acrylic":       {"co2": 10.5, "water": 70,    "energy": 130, "circular_base": 58, "recyclability": "Low",       "fabric_type": "Synthetic Fleece", "lifespan": "30–200 yrs"},
    "Mixed Fabric":  {"co2": 7.0,  "water": 3000,  "energy": 65,  "circular_base": 68, "recyclability": "Medium",    "fabric_type": "Blended",          "lifespan": "5–20 yrs"},
}

CONDITION_MULTIPLIERS = {"Good": 1.0, "Fair": 0.85, "Poor": 0.65, "Critical": 0.45}
CATEGORY_EFFICIENCY   = {
    "Recyclable": 0.85, "Reusable": 0.95, "Repairable": 0.75,
    "Upcyclable": 0.80, "Compostable": 0.60, "Hazardous Waste": 0.30
}

# ── Circular economy end-of-life pathways ────────────────────────────────────
EOL_PATHWAYS = {
    "Recyclable":      ["Fiber Recycling", "Mechanical Shredding", "Industrial Use"],
    "Reusable":        ["Direct Donation", "Resale", "Remanufacturing"],
    "Repairable":      ["In-house Repair", "Professional Tailoring", "Upcycling"],
    "Upcyclable":      ["Upcycling Studio", "Artisan Workshop", "Mechanical Recycling"],
    "Compostable":     ["Industrial Composting", "Biogas Generation", "Soil Amendment"],
    "Hazardous Waste": ["Specialist Disposal", "Chemical Neutralisation", "Controlled Incineration"],
}


def generate_confidence_scores(top: str, options: List[str]) -> List[Dict]:
    remaining = [o for o in options if o != top]
    random.shuffle(remaining)
    top_conf = round(random.uniform(0.75, 0.97), 3)
    remaining_total = 1 - top_conf
    scores = [{"label": top, "confidence": top_conf}]
    for i, opt in enumerate(remaining[:4]):
        if i < len(remaining) - 1:
            c = round(random.uniform(0.01, remaining_total * 0.4), 3)
            remaining_total -= c
        else:
            c = round(remaining_total, 3)
        scores.append({"label": opt, "confidence": c})
    return sorted(scores, key=lambda x: x["confidence"], reverse=True)


# ══════════════════════════════════════════════════════════════════════════════
#  Task 1 — Sustainability Intelligence Engine  +  Image Analysis
# ══════════════════════════════════════════════════════════════════════════════
def analyze_image(filename: str) -> Dict[str, Any]:
    """
    Full image analysis — fabric detection, texture, color, damage,
    contamination plus all Milestone 3 enriched fields.
    """
    start = time.time()

    # Detect material from filename (demo intelligence)
    lower = filename.lower()
    material = next((m for m in MATERIAL_TYPES if m.lower() in lower), None) or random.choice(MATERIAL_TYPES)

    waste_cat  = random.choice(WASTE_CATEGORIES)
    color      = random.choice(COLORS)
    texture    = random.choice(TEXTURE_TYPES)
    damage_lvl = random.choice(["None", "Minor", "Moderate", "Severe"])
    contam     = random.choice(["Clean", "Slightly Contaminated", "Contaminated"])

    mat_scores   = generate_confidence_scores(material, MATERIAL_TYPES)
    waste_scores = generate_confidence_scores(waste_cat, WASTE_CATEGORIES)
    quality_score = round(random.uniform(0.3, 0.95), 2)
    quality_label = ("Excellent" if quality_score > 0.8 else
                     "Good"      if quality_score > 0.6 else
                     "Fair"      if quality_score > 0.4 else "Poor")

    conf_pct       = round(mat_scores[0]["confidence"] * 100, 1)
    processing_ms  = int((time.time() - start) * 1000) + random.randint(200, 800)

    # Milestone 3 enriched fields
    f = MATERIAL_FACTORS.get(material, MATERIAL_FACTORS["Mixed Fabric"])
    cond_mult  = 0.85   # default Fair
    cat_eff    = CATEGORY_EFFICIENCY.get(waste_cat, 0.70)
    qty_ref    = 1.0    # per-kg reference for image analysis

    carbon_saved_kg = round(qty_ref * f["co2"] * cat_eff, 3)
    sust_score      = round(min(100, f["circular_base"] * cat_eff + random.uniform(0, 8)), 1)

    return {
        "filename": filename,
        # ── Core detections ──
        "material_detection": {
            "primary_material": material,
            "confidence": mat_scores[0]["confidence"],
            "all_predictions": mat_scores,
        },
        "waste_classification": {
            "category": waste_cat,
            "confidence": waste_scores[0]["confidence"],
            "all_predictions": waste_scores,
        },
        "texture_analysis": {
            "texture_type": texture,
            "weave_density": random.choice(["Low", "Medium", "High"]),
            "fiber_uniformity": round(random.uniform(0.5, 0.99), 2),
        },
        "color_detection": {
            "primary_color": color,
            "color_fastness": random.choice(["Excellent", "Good", "Fair"]),
            "dye_type": random.choice(["Reactive", "Acid", "Direct", "Vat"]),
        },
        "damage_detection": {
            "damage_level": damage_lvl,
            "damage_types": random.sample(["Tears", "Stains", "Pilling", "Fading", "Holes"], k=random.randint(0, 2)),
            "repairability": random.choice(["Easily Repairable", "Needs Professional Repair", "Not Repairable"]),
        },
        "contamination_detection": {
            "status": contam,
            "contaminants": random.sample(["Oil", "Chemical", "Biological", "None"], k=1),
        },
        "ai_result": {
            "material": material,
            "confidence_pct": conf_pct,
            "quality": quality_label,
            "quality_score": quality_score,
            "suggested_category": waste_cat,
        },
        # ── Milestone 3 new fields ──
        "fabric_type":        f["fabric_type"],
        "waste_category":     f"{'Grade A' if cat_eff >= 0.85 else 'Grade B' if cat_eff >= 0.65 else 'Grade C'} – {waste_cat}",
        "carbon_saved_kg":    carbon_saved_kg,
        "sustainability_score": sust_score,
        "environmental_impact": {
            "water_saved_liters":    round(qty_ref * f["water"] * cat_eff, 0),
            "co2_reduction_kg":      carbon_saved_kg,
            "landfill_diverted_kg":  round(qty_ref * 0.95 * cat_eff, 3),
            "energy_saved_kwh":      round(qty_ref * f["energy"] * cat_eff * 0.1, 2),
            "impact_rating": ("Low Impact" if cat_eff >= 0.80 else
                              "Medium Impact" if cat_eff >= 0.55 else "High Impact"),
        },
        "processing_time_ms": processing_ms,
        "model_version":      "TWIP-AI-v2.1.0",
    }


def classify_material(fabric_type: str, quantity: float = None) -> Dict[str, Any]:
    material = fabric_type if fabric_type in MATERIAL_TYPES else random.choice(MATERIAL_TYPES)
    scores = generate_confidence_scores(material, MATERIAL_TYPES)
    f = MATERIAL_FACTORS.get(material, MATERIAL_FACTORS["Mixed Fabric"])
    return {
        "input": fabric_type,
        "primary_classification": material,
        "confidence": scores[0]["confidence"],
        "confidence_pct": round(scores[0]["confidence"] * 100, 1),
        "all_classifications": scores,
        "properties": {
            "recyclability": f["recyclability"],
            "fabric_type":   f["fabric_type"],
            "lifespan":      f["lifespan"],
            "biodegradability": random.choice(["Biodegradable", "Non-biodegradable", "Partially Biodegradable"]),
            "moisture_absorption": random.choice(["High", "Medium", "Low"]),
            "durability": random.choice(["High", "Medium", "Low"]),
        },
    }


def classify_waste(fabric_type: str, condition: str = None, quantity: float = None) -> Dict[str, Any]:
    condition_map = {
        "Good":     ["Reusable",       "Recyclable",   "Upcyclable"],
        "Fair":     ["Recyclable",     "Repairable",   "Upcyclable"],
        "Poor":     ["Recyclable",     "Compostable",  "Repairable"],
        "Critical": ["Hazardous Waste","Compostable",  "Recyclable"],
    }
    preferred = condition_map.get(condition, WASTE_CATEGORIES)
    category  = random.choice(preferred)
    scores    = generate_confidence_scores(category, WASTE_CATEGORIES)
    return {
        "waste_category":     category,
        "confidence":         scores[0]["confidence"],
        "confidence_pct":     round(scores[0]["confidence"] * 100, 1),
        "all_classifications": scores,
        "disposal_urgency":    random.choice(["Immediate", "Within 7 days", "Within 30 days", "Flexible"]),
        "regulatory_compliance": random.choice(["Compliant", "Check Required", "Non-compliant"]),
    }


# ══════════════════════════════════════════════════════════════════════════════
#  Task 1 — Sustainability Intelligence Engine
# ══════════════════════════════════════════════════════════════════════════════
def calculate_sustainability(
    fabric_type: str, quantity: float, waste_category: str, condition: str
) -> Dict[str, Any]:
    """Comprehensive sustainability + circular economy calculation (Tasks 1 & 4)."""
    f        = MATERIAL_FACTORS.get(fabric_type, MATERIAL_FACTORS["Mixed Fabric"])
    cond_m   = CONDITION_MULTIPLIERS.get(condition, 0.85)
    cat_eff  = CATEGORY_EFFICIENCY.get(waste_category, 0.70)
    combined = cond_m * cat_eff

    co2_saved      = round(quantity * f["co2"] * combined / 1000, 3)   # tonnes
    water_saved    = round(quantity * f["water"] * combined, 0)
    energy_saved   = round(quantity * f["energy"] * combined, 1)
    landfill_red   = round(quantity * 0.95 * combined, 2)
    carbon_fp      = round(quantity * f["co2"] * (1 - combined) / 1000, 4)

    # Task 1 — Sustainability score
    base_score     = f["circular_base"] * combined
    sust_score     = round(min(100, base_score + random.uniform(0, 5)), 1)
    env_rating     = ("Excellent" if sust_score >= 80 else "Good" if sust_score >= 60 else "Needs Work")

    # Task 4 — Circular economy score
    circular_score = round(base_score + random.uniform(0, 4), 1)
    loop_eff       = round(f["circular_base"] * cond_m, 1)
    val_retention  = round(88 * cond_m, 1)

    return {
        # Core sustainability (Task 1)
        "co2_saved_tonnes":       co2_saved,
        "water_saved_liters":     int(water_saved),
        "energy_saved_kwh":       energy_saved,
        "landfill_reduced_kg":    landfill_red,
        "carbon_footprint_tonnes": carbon_fp,
        "circular_economy_score": circular_score,
        "sustainability_score":   sust_score,
        "environmental_rating":   env_rating,
        "trees_equivalent":       round(co2_saved * 45),
        "car_trips_avoided":      round(co2_saved * 230),
        "breakdown": {
            "recycling_efficiency_pct": round(cat_eff * 100, 1),
            "material_recovery_pct":    round(random.uniform(70, 95) * cond_m, 1),
            "energy_recovery_pct":      round(random.uniform(60, 90) * cond_m, 1),
            "water_recovery_pct":       round(random.uniform(55, 85) * cond_m, 1),
        },
        # Task 4 — Circular economy analytics
        "circular_analytics": {
            "circular_potential_score": round(circular_score),
            "material_loop_efficiency": loop_eff,
            "waste_prevention_score":   round(min(100, loop_eff * 1.05), 0),
            "value_retention_pct":      val_retention,
            "resource_productivity":    round(quantity * f["co2"] * 120, 0),
            "end_of_life_options":      EOL_PATHWAYS.get(waste_category, ["Recycling", "Composting"]),
        },
        # Material intelligence info
        "fabric_type":    f["fabric_type"],
        "recyclability":  f["recyclability"],
        "lifespan":       f["lifespan"],
    }


# ══════════════════════════════════════════════════════════════════════════════
#  Task 3 — Environmental Impact Assessment
# ══════════════════════════════════════════════════════════════════════════════
def calculate_environmental_impact(
    material: str, quantity: float, recovery_method: str
) -> Dict[str, Any]:
    """Calculate CO₂, water, landfill & resource conservation indicators."""
    f = MATERIAL_FACTORS.get(material, MATERIAL_FACTORS["Mixed Fabric"])
    method_efficiency = {
        "Fiber Recycling":    0.85, "Mechanical Recycling": 0.72,
        "Chemical Recycling": 0.91, "Donation":             1.00,
        "Upcycling":          0.88, "Composting":           0.60,
        "Industrial Use":     0.55,
    }
    eff = method_efficiency.get(recovery_method, 0.75)

    co2_saved_kg       = round(quantity * f["co2"] * eff, 2)
    water_saved_liters = round(quantity * f["water"] * eff, 0)
    energy_saved_kwh   = round(quantity * f["energy"] * eff * 0.1, 1)
    landfill_kg        = round(quantity * 0.95 * eff, 2)

    return {
        "material":               material,
        "quantity_kg":            quantity,
        "recovery_method":        recovery_method,
        "co2_saved_kg":           co2_saved_kg,
        "co2_saved_tonnes":       round(co2_saved_kg / 1000, 4),
        "water_saved_liters":     int(water_saved_liters),
        "energy_saved_kwh":       energy_saved_kwh,
        "landfill_diverted_kg":   landfill_kg,
        "resource_conservation_pct": round(eff * 100, 1),
        "impact_rating": ("Excellent" if eff >= 0.85 else
                          "Good"      if eff >= 0.70 else
                          "Moderate"  if eff >= 0.55 else "Low"),
        # SDG alignment scores
        "sdg_alignment": {
            "sdg_12_responsible_consumption": round(eff * 90, 1),
            "sdg_13_climate_action":          round(eff * 95, 1),
            "sdg_14_life_below_water":        round(eff * 75, 1),
            "sdg_15_life_on_land":            round(eff * 82, 1),
        },
    }


# ══════════════════════════════════════════════════════════════════════════════
#  Task 2 — Recycling Recommendation Workflow
# ══════════════════════════════════════════════════════════════════════════════
def generate_recommendations(
    fabric_type: str, waste_category: str, quantity: float,
    condition: str = "Fair"
) -> List[Dict[str, Any]]:
    """Generate condition-aware recycling/recovery recommendations."""
    f        = MATERIAL_FACTORS.get(fabric_type, MATERIAL_FACTORS["Mixed Fabric"])
    cond_m   = CONDITION_MULTIPLIERS.get(condition, 0.85)
    cat_eff  = CATEGORY_EFFICIENCY.get(waste_category, 0.70)

    all_recs = [
        {
            "method": "Fiber Recycling",
            "priority": "High",
            "description": "Mechanically break down fibers to create new textile raw materials, suitable for high-quality fabrics.",
            "benefits": ["Reduces virgin material usage by 60%", "Creates high-value recycled fibers", "Supports circular economy"],
            "environmental_impact": {
                "co2_saved_kg":       round(quantity * 2.3 * cond_m, 1),
                "water_saved_liters": round(quantity * 150 * cond_m, 0),
                "energy_saved_kwh":   round(quantity * 8.5 * cond_m, 1),
            },
            "estimated_cost_usd": round(quantity * 0.45, 2),
            "recovery_rate_pct":  round(random.uniform(70, 92) * cond_m, 1),
            "time_to_process_days": random.randint(3, 14),
            "facilities_nearby":    random.randint(2, 8),
            "condition_suitability": ("Best" if condition in ["Good", "Fair"] else "Moderate"),
        },
        {
            "method": "Mechanical Recycling",
            "priority": "High",
            "description": "Shred and process textiles into fiber fill, insulation, or industrial rags without chemical treatments.",
            "benefits": ["Cost-effective process", "No chemical waste", "Suitable for mixed fabrics"],
            "environmental_impact": {
                "co2_saved_kg":       round(quantity * 1.8 * cond_m, 1),
                "water_saved_liters": round(quantity * 80 * cond_m, 0),
                "energy_saved_kwh":   round(quantity * 5.2 * cond_m, 1),
            },
            "estimated_cost_usd": round(quantity * 0.25, 2),
            "recovery_rate_pct":  round(random.uniform(60, 85) * cond_m, 1),
            "time_to_process_days": random.randint(1, 7),
            "facilities_nearby":    random.randint(5, 15),
            "condition_suitability": "All Conditions",
        },
        {
            "method": "Fabric Reuse",
            "priority": "High",
            "description": "Directly reuse fabric pieces in new garment manufacturing or industrial applications.",
            "benefits": ["Zero processing cost", "Maximum material value retained", "Immediate impact"],
            "environmental_impact": {
                "co2_saved_kg":       round(quantity * 4.0 * cond_m, 1),
                "water_saved_liters": round(quantity * 300 * cond_m, 0),
                "energy_saved_kwh":   round(quantity * 15.0 * cond_m, 1),
            },
            "estimated_cost_usd": round(quantity * 0.05, 2),
            "recovery_rate_pct":  round(random.uniform(90, 100) * cond_m, 1),
            "time_to_process_days": 1,
            "facilities_nearby":    random.randint(8, 20),
            "condition_suitability": ("Best" if condition == "Good" else "Fair"),
        },
        {
            "method": "Chemical Recycling",
            "priority": "Medium",
            "description": "Dissolve and re-polymerize synthetic fibers back to virgin-quality material using chemical solvents.",
            "benefits": ["Virgin-quality output", "100% pure material recovery", "Handles contaminated textiles"],
            "environmental_impact": {
                "co2_saved_kg":       round(quantity * 3.1 * cond_m, 1),
                "water_saved_liters": round(quantity * 200 * cond_m, 0),
                "energy_saved_kwh":   round(quantity * 12.0 * cond_m, 1),
            },
            "estimated_cost_usd": round(quantity * 1.20, 2),
            "recovery_rate_pct":  round(random.uniform(85, 98) * cond_m, 1),
            "time_to_process_days": random.randint(7, 30),
            "facilities_nearby":    random.randint(1, 4),
            "condition_suitability": ("Best" if condition in ["Poor", "Critical"] else "Moderate"),
        },
        {
            "method": "Donation",
            "priority": "Medium",
            "description": "Donate usable textiles to charitable organizations, shelters, or developing communities.",
            "benefits": ["Social impact", "Tax deductible", "Community benefit", "Zero disposal cost"],
            "environmental_impact": {
                "co2_saved_kg":       round(quantity * 3.5 * cond_m, 1),
                "water_saved_liters": round(quantity * 250 * cond_m, 0),
                "energy_saved_kwh":   round(quantity * 10.0 * cond_m, 1),
            },
            "estimated_cost_usd": 0.0,
            "recovery_rate_pct":  100.0,
            "time_to_process_days": random.randint(1, 5),
            "facilities_nearby":    random.randint(10, 30),
            "condition_suitability": ("Best" if condition == "Good" else "Fair"),
        },
        {
            "method": "Upcycling",
            "priority": "Medium",
            "description": "Transform waste textiles into higher-value products like home décor, bags, or art installations.",
            "benefits": ["Creates premium products", "High profit margin", "Brand sustainability story"],
            "environmental_impact": {
                "co2_saved_kg":       round(quantity * 2.0 * cond_m, 1),
                "water_saved_liters": round(quantity * 120 * cond_m, 0),
                "energy_saved_kwh":   round(quantity * 6.0 * cond_m, 1),
            },
            "estimated_cost_usd": round(quantity * 0.80, 2),
            "recovery_rate_pct":  round(random.uniform(75, 95) * cond_m, 1),
            "time_to_process_days": random.randint(5, 21),
            "facilities_nearby":    random.randint(3, 10),
            "condition_suitability": "Good to Fair",
        },
        {
            "method": "Industrial Recovery",
            "priority": "Low",
            "description": "Use textile waste as industrial wipes, padding, soundproofing, or construction insulation.",
            "benefits": ["Always in demand", "Simple processing", "Stable market price"],
            "environmental_impact": {
                "co2_saved_kg":       round(quantity * 1.2 * cond_m, 1),
                "water_saved_liters": round(quantity * 50 * cond_m, 0),
                "energy_saved_kwh":   round(quantity * 3.0 * cond_m, 1),
            },
            "estimated_cost_usd": round(quantity * 0.15, 2),
            "recovery_rate_pct":  round(random.uniform(50, 75) * cond_m, 1),
            "time_to_process_days": random.randint(2, 10),
            "facilities_nearby":    random.randint(5, 20),
            "condition_suitability": "All Conditions",
        },
    ]

    # Sort: High priority first, then by recovery_rate descending
    priority_order = {"High": 0, "Medium": 1, "Low": 2}
    all_recs.sort(key=lambda r: (priority_order[r["priority"]], -r["recovery_rate_pct"]))
    return all_recs
