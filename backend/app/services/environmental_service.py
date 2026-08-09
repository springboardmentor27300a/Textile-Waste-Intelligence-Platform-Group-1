"""
Environmental Impact Assessment Engine  -  Service Layer (Milestone 4)

All business logic for the Environmental Impact Assessment Engine lives here.
Routers must NOT perform any calculations  -  they delegate entirely to the
functions exposed in this module.

────────────────────────────────────────────────────────────────────
Architecture
────────────────────────────────────────────────────────────────────

Data Sources (read-only  -  never recalculated here)
    sustainability_metrics         -  all KPI numbers
    recycling_recommendations      -  recommendation type names + benefits
    inventory                      -  material name, weight, waste category

Pure helper functions
    derive_environmental_rating()       -  map score → rating band
    generate_insights()                 -  produce 3-5 meaningful insights
    build_summary()                     -  compose one-paragraph assessment
    build_environmental_benefits()      -  compose narrative benefit strings
    build_impact_statistics()           -  build six-category stats block

Orchestrators
    generate_and_save()     -  main POST entry point
    get_report()            -  retrieve a stored report + live KPIs
    get_all_reports()       -  list all stored report rows

Retrieval helpers
    _get_inventory()        -  fetch + validate inventory record
    _get_metric()           -  fetch + validate sustainability_metric row
    _get_recommendations()  -  fetch + validate recommendation rows
────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.environmental_report import EnvironmentalReport
from app.models.inventory import Inventory
from app.models.sustainability_metric import SustainabilityMetric
from app.models.recycling_recommendation import RecyclingRecommendation

logger = logging.getLogger(__name__)


# ====================================================================
# 1. RATING CONFIGURATION
#    90-100  → Excellent
#    75-89   → Very Good
#    60-74   → Good
#    40-59   → Fair
#    < 40    → Needs Improvement
# ====================================================================

RATING_BANDS: list[tuple[float, str, str]] = [
    (
        90.0,
        "Excellent",
        "Outstanding environmental performance. This material demonstrates "
        "exceptional sustainability characteristics and should be prioritised "
        "for immediate recycling or reuse.",
    ),
    (
        75.0,
        "Very Good",
        "Strong environmental performance. This material shows a high level "
        "of sustainability and contributes significantly to circular economy goals.",
    ),
    (
        60.0,
        "Good",
        "Satisfactory environmental performance. The material has solid "
        "sustainability metrics and positive recycling potential.",
    ),
    (
        40.0,
        "Fair",
        "Moderate environmental performance. The material has some sustainability "
        "value but there is meaningful room for improvement in recycling strategy.",
    ),
    (
        0.0,
        "Needs Improvement",
        "Below-average environmental performance. Careful handling, specialist "
        "processing, or an alternative disposal pathway should be considered.",
    ),
]


# ====================================================================
# 2. INSIGHT GENERATION TEMPLATES
#    Keyed by (material_type, waste_category, generic) so the
#    service can produce material-specific insights where possible.
# ====================================================================

_MATERIAL_INSIGHTS: dict[str, list[str]] = {
    "Cotton": [
        "Recycling this cotton textile avoids the need to grow and process "
        "new cotton, which typically requires ~10,000 litres of water per kilogram.",
        "Cotton fibre recycling significantly reduces the use of pesticides "
        "and synthetic fertilisers associated with virgin cotton cultivation.",
        "Mechanically recycled cotton can be blended back into new yarn, "
        "creating a closed-loop material flow that reduces virgin fibre demand.",
    ],
    "Polyester": [
        "Recycling polyester avoids the energy-intensive process of producing "
        "petroleum-derived polymers, directly reducing fossil fuel consumption.",
        "Recycled polyester (rPET) retains comparable tensile strength to "
        "virgin polyester, making it suitable for high-performance textile applications.",
        "Polyester recycling prevents microplastic accumulation in waterways "
        "that would otherwise result from landfill leachate.",
    ],
    "Wool": [
        "Wool recycling avoids methane emissions from sheep farming and the "
        "water-intensive scouring and dyeing processes of virgin wool production.",
        "Recycled wool fibres can be respun into quality yarns for blankets, "
        "insulation, and industrial textiles, extending material lifecycle.",
        "By recycling wool, we reduce the demand for new livestock farming, "
        "which is a significant contributor to agricultural greenhouse gas emissions.",
    ],
    "Nylon": [
        "Nylon has one of the highest embodied carbon footprints among textiles; "
        "recycling it delivers substantial CO2 savings per kilogram compared to virgin production.",
        "Chemical recycling of nylon back to its monomer (caprolactam) enables "
        "infinite recyclability without degradation of performance properties.",
        "Avoiding nylon landfill prevents persistent synthetic polymer contamination "
        "of soil and groundwater over long decomposition timescales.",
    ],
    "Denim": [
        "Denim recycling significantly reduces the heavy water and chemical loads "
        "associated with indigo dyeing and stonewash finishing processes.",
        "Recycled denim fibres are widely used in acoustic insulation panels "
        "and padding materials, demonstrating strong cross-industry circular value.",
        "By diverting denim from landfill, we avoid the release of synthetic "
        "dye compounds that can persist in soil ecosystems for decades.",
    ],
    "Linen": [
        "Linen is derived from flax, a low-input crop; recycling it further "
        "reduces the already modest carbon footprint of this natural fibre.",
        "Recycled linen can be broken down into cellulosic fibres suitable "
        "for paper-making, insulation, and biocomposite materials.",
        "Linen's natural biodegradability makes composting a viable end-of-life "
        "route, keeping valuable organic matter in the biological cycle.",
    ],
    "Silk": [
        "Silk production is energy-intensive; recycling silk textiles avoids "
        "the carbon cost of silkworm rearing, degumming, and weaving.",
        "Recycled silk can be repurposed into high-value fashion accessories, "
        "preserving its premium fibre quality and reducing downcycling.",
        "Recovering silk fibres extends the useful life of a rare biological "
        "resource and reduces pressure on sericulture farming systems.",
    ],
    "Rayon": [
        "Rayon recycling avoids the chemically intensive wood-pulp dissolution "
        "process, which uses hazardous solvents in virgin fibre production.",
        "Recycled rayon fibres can be blended into nonwoven materials used "
        "in medical textiles, reducing demand for virgin cellulosic inputs.",
    ],
    "Acrylic": [
        "Acrylic is a petroleum-based fibre; recycling reduces dependence on "
        "non-renewable fossil resources used in its original synthesis.",
        "Acrylic microfibre shedding during laundering is an environmental "
        "concern; diverting acrylic waste reduces the total microplastic load.",
    ],
    "Mixed Fabric": [
        "Mixed-fabric recycling requires sorting technologies that, when applied, "
        "enable component fibre recovery and prevent blended materials from landfill.",
        "Emerging chemical depolymerisation processes can separate blended fibres, "
        "opening new circular economy pathways for mixed textile waste.",
    ],
}

_CATEGORY_INSIGHTS: dict[str, list[str]] = {
    "Recyclable": [
        "Mechanical recycling breaks down this textile into reusable fibres "
        "without chemical processing, providing an energy-efficient recovery route.",
        "Recycling this material keeps valuable resources in the economy and "
        "reduces the need to extract and process virgin raw materials.",
    ],
    "Reusable": [
        "Reusing this textile in its current form has the lowest environmental "
        "impact of any end-of-life pathway, requiring no additional processing energy.",
        "Textile reuse directly extends product life, delaying energy consumption "
        "for recycling while maximising the value of embedded resources.",
    ],
    "Repairable": [
        "Repairing and refurbishing this textile significantly extends its usable "
        "life, deferring the environmental cost of replacement production.",
        "Repair-based circular strategies preserve the fibre quality of the "
        "material and maintain its highest possible economic and environmental value.",
    ],
    "Upcyclable": [
        "Upcycling transforms this waste textile into a higher-value product, "
        "generating creative economic value while eliminating landfill disposal.",
        "Upcycled textiles contribute to artisan and small-batch manufacturing "
        "ecosystems that prioritise craft and sustainability over fast fashion.",
    ],
    "Compostable": [
        "Composting this natural-fibre textile returns organic carbon to the "
        "soil, enriching it and closing the biological nutrient cycle.",
        "Industrial composting of textiles can be combined with food waste "
        "streams, reducing the operational cost of organic waste diversion.",
    ],
    "Hazardous": [
        "Proper hazardous textile handling prevents the release of toxic "
        "compounds into soil and groundwater during disposal.",
        "Specialist treatment facilities can safely recover residual fibres "
        "even from hazardous textile waste, minimising total landfill volume.",
    ],
}

_GENERIC_INSIGHTS: list[str] = [
    "Diverting this textile from landfill contributes directly to national "
    "circular economy targets and reduces municipal solid waste volumes.",
    "Every kilogram of textile recycled reduces the global demand for virgin "
    "raw materials, lowering the overall environmental impact of the fashion industry.",
    "Sustainable textile management supports Sustainable Development Goal 12 "
    "(Responsible Consumption and Production) and SDG 13 (Climate Action).",
    "Processing this material through a circular pathway reduces the lifecycle "
    "carbon footprint compared to incineration or landfill disposal.",
    "Extended producer responsibility frameworks increasingly mandate textile "
    "recycling  -  early adoption positions operations ahead of regulatory requirements.",
]


# ====================================================================
# 3. PURE HELPER FUNCTIONS
# ====================================================================

def derive_environmental_rating(sustainability_score: float) -> dict:
    """
    Map a sustainability score (0-100) to a named performance band.

    Parameters
    ----------
    sustainability_score : Composite score from sustainability_metrics.

    Returns
    -------
    dict with keys: 'rating', 'description'
    """
    for threshold, rating, description in RATING_BANDS:
        if sustainability_score >= threshold:
            return {"rating": rating, "description": description}
    # Fallback  -  should never be reached due to the 0.0 sentinel band
    return {"rating": "Needs Improvement", "description": RATING_BANDS[-1][2]}


def generate_insights(
    material_type: str,
    waste_category: str,
    co2_saved: float,
    water_saved: float,
    landfill_diverted: float,
    resource_recovery: float,
    sustainability_score: float,
) -> List[str]:
    """
    Produce 3-5 meaningful, non-generic environmental insights.

    Strategy
    --------
    1. Always include one KPI-grounded quantitative insight.
    2. Pull up to 2 material-specific insights (if available).
    3. Pull 1 waste-category insight.
    4. Pad with a generic circular-economy insight if under 3 total.
    5. Cap at 5 insights.

    Parameters
    ----------
    material_type        : e.g. "Cotton"
    waste_category       : e.g. "Recyclable"
    co2_saved            : kg CO2 avoided
    water_saved          : litres of water saved
    landfill_diverted    : % diversion
    resource_recovery    : kg of material recovered
    sustainability_score : composite score

    Returns
    -------
    List[str]  -  3 to 5 insight strings.
    """
    insights: List[str] = []

    # ── Insight 1: Quantitative CO2 anchor (always present) ──────────────────
    insights.append(
        f"Recycling this {material_type.lower()} textile saves approximately "
        f"{co2_saved:.1f} kg of CO2  -  equivalent to planting roughly "
        f"{max(1, int(co2_saved / 0.021))} tree seedlings grown for one year."
    )

    # ── Insight 2: Water conservation (if meaningful) ─────────────────────────
    if water_saved >= 50:
        insights.append(
            f"This assessment identified {water_saved:.0f} litres of water saved  -  "
            f"enough to meet approximately {max(1, int(water_saved / 50))} person-days "
            f"of average household water consumption."
        )
    elif water_saved > 0:
        insights.append(
            f"Water savings of {water_saved:.1f} litres are realised by avoiding "
            "virgin material production through this recycling pathway."
        )

    # ── Insight 3: Material-specific insights ─────────────────────────────────
    material_pool = _MATERIAL_INSIGHTS.get(material_type, _MATERIAL_INSIGHTS["Mixed Fabric"])
    for insight in material_pool[:2]:
        if insight not in insights:
            insights.append(insight)
        if len(insights) >= 4:
            break

    # ── Insight 4: Category-specific insight ──────────────────────────────────
    category_pool = _CATEGORY_INSIGHTS.get(waste_category, [])
    for insight in category_pool[:1]:
        if insight not in insights:
            insights.append(insight)

    # ── Insight 5: Landfill / recovery grounding ──────────────────────────────
    if len(insights) < 3:
        insights.append(
            f"Diverting {landfill_diverted:.0f}% of this material from landfill "
            f"recovers approximately {resource_recovery:.2f} kg of usable textile fibre."
        )

    # ── Pad to minimum of 3 with generic insights ─────────────────────────────
    for generic in _GENERIC_INSIGHTS:
        if len(insights) >= 3:
            break
        if generic not in insights:
            insights.append(generic)

    return insights[:5]


def build_summary(
    material_type: str,
    waste_category: str,
    sustainability_score: float,
    environmental_rating: str,
    co2_saved: float,
    water_saved: float,
    landfill_diverted: float,
    circularity: str,
    recommendation_names: List[str],
) -> str:
    """
    Compose a concise one-paragraph environmental assessment summary.

    Parameters
    ----------
    All values sourced from sustainability_metrics and recycling_recommendations.

    Returns
    -------
    str  -  a human-readable paragraph.
    """
    rec_text = (
        " and ".join(recommendation_names[:2])
        if recommendation_names
        else "appropriate processing"
    )

    return (
        f"This {material_type} textile waste has been assessed as '{environmental_rating}' "
        f"with an overall sustainability score of {sustainability_score:.1f}/100. "
        f"It is classified as '{waste_category}' with a '{circularity}' circularity contribution. "
        f"Recycling or recovering this material would save approximately {co2_saved:.1f} kg of CO2 "
        f"and {water_saved:.0f} litres of water, while diverting {landfill_diverted:.0f}% of its "
        f"mass from landfill. The recommended action  -  {rec_text}  -  should be prioritised "
        f"to maximise environmental benefit and circular economy value."
    )


def build_environmental_benefits(
    material_type: str,
    waste_category: str,
    co2_saved: float,
    water_saved: float,
    landfill_diverted: float,
    resource_recovery: float,
) -> dict:
    """
    Compose narrative benefit strings for the four main KPI categories.

    Returns
    -------
    dict with keys: 'co2_benefit', 'water_benefit', 'landfill_benefit', 'recovery_benefit'
    """
    return {
        "co2_benefit": (
            f"Recycling this {material_type.lower()} textile avoids the emission of "
            f"{co2_saved:.2f} kg of CO2, reducing the carbon footprint of textile production."
        ),
        "water_benefit": (
            f"Processing through a circular pathway conserves {water_saved:.2f} litres "
            f"of water that would otherwise be consumed in virgin {material_type.lower()} manufacturing."
        ),
        "landfill_benefit": (
            f"{landfill_diverted:.1f}% of this material's weight is diverted from landfill, "
            f"reducing methane generation and soil contamination risk from textile decomposition."
        ),
        "recovery_benefit": (
            f"Approximately {resource_recovery:.2f} kg of {material_type.lower()} fibre "
            f"can be recovered from this '{waste_category}' classified batch, "
            f"re-entering the textile supply chain as a secondary raw material."
        ),
    }


def build_impact_statistics(
    co2_saved: float,
    water_saved: float,
    landfill_diverted: float,
    resource_recovery: float,
    circularity: str,
    sustainability_score: float,
) -> dict:
    """
    Compose the six-category impact statistics block.

    Returns
    -------
    dict matching the EnvironmentalImpactStats schema fields.
    """
    return {
        "carbon_impact": co2_saved,
        "water_conservation": water_saved,
        "landfill_reduction": landfill_diverted,
        "resource_recovery": resource_recovery,
        "circular_economy_contribution": circularity,
        "overall_sustainability_performance": sustainability_score,
    }


# ====================================================================
# 4. PRIVATE RETRIEVAL HELPERS
# ====================================================================

def _get_inventory(inventory_id: int, db: Session) -> Inventory:
    """
    Fetch the Inventory record by ID.

    Raises
    ------
    ValueError  -  if the record does not exist.
    """
    item = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if item is None:
        raise ValueError(f"Inventory item with id={inventory_id} not found.")
    return item


def _get_metric(inventory_id: int, db: Session) -> SustainabilityMetric:
    """
    Fetch the SustainabilityMetric record for the given inventory item.

    Raises
    ------
    ValueError  -  if no sustainability assessment has been run yet.
    """
    metric = (
        db.query(SustainabilityMetric)
        .filter(SustainabilityMetric.inventory_id == inventory_id)
        .first()
    )
    if metric is None:
        raise ValueError(
            f"No sustainability assessment found for inventory_id={inventory_id}. "
            "Run POST /api/sustainability/calculate first."
        )
    return metric


def _get_recommendations(
    inventory_id: int, db: Session
) -> List[RecyclingRecommendation]:
    """
    Fetch all RecyclingRecommendation records for the given inventory item.

    Raises
    ------
    ValueError  -  if no recommendations have been generated yet.
    """
    recs = (
        db.query(RecyclingRecommendation)
        .filter(RecyclingRecommendation.inventory_id == inventory_id)
        .order_by(RecyclingRecommendation.id)
        .all()
    )
    if not recs:
        raise ValueError(
            f"No recycling recommendations found for inventory_id={inventory_id}. "
            "Run POST /api/recommendation/generate first."
        )
    return recs


# ====================================================================
# 5. ORCHESTRATOR  -  generate_and_save()
# ====================================================================

def generate_and_save(
    inventory_id: int,
    db: Session,
) -> dict:
    """
    Main entry point for the Environmental Impact Assessment Engine.

    Steps
    -----
    1. Validate inventory exists.
    2. Validate sustainability_metric exists (raises 404 if not).
    3. Validate recycling_recommendations exist (raises 404 if not).
    4. Derive environmental rating from sustainability_score.
    5. Generate 3-5 contextual insights.
    6. Build summary paragraph.
    7. Upsert EnvironmentalReport row (one per inventory item).
    8. Return full report dict.

    Parameters
    ----------
    inventory_id : Primary key of the inventory item to assess.
    db           : Active SQLAlchemy session (injected by FastAPI).

    Returns
    -------
    dict  -  the assembled environmental report payload.

    Raises
    ------
    ValueError    -  inventory / metric / recommendations not found.
    RuntimeError  -  unexpected assessment failure.
    """

    # ── Step 1-3: Validate all required data sources ──────────────────────────
    inventory = _get_inventory(inventory_id, db)
    metric = _get_metric(inventory_id, db)
    recs = _get_recommendations(inventory_id, db)

    # ── Step 4: Derive environmental rating ───────────────────────────────────
    try:
        rating_info = derive_environmental_rating(metric.sustainability_score)
        environmental_rating: str = rating_info["rating"]

        # ── Step 5: Generate insights ─────────────────────────────────────────
        insights: List[str] = generate_insights(
            material_type=metric.material_type,
            waste_category=metric.waste_category,
            co2_saved=metric.co2_saved,
            water_saved=metric.water_saved,
            landfill_diverted=metric.landfill_diverted,
            resource_recovery=metric.resource_recovery,
            sustainability_score=metric.sustainability_score,
        )

        # ── Step 6: Build summary ─────────────────────────────────────────────
        recommendation_names: List[str] = [r.recommendation for r in recs]
        summary: str = build_summary(
            material_type=metric.material_type,
            waste_category=metric.waste_category,
            sustainability_score=metric.sustainability_score,
            environmental_rating=environmental_rating,
            co2_saved=metric.co2_saved,
            water_saved=metric.water_saved,
            landfill_diverted=metric.landfill_diverted,
            circularity=metric.circularity_score,
            recommendation_names=recommendation_names,
        )

    except Exception as exc:
        logger.exception("Assessment calculation failed for inventory_id=%s", inventory_id)
        raise RuntimeError(f"Environmental assessment failed: {exc}") from exc

    # ── Step 7: Upsert EnvironmentalReport row ────────────────────────────────
    existing = (
        db.query(EnvironmentalReport)
        .filter(EnvironmentalReport.inventory_id == inventory_id)
        .first()
    )

    insights_json: str = json.dumps(insights)

    if existing:
        existing.environmental_rating = environmental_rating
        existing.summary = summary
        existing.generated_insights = insights_json
        existing.report_generated_at = datetime.now(timezone.utc)
        report_row = existing
    else:
        report_row = EnvironmentalReport(
            inventory_id=inventory_id,
            environmental_rating=environmental_rating,
            summary=summary,
            generated_insights=insights_json,
        )
        db.add(report_row)

    db.commit()
    db.refresh(report_row)

    logger.info(
        "Environmental report saved: inventory_id=%s rating=%s score=%.2f",
        inventory_id,
        environmental_rating,
        metric.sustainability_score,
    )

    # ── Step 8: Assemble and return full report dict ──────────────────────────
    return _build_report_dict(
        inventory=inventory,
        metric=metric,
        recs=recs,
        environmental_rating=environmental_rating,
        insights=insights,
        summary=summary,
        report_row=report_row,
    )


# ====================================================================
# 6. RETRIEVAL  -  get_report() / get_all_reports()
# ====================================================================

def get_report(inventory_id: int, db: Session) -> dict:
    """
    Retrieve an existing environmental report for a given inventory item.

    Fetches stored metadata from environmental_reports and merges it with
    live KPI values from sustainability_metrics and recommendations.

    Parameters
    ----------
    inventory_id : Primary key of the inventory item.
    db           : Active SQLAlchemy session.

    Returns
    -------
    dict  -  the full report payload (same shape as generate_and_save).

    Raises
    ------
    ValueError  -  inventory / metric / report / recommendations not found.
    """
    inventory = _get_inventory(inventory_id, db)
    metric = _get_metric(inventory_id, db)
    recs = _get_recommendations(inventory_id, db)

    report_row = (
        db.query(EnvironmentalReport)
        .filter(EnvironmentalReport.inventory_id == inventory_id)
        .first()
    )
    if report_row is None:
        raise ValueError(
            f"No environmental report found for inventory_id={inventory_id}. "
            "Run POST /api/environmental/generate first."
        )

    insights: List[str] = json.loads(report_row.generated_insights)

    return _build_report_dict(
        inventory=inventory,
        metric=metric,
        recs=recs,
        environmental_rating=report_row.environmental_rating,
        insights=insights,
        summary=report_row.summary,
        report_row=report_row,
    )


def get_all_reports(db: Session) -> List[EnvironmentalReport]:
    """
    Return all stored environmental report rows ordered by most recently generated.

    Parameters
    ----------
    db : Active SQLAlchemy session.

    Returns
    -------
    List[EnvironmentalReport]  -  ORM rows; lightweight for list serialisation.
    """
    return (
        db.query(EnvironmentalReport)
        .order_by(EnvironmentalReport.report_generated_at.desc())
        .all()
    )


# ====================================================================
# 7. PRIVATE REPORT ASSEMBLER
# ====================================================================

def _build_report_dict(
    inventory: Inventory,
    metric: SustainabilityMetric,
    recs: List[RecyclingRecommendation],
    environmental_rating: str,
    insights: List[str],
    summary: str,
    report_row: EnvironmentalReport,
) -> dict:
    """
    Assemble the full environmental report response dictionary.

    This is the single place where all data sources are merged into
    the canonical API response shape, keeping both generate_and_save
    and get_report consistent.

    Parameters
    ----------
    inventory            : Inventory ORM row.
    metric               : SustainabilityMetric ORM row.
    recs                 : List of RecyclingRecommendation ORM rows.
    environmental_rating : Derived band string.
    insights             : Generated insight strings.
    summary              : Composed paragraph.
    report_row           : EnvironmentalReport ORM row (for generated_at).

    Returns
    -------
    dict  -  matches the SustainabilityReportOut / EnvironmentalReportOut schema.
    """
    recommendation_names: List[str] = [r.recommendation for r in recs]
    benefits = build_environmental_benefits(
        material_type=metric.material_type,
        waste_category=metric.waste_category,
        co2_saved=metric.co2_saved,
        water_saved=metric.water_saved,
        landfill_diverted=metric.landfill_diverted,
        resource_recovery=metric.resource_recovery,
    )
    stats = build_impact_statistics(
        co2_saved=metric.co2_saved,
        water_saved=metric.water_saved,
        landfill_diverted=metric.landfill_diverted,
        resource_recovery=metric.resource_recovery,
        circularity=metric.circularity_score,
        sustainability_score=metric.sustainability_score,
    )

    return {
        # Identity
        "inventory_id": inventory.id,
        "material": metric.material_type,
        "waste_category": metric.waste_category,
        "weight_kg": metric.weight_kg,

        # Impact Summary (KPIs  -  read directly from sustainability_metrics)
        "co2_saved": metric.co2_saved,
        "water_saved": metric.water_saved,
        "landfill_diversion": metric.landfill_diverted,
        "resource_recovery": metric.resource_recovery,
        "sustainability_score": metric.sustainability_score,
        "circularity": metric.circularity_score,

        # Recommendations
        "recommendations": recommendation_names,

        # Performance Rating
        "environmental_rating": environmental_rating,

        # Environmental Benefits (narrative strings)
        "co2_benefit": benefits["co2_benefit"],
        "water_benefit": benefits["water_benefit"],
        "landfill_benefit": benefits["landfill_benefit"],
        "recovery_benefit": benefits["recovery_benefit"],

        # Impact Statistics
        "impact_statistics": stats,

        # Generated Insights
        "insights": insights,

        # Summary Paragraph
        "summary": summary,

        # Metadata
        "generated_at": report_row.report_generated_at,
    }
