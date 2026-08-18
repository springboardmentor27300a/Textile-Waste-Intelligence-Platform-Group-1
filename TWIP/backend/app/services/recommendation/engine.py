from typing import List, Dict, Any, Tuple
from app.services.recommendation.rules import (
    RECOMMENDATION_RULES,
    FIBER_RECYCLING,
    MECHANICAL_RECYCLING,
    CHEMICAL_RECYCLING,
    FABRIC_REUSE,
    UPCYCLING,
    DONATION,
    INDUSTRIAL_RECOVERY,
    DISPOSAL
)

def suggest_upcycling(fabric_type: str, condition: str) -> str:
    """
    Suggest specific upcycling ideas based on fabric type and condition.
    """
    fab = fabric_type.lower()
    cond = condition.lower()
    
    if cond == "damaged":
        return f"Repurpose damaged {fabric_type} into patch materials, utility wipes, or acoustic insulation backing."
    
    if "cotton" in fab or "linen" in fab:
        return "Convert into eco-friendly tote bags, reusable cleaning cloths, or custom home decor accessories."
    elif "denim" in fab:
        return "Re-stitch into patchwork clothing, rugged storage containers, or durable upholstery pieces."
    elif "wool" in fab:
        return "Felt the material for thermal insulation, premium carpet underlay, or winter apparel accessories."
    elif "silk" in fab:
        return "Repurpose into delicate textile crafts, luxury padding inserts, or lining for high-end garments."
    else:
        return "Transform into industrial rags, sorting bags, or packaging wraps."

def recommend_material_recovery(fiber_composition: str) -> str:
    """
    Generate material recovery technical recommendations based on fiber composition.
    """
    comp = fiber_composition.lower() if fiber_composition else ""
    if "100% cotton" in comp:
        return "Perform mechanical fiber pulling to reclaim raw cotton staple fibers suitable for spinning new yarn."
    elif "polyester" in comp and "cotton" in comp:
        return "Apply chemical depolymerization to separate synthetic polyester polymers from organic cotton cellulose."
    elif "100% polyester" in comp or "nylon" in comp:
        return "Use thermal extrusion and pelletizing to reform synthetic polymers into reusable manufacturing fibers."
    elif "wool" in comp:
        return "Reclaim clean wool fibers via mechanical pulling for industrial felt production."
    else:
        return "Assess material for mechanical shredding to manufacture secondary non-woven insulation pads."

def detect_reuse_opportunity(batch: Any) -> bool:
    """
    Check if a batch presents direct reuse/donation opportunities.
    """
    cond = getattr(batch, "condition", "").lower()
    
    # Check if contaminated
    has_contaminants = False
    tw_list = getattr(batch, "textile_wastes", [])
    if tw_list:
        has_contaminants = any(tw.has_contaminants for tw in tw_list)
        
    return cond == "clean" and not has_contaminants

def waste_reduction_tips(source: str) -> List[str]:
    """
    Provide source-specific waste reduction and mitigation tips.
    """
    src = source.lower()
    if "industrial" in src or "manufacturer" in src:
        return [
            "Implement digital pattern nesting to minimize factory cutting floor scraps.",
            "Establish a closed-loop collection system to aggregate clean production waste.",
            "Engage in pre-consumer industrial swap networks to exchange excess fabric rolls."
        ]
    elif "pre-consumer" in src:
        return [
            "Optimize inventory levels based on demand forecasts to prevent fabric obsolescence.",
            "Offer surplus sample swatches and deadstock to design schools or local makers.",
            "Formulate design-for-disassembly standards in new apparel lines."
        ]
    else:
        return [
            "Establish accessible community bins to collect discarded post-consumer garments.",
            "Provide consumer incentives (discounts, reward points) for returned textile items.",
            "Partner with local charities to facilitate direct donation and clothing reuse."
        ]

def recommend_strategy(batch: Any) -> Dict[str, Any]:
    """
    Recommend a ranked list of recycling and recovery strategies for a batch.
    """
    fabric_type = getattr(batch, "fabric_type", "Blend").lower()
    condition = getattr(batch, "condition", "Clean").lower()
    qty = getattr(batch, "quantity_kg", getattr(batch, "quantity", 0.0))
    
    # Extract details from TextileWaste child records
    recyclability_rate = 0.70
    has_contaminants = False
    composition = ""
    
    tw_list = getattr(batch, "textile_wastes", [])
    if tw_list:
        recyclability_rate = tw_list[0].recyclability_rate
        has_contaminants = any(tw.has_contaminants for tw in tw_list)
        composition = tw_list[0].material_composition or ""
        
    # Match declarative rules
    matched_strategies = []
    
    # 1. Check specific rules
    for r_fab, r_cond, r_cont, r_rec_min, r_strategies in RECOMMENDATION_RULES:
        # Check contamination condition
        if r_cont != has_contaminants:
            continue
            
        # Check recyclability minimum
        if recyclability_rate < r_rec_min:
            continue
            
        # Match fabric type
        fab_matches = (r_fab == "any" or r_fab in fabric_type)
        # Match condition
        cond_matches = (r_cond == "any" or r_cond == condition)
        
        if fab_matches and cond_matches:
            matched_strategies = r_strategies
            break
            
    # Fallback if no rules matched
    if not matched_strategies:
        if has_contaminants:
            matched_strategies = [CHEMICAL_RECYCLING, INDUSTRIAL_RECOVERY, DISPOSAL]
        else:
            matched_strategies = [MECHANICAL_RECYCLING, INDUSTRIAL_RECOVERY]
            
    # Calculate confidence score and construct rationale
    ranked_recommendations = []
    base_confidence = recyclability_rate * 100
    
    for i, strategy in enumerate(matched_strategies):
        # Discount confidence as rank goes down
        rank_discount = i * 15
        conf = max(10, min(98, int(base_confidence - rank_discount)))
        
        # Build custom rationale per strategy
        if strategy == UPCYCLING:
            rat = f"Clean condition and premium {fabric_type} properties render upcycling highly viable."
        elif strategy == FABRIC_REUSE:
            rat = f"Direct reuse is recommended to preserve material integrity without energy expenditure."
        elif strategy == DONATION:
            rat = "Suitable for donation to social enterprises or community spin-offs."
        elif strategy == FIBER_RECYCLING:
            rat = f"Excellent fiber length in {fabric_type} allows mechanical pulling and re-spinning."
        elif strategy == MECHANICAL_RECYCLING:
            rat = f"Shredding {fabric_type} yields high-grade mechanical cotton or wool insulation filler."
        elif strategy == CHEMICAL_RECYCLING:
            rat = "Chemical depolymerization allows splitting synthetics or removing contaminants."
        elif strategy == INDUSTRIAL_RECOVERY:
            rat = "Low-grade fiber suitable for industrial carpets, padding, or engineering wraps."
        else:
            rat = "Material is heavily soiled or damaged; safe municipal disposal is recommended."
            
        ranked_recommendations.append({
            "strategy": strategy,
            "confidence_score": conf,
            "rationale": rat
        })
        
    # Generate upcycling and recovery text logs
    upcycling_idea = suggest_upcycling(fabric_type, condition)
    recovery_advice = recommend_material_recovery(composition)
    reduction_tips = waste_reduction_tips(getattr(batch, "source", "Post-consumer"))
    
    return {
        "batch_id": getattr(batch, "id", 0),
        "primary_recommendation": ranked_recommendations[0] if ranked_recommendations else None,
        "ranked_recommendations": ranked_recommendations,
        "is_eligible_for_direct_reuse": detect_reuse_opportunity(batch),
        "upcycling_concept": upcycling_idea,
        "material_recovery_advice": recovery_advice,
        "waste_reduction_tips": reduction_tips
    }
