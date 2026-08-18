export function generateHistoryCSV(item) {

    if (!item) return;

    const rows = [

        ["Section", "Field", "Value"],

        // ==========================
        // Basic Information
        // ==========================

        ["Basic Information", "Image", item.image_name],
        ["Basic Information", "Material", item.material],
        [
            "Basic Information",
            "Material Confidence",
            `${(item.material_confidence * 100).toFixed(1)}%`
        ],
        ["Basic Information", "Damage", item.damage],
        [
            "Basic Information",
            "Damage Confidence",
            `${(item.damage_confidence * 100).toFixed(1)}%`
        ],
        ["Basic Information", "Quality Grade", item.quality_grade],
        ["Basic Information", "Quality Score", item.quality_score],
        ["Basic Information", "Recommendation", item.recommended_action],
        [
            "Basic Information",
            "Analysis Date",
            new Date(item.analyzed_at).toLocaleString()
        ],

        ["", "", ""],

        // ==========================
        // Material Classification
        // ==========================

        [
            "Material Classification",
            "Material Category",
            item.material_category
        ],
        [
            "Material Classification",
            "Fiber Composition",
            item.fiber_composition
        ],
        [
            "Material Classification",
            "Blend Identification",
            item.blend_identification
        ],
        [
            "Material Classification",
            "Fabric Texture",
            item.fabric_texture
        ],
        [
            "Material Classification",
            "Fabric Pattern",
            item.fabric_pattern
        ],

        ["", "", ""],

        // ==========================
        // Waste Classification
        // ==========================

        [
            "Waste Classification",
            "Category",
            item.waste_category
        ],
        [
            "Waste Classification",
            "Recyclability",
            item.recyclability
        ],
        [
            "Waste Classification",
            "Reuse Potential",
            item.reuse_potential
        ],
        [
            "Waste Classification",
            "Contamination Detection",
            item.contamination_detection
        ],
        [
            "Waste Classification",
            "Disposal Recommendation",
            item.disposal_recommendation
        ],
        [
            "Waste Classification",
            "Compostable",
            item.compostable
        ],
        [
            "Waste Classification",
            "Hazardous Textile",
            item.hazardous_textile
        ],

        ["", "", ""],

        // ==========================
        // Recycling Recommendation
        // ==========================

        [
            "Recycling Recommendation",
            "Recommended Method",
            item.recommended_method
        ],
        [
            "Recycling Recommendation",
            "Fiber Recycling",
            item.fiber_recycling
        ],
        [
            "Recycling Recommendation",
            "Mechanical Recycling",
            item.mechanical_recycling
        ],
        [
            "Recycling Recommendation",
            "Chemical Recycling",
            item.chemical_recycling
        ],
        [
            "Recycling Recommendation",
            "Fabric Reuse",
            item.fabric_reuse
        ],
        [
            "Recycling Recommendation",
            "Industrial Recovery",
            item.industrial_recovery
        ],
        [
            "Recycling Recommendation",
            "Donation",
            item.donation
        ],
        [
            "Recycling Recommendation",
            "Estimated Value",
            item.estimated_value
        ],
        [
            "Recycling Recommendation",
            "Environmental Impact",
            item.environmental_impact
        ],
        [
            "Recycling Recommendation",
            "Priority",
            item.priority
        ],
        [
            "Recycling Recommendation",
            "Waste Reduction Strategy",
            item.waste_reduction_strategy
        ],
        [
            "Recycling Recommendation",
            "Upcycling Suggestions",
            item.upcycling_suggestions
        ],

        ["", "", ""],

        // ==========================
        // Sustainability Intelligence
        // ==========================

        [
            "Sustainability",
            "Score",
            item.sustainability_score
        ],
        [
            "Sustainability",
            "Environmental Rating",
            item.environmental_rating
        ],
        [
            "Sustainability",
            "Carbon Footprint (kg CO2e)",
            item.carbon_footprint
        ],
        [
            "Sustainability",
            "CO2 Saved (kg)",
            item.co2_saved
        ],
        [
            "Sustainability",
            "Water Saved (L)",
            item.water_saved?.toLocaleString()
        ],
        [
            "Sustainability",
            "Landfill Saved (kg)",
            item.landfill_saved
        ],
        [
            "Sustainability",
            "Resource Conservation",
            item.resource_conservation
        ],

        ["", "", ""],

        // ==========================
        // Environmental Analytics
        // ==========================

        [
            "Environmental Analytics",
            "Carbon Reduction (kg)",
            item.carbon_reduction
        ],
        [
            "Environmental Analytics",
            "Water Conservation (L)",
            item.water_conservation?.toLocaleString()
        ],
        [
            "Environmental Analytics",
            "Landfill Diversion (kg)",
            item.landfill_diversion
        ],
        [
            "Environmental Analytics",
            "Eco Rating",
            `${item.eco_rating}/5`
        ],

        ["", "", ""],

        // ==========================
        // Waste Scoring Engine
        // ==========================

        [
            "Waste Scoring",
            "Recyclability Score",
            `${item.recyclability_score}%`
        ],
        [
            "Waste Scoring",
            "Reuse Score",
            `${item.reuse_score}%`
        ],
        [
            "Waste Scoring",
            "Sustainability Score",
            `${item.sustainability_score}%`
        ],
        [
            "Waste Scoring",
            "Material Recovery Score",
            `${item.material_recovery_score}%`
        ],
        [
            "Waste Scoring",
            "Processing Feasibility Score",
            `${item.processing_feasibility_score}%`
        ],
        [
            "Waste Scoring",
            "Circularity Score",
            `${item.circularity_score}%`
        ],
        [
            "Waste Scoring",
            "Circularity Category",
            item.circularity_category
        ],

        ["", "", ""],

        // ==========================
        // Circular Economy Analytics
        // ==========================

        [
            "Circular Economy",
            "Recycling Efficiency",
            `${item.recycling_efficiency}%`
        ],
        [
            "Circular Economy",
            "Waste Diversion Rate",
            `${item.waste_diversion_rate}%`
        ],
        [
            "Circular Economy",
            "Resource Recovery Rate",
            `${item.resource_recovery_rate}%`
        ],
        [
            "Circular Economy",
            "Circular Economy Index",
            item.circular_economy_index
        ],
        [
            "Circular Economy",
            "Overall Rating",
            item.circular_rating
        ],

        ["", "", ""],

        // ==========================
        // Sustainability Benchmark
        // ==========================

        [
            "Benchmark",
            "Overall Score",
            `${item.overall_score}%`
        ],
        [
            "Benchmark",
            "Sustainability Grade",
            item.sustainability_grade
        ],
        [
            "Benchmark",
            "ESG Rating",
            item.esg_rating
        ],
        [
            "Benchmark",
            "Industry Percentile",
            `${item.industry_percentile}%`
        ],
        [
            "Benchmark",
            "Performance",
            item.performance
        ],
        [
            "Benchmark",
            "Improvement Suggestions",
            item.improvement_suggestions
        ]

    ];

    const csvContent = rows
        .map(row =>
            row
                .map(value =>
                    `"${String(value ?? "").replace(/"/g, '""')}"`
                )
                .join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `Analysis_Report_${item.id}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}