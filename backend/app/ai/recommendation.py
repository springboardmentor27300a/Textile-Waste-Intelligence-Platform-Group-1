from app.ai.waste_classifier import WasteClassifier
from app.ai.recyclability import RecyclabilityEngine
from app.ai.scoring import WasteScoringEngine
from app.ai.sustainability import SustainabilityEngine


class RecommendationEngine:
    """
    AI Recommendation Engine (Document Modules 6, 7, 8, 9)

    Generates:
    - Waste Category (Recyclable, Reusable, Repairable, Upcyclable, Compostable, Hazardous)
    - Recycling Strategy (Fiber, Mechanical, Chemical, Fabric Reuse, Upcycling, Donation, Industrial Recovery)
    - Reuse Opportunities & Upcycling Suggestions
    - Material Recovery & Waste Reduction Guidance
    - Weighted Circularity Score & Sub-scores (Scoring Engine)
    - Carbon Footprint & Water Saving Estimates (Sustainability Engine)
    """

    def __init__(self):
        self.waste_classifier = WasteClassifier()
        self.recyclability_engine = RecyclabilityEngine()
        self.scoring_engine = WasteScoringEngine()
        self.sustainability_engine = SustainabilityEngine()

    def generate(
        self,
        material: str,
        condition: str = "good",
        weight_kg: float = 1.0,
        confidence: float = None,
        confidence_level: str = None,
        requires_manual_verification: bool = False,
    ):
        normalized_material = material.strip().title() if isinstance(material, str) else "Cotton"

        # Waste Classification
        waste_result = self.waste_classifier.classify(normalized_material)

        # Environmental Impact Calculation
        impact_result = self.sustainability_engine.calculate_impact(
            material=normalized_material, weight_kg=weight_kg
        )

        carbon_saved = impact_result["estimated_carbon_saving_kg"]
        water_saved = impact_result["estimated_water_saving_liters"]

        # Waste Scoring Engine (Weighted Scoring Model)
        scores = self.scoring_engine.compute_scores(
            material=normalized_material,
            condition=condition,
            reuse_potential_label=waste_result["reuse"],
            carbon_saving_kg=carbon_saved,
            water_saving_liters=water_saved,
        )

        recyclability_score = scores["recyclability_score"]
        circularity_score = scores["overall_circularity_score"]
        circularity_category = scores["circularity_category"]
        sustainability_score = scores["sustainability_score"]

        # Recyclability Level Label
        if recyclability_score >= 85:
            recyclability_level = "Excellent"
            recommendation = "Highly Recommended for Recycling"
        elif recyclability_score >= 70:
            recyclability_level = "Good"
            recommendation = "Suitable for Recycling"
        elif recyclability_score >= 50:
            recyclability_level = "Moderate"
            recommendation = "Reuse or Repair Preferred"
        else:
            recyclability_level = "Poor"
            recommendation = "Dispose using Approved Method"

        if confidence is not None and confidence < 40.0 or requires_manual_verification:
            recommendation = "Prediction confidence is low. Please verify the material manually."
        elif confidence_level == "Medium":
            recommendation = "Proceed with caution and review the material if the item is heavily contaminated."

        sustainability_priority = (
            "High" if sustainability_score >= 80 else "Medium" if sustainability_score >= 60 else "Low"
        )

        milestone_2_summary = (
            f"Milestone 2 output: {normalized_material} is classified as {waste_result['category']} with {waste_result['reuse']} reuse potential. "
            f"The material is {recyclability_level.lower()} for recycling and should follow {waste_result['disposal']} guidance. "
            f"The current assessment recommends {recommendation.lower()} with a recyclability score of {recyclability_score}/100, "
            f"a circularity score of {circularity_score}/100, and an estimated carbon saving of {carbon_saved:.1f} kg CO₂."
        )

        return {
            "material": normalized_material,
            "waste_category": waste_result["category"],
            "reuse_potential": waste_result["reuse"],
            "disposal_method": waste_result["disposal"],
            "contamination_detection": waste_result["contamination"],
            "reuse_opportunity": waste_result["reuse_potential"],
            "recycling_strategy": self._recycling_strategy(normalized_material),
            "upcycling_suggestion": self._upcycling_suggestion(normalized_material),
            "material_recovery_recommendation": self._material_recovery(normalized_material),
            "waste_reduction_strategy": self._waste_reduction_strategy(normalized_material),
            "recycling_options": self._recycling_options(normalized_material),
            "recyclability_score": recyclability_score,
            "recyclability_level": recyclability_level,
            "recommendation": recommendation,
            "estimated_carbon_saving_kg": carbon_saved,
            "estimated_water_saving_liters": water_saved,
            "estimated_energy_saving_kwh": impact_result["estimated_energy_saving_kwh"],
            "landfill_diverted_kg": impact_result["landfill_diverted_kg"],
            "circularity_score": circularity_score,
            "circularity_category": circularity_category,
            "sustainability_score": sustainability_score,
            "material_recovery_score": scores["material_recovery_score"],
            "reuse_score": scores["reuse_score"],
            "environmental_benefit_score": scores["environmental_benefit_score"],
            "processing_feasibility_score": scores["processing_feasibility_score"],
            "sustainability_priority": sustainability_priority,
            "environmental_impact_summary": impact_result["environmental_impact_summary"],
            "milestone_2_summary": milestone_2_summary,
            "milestone_3_summary": impact_result["environmental_impact_summary"],
        }

    def _recycling_strategy(self, material):
        mapping = {
            "Cotton": "Fiber recycling with mechanical processing",
            "Polyester": "Chemical recycling to recover polymer feedstock",
            "Wool": "Selective fiber recovery and insulation reuse",
            "Silk": "High-value fiber extraction and upcycling",
            "Linen": "Mechanical recycling to regenerate fiber",
            "Denim": "Sorting for resale, donation, and fiber recovery",
            "Nylon": "Depolymerization or polymer recovery",
            "Rayon": "Blending with cellulose recovery routes",
            "Acrylic": "Specialized processing due to synthetic content",
            "Mixed Fabrics": "Manual sorting for material separation",
        }
        return mapping.get(material, "Manual sorting and processing review")

    def _upcycling_suggestion(self, material):
        mapping = {
            "Cotton": "Turn into insulation, cleaning cloths, or patchwork textiles",
            "Polyester": "Convert into composite panels or durable accessories",
            "Wool": "Reuse in felt, insulation, or cushioning products",
            "Silk": "Use for luxury accessories or decorative pieces",
            "Linen": "Create tote bags, home textiles, or packaging",
            "Denim": "Turn into bags, upholstery, or artisan products",
            "Nylon": "Convert to technical textiles or repair materials",
            "Rayon": "Use in blended soft furnishings and apparel",
            "Acrylic": "Repurpose into decorative or low-load applications",
            "Mixed Fabrics": "Separate by fiber before products are redesigned",
        }
        return mapping.get(material, "Explore circular design concepts")

    def _material_recovery(self, material):
        mapping = {
            "Cotton": "Recover fibers for nonwoven products",
            "Polyester": "Recover polymer components for re-spinning",
            "Wool": "Recover fibers for insulation and felt",
            "Silk": "Recover filament for premium remanufacturing",
            "Linen": "Recover fiber for paper, composites, or textile blending",
            "Denim": "Recover strong cotton fibers for reuse",
            "Nylon": "Recover nylon polymer for technical applications",
            "Rayon": "Recover cellulose content for regeneration",
            "Acrylic": "Consider controlled processing for recovery",
            "Mixed Fabrics": "Manual separation is required before recovery",
        }
        return mapping.get(material, "Review end-of-life route for material recovery")

    def _waste_reduction_strategy(self, material):
        mapping = {
            "Cotton": "Prioritize product longevity and repair before disposal",
            "Polyester": "Promote design for durability and reuse",
            "Wool": "Use repair and maintenance loops to extend lifespan",
            "Silk": "Preserve quality through careful collection and resale",
            "Linen": "Encourage reuse and repair before recycling",
            "Denim": "Support resale and donation pathways",
            "Nylon": "Improve recovery through sortation and take-back programs",
            "Rayon": "Reduce blending losses by preserving clean feedstock",
            "Acrylic": "Minimize contamination to improve downstream viability",
            "Mixed Fabrics": "Improve sortation and separation at source",
        }
        return mapping.get(material, "Improve collection and sortation practices")

    def _recycling_options(self, material):
        mapping = {
            "Cotton": ["Fiber Recycling", "Mechanical Recycling", "Fabric Reuse"],
            "Polyester": ["Chemical Recycling", "Mechanical Recycling", "Upcycling"],
            "Wool": ["Fiber Recycling", "Fabric Reuse", "Upcycling"],
            "Silk": ["Fabric Reuse", "Upcycling", "Donation"],
            "Linen": ["Mechanical Recycling", "Fabric Reuse", "Industrial Recovery"],
            "Denim": ["Fabric Reuse", "Donation", "Fiber Recycling"],
            "Nylon": ["Chemical Recycling", "Industrial Recovery", "Upcycling"],
            "Rayon": ["Mechanical Recycling", "Fabric Reuse", "Industrial Recovery"],
            "Acrylic": ["Industrial Recovery", "Specialized Recycling"],
            "Mixed Fabrics": ["Manual Sorting", "Industrial Recovery", "Special Disposal"],
        }
        return mapping.get(material, ["Manual Sorting", "Industrial Recovery"])