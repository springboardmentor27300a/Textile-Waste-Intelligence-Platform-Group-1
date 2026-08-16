"""
Sustainability Intelligence Service — Milestone 3
===================================================
Contains calculation algorithms for:
1. Recycling recommendations based on material properties & condition
2. Sustainability scores & AI-powered insights
3. Environmental savings estimations (CO2, water, energy)
4. Circular economy scores (radar metrics & classification)
5. Comprehensive sustainability reports and dashboard stats
"""

import os
import json
import uuid
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.prediction import Prediction
from app.models.sustainability import (
    SustainabilityAnalysis,
    RecyclingRecommendation,
    EnvironmentalImpact,
    CircularityScore,
    SustainabilityReport,
)
from app.models.user import User
from app.database.session import engine

logger = logging.getLogger(__name__)

_is_postgres = "postgresql" in str(engine.url)

WEIGHTS_FILE = os.path.join(os.path.dirname(__file__), "weights.json")

def load_weights() -> dict:
    default_weights = {
        "material_recyclability": 0.35,
        "material_condition": 0.20,
        "reuse_potential": 0.20,
        "environmental_benefit": 0.15,
        "processing_feasibility": 0.10
    }
    if not os.path.exists(WEIGHTS_FILE):
        try:
            with open(WEIGHTS_FILE, "w") as f:
                json.dump(default_weights, f, indent=2)
        except Exception:
            pass
        return default_weights
    try:
        with open(WEIGHTS_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return default_weights


def _coerce_id(val):
    """Convert an ID value to the correct type for the database dialect."""
    if val is None:
        return None
    if _is_postgres:
        if isinstance(val, uuid.UUID):
            return val
        return uuid.UUID(str(val))
    else:
        return str(val)


# ─── ENVIRONMENTAL IMPACT COEFFICIENTS (Per kg of material) ───────────────────
# Source: Circular economy and textile waste studies (average metrics)
IMPACT_COEFFICIENTS = {
    "Cotton": {
        "co2": 2.6,        # kg CO2 saved per kg recycled
        "water": 2500.0,   # Liters saved per kg recycled
        "energy": 15.0,    # kWh saved per kg recycled
        "resource": 1.2    # kg of new cotton crops/pesticides avoided
    },
    "Denim": {
        "co2": 2.8,
        "water": 2900.0,
        "energy": 16.0,
        "resource": 1.3
    },
    "Polyester": {
        "co2": 1.8,        # lower than cotton, but avoids fossil fuels
        "water": 50.0,     # polyester is not water-heavy in growth, but recycling saves oil
        "energy": 24.0,    # high energy savings from not refining new crude oil
        "resource": 1.5    # kg petroleum raw material saved
    },
    "Nylon": {
        "co2": 2.2,
        "water": 80.0,
        "energy": 28.0,
        "resource": 1.6
    },
    "Wool": {
        "co2": 3.5,        # high carbon footprint of sheep farming
        "water": 800.0,
        "energy": 18.0,
        "resource": 1.1
    },
    "Silk": {
        "co2": 3.2,
        "water": 1000.0,
        "energy": 14.0,
        "resource": 1.0
    },
    "Linen": {
        "co2": 2.4,
        "water": 600.0,
        "energy": 12.0,
        "resource": 1.2
    },
    "Rayon": {
        "co2": 2.0,
        "water": 450.0,
        "energy": 16.0,
        "resource": 1.4
    },
    "Acrylic": {
        "co2": 1.9,
        "water": 60.0,
        "energy": 22.0,
        "resource": 1.5
    },
    "Mixed": {
        "co2": 2.1,
        "water": 600.0,
        "energy": 18.0,
        "resource": 1.2
    },
    "Default": {
        "co2": 2.0,
        "water": 500.0,
        "energy": 18.0,
        "resource": 1.2
    }
}


class SustainabilityService:
    """Core analytical calculations & persistence service."""

    @staticmethod
    def generate_recommendations(
        material: str,
        waste_category: str,
        recyclability_score: float,
        recovery_difficulty: str,
        condition: Optional[dict] = None
    ) -> List[Dict[str, Any]]:
        """Generates appropriate circular recovery recommendations based on heuristics."""
        recs = []

        is_natural = material in ["Cotton", "Denim", "Wool", "Silk", "Linen", "Rayon"]
        is_synthetic = material in ["Polyester", "Nylon", "Acrylic"]
        difficulty = (recovery_difficulty or "Medium").capitalize()
        score = recyclability_score or 75.0

        has_tears = False
        has_damage = False
        has_contamination = False
        surface_quality = "Good"

        if condition:
            has_tears = condition.get("tear_detected", False) or condition.get("visible_damage", False)
            has_damage = condition.get("visible_damage", False)
            has_contamination = condition.get("contamination_detected", False)
            surface_quality = condition.get("surface_quality", "Good")

        # 1. Garment Repair & Reuse
        if waste_category in ["Reusable", "Repairable"] and not has_contamination:
            if has_tears or has_damage or surface_quality == "Fair":
                recs.append({
                    "recovery_method": "Garment Repair",
                    "recovery_priority": "High",
                    "difficulty_level": "Medium",
                    "estimated_success": 85.0,
                    "reason": "The textile exhibits moderate localized tear/wrinkle issues but retains strong fiber structure, allowing restoration via repair.",
                    "required_processing": "Stitching tears, patching panels, and steam finishing.",
                    "industry_use_cases": "Corporate takeback programs, vintage resale markets, and circular brands.",
                    "industry_applications": "Secondhand consumer marketplaces, apparel restoration shops, and corporate uniform hubs.",
                    "expected_output": "Restored ready-to-wear apparel.",
                    "environmental_benefit": "Reduces virgin garment consumption and direct manufacturing carbon offsets.",
                    "estimated_cost": "Low",
                    "estimated_time": "1–2 Days"
                })
            else:
                recs.append({
                    "recovery_method": "Fabric Reuse",
                    "recovery_priority": "High",
                    "difficulty_level": "Easy",
                    "estimated_success": 95.0,
                    "reason": "Excellent fabric composition and surface quality permit immediate redistribution for secondary reuse.",
                    "required_processing": "Sorting by color/size, industrial laundering, and rolling into fabric sheets.",
                    "industry_use_cases": "Second-hand clothing markets, deadstock fabric supply lines.",
                    "industry_applications": "Deadstock fabrics distribution, fashion studios, and thrift markets.",
                    "expected_output": "Premium reusable textile rolls.",
                    "environmental_benefit": "Maximum product life extension, completely bypassing processing and spinning carbon emissions.",
                    "estimated_cost": "Low",
                    "estimated_time": "1–2 Days"
                })
                recs.append({
                    "recovery_method": "Donation",
                    "recovery_priority": "High",
                    "difficulty_level": "Easy",
                    "estimated_success": 98.0,
                    "reason": "High-grade garments suitable for cleaning and donation to charity programs.",
                    "required_processing": "Laundering, size sorting, and vacuum packaging.",
                    "industry_use_cases": "Social charity distributions, humanitarian aid kits.",
                    "industry_applications": "Humanitarian relief programs, local charities, and social donation circles.",
                    "expected_output": "Sanitized clothing bags.",
                    "environmental_benefit": "Diverts ready-to-wear apparel from landfill and extends fiber usefulness directly.",
                    "estimated_cost": "Low",
                    "estimated_time": "1–3 Days"
                })

        # 2. Upcycling
        if waste_category in ["Upcyclable", "Reusable", "Repairable"] and not has_contamination:
            recs.append({
                "recovery_method": "Upcycling",
                "recovery_priority": "High" if waste_category == "Upcyclable" else "Medium",
                "difficulty_level": "Medium",
                "estimated_success": 90.0,
                "reason": "The fabric composition is prime feedstock for upcycling into premium designer apparel and artistic reuse accessories.",
                "required_processing": "Creative pattern cutting, structural reinforcement, and artistic redesign.",
                "industry_use_cases": "Designer bags, fashion accessories, patch-work blankets, and custom shoes.",
                "industry_applications": "Artisan labels, patchwork craft designers, and circular accessories brands.",
                "expected_output": "Value-added upcycled products.",
                "environmental_benefit": "Retains aesthetic value while avoiding energy-intensive shredding or chemical extraction.",
                "estimated_cost": "Low",
                "estimated_time": "2–4 Days"
            })

        # 3. Fiber Recycling
        if is_natural and score >= 50 and not has_contamination:
            recs.append({
                "recovery_method": "Fiber Recycling",
                "recovery_priority": "High" if score >= 75 else "Medium",
                "difficulty_level": "Medium",
                "estimated_success": score - 2.0,
                "reason": "High confidence natural material composition enables high-yield fiber extraction and carding for new yarn.",
                "required_processing": "Sorting, industrial shredding, carding, and spinning into organic fibers.",
                "industry_use_cases": "Textile spinning mills, organic apparel brands.",
                "industry_applications": "Textile spinners, industrial fiber carders, and yarn supply lines.",
                "expected_output": "Recycled organic natural fibers.",
                "environmental_benefit": "Diverts natural organic waste, preserving raw cotton, wool, or linen materials.",
                "estimated_cost": "Medium",
                "estimated_time": "3–5 Days"
            })

        # 4. Mechanical Recycling
        if waste_category in ["Recyclable", "Reusable", "Repairable", "Upcyclable"] and not has_contamination:
            if score >= 40:
                priority = "High" if (score >= 75 and is_natural) else "Medium"
                recs.append({
                    "recovery_method": "Mechanical Recycling",
                    "recovery_priority": priority,
                    "difficulty_level": "Easy" if difficulty == "Easy" else "Medium",
                    "estimated_success": score - 5.0,
                    "reason": "The recyclability score and low contamination levels permit carding and mechanical shredding for industrial insulation or secondary yarn.",
                    "required_processing": "Metal sorting (removing zippers/buttons), tearing, shredding, and fiber carding.",
                    "industry_use_cases": "Home insulation, acoustic dampening panels, furniture stuffing, and cleaning rugs.",
                    "industry_applications": "Automotive acoustic dampening, building insulation manufacturers, and cushion fillers.",
                    "expected_output": "Shredded insulation felt and coarse secondary yarn.",
                    "environmental_benefit": "Reduces virgin fiber spinning needs, saving carbon and processing water.",
                    "estimated_cost": "Low",
                    "estimated_time": "2–4 Days"
                })

        # 5. Chemical Recycling
        if waste_category in ["Recyclable", "Upcyclable"] and (is_synthetic or material == "Mixed"):
            if score >= 60 and not has_contamination:
                recs.append({
                    "recovery_method": "Chemical Recycling",
                    "recovery_priority": "High" if is_synthetic else "Medium",
                    "difficulty_level": "Hard",
                    "estimated_success": 88.0,
                    "reason": "Synthetic compositions (polyester, nylon, acrylic) require depolymerization to break down polymers into virgin-equivalent raw chemicals.",
                    "required_processing": "Solvent dissolution, molecular depolymerization, purification, and repolymerization.",
                    "industry_use_cases": "Virgin-quality recycled activewear, high-performance athletic footwear, and carpet filaments.",
                    "industry_applications": "Polymer fiber plants, high-performance sportswear lines, and technical textile mills.",
                    "expected_output": "Recycled Polyester (rPET) or Recycled Nylon chips.",
                    "environmental_benefit": "Closes synthetic loops, reducing virgin oil feedstock consumption and carbon emission.",
                    "estimated_cost": "High",
                    "estimated_time": "5–7 Days"
                })

        # 6. Composting
        if is_natural and (waste_category == "Compostable" or (score < 40 and surface_quality == "Poor")):
            recs.append({
                "recovery_method": "Composting",
                "recovery_priority": "Medium",
                "difficulty_level": "Easy",
                "estimated_success": 95.0,
                "reason": "100% natural fiber composition makes this organic waste fully compostable for agricultural soils.",
                "required_processing": "Shredding into micro-fibers, mixing with brown/green carbon layers, and moisture regulation.",
                "industry_use_cases": "Agricultural soil conditioning, commercial landscaping, and carbon sequestration soils.",
                "industry_applications": "Commercial composting facilities, organic farms, and municipal landscaping.",
                "expected_output": "Nutrient-rich soil compost (100% biodegradable).",
                "environmental_benefit": "Returns organic nutrients to agricultural topsoils, promoting natural carbon sequestration.",
                "estimated_cost": "Low",
                "estimated_time": "4–6 Weeks"
            })

        # 7. Industrial Recovery
        if has_contamination or score < 30 or waste_category == "Hazardous Textile Waste":
            recs.append({
                "recovery_method": "Industrial Recovery",
                "recovery_priority": "Medium",
                "difficulty_level": "Medium",
                "estimated_success": 80.0,
                "reason": "High contamination rates or low material grade necessitate industrial recovery for refuse-derived fuel (RDF) or thermal processing.",
                "required_processing": "Refuse shredding, moisture extraction, and thermal pellet conversion.",
                "industry_use_cases": "Co-combustion energy production, industrial boilers.",
                "industry_applications": "Co-combustion power generation plants, cement kilns, and industrial heat utilities.",
                "expected_output": "Solid waste-derived fuels and heat output.",
                "environmental_benefit": "Diverts low-grade contaminated refuse from landfills, reclaiming waste energy value.",
                "estimated_cost": "Medium",
                "estimated_time": "3–5 Days"
            })

        # 8. Safe Disposal
        if waste_category == "Hazardous Textile Waste" or has_contamination or (score < 30 and not is_natural):
            recs.append({
                "recovery_method": "Safe Disposal",
                "recovery_priority": "Critical",
                "difficulty_level": "Easy",
                "estimated_success": 100.0,
                "reason": "Presence of hazardous contamination or non-recyclable complex blends limits recovery, recommending safe controlled disposal.",
                "required_processing": "Containment isolation, high-temperature incineration with flue gas scrubbing, or secure landfilling.",
                "industry_use_cases": "Certified industrial hazardous waste disposal facilities.",
                "industry_applications": "Secure landfill storage and certified chemical waste plants.",
                "expected_output": "Stabilized ash / sequestered waste residues.",
                "environmental_benefit": "Contains toxic or hazardous materials safely, preventing environmental leaching.",
                "estimated_cost": "Medium",
                "estimated_time": "1–2 Days"
            })

        # Default fallbacks to ensure recommendations are always returned
        if not recs:
            recs.append({
                "recovery_method": "Mechanical Shredding",
                "recovery_priority": "Medium",
                "difficulty_level": "Medium",
                "estimated_success": 70.0,
                "reason": "Low-grade fiber length or recyclability rating dictates mechanical shredding for utility rags.",
                "required_processing": "General shredding and fiber carding.",
                "industry_use_cases": "Utility rags and mattress stuffing.",
                "industry_applications": "Automotive insulation, cleaning rag suppliers.",
                "expected_output": "Shredded secondary rags.",
                "environmental_benefit": "Reclaims fiber structure for mattress padding or utility rags.",
                "estimated_cost": "Low",
                "estimated_time": "2–3 Days"
            })

        return recs

    @staticmethod
    def calculate_sustainability_metrics(
        material: str,
        waste_category: str,
        recyclability_score: float,
        recovery_difficulty: str
    ) -> Dict[str, Any]:
        """Calculates granular sustainability scores and synthesizes insights."""
        score = recyclability_score or 75.0
        difficulty = (recovery_difficulty or "Medium").capitalize()

        # 1. Base scores
        is_natural = material in ["Cotton", "Denim", "Wool", "Silk", "Linen", "Rayon"]

        # Sustainability Score (Weighted combination of recyclability and material impact)
        sustainability_score = score * 0.7
        if is_natural:
            sustainability_score += 25.0
        else:
            sustainability_score += 10.0

        if waste_category == "Reusable":
            sustainability_score += 10.0
        elif waste_category == "Hazardous Textile Waste":
            sustainability_score -= 30.0

        sustainability_score = max(0.0, min(100.0, sustainability_score))

        # Environmental Benefit Score
        benefit_map = {
            "Reusable": 95.0,
            "Upcyclable": 90.0,
            "Compostable": 88.0,
            "Recyclable": 82.0,
            "Repairable": 78.0,
            "Hazardous Textile Waste": 15.0
        }
        environmental_benefit_score = benefit_map.get(waste_category, 50.0)

        # Resource Recovery Score
        diff_score = 90.0 if difficulty == "Easy" else 70.0 if difficulty == "Medium" else 50.0
        resource_recovery_score = diff_score * 0.7 + score * 0.3

        # Material Longevity Score (Synthetic fibers last longer)
        if material in ["Polyester", "Nylon", "Acrylic"]:
            material_longevity_score = 92.0
        elif material in ["Wool", "Silk"]:
            material_longevity_score = 75.0
        elif material in ["Cotton", "Denim", "Linen"]:
            material_longevity_score = 62.0
        else:
            material_longevity_score = 70.0

        # Waste Diversion Score
        if waste_category == "Hazardous Textile Waste":
            waste_diversion_score = 10.0
        else:
            waste_diversion_score = min(100.0, 70.0 + (score * 0.3))

        # Insights synthesis
        insights = []
        if sustainability_score >= 80:
            insights.append(f"Excellent circular potential. This {material} textile exhibits a high recyclability index.")
        elif sustainability_score >= 50:
            insights.append(f"Moderate circular potential. {material} recovery is recommended through mechanical sorting.")
        else:
            insights.append(f"Limited recovery potential. Careful sorting is required to prevent contamination of local recycling bins.")

        if is_natural:
            insights.append(f"Natural organic composition makes this waste fully biodegradable and eligible for industrial composting.")
        else:
            insights.append(f"Synthetic polymers are non-biodegradable; chemical recycling is preferred to retain synthetic polymers in closed loops.")

        if difficulty == "Easy":
            insights.append("Processing difficulty is low, resulting in a minimal carbon footprint during the reclamation phase.")
        else:
            insights.append("Higher processing complexity requires specialized material sorting facilities to filter zippers, buttons, and blends.")

        return {
            "sustainability_score": round(sustainability_score, 1),
            "environmental_benefit_score": round(environmental_benefit_score, 1),
            "resource_recovery_score": round(resource_recovery_score, 1),
            "material_longevity_score": round(material_longevity_score, 1),
            "waste_diversion_score": round(waste_diversion_score, 1),
            "insights": insights
        }

    @staticmethod
    def assess_environmental_impact(
        material: str,
        waste_category: str,
        weight_kg: float = 100.0
    ) -> Dict[str, Any]:
        """Calculates specific ecological resource savings scaled by batch weight."""
        coef = IMPACT_COEFFICIENTS.get(material, IMPACT_COEFFICIENTS["Default"])

        # If hazardous, zero out savings
        if waste_category == "Hazardous Textile Waste":
            return {
                "co2_saved": 0.0,
                "water_saved": 0.0,
                "energy_saved": 0.0,
                "landfill_diversion": 0.0,
                "resource_conservation": 0.0,
                "equivalent_trees": 0.0,
                "equivalent_electricity": 0.0,
                "equivalent_water_bottles": 0.0,
                "equivalent_household_energy": 0.0
            }

        co2 = coef["co2"] * weight_kg
        water = coef["water"] * weight_kg
        energy = coef["energy"] * weight_kg
        landfill = weight_kg
        conservation = coef["resource"] * weight_kg

        # Equivalents
        # 1 mature tree absorbs ~22kg of CO2 per year
        trees = co2 / 22.0
        # 1 standard US home uses ~30 kWh per day
        electricity = energy / 30.0
        # 500ml water bottles
        water_bottles = water / 0.5
        # 10W LED bulb hours
        bulb_hours = energy * 100.0

        return {
            "co2_saved": round(co2, 2),
            "water_saved": round(water, 2),
            "energy_saved": round(energy, 2),
            "landfill_diversion": round(landfill, 2),
            "resource_conservation": round(conservation, 2),
            "equivalent_trees": round(trees, 1),
            "equivalent_electricity": round(electricity, 1),
            "equivalent_water_bottles": round(water_bottles, 1),
            "equivalent_household_energy": round(bulb_hours, 1)
        }

    @staticmethod
    def calculate_circularity_scores(
        material: str,
        waste_category: str,
        recyclability_score: float,
        recovery_difficulty: str,
        condition: Optional[dict] = None
    ) -> Dict[str, Any]:
        """Computes Circular Economy Index values and classifications based on weights config."""
        # 1. Material Recyclability (35% weight)
        rec_score = recyclability_score or 75.0
        difficulty = (recovery_difficulty or "Medium").capitalize()

        # 2. Material Condition (20% weight)
        if condition:
            cond_score = 95.0
            if condition.get("visible_damage", False):
                cond_score -= 20.0
            if condition.get("contamination_detected", False):
                cond_score -= 30.0
            if condition.get("tear_detected", False):
                cond_score -= 15.0
            if condition.get("wrinkle_detected", False):
                cond_score -= 5.0
            
            sq = condition.get("surface_quality", "Good")
            if sq == "Good":
                cond_score -= 5.0
            elif sq == "Fair":
                cond_score -= 20.0
            elif sq == "Poor":
                cond_score -= 40.0
        else:
            if waste_category == "Reusable":
                cond_score = 95.0
            elif waste_category == "Repairable":
                cond_score = 75.0
            elif waste_category == "Hazardous Textile Waste":
                cond_score = 20.0
            else:
                cond_score = 85.0
        cond_score = max(0.0, min(100.0, cond_score))

        # 3. Reuse Potential (20% weight)
        reuse_map = {
            "Reusable": 95.0,
            "Repairable": 80.0,
            "Upcyclable": 85.0,
            "Recyclable": 60.0,
            "Compostable": 50.0,
            "Hazardous Textile Waste": 5.0
        }
        reuse_score = reuse_map.get(waste_category, 50.0)

        # 4. Environmental Benefit (15% weight)
        benefit_map = {
            "Reusable": 95.0,
            "Upcyclable": 90.0,
            "Compostable": 85.0,
            "Recyclable": 80.0,
            "Repairable": 75.0,
            "Hazardous Textile Waste": 15.0
        }
        benefit_score = benefit_map.get(waste_category, 75.0)

        # 5. Processing Feasibility (10% weight)
        feasibility_map = {
            "Easy": 95.0,
            "Medium": 80.0,
            "Hard": 60.0
        }
        feasibility_score = feasibility_map.get(difficulty, 80.0)

        # Load weights from config
        weights = load_weights()
        w_rec = weights.get("material_recyclability", 0.35)
        w_cond = weights.get("material_condition", 0.20)
        w_reuse = weights.get("reuse_potential", 0.20)
        w_benefit = weights.get("environmental_benefit", 0.15)
        w_feas = weights.get("processing_feasibility", 0.10)

        # Calculate Overall Circularity Score exactly using weights
        overall_score = (
            rec_score * w_rec +
            cond_score * w_cond +
            reuse_score * w_reuse +
            benefit_score * w_benefit +
            feasibility_score * w_feas
        )

        # Classifications
        if overall_score >= 85:
            classification = "Excellent Recovery Potential"
        elif overall_score >= 70:
            classification = "High Recovery Potential"
        elif overall_score >= 50:
            classification = "Moderate Recovery Potential"
        elif overall_score >= 30:
            classification = "Limited Recovery Potential"
        else:
            classification = "Disposal Recommended"

        return {
            "circularity_score": round(overall_score, 1),
            "reuse_potential": round(reuse_score, 1),
            "recovery_efficiency": round(feasibility_score, 1),
            "material_retention": round(cond_score, 1),
            "lifecycle_extension": round(benefit_score, 1),
            "circularity_index": round(overall_score, 1),
            "classification": classification
        }

    @classmethod
    def run_full_analysis(
        cls,
        db: Session,
        user_id,
        prediction_id,
        weight_kg: float = 100.0,
        inventory_id = None
    ) -> Dict[str, Any]:
        """Runs the complete end-to-end analytical workflow for a prediction and saves results."""
        pred = db.query(Prediction).filter(Prediction.id == _coerce_id(prediction_id)).first()
        if not pred:
            raise ValueError(f"Prediction {prediction_id} not found")

        user = db.query(User).filter(User.id == _coerce_id(user_id)).first()
        if not user:
            raise ValueError(f"User {user_id} not found")

        # 1. Fetch condition properties from UploadedImage
        condition = {
            "visible_damage": pred.image.visible_damage if pred.image else False,
            "contamination_detected": pred.image.contamination_detected if pred.image else False,
            "wrinkle_detected": pred.image.wrinkle_detected if pred.image else False,
            "tear_detected": pred.image.tear_detected if pred.image else False,
            "surface_quality": pred.image.surface_quality if pred.image else "Good",
        }

        # 2. Run calculations
        score = pred.recyclability_score or 75.0
        s_data = cls.calculate_sustainability_metrics(
            pred.material, pred.waste_category, score, pred.recovery_difficulty
        )
        recs = cls.generate_recommendations(
            pred.material, pred.waste_category, score, pred.recovery_difficulty, condition
        )
        env = cls.assess_environmental_impact(pred.material, pred.waste_category, weight_kg)
        circ = cls.calculate_circularity_scores(
            pred.material, pred.waste_category, score, pred.recovery_difficulty, condition
        )

        # 3. Save SustainabilityAnalysis record
        # Check if analysis already exists for this prediction to avoid duplicates
        analysis = db.query(SustainabilityAnalysis).filter(SustainabilityAnalysis.prediction_id == _coerce_id(prediction_id)).first()
        if not analysis:
            analysis = SustainabilityAnalysis(
                prediction_id=_coerce_id(prediction_id),
                user_id=_coerce_id(user_id),
                inventory_id=_coerce_id(inventory_id) if inventory_id else None,
                material=pred.material,
                waste_category=pred.waste_category,
                sustainability_score=s_data["sustainability_score"],
                environmental_benefit_score=s_data["environmental_benefit_score"],
                resource_recovery_score=s_data["resource_recovery_score"],
                material_longevity_score=s_data["material_longevity_score"],
                waste_diversion_score=s_data["waste_diversion_score"],
                insights=json.dumps(s_data["insights"])
            )
            db.add(analysis)
            db.commit()
            db.refresh(analysis)

        # 4. Save Recommendations
        # Clear existing ones to prevent duplicates
        db.query(RecyclingRecommendation).filter(RecyclingRecommendation.prediction_id == _coerce_id(prediction_id)).delete()
        for r in recs:
            rec_record = RecyclingRecommendation(
                prediction_id=_coerce_id(prediction_id),
                recovery_method=r["recovery_method"],
                recovery_priority=r["recovery_priority"],
                difficulty_level=r["difficulty_level"],
                estimated_success=r["estimated_success"],
                required_processing=r["required_processing"],
                industry_use_cases=r["industry_use_cases"],
                expected_output=r["expected_output"],
                reason=r.get("reason", "Chosen based on material composition and condition parameters."),
                industry_applications=r.get("industry_applications", r["industry_use_cases"]),
                environmental_benefit=r.get("environmental_benefit", "Reduces virgin fiber consumption."),
                estimated_cost=r.get("estimated_cost", "Low"),
                estimated_time=r.get("estimated_time", "2–4 Days")
            )
            db.add(rec_record)

        # 5. Save Environmental Impact
        db.query(EnvironmentalImpact).filter(EnvironmentalImpact.prediction_id == _coerce_id(prediction_id)).delete()
        env_record = EnvironmentalImpact(
            prediction_id=_coerce_id(prediction_id),
            co2_saved=env["co2_saved"],
            water_saved=env["water_saved"],
            energy_saved=env["energy_saved"],
            landfill_diversion=env["landfill_diversion"],
            resource_conservation=env["resource_conservation"],
            equivalent_trees=env["equivalent_trees"],
            equivalent_electricity=env["equivalent_electricity"],
            equivalent_water_bottles=env["equivalent_water_bottles"],
            equivalent_household_energy=env["equivalent_household_energy"]
        )
        db.add(env_record)

        # 6. Save Circularity Score
        db.query(CircularityScore).filter(CircularityScore.prediction_id == _coerce_id(prediction_id)).delete()
        circ_record = CircularityScore(
            prediction_id=_coerce_id(prediction_id),
            circularity_score=circ["circularity_score"],
            reuse_potential=circ["reuse_potential"],
            recovery_efficiency=circ["recovery_efficiency"],
            material_retention=circ["material_retention"],
            lifecycle_extension=circ["lifecycle_extension"],
            circularity_index=circ["circularity_index"],
            classification=circ["classification"]
        )
        db.add(circ_record)

        # 7. Save Sustainability Report Record
        db.query(SustainabilityReport).filter(SustainabilityReport.prediction_id == _coerce_id(prediction_id)).delete()
        org_name = user.organization.name if (user and user.organization) else "WeaveCycle"
        best_rec = recs[0]["recovery_method"] if recs else "Mechanical Recycling"

        exec_summary = (
            f"Sustainability Audit Executive Summary:\n"
            f"Analyzed textile batch is verified as {pred.material} ({pred.material_confidence:.1f}% confidence), "
            f"classified under the waste stream '{pred.waste_category}'. Recyclability score computed at {score:.1f}%.\n\n"
            f"Based on environmental models, recovering this material yields an Overall Sustainability Score of "
            f"{s_data['sustainability_score']}/100 and a Circular Economy Index of {circ['circularity_score']}/100. "
            f"The primary recovery strategy is determined to be '{best_rec}' which diverts {weight_kg:.1f} kg from landfills, "
            f"saving {env['co2_saved']:.1f} kg of CO2 emissions and saving {env['water_saved']:.1f} Liters of water resources."
        )

        report = SustainabilityReport(
            prediction_id=_coerce_id(prediction_id),
            user_id=_coerce_id(user_id),
            report_title=f"Sustainability Analysis Report — Batch {prediction_id[:8].upper()}",
            executive_summary=exec_summary,
            pdf_path=f"uploads/report_{prediction_id}.pdf"  # Simulated path
        )
        db.add(report)
        db.commit()

        # Build response structure
        return {
            "prediction_id": str(prediction_id),
            "analysis_id": str(analysis.id),
            "material": pred.material,
            "waste_category": pred.waste_category,
            "sustainability_metrics": s_data,
            "recommendations": recs,
            "environmental_impact": env,
            "circularity": circ,
            "executive_summary": exec_summary,
            "report_title": report.report_title,
            "created_at": analysis.created_at.isoformat()
        }

    @staticmethod
    def get_history(
        db: Session,
        user_id = None,
        search: Optional[str] = None,
        material: Optional[str] = None,
        waste_category: Optional[str] = None,
        page: int = 1,
        per_page: int = 10,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> Dict[str, Any]:
        """Fetches paginated sustainability logs with filter rules."""
        query = db.query(SustainabilityAnalysis)

        if user_id:
            query = query.filter(SustainabilityAnalysis.user_id == _coerce_id(user_id))

        if material:
            query = query.filter(SustainabilityAnalysis.material.ilike(f"%{material}%"))

        if waste_category:
            query = query.filter(SustainabilityAnalysis.waste_category.ilike(f"%{waste_category}%"))

        if search:
            query = query.filter(
                (SustainabilityAnalysis.material.ilike(f"%{search}%")) |
                (SustainabilityAnalysis.waste_category.ilike(f"%{search}%"))
            )

        total = query.count()

        sort_col = getattr(SustainabilityAnalysis, sort_by, SustainabilityAnalysis.created_at)
        if sort_order == "asc":
            query = query.order_by(sort_col.asc())
        else:
            query = query.order_by(sort_col.desc())

        items = query.offset((page - 1) * per_page).limit(per_page).all()
        pages = (total + per_page - 1) // per_page if total > 0 else 1

        result_list = []
        for analysis in items:
            # Fetch linked records
            pred_id = analysis.prediction_id
            env = db.query(EnvironmentalImpact).filter(EnvironmentalImpact.prediction_id == pred_id).first()
            circ = db.query(CircularityScore).filter(CircularityScore.prediction_id == pred_id).first()
            recs = db.query(RecyclingRecommendation).filter(RecyclingRecommendation.prediction_id == pred_id).all()

            pred_record = analysis.prediction
            filename = pred_record.image.filename if (pred_record and pred_record.image) else "unknown.jpg"
            image_path = pred_record.image.original_path if (pred_record and pred_record.image) else None

            # Get top recommendation
            best_rec = recs[0].recovery_method if recs else "Mechanical Recycling"

            result_list.append({
                "id": str(analysis.id),
                "prediction_id": str(pred_id),
                "material": analysis.material,
                "waste_category": analysis.waste_category,
                "sustainability_score": analysis.sustainability_score,
                "circularity_score": circ.circularity_score if circ else 0.0,
                "co2_saved": env.co2_saved if env else 0.0,
                "water_saved": env.water_saved if env else 0.0,
                "energy_saved": env.energy_saved if env else 0.0,
                "recovery_recommendation": best_rec,
                "filename": filename,
                "image_path": image_path,
                "created_at": analysis.created_at.isoformat(),
                "user_name": analysis.user.full_name if analysis.user else "System"
            })

        return {
            "items": result_list,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": pages
        }

    @staticmethod
    def get_analysis_by_prediction_id(db: Session, prediction_id) -> Optional[Dict[str, Any]]:
        """Returns the full parsed analysis package by Prediction ID."""
        pred_id = _coerce_id(prediction_id)
        analysis = db.query(SustainabilityAnalysis).filter(SustainabilityAnalysis.prediction_id == pred_id).first()
        if not analysis:
            return None

        env = db.query(EnvironmentalImpact).filter(EnvironmentalImpact.prediction_id == pred_id).first()
        circ = db.query(CircularityScore).filter(CircularityScore.prediction_id == pred_id).first()
        recs = db.query(RecyclingRecommendation).filter(RecyclingRecommendation.prediction_id == pred_id).all()
        report = db.query(SustainabilityReport).filter(SustainabilityReport.prediction_id == pred_id).first()

        pred_record = analysis.prediction
        filename = pred_record.image.filename if (pred_record and pred_record.image) else "unknown.jpg"
        image_path = pred_record.image.original_path if (pred_record and pred_record.image) else None

        # Build structures
        recs_list = [
            {
                "recovery_method": r.recovery_method,
                "method": r.recovery_method,
                "recovery_priority": r.recovery_priority,
                "priority": r.recovery_priority,
                "difficulty_level": r.difficulty_level,
                "difficulty": r.difficulty_level,
                "estimated_success": r.estimated_success,
                "success_rate": f"{int(r.estimated_success)}%" if isinstance(r.estimated_success, (int, float)) else str(r.estimated_success),
                "required_processing": r.required_processing,
                "processing_description": r.required_processing,
                "industry_use_cases": r.industry_use_cases,
                "industry_applications": r.industry_applications or r.industry_use_cases,
                "industry_application": r.industry_applications or r.industry_use_cases,
                "expected_output": r.expected_output,
                "expected_output_material": r.expected_output,
                "reason": r.reason or "Chosen based on material composition and condition parameters.",
                "environmental_benefit": r.environmental_benefit or "Reduces virgin fiber consumption.",
                "estimated_cost": r.estimated_cost or "Low",
                "estimated_time": r.estimated_time or "2–4 Days",
                "cost_estimate": r.estimated_cost or "Low",
                "time_estimate": r.estimated_time or "2–4 Days"
            }
            for r in recs
        ]

        insights_list = []
        if analysis.insights:
            try:
                insights_list = json.loads(analysis.insights)
            except Exception:
                insights_list = [analysis.insights]

        return {
            "id": str(analysis.id),
            "prediction_id": str(pred_id),
            "material": analysis.material,
            "confidence": pred_record.material_confidence if pred_record else 100.0,
            "waste_category": analysis.waste_category,
            "sustainability_metrics": {
                "sustainability_score": analysis.sustainability_score,
                "environmental_benefit_score": analysis.environmental_benefit_score,
                "resource_recovery_score": analysis.resource_recovery_score,
                "material_longevity_score": analysis.material_longevity_score,
                "waste_diversion_score": analysis.waste_diversion_score,
                "insights": insights_list
            },
            "recommendations": recs_list,
            "environmental_impact": {
                "co2_saved": env.co2_saved if env else 0.0,
                "water_saved": env.water_saved if env else 0.0,
                "energy_saved": env.energy_saved if env else 0.0,
                "landfill_diversion": env.landfill_diversion if env else 0.0,
                "resource_conservation": env.resource_conservation if env else 0.0,
                "equivalent_trees": env.equivalent_trees if env else 0.0,
                "equivalent_electricity": env.equivalent_electricity if env else 0.0,
                "equivalent_water_bottles": env.equivalent_water_bottles if env else 0.0,
                "equivalent_household_energy": env.equivalent_household_energy if env else 0.0
            } if env else {},
            "circularity": {
                "circularity_score": circ.circularity_score if circ else 0.0,
                "reuse_potential": circ.reuse_potential if circ else 0.0,
                "recovery_efficiency": circ.recovery_efficiency if circ else 0.0,
                "material_retention": circ.material_retention if circ else 0.0,
                "lifecycle_extension": circ.lifecycle_extension if circ else 0.0,
                "circularity_index": circ.circularity_index if circ else 0.0,
                "classification": circ.classification if circ else "Moderate Circular Potential"
            } if circ else {},
            "executive_summary": report.executive_summary if report else "",
            "report_title": report.report_title if report else "Sustainability Audit",
            "filename": filename,
            "image_path": image_path,
            "created_at": analysis.created_at.isoformat(),
            "user_name": analysis.user.full_name if analysis.user else "System",
            "organization_name": analysis.user.organization.name if (analysis.user and analysis.user.organization) else "WeaveCycle"
        }

    @staticmethod
    def get_dashboard_stats(db: Session) -> Dict[str, Any]:
        """Calculates aggregated sustainability metrics for dashboard extensions."""
        total_co2 = db.query(func.sum(EnvironmentalImpact.co2_saved)).scalar() or 0.0
        total_water = db.query(func.sum(EnvironmentalImpact.water_saved)).scalar() or 0.0
        total_diverted = db.query(func.sum(EnvironmentalImpact.landfill_diversion)).scalar() or 0.0

        avg_sustain = db.query(func.avg(SustainabilityAnalysis.sustainability_score)).scalar() or 0.0
        avg_circ = db.query(func.avg(CircularityScore.circularity_score)).scalar() or 0.0

        # Top recyclable materials (grouped by material, ordered by count)
        top_mats_query = (
            db.query(SustainabilityAnalysis.material, func.count(SustainabilityAnalysis.id))
            .group_by(SustainabilityAnalysis.material)
            .order_by(func.count(SustainabilityAnalysis.id).desc())
            .limit(5)
            .all()
        )
        top_recyclable_materials = [
            {"material": m[0], "count": m[1]} for m in top_mats_query
        ]

        # Most common recovery method
        common_rec_query = (
            db.query(RecyclingRecommendation.recovery_method, func.count(RecyclingRecommendation.id))
            .group_by(RecyclingRecommendation.recovery_method)
            .order_by(func.count(RecyclingRecommendation.id).desc())
            .first()
        )
        most_common_recovery_method = common_rec_query[0] if common_rec_query else "Mechanical Recycling"

        # Recovery method distribution (for chart)
        rec_dist = (
            db.query(RecyclingRecommendation.recovery_method, func.count(RecyclingRecommendation.id))
            .group_by(RecyclingRecommendation.recovery_method)
            .all()
        )
        recovery_method_distribution = {d[0]: d[1] for d in rec_dist if d[0]}

        # Material recovery stats
        mat_rec_query = (
            db.query(
                SustainabilityAnalysis.material,
                func.avg(SustainabilityAnalysis.sustainability_score),
                func.avg(CircularityScore.circularity_score)
            )
            .join(CircularityScore, CircularityScore.prediction_id == SustainabilityAnalysis.prediction_id)
            .group_by(SustainabilityAnalysis.material)
            .all()
        )
        material_recovery_statistics = [
            {
                "material": r[0],
                "avg_sustainability_score": round(float(r[1]), 1),
                "avg_circularity_score": round(float(r[2]), 1)
            }
            for r in mat_rec_query
        ]

        # Recent Reports (limit to 5)
        recent_reports = (
            db.query(SustainabilityReport)
            .order_by(SustainabilityReport.created_at.desc())
            .limit(5)
            .all()
        )
        recent_reports_json = [
            {
                "id": str(r.id),
                "prediction_id": str(r.prediction_id),
                "report_title": r.report_title,
                "material": r.prediction.material if r.prediction else "Unknown",
                "waste_category": r.prediction.waste_category if r.prediction else "Unknown",
                "created_at": r.created_at.isoformat()
            }
            for r in recent_reports
        ]

        return {
            "average_sustainability_score": round(float(avg_sustain), 1),
            "average_circularity_score": round(float(avg_circ), 1),
            "top_recyclable_materials": top_recyclable_materials,
            "most_common_recovery_method": most_common_recovery_method,
            "total_waste_diverted_kg": round(float(total_diverted), 1),
            "estimated_co2_saved_kg": round(float(total_co2), 1),
            "estimated_water_saved_liters": round(float(total_water), 1),
            "recent_sustainability_reports": recent_reports_json,
            "recovery_method_distribution": recovery_method_distribution,
            "material_recovery_statistics": material_recovery_statistics
        }
