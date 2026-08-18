export function generateCSV(result) {

    if (!result) return;

    const rows = [

        ["Category", "Property", "Value"],

        ["Material", "Prediction", result.material.label],
        ["Material", "Confidence", `${(result.material.confidence * 100).toFixed(1)}%`],

        ...Object.entries(result.material.probabilities).map(([name, value]) => [
            "Material Probability",
            name,
            `${(value * 100).toFixed(1)}%`
        ]),
        ["", "", ""],
        ["Damage", "Prediction", result.damage.label],
        ["Damage", "Confidence", `${(result.damage.confidence * 100).toFixed(1)}%`],
        ["", "", ""],

        ["Quality", "Grade", result.quality.quality_grade],
        ["Quality", "Score", result.quality.quality_score],
        ["Quality", "Brightness", Math.round(result.quality.brightness)],
        ["Quality", "Contrast", Math.round(result.quality.contrast)],
        ["Quality", "Sharpness", Math.round(result.quality.sharpness)],
        ["Quality", "Dominant Color", result.quality.dominant_color],

        ["", "", ""],

        ["Recommendation", "Action", result.recommendation.recommended_action],
        ["Recommendation", "Recyclability", result.recommendation.recyclability],
        ["Recommendation", "Environmental Impact", result.recommendation.environmental_impact],
        ["Recommendation", "Estimated Value", result.recommendation.estimated_value],
        ["Recommendation", "Priority", result.recommendation.priority],
        ["Recommendation", "Reason", result.recommendation.reason],
        ["Material Details", "Fabric Type",
        result.material_classification.fabric_type],

        ["", "", ""],

        ["Material Details", "Material Category",
        result.material_classification.material_category],

        ["Material Details", "Fiber Composition",
        result.material_classification.fiber_composition],

        ["Material Details", "Blend Identification",
        result.material_classification.blend_identification],

        ["Material Details", "Fabric Texture",
        result.material_classification.fabric_texture],

        ["Material Details", "Fabric Pattern",
        result.material_classification.fabric_pattern],

        ["", "", ""],
        ["Waste Classification", "Category", result.waste_classification.category],
        ["Waste Classification", "Recyclability", result.waste_classification.recyclability],
        ["Waste Classification", "Reuse Potential", result.waste_classification.reuse_potential],
        ["Waste Classification", "Contamination", result.waste_classification.contamination_detection],
        ["Waste Classification", "Disposal", result.waste_classification.disposal_recommendation],
        ["Waste Classification", "Compostable", result.waste_classification.compostable],
        ["Waste Classification", "Hazardous", result.waste_classification.hazardous_textile],

        ["", "", ""],

        ["Recycling", "Recommended Method", result.recycling_engine.recommended_method],
        ["Recycling", "Fiber Recycling", result.recycling_engine.fiber_recycling],
        ["Recycling", "Mechanical Recycling", result.recycling_engine.mechanical_recycling],
        ["Recycling", "Chemical Recycling", result.recycling_engine.chemical_recycling],
        ["Recycling", "Fabric Reuse", result.recycling_engine.fabric_reuse],
        ["Recycling", "Industrial Recovery", result.recycling_engine.industrial_recovery],
        ["Recycling", "Donation", result.recycling_engine.donation],
        ["Recycling", "Waste Reduction", result.recycling_engine.waste_reduction_strategy],
        ["Recycling", "Upcycling", result.recycling_engine.upcycling_suggestions.join(" | ")],

        ["", "", ""],

        // Sustainability Intelligence
        ["Sustainability", "Score", result.sustainability.score],
        ["Sustainability", "Environmental Rating", result.sustainability.environmental_rating],
        ["Sustainability", "Carbon Footprint (kg CO2e)", result.sustainability.carbon_footprint],
        ["Sustainability", "CO2 Saved (kg)", result.sustainability.co2_saved],
        ["Sustainability", "Water Saved (L)", result.sustainability.water_saved.toLocaleString()],
        ["Sustainability", "Landfill Saved (kg)", result.sustainability.landfill_saved],
        ["Sustainability", "Resource Conservation", result.sustainability.resource_conservation],

        ["", "", ""],

        // Environmental Analytics
        ["Environmental Analytics", "Carbon Reduction (kg)", result.environmental_analytics.carbon_reduction],
        ["Environmental Analytics", "Water Conservation (L)", result.environmental_analytics.water_conservation.toLocaleString()],
        ["Environmental Analytics", "Landfill Diversion (kg)", result.environmental_analytics.landfill_diversion],
        ["Environmental Analytics", "Environmental Impact", result.environmental_analytics.environmental_impact],
        ["Environmental Analytics", "Eco Rating", `${result.environmental_analytics.eco_rating}/5`],
        // ["Environmental Analytics", "Summary", result.environmental_analytics.summary],
                ["", "", ""],

        // ==========================
        // Waste Scoring Engine
        // ==========================

        ["Waste Scoring", "Recyclability Score", `${result.waste_scoring.recyclability_score}%`],
        ["Waste Scoring", "Reuse Score", `${result.waste_scoring.reuse_score}%`],
        ["Waste Scoring", "Sustainability Score", `${result.waste_scoring.sustainability_score}%`],
        ["Waste Scoring", "Material Recovery Score", `${result.waste_scoring.material_recovery_score}%`],
        ["Waste Scoring", "Processing Feasibility Score", `${result.waste_scoring.processing_feasibility_score}%`],
        ["Waste Scoring", "Circularity Score", `${result.waste_scoring.circularity_score}%`],
        ["Waste Scoring", "Circularity Category", result.waste_scoring.circularity_category],

        ["", "", ""],

        // ==========================
        // Circular Economy Analytics
        // ==========================

        ["Circular Economy", "Recycling Efficiency", `${result.circular_economy.recycling_efficiency}%`],
        ["Circular Economy", "Waste Diversion Rate", `${result.circular_economy.waste_diversion_rate}%`],
        ["Circular Economy", "Resource Recovery Rate", `${result.circular_economy.resource_recovery_rate}%`],
        ["Circular Economy", "Circular Economy Index", result.circular_economy.circular_economy_index],
        ["Circular Economy", "Overall Rating", result.circular_economy.rating],

        ["", "", ""],

        // ==========================
        // Sustainability Benchmark
        // ==========================

        ["Benchmark", "Overall Score", `${result.benchmark.overall_score}%`],
        ["Benchmark", "Sustainability Grade", result.benchmark.sustainability_grade],
        ["Benchmark", "ESG Rating", result.benchmark.esg_rating],
        ["Benchmark", "Industry Percentile", `${result.benchmark.industry_percentile}%`],
        ["Benchmark", "Performance", result.benchmark.performance],
        [
            "Benchmark",
            "Improvement Suggestions",
            result.benchmark.improvement_suggestions.join(" | ")
        ]
    ];

    const csvContent = rows
        .map(row =>
            row
                .map(value => `"${String(value ?? "").replace(/"/g, '""')}"`)
                .join(",")
        )
        .join("\n");
    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `Textile_AI_Report_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}