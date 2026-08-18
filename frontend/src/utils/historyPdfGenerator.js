import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateHistoryPDF(item) {

    if (!item) return;

    const doc = new jsPDF();

    /* ===========================
       Title
    =========================== */

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175);

    doc.text(
        "AI Textile Waste Analysis Report",
        105,
        18,
        { align: "center" }
    );

    doc.setFontSize(11);
    doc.setTextColor(120);

    doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        14,
        30
    );

    /* ===========================
       Basic Information
    =========================== */

    autoTable(doc, {

        startY: 40,

        head: [["Basic Information", "Value"]],

        body: [

            ["Image", item.image_name],

            ["Material", item.material],

            ["Material Confidence",
                `${(item.material_confidence * 100).toFixed(1)}%`],

            ["Damage", item.damage],

            ["Damage Confidence",
                `${(item.damage_confidence * 100).toFixed(1)}%`],

            ["Quality Grade", item.quality_grade],

            ["Quality Score", item.quality_score],

            ["Recommendation", item.recommended_action],

            ["Date",
                new Date(item.analyzed_at).toLocaleString()]

        ],

        theme: "grid",

        headStyles: {

            fillColor: [37, 99, 235]

        }

    });

    /* ===========================
       Material Classification
    =========================== */

    autoTable(doc, {

        startY: doc.lastAutoTable.finalY + 12,

        head: [["Material Classification", "Value"]],

        body: [

            ["Material Category", item.material_category],

            ["Fiber Composition", item.fiber_composition],

            ["Blend Identification", item.blend_identification],

            ["Fabric Texture", item.fabric_texture],

            ["Fabric Pattern", item.fabric_pattern]

        ],

        theme: "grid",

        headStyles: {

            fillColor: [99, 102, 241]

        }

    });

    /* ===========================
       Waste Classification
    =========================== */

    let wasteStart = doc.lastAutoTable.finalY + 12;

    if (wasteStart > 190) {

        doc.addPage();

        wasteStart = 20;

    }

    autoTable(doc, {

        startY: wasteStart,

        head: [["Waste Classification", "Value"]],

        body: [

            ["Category", item.waste_category],

            ["Recyclability", item.recyclability],

            ["Reuse Potential", item.reuse_potential],

            ["Contamination", item.contamination_detection],

            ["Disposal", item.disposal_recommendation],

            ["Compostable", item.compostable],

            ["Hazardous Textile", item.hazardous_textile]

        ],

        theme: "grid",

        headStyles: {

            fillColor: [59, 130, 246]

        }

    });

    /* ===========================
       Recycling Recommendation
    =========================== */

    let recycleStart = doc.lastAutoTable.finalY + 12;

    if (recycleStart > 190) {

        doc.addPage();

        recycleStart = 20;

    }

    autoTable(doc, {

        startY: recycleStart,

        head: [["Recycling Recommendation", "Value"]],

        body: [

            ["Recommended Method", item.recommended_method],

            ["Fiber Recycling", item.fiber_recycling],

            ["Mechanical Recycling", item.mechanical_recycling],

            ["Chemical Recycling", item.chemical_recycling],

            ["Fabric Reuse", item.fabric_reuse],

            ["Industrial Recovery", item.industrial_recovery],

            ["Donation", item.donation],

            ["Estimated Value", item.estimated_value],

            ["Environmental Impact", item.environmental_impact],

            ["Priority", item.priority],

            ["Waste Reduction Strategy",
                item.waste_reduction_strategy],

            ["Upcycling Suggestions",
                item.upcycling_suggestions]

        ],

        theme: "grid",

        headStyles: {

            fillColor: [22, 163, 74]

        }

    });

    let sustainabilityStart = doc.lastAutoTable.finalY + 12;

    if (sustainabilityStart > 190) {
        doc.addPage();
        sustainabilityStart = 20;
    }

    autoTable(doc, {
        startY: sustainabilityStart,

        head: [["Sustainability Intelligence", "Value"]],

        body: [
            ["Sustainability Score", item.sustainability_score],
            ["Environmental Rating", item.environmental_rating],
            ["Carbon Footprint (kg CO2e)", item.carbon_footprint],
            ["CO2 Saved (kg)", item.co2_saved],
            ["Water Saved (L)", item.water_saved?.toLocaleString()],
            ["Landfill Saved (kg)", item.landfill_saved],
            ["Resource Conservation", item.resource_conservation]
        ],

        theme: "grid",

        headStyles: {
            fillColor: [16, 185, 129]
        }
    });

    let environmentalStart = doc.lastAutoTable.finalY + 12;

    if (environmentalStart > 190) {
        doc.addPage();
        environmentalStart = 20;
    }

    autoTable(doc, {
        startY: environmentalStart,

        head: [["Environmental Analytics", "Value"]],

        body: [
            ["Carbon Reduction (kg)", item.carbon_reduction],
            ["Water Conservation (L)", item.water_conservation?.toLocaleString()],
            ["Landfill Diversion (kg)", item.landfill_diversion],
            ["Eco Rating", `${item.eco_rating}/5`]
        ],

        theme: "grid",

        headStyles: {
            fillColor: [5, 150, 105]
        }
    });

    /* ===========================
   Waste Scoring Engine
=========================== */

let wasteScoreStart = doc.lastAutoTable.finalY + 12;

if (wasteScoreStart > 190) {
    doc.addPage();
    wasteScoreStart = 20;
}

autoTable(doc, {

    startY: wasteScoreStart,

    head: [["Waste Scoring Engine", "Value"]],

    body: [

        ["Recyclability Score", `${item.recyclability_score}%`],

        ["Reuse Score", `${item.reuse_score}%`],

        ["Sustainability Score", `${item.sustainability_score}%`],

        ["Material Recovery Score", `${item.material_recovery_score}%`],

        ["Processing Feasibility", `${item.processing_feasibility_score}%`],

        ["Circularity Score", `${item.circularity_score}%`],

        ["Circularity Category", item.circularity_category]

    ],

    theme: "grid",

    headStyles: {
        fillColor: [37, 99, 235]
    }

});
    /* ===========================
   Circular Economy Analytics
=========================== */

let circularStart = doc.lastAutoTable.finalY + 12;

if (circularStart > 190) {
    doc.addPage();
    circularStart = 20;
}

autoTable(doc, {

    startY: circularStart,

    head: [["Circular Economy Analytics", "Value"]],

    body: [

        ["Recycling Efficiency", `${item.recycling_efficiency}%`],

        ["Waste Diversion Rate", `${item.waste_diversion_rate}%`],

        ["Resource Recovery Rate", `${item.resource_recovery_rate}%`],

        ["Circular Economy Index", item.circular_economy_index],

        ["Overall Rating", item.circular_rating]

    ],

    theme: "grid",

    headStyles: {
        fillColor: [22, 163, 74]
    }

});
    /* ===========================
   Sustainability Benchmark
=========================== */

let benchmarkStart = doc.lastAutoTable.finalY + 12;

if (benchmarkStart > 190) {
    doc.addPage();
    benchmarkStart = 20;
}

autoTable(doc, {

    startY: benchmarkStart,

    head: [["Sustainability Benchmark", "Value"]],

    body: [

        ["Overall Score", `${item.overall_score}%`],

        ["Sustainability Grade", item.sustainability_grade],

        ["ESG Rating", item.esg_rating],

        ["Industry Percentile", `${item.industry_percentile}%`],

        ["Performance", item.performance],

        ["Improvement Suggestions", item.improvement_suggestions]

    ],

    theme: "grid",

    headStyles: {
        fillColor: [168, 85, 247]
    }

});

    /* ===========================
       Footer
    =========================== */

    doc.setFontSize(10);

    doc.setTextColor(120);

    const pageHeight = doc.internal.pageSize.getHeight();

doc.text(
    "Generated by Textile Waste Intelligence Platform",
    105,
    pageHeight - 10,
    {
        align: "center"
    }
);

    doc.save(

        `Analysis_Report_${item.id}.pdf`

    );

}