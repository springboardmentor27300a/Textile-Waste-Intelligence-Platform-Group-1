"""
Recycling Recommendation Service — Milestone 4

Implements the Recycling Recommendation Engine.

This service consumes outputs from the existing Material Classification Engine
and Waste Classification Engine stored in the ``inventory`` table.
It does NOT perform any image classification.

────────────────────────────────────────────────────────────────────
Architecture
────────────────────────────────────────────────────────────────────

Rule Knowledge Base
    All recommendation rules, priorities, descriptions, reasons, and
    environmental benefits are stored in structured Python dicts at the
    top of this file.  Rules are keyed on (material_type, waste_category)
    combinations with condition refinements applied on top.

Pure helper functions
    _resolve_condition_tier(condition) → "excellent" | "good" | "fair" | "poor" | "unknown"
    _build_recommendations(material, category, condition) → List[RecommendationEntry]
    _priority_sort_key(priority) → int          (for ordering: High=0, Medium=1, Low=2)

Orchestrator
    generate_and_save(inventory_id, condition, db)
        1. Fetch and validate the Inventory record.
        2. Resolve material_type + waste_category from inventory.
        3. Delete any previously generated recommendations for this item.
        4. Build new recommendations using the rule engine.
        5. Persist all recommendation rows.
        6. Return the grouped response payload.

Retrieval helpers
    get_recommendations_by_inventory_id(inventory_id, db) → List[RecyclingRecommendation]
    get_all_recommendations(db)                           → List[RecyclingRecommendation]

────────────────────────────────────────────────────────────────────
Design decisions
────────────────────────────────────────────────────────────────────
• No image classification — material_type comes from inventory.material_type
  (already set by the Material Classification Engine).
• The waste_category is re-derived from waste_classifier.classify() so the
  Recommendation Engine always uses the same logic as the Waste Classification Engine.
• Recommendations are regenerated (not accumulated) on every POST — this keeps
  the table clean and avoids stale data when inventory metadata changes.
• All business rules live in this service file — the router contains zero logic.
────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.inventory import Inventory
from app.models.recycling_recommendation import RecyclingRecommendation
from app.services import waste_classifier

logger = logging.getLogger(__name__)


# ════════════════════════════════════════════════════════════════════
# 1. RECOMMENDATION KNOWLEDGE BASE
# ════════════════════════════════════════════════════════════════════

@dataclass(frozen=True)
class RecommendationRule:
    """
    Immutable rule entry — one row in the knowledge base.

    Attributes
    ----------
    recommendation       : Display name of the recommendation type.
    priority             : "High" | "Medium" | "Low"
    description          : What this action involves.
    reason               : Why it applies to this material/category combination.
    environmental_benefit: Expected environmental outcome.
    """
    recommendation: str
    priority: str
    description: str
    reason: str
    environmental_benefit: str


# ── Priority ordering helper ──────────────────────────────────────────────────
_PRIORITY_ORDER = {"High": 0, "Medium": 1, "Low": 2}


def _priority_sort_key(rule: RecommendationRule) -> int:
    return _PRIORITY_ORDER.get(rule.priority, 99)


# ── Material-condition condition tier resolver ────────────────────────────────
_CONDITION_TIERS = {
    "excellent": "excellent",
    "good":      "good",
    "fair":      "fair",
    "poor":      "poor",
}


def _resolve_condition_tier(condition: Optional[str]) -> str:
    """
    Normalise the free-text condition string to a canonical tier.

    Returns one of: "excellent" | "good" | "fair" | "poor" | "unknown"
    """
    if not condition:
        return "unknown"
    return _CONDITION_TIERS.get(condition.strip().lower(), "unknown")


# ════════════════════════════════════════════════════════════════════
# 2. RULE DEFINITIONS
#    Keyed by (material_type_lower, waste_category_lower).
#    Condition refinements narrow the rule set; if no condition is
#    given all rules for the combination are returned.
# ════════════════════════════════════════════════════════════════════

# Format:  RULES[(material, category)] = {
#               "all"        : [rules applied regardless of condition],
#               "excellent"  : [rules applied when condition is Excellent],
#               "good"       : [rules applied when condition is Good],
#               "fair"       : [rules applied when condition is Fair],
#               "poor"       : [rules applied when condition is Poor],
#          }
# Rules in "all" always apply; condition-specific rules are ADDED on top.

RECOMMENDATION_RULES: dict = {

    # ── Cotton ────────────────────────────────────────────────────────────────
    ("cotton", "recyclable"): {
        "all": [
            RecommendationRule(
                recommendation="Fiber Recycling",
                priority="High",
                description="Send to certified mechanical fiber recycling facility for cotton fiber recovery.",
                reason="Cotton is a natural fiber with high mechanical recyclability — fibers can be regenerated into new yarn.",
                environmental_benefit="Reduces virgin cotton demand by up to 90%, saving approximately 10,000 litres of water per kg.",
            ),
            RecommendationRule(
                recommendation="Fabric Reuse",
                priority="Medium",
                description="Repurpose as industrial wipers, cleaning rags, or insulation filling material.",
                reason="Cotton fibers remain structurally intact even after primary use, enabling secondary industrial applications.",
                environmental_benefit="Extends product lifecycle and avoids landfill — reduces CO₂ by approximately 2.5 kg per kg recycled.",
            ),
        ],
        "excellent": [
            RecommendationRule(
                recommendation="Donation",
                priority="High",
                description="Donate to certified textile charity collections or second-hand retail programmes.",
                reason="Excellent condition cotton is highly suitable for direct reuse — high demand in charity and resale markets.",
                environmental_benefit="Direct reuse avoids all reprocessing energy and extends garment life by 2–5 additional years.",
            ),
        ],
        "good": [
            RecommendationRule(
                recommendation="Donation",
                priority="High",
                description="Donate to local textile charity drives — good quality cotton has a 95% reuse acceptance rate.",
                reason="Good quality natural fiber is suitable for direct reuse without any reprocessing.",
                environmental_benefit="Reduces landfill waste and extends product life, saving up to 2.5 kg CO₂ per kg.",
            ),
        ],
        "fair": [
            RecommendationRule(
                recommendation="Upcycling",
                priority="Medium",
                description="Transform into quilts, patchwork panels, or insulation material.",
                reason="Fair condition cotton retains sufficient structural integrity for creative remanufacturing.",
                environmental_benefit="Keeps material in circular economy and avoids downcycling to lower-value waste streams.",
            ),
        ],
        "poor": [
            RecommendationRule(
                recommendation="Fiber Recycling",
                priority="High",
                description="Route to industrial shredding and fiber recovery — poor condition material is unsuitable for reuse.",
                reason="Material quality unsuitable for donation or direct reuse, but cotton fibers can still be fully recovered.",
                environmental_benefit="Recovers raw fiber value and prevents landfill — cotton is 100% biodegradable if composted.",
            ),
        ],
    },

    # ── Polyester ─────────────────────────────────────────────────────────────
    ("polyester", "reusable"): {
        "all": [
            RecommendationRule(
                recommendation="Mechanical Recycling",
                priority="High",
                description="Process through mechanical recycling — shred, melt, and re-extrude into new polyester fiber.",
                reason="Synthetic fibers can be processed efficiently using mechanical recycling without significant quality loss.",
                environmental_benefit="Saves up to 5.5 kg CO₂ per kg compared to virgin polyester production — reduces petroleum dependency.",
            ),
        ],
        "excellent": [
            RecommendationRule(
                recommendation="Fabric Reuse",
                priority="High",
                description="Route to second-hand retail or corporate refurbishment programmes.",
                reason="Excellent condition polyester has a long wear lifespan and strong resale market demand.",
                environmental_benefit="Zero reprocessing energy required — maximum carbon saving through direct reuse.",
            ),
        ],
        "good": [
            RecommendationRule(
                recommendation="Fabric Reuse",
                priority="Medium",
                description="Donate functional polyester garments to second-hand programmes.",
                reason="Polyester is durable synthetic fiber — good condition material is well-suited for second-hand markets.",
                environmental_benefit="Extends garment life by 2–3 years and reduces textile waste entering recycling streams.",
            ),
        ],
        "fair": [
            RecommendationRule(
                recommendation="Chemical Recycling",
                priority="Medium",
                description="Route to chemical recycling (glycolysis or methanolysis) to recover PET monomers.",
                reason="Fair condition synthetic material benefits from chemical recycling to restore fiber to original polymer quality.",
                environmental_benefit="Recovers virgin-equivalent PET monomers, reducing need for petroleum-derived raw materials.",
            ),
        ],
        "poor": [
            RecommendationRule(
                recommendation="Industrial Recovery",
                priority="High",
                description="Route to industrial chemical depolymerisation or waste-to-energy facility.",
                reason="Poor condition polyester cannot be mechanically recycled effectively — industrial recovery maximises material value.",
                environmental_benefit="Prevents microplastic release from degraded polyester and recovers embodied energy.",
            ),
        ],
    },

    # ── Wool ──────────────────────────────────────────────────────────────────
    ("wool", "recyclable"): {
        "all": [
            RecommendationRule(
                recommendation="Fiber Recycling",
                priority="High",
                description="Send to shoddy mill for garnetting and re-spinning into recycled wool blended yarn.",
                reason="Wool fibers are naturally crimped and resilient — mechanical separation recovers high-quality reclaimed fiber.",
                environmental_benefit="Reduces wool production emissions by up to 3.0 kg CO₂ per kg and conserves significant water.",
            ),
        ],
        "excellent": [
            RecommendationRule(
                recommendation="Donation",
                priority="High",
                description="Sell or donate through wool-specific resale platforms — quality wool retains high second-hand value.",
                reason="Premium natural fiber in excellent condition commands strong resale demand in sustainable fashion markets.",
                environmental_benefit="Direct reuse avoids all reprocessing — maximum lifecycle extension for premium material.",
            ),
        ],
        "good": [
            RecommendationRule(
                recommendation="Fabric Reuse",
                priority="High",
                description="Use for premium insulation panels or donate to textile charity collections.",
                reason="Good quality wool's natural crimp provides excellent thermal properties suitable for insulation reuse.",
                environmental_benefit="Avoids energy-intensive virgin wool production and reduces landfill pressure.",
            ),
        ],
        "poor": [
            RecommendationRule(
                recommendation="Fiber Recycling",
                priority="High",
                description="Route to industrial composting as a secondary option — wool is protein-based and fully biodegradable.",
                reason="Heavily damaged wool is unsuitable for reuse but provides valuable organic matter when composted.",
                environmental_benefit="Wool composting enriches soil with nitrogen and keratin — zero-waste disposal pathway.",
            ),
        ],
    },

    # ── Silk ──────────────────────────────────────────────────────────────────
    ("silk", "upcyclable"): {
        "all": [
            RecommendationRule(
                recommendation="Upcycling",
                priority="High",
                description="Partner with high-end fashion designers or artisans for luxury upcycling into accessories.",
                reason="Silk is a luxury natural fiber with high upcycling value — can be transformed into premium fashion products.",
                environmental_benefit="High-value upcycling preserves the embodied energy of silk production and avoids waste.",
            ),
        ],
        "excellent": [
            RecommendationRule(
                recommendation="Donation",
                priority="High",
                description="Sell through luxury second-hand platforms — silk garments retain 60–80% of original market value.",
                reason="Excellent condition silk has extremely strong premium resale market — direct reuse maximises value recovery.",
                environmental_benefit="Extends product life by 5+ years and avoids all reprocessing energy expenditure.",
            ),
        ],
        "good": [
            RecommendationRule(
                recommendation="Fabric Reuse",
                priority="Medium",
                description="Repurpose as luxury gift packaging, ribbons, or premium lining material.",
                reason="Good condition silk retains its lustrous properties — suitable for high-value secondary applications.",
                environmental_benefit="Keeps silk in productive use and delays waste stream entry significantly.",
            ),
        ],
        "poor": [
            RecommendationRule(
                recommendation="Fiber Recycling",
                priority="Medium",
                description="Send to specialist silk recyclers for fiber extraction and premium yarn production.",
                reason="Damaged silk can still yield valuable fibers — specialist recycling recovers the protein-based material.",
                environmental_benefit="Silk fiber recovery prevents landfill of a biodegradable protein material with 4-year decomposition cycle.",
            ),
        ],
    },

    # ── Denim ─────────────────────────────────────────────────────────────────
    ("denim", "repairable"): {
        "all": [
            RecommendationRule(
                recommendation="Upcycling",
                priority="High",
                description="Convert into bags, mats, furniture accessories, insulation panels, or fashion products.",
                reason="Denim is a durable cotton-based twill fabric — highly versatile for upcycling into new products with strong market demand.",
                environmental_benefit="Denim upcycling saves approximately 3.2 kg CO₂ per kg and avoids heavy dye water pollution from new denim production.",
            ),
            RecommendationRule(
                recommendation="Mechanical Recycling",
                priority="Medium",
                description="Shred into denim insulation or acoustic panel material (e.g. Bonded Logic process).",
                reason="Denim shredding into insulation is an established industrial process with certified end markets.",
                environmental_benefit="Denim insulation replaces fibreglass, saving energy in both production and building heating/cooling.",
            ),
        ],
        "excellent": [
            RecommendationRule(
                recommendation="Donation",
                priority="High",
                description="Donate to denim-specific programmes (e.g. Blue Jeans Go Green) or resell through vintage platforms.",
                reason="Excellent condition denim has strong pre-loved market demand — vintage denim commands premium resale value.",
                environmental_benefit="Direct reuse saves up to 7,000 litres of water compared to producing one new pair of jeans.",
            ),
        ],
        "good": [
            RecommendationRule(
                recommendation="Fabric Reuse",
                priority="High",
                description="Repair using visible mending techniques (boro or sashiko) to extend garment life.",
                reason="Good condition denim is highly durable — minor repairs can add 3–5 more years of active use.",
                environmental_benefit="Repair extends product life and delays entry into waste stream, reducing textile pollution.",
            ),
        ],
        "poor": [
            RecommendationRule(
                recommendation="Fiber Recycling",
                priority="High",
                description="Send to certified cotton recyclers — denim is primarily cotton-based and fully recoverable.",
                reason="Poor condition denim unsuitable for repair, but its cotton base can be recovered via mechanical fiber recycling.",
                environmental_benefit="Cotton fiber recovery from denim avoids landfill and reduces virgin cotton demand.",
            ),
        ],
    },

    # ── Nylon ─────────────────────────────────────────────────────────────────
    ("nylon", "hazardous"): {
        "all": [
            RecommendationRule(
                recommendation="Industrial Recovery",
                priority="High",
                description="Route to licensed hazardous textile waste handler — do NOT landfill or incinerate without permits.",
                reason="Nylon is a synthetic petroleum-derived material classified as hazardous — requires specialist handling and certified recovery.",
                environmental_benefit="Specialist recovery prevents toxic chemical leachate and captures embodied energy from petroleum-based polymer.",
            ),
            RecommendationRule(
                recommendation="Chemical Recycling",
                priority="Medium",
                description="Route to nylon-specific chemical recycling — Econyl process recovers caprolactam monomer.",
                reason="Chemical depolymerisation of nylon (Econyl/similar) restores monomer to virgin-equivalent quality for new fiber spinning.",
                environmental_benefit="Econyl recycling saves up to 7.2 kg CO₂ per kg compared to virgin nylon production from petroleum.",
            ),
        ],
        "excellent": [
            RecommendationRule(
                recommendation="Fabric Reuse",
                priority="Medium",
                description="Donate functional nylon sportswear or outerwear to second-hand athletic gear programmes.",
                reason="Excellent condition nylon retains full performance properties — suitable for direct reuse in sports and outdoor markets.",
                environmental_benefit="Direct reuse avoids energy-intensive chemical recycling and extends product life by 2–4 years.",
            ),
        ],
    },

    # ── Rayon ─────────────────────────────────────────────────────────────────
    ("rayon", "compostable"): {
        "all": [
            RecommendationRule(
                recommendation="Fiber Recycling",
                priority="High",
                description="Send to cellulose-based recyclers — rayon's viscose fibers are recoverable for new cellulose products.",
                reason="Rayon is a semi-synthetic cellulose fiber — cellulose recovery processes can regenerate pulp for new lyocell or viscose production.",
                environmental_benefit="Cellulose recovery from rayon reduces deforestation pressure by substituting virgin wood-pulp requirements.",
            ),
        ],
        "excellent": [
            RecommendationRule(
                recommendation="Donation",
                priority="High",
                description="Donate wearable rayon garments to textile charity collections for direct reuse.",
                reason="Excellent condition rayon is biodegradable and comfortable — highly suitable for direct reuse in charity markets.",
                environmental_benefit="Direct reuse prevents biodegradable material from entering composting streams unnecessarily.",
            ),
        ],
        "good": [
            RecommendationRule(
                recommendation="Donation",
                priority="Medium",
                description="Donate to textile charity drives — rayon in good condition is accepted by most charity textile collections.",
                reason="Good condition rayon is wearable and comfortable — suitable for second-hand market entry.",
                environmental_benefit="Extends garment life and delays material entry into biodegradable waste stream.",
            ),
        ],
        "fair": [
            RecommendationRule(
                recommendation="Fabric Reuse",
                priority="Medium",
                description="Repurpose as cleaning cloths or industrial wipes before final composting.",
                reason="Fair condition rayon retains absorbency properties useful for cleaning applications.",
                environmental_benefit="Secondary use as cleaning material delays composting and extracts maximum value from cellulose material.",
            ),
        ],
        "poor": [
            RecommendationRule(
                recommendation="Fiber Recycling",
                priority="High",
                description="Industrial composting is the optimal end-of-life route — rayon decomposes within 6–12 months.",
                reason="Poor condition rayon is unsuitable for reuse but fully biodegradable — composting is the cleanest disposal pathway.",
                environmental_benefit="Rayon composting returns cellulose nutrients to soil, supporting circular bioeconomy principles.",
            ),
        ],
    },

    # ── Linen ─────────────────────────────────────────────────────────────────
    ("linen", "compostable"): {
        "all": [
            RecommendationRule(
                recommendation="Fiber Recycling",
                priority="Medium",
                description="Shred and use as eco-friendly animal bedding or agricultural mulch before composting.",
                reason="Linen's natural bast fiber structure makes it ideal for secondary agricultural applications.",
                environmental_benefit="Agricultural reuse of linen fibers enriches soil and supports sustainable farming practices.",
            ),
        ],
        "excellent": [
            RecommendationRule(
                recommendation="Donation",
                priority="High",
                description="Donate to textile charity programmes — linen commands premium second-hand prices.",
                reason="Excellent condition linen is highly durable and sought-after in sustainable fashion and home textile markets.",
                environmental_benefit="Premium linen reuse avoids all processing energy — maximum lifecycle extension for a low-carbon crop fiber.",
            ),
        ],
        "good": [
            RecommendationRule(
                recommendation="Upcycling",
                priority="High",
                description="Upcycle into napkins, dishcloths, tote bags, or home décor — linen is extremely durable.",
                reason="Good condition linen's natural strength and texture makes it ideal for high-value home textile upcycling.",
                environmental_benefit="Linen upcycling saves 1.5 kg CO₂ per kg and reduces demand for synthetic alternatives.",
            ),
        ],
        "poor": [
            RecommendationRule(
                recommendation="Fiber Recycling",
                priority="High",
                description="Compost directly — linen is a natural bast fiber and fully biodegrades within 2–4 weeks.",
                reason="Poor condition linen is unsuitable for any reuse application — composting is the fastest, cleanest disposal.",
                environmental_benefit="Rapid linen composting returns organic matter to soil within weeks — minimal environmental burden.",
            ),
        ],
    },

    # ── Acrylic ───────────────────────────────────────────────────────────────
    ("acrylic", "hazardous"): {
        "all": [
            RecommendationRule(
                recommendation="Industrial Recovery",
                priority="High",
                description="Send to a licensed hazardous waste handler — acrylic requires specialist chemical waste processing.",
                reason="Acrylic is a petroleum-based non-biodegradable synthetic that requires specialised handling and recovery processes.",
                environmental_benefit="Prevents toxic microplastic release and recovers petrochemical value through controlled industrial processing.",
            ),
        ],
        "excellent": [
            RecommendationRule(
                recommendation="Donation",
                priority="Medium",
                description="Donate functional acrylic knitwear to cold-weather clothing drives.",
                reason="Excellent condition acrylic is warm and durable — suitable for cold-climate charity donation programmes.",
                environmental_benefit="Direct reuse of acrylic extends product life without additional processing energy expenditure.",
            ),
        ],
        "poor": [
            RecommendationRule(
                recommendation="Industrial Recovery",
                priority="High",
                description="Contact specialist chemical waste contractors for safe depolymerisation — do NOT landfill or compost.",
                reason="Poor condition acrylic cannot be reused and poses environmental risk if landfilled — specialist treatment is mandatory.",
                environmental_benefit="Controlled industrial disposal prevents groundwater contamination and toxic gas emission from improper burning.",
            ),
        ],
    },

    # ── Mixed Fabric ──────────────────────────────────────────────────────────
    ("mixed fabric", "reusable"): {
        "all": [
            RecommendationRule(
                recommendation="Chemical Recycling",
                priority="High",
                description="Route to chemical fiber separation facility — mixed fibers require chemical processes to separate effectively.",
                reason="Mixed fibers are difficult to separate mechanically — chemical recycling is the most effective route for blended fabrics.",
                environmental_benefit="Chemical separation of blended fibers enables recovery of individual polymer streams, maximising material value.",
            ),
            RecommendationRule(
                recommendation="Mechanical Recycling",
                priority="Medium",
                description="Sort by primary fiber type if possible, then route to material-specific mechanical recycler.",
                reason="Partial sorting of mixed fabrics improves mechanical recycling efficiency and output quality.",
                environmental_benefit="Even partial sorting can improve recycling yield by 30–50% compared to unsorted blended waste.",
            ),
        ],
        "excellent": [
            RecommendationRule(
                recommendation="Donation",
                priority="High",
                description="Donate wearable mixed-fiber garments — second-hand shops widely accept blended fabrics.",
                reason="Excellent condition mixed-fiber garments have strong resale market demand regardless of blend composition.",
                environmental_benefit="Direct reuse avoids all energy-intensive fiber separation processes.",
            ),
        ],
        "good": [
            RecommendationRule(
                recommendation="Fabric Reuse",
                priority="Medium",
                description="Route to general textile recyclers who handle blended materials through automated sorting.",
                reason="Good condition mixed fabrics can be processed by modern textile sorting facilities using NIR technology.",
                environmental_benefit="Automated sorting of mixed fabrics improves overall recycling rates across the textile waste stream.",
            ),
        ],
        "poor": [
            RecommendationRule(
                recommendation="Industrial Recovery",
                priority="High",
                description="Route unsorted blends to textile energy recovery facilities or industrial shredding for insulation.",
                reason="Poor condition mixed fabrics are not suitable for reuse and difficult to sort — energy recovery is the most viable option.",
                environmental_benefit="Energy recovery from blended textiles displaces fossil fuel consumption in industrial processes.",
            ),
        ],
    },
}


# ── Default fallback rules (used when no exact material+category key is found) ─

DEFAULT_RULES: dict = {
    "recyclable": [
        RecommendationRule(
            recommendation="Mechanical Recycling",
            priority="High",
            description="Route to certified mechanical textile recycling facility for fiber recovery.",
            reason="Material is classified as Recyclable — mechanical recycling is the standard processing route.",
            environmental_benefit="Mechanical recycling recovers fiber value and reduces landfill waste significantly.",
        ),
        RecommendationRule(
            recommendation="Fiber Recycling",
            priority="Medium",
            description="Shred and recover raw fiber for industrial applications.",
            reason="Recyclable materials can yield reusable fiber suitable for industrial flock and padding applications.",
            environmental_benefit="Fiber recovery extends material lifecycle and reduces demand for virgin raw materials.",
        ),
    ],
    "reusable": [
        RecommendationRule(
            recommendation="Donation",
            priority="High",
            description="Donate to certified textile charity collections for direct reuse.",
            reason="Material is classified as Reusable — direct donation maximises social and environmental value.",
            environmental_benefit="Direct reuse avoids all reprocessing energy and extends garment lifecycle.",
        ),
        RecommendationRule(
            recommendation="Fabric Reuse",
            priority="Medium",
            description="Route to second-hand retail or corporate refurbishment programmes.",
            reason="Reusable classification indicates sufficient material integrity for continued use.",
            environmental_benefit="Second-hand market participation reduces overall textile consumption.",
        ),
    ],
    "repairable": [
        RecommendationRule(
            recommendation="Fabric Reuse",
            priority="High",
            description="Assess and carry out professional repairs to restore to saleable condition.",
            reason="Material is classified as Repairable — targeted repairs can restore significant value.",
            environmental_benefit="Repair extends product life and delays waste stream entry by 2–5 years.",
        ),
        RecommendationRule(
            recommendation="Upcycling",
            priority="Medium",
            description="Transform into new products if repair is not cost-effective.",
            reason="Repairable material that cannot be economically repaired is still suitable for creative upcycling.",
            environmental_benefit="Upcycling keeps material in productive use and avoids downcycling.",
        ),
    ],
    "upcyclable": [
        RecommendationRule(
            recommendation="Upcycling",
            priority="High",
            description="Partner with designers or artisans for high-value transformation into new products.",
            reason="Material is classified as Upcyclable — creative remanufacturing maximises remaining value.",
            environmental_benefit="High-value upcycling preserves embodied energy and avoids waste stream entry.",
        ),
    ],
    "compostable": [
        RecommendationRule(
            recommendation="Fiber Recycling",
            priority="High",
            description="Send to industrial composting facility — natural fibers biodegrade within 6–24 months.",
            reason="Material is classified as Compostable — industrial composting is the cleanest end-of-life pathway.",
            environmental_benefit="Composting returns organic matter to soil and supports circular bioeconomy.",
        ),
    ],
    "hazardous": [
        RecommendationRule(
            recommendation="Industrial Recovery",
            priority="High",
            description="Route to licensed hazardous textile waste contractor — specialist handling is legally required.",
            reason="Material is classified as Hazardous Textile Waste — specialist handling and recovery is required by regulation.",
            environmental_benefit="Specialist industrial recovery prevents environmental contamination and recovers residual material value.",
        ),
    ],
}


# ════════════════════════════════════════════════════════════════════
# 3. RULE ENGINE
# ════════════════════════════════════════════════════════════════════

def _build_recommendations(
    material_type: str,
    waste_category: str,
    condition: Optional[str],
) -> List[RecommendationRule]:
    """
    Apply the recommendation rule engine to produce an ordered list of rules.

    Logic
    -----
    1. Normalise inputs.
    2. Look up the (material, category) key in RECOMMENDATION_RULES.
    3. Take all "all" rules plus condition-tier-specific rules.
    4. If no exact match, fall back to DEFAULT_RULES keyed by category.
    5. Deduplicate by recommendation name, preserving highest priority.
    6. Sort by priority (High → Medium → Low).

    Parameters
    ----------
    material_type  : Material name from inventory (e.g. "Cotton").
    waste_category : Waste category resolved by waste_classifier (e.g. "Recyclable").
    condition      : Optional material condition string.

    Returns
    -------
    List[RecommendationRule] — ordered High → Medium → Low priority.
    """
    mat_key  = material_type.strip().lower()
    cat_key  = waste_category.strip().lower()
    tier     = _resolve_condition_tier(condition)

    rules: List[RecommendationRule] = []
    lookup_key = (mat_key, cat_key)

    rule_set = RECOMMENDATION_RULES.get(lookup_key)

    if rule_set:
        # Always include "all" rules
        rules.extend(rule_set.get("all", []))
        # Add condition-specific rules (if condition given and tier exists)
        if tier != "unknown" and tier in rule_set:
            for rule in rule_set[tier]:
                # Avoid exact duplicates
                if rule not in rules:
                    rules.append(rule)
    else:
        # Fallback: use category-level defaults
        logger.debug(
            "No specific rules for (%s, %s) — using category fallback '%s'.",
            mat_key, cat_key, cat_key,
        )
        rules.extend(DEFAULT_RULES.get(cat_key, DEFAULT_RULES["recyclable"]))

    # Deduplicate by recommendation name, keeping the highest-priority entry
    seen: dict[str, RecommendationRule] = {}
    for rule in rules:
        name = rule.recommendation
        if name not in seen or _priority_sort_key(rule) < _priority_sort_key(seen[name]):
            seen[name] = rule

    # Sort by priority
    return sorted(seen.values(), key=_priority_sort_key)


# ════════════════════════════════════════════════════════════════════
# 4. ORCHESTRATOR
# ════════════════════════════════════════════════════════════════════

def generate_and_save(
    inventory_id: int,
    db: Session,
    condition: Optional[str] = None,
) -> List[RecyclingRecommendation]:
    """
    Main entry point for the Recycling Recommendation Engine.

    Steps
    -----
    1. Fetch and validate the Inventory record (raises ValueError if missing).
    2. Validate material_type is recognised.
    3. Re-derive waste_category from waste_classifier (consistent with Waste Classification Engine).
    4. Delete any previously stored recommendations for this inventory_id.
    5. Build new recommendations via the rule engine.
    6. Persist all recommendation rows.
    7. Return the list of saved ORM instances.

    Parameters
    ----------
    inventory_id : Primary key of the inventory item.
    db           : Active SQLAlchemy session (injected by FastAPI).
    condition    : Optional material condition: "Excellent" / "Good" / "Fair" / "Poor".

    Returns
    -------
    List[RecyclingRecommendation] — all freshly persisted recommendation ORM instances.

    Raises
    ------
    ValueError  — inventory not found, or material unrecognised by waste_classifier.
    RuntimeError — unexpected internal failure.
    """
    # ── Step 1: Fetch inventory ────────────────────────────────────────────────
    inventory = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if inventory is None:
        raise ValueError(f"Inventory item with id={inventory_id} not found.")

    material_type: str = inventory.material_type

    # ── Step 2 & 3: Resolve waste category via waste_classifier ───────────────
    try:
        classification = waste_classifier.classify(material_type)
        waste_category: str = classification["category"]
    except ValueError as exc:
        raise ValueError(
            f"Material '{material_type}' from inventory #{inventory_id} "
            f"is not recognised by the Waste Classification Engine: {exc}"
        ) from exc

    # ── Step 4: Clear previous recommendations ─────────────────────────────────
    deleted = (
        db.query(RecyclingRecommendation)
        .filter(RecyclingRecommendation.inventory_id == inventory_id)
        .delete(synchronize_session=False)
    )
    if deleted:
        logger.info("Cleared %d existing recommendations for inventory_id=%s.", deleted, inventory_id)

    # ── Step 5: Build rules ────────────────────────────────────────────────────
    try:
        rules = _build_recommendations(material_type, waste_category, condition)
    except Exception as exc:
        logger.exception("Rule engine failed for inventory_id=%s.", inventory_id)
        raise RuntimeError(f"Recommendation generation failed: {exc}") from exc

    if not rules:
        logger.warning(
            "No rules generated for material='%s' category='%s' — using emergency fallback.",
            material_type, waste_category,
        )
        rules = DEFAULT_RULES.get(waste_category.lower(), DEFAULT_RULES["recyclable"])

    # ── Step 6: Persist ────────────────────────────────────────────────────────
    saved: List[RecyclingRecommendation] = []
    for rule in rules:
        rec = RecyclingRecommendation(
            inventory_id=inventory_id,
            material_type=material_type,
            waste_category=waste_category,
            condition=condition,
            recommendation=rule.recommendation,
            description=rule.description,
            reason=rule.reason,
            environmental_benefit=rule.environmental_benefit,
            priority=rule.priority,
        )
        db.add(rec)
        saved.append(rec)

    db.commit()
    for rec in saved:
        db.refresh(rec)

    logger.info(
        "Recommendations saved: inventory_id=%s material=%s category=%s condition=%s count=%d",
        inventory_id, material_type, waste_category, condition, len(saved),
    )
    return saved


# ════════════════════════════════════════════════════════════════════
# 5. RETRIEVAL HELPERS
# ════════════════════════════════════════════════════════════════════

def get_recommendations_by_inventory_id(
    inventory_id: int,
    db: Session,
) -> List[RecyclingRecommendation]:
    """
    Retrieve all stored recommendations for a given inventory item,
    ordered by priority (High first).

    Returns an empty list if no recommendations have been generated yet.
    """
    return (
        db.query(RecyclingRecommendation)
        .filter(RecyclingRecommendation.inventory_id == inventory_id)
        .order_by(RecyclingRecommendation.created_at.desc())
        .all()
    )


def get_all_recommendations(db: Session) -> List[RecyclingRecommendation]:
    """
    Return all recommendation records, ordered by most recently created.
    """
    return (
        db.query(RecyclingRecommendation)
        .order_by(RecyclingRecommendation.created_at.desc())
        .all()
    )
