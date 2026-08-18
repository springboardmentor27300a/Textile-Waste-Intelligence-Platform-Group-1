import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function generatePDF(result, image) {

    if (!result) return;

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
    doc.setTextColor(100);

    doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        14,
        28
    );

    /* ===========================
       Uploaded Image
    =========================== */

    let startY = 40;

    if (image) {

        const reader = new FileReader();

        const imageData = await new Promise((resolve) => {

            reader.onload = () => resolve(reader.result);

            reader.readAsDataURL(image);

        });

        doc.setFontSize(14);
        doc.setTextColor(0);

        doc.text("Uploaded Textile Image", 14, startY);

        doc.addImage(
            imageData,
            "JPEG",
            14,
            startY + 5,
            50,
            50
        );

    }

    /* ===========================
       Summary
    =========================== */

    autoTable(doc, {

        startY: 100,

        head: [["Analysis Summary", "Result"]],

        body: [

            ["Material", result.material.label],

            ["Material Confidence",
            `${(result.material.confidence * 100).toFixed(1)}%`],

            ["Damage",
            result.damage.label],

            ["Damage Confidence",
            `${(result.damage.confidence * 100).toFixed(1)}%`],

            ["Quality Grade",
            result.quality.quality_grade],

            ["Recommendation",
            result.recommendation.recommended_action]

        ],

        theme: "grid",

        headStyles: {

            fillColor: [37, 99, 235]

        }

    });

    /* ===========================
       Material Probabilities
    =========================== */

    autoTable(doc, {

        startY: doc.lastAutoTable.finalY + 12,

        head: [["Material", "Probability"]],

        body: Object.entries(result.material.probabilities).map(

            ([key, value]) => [

                key,

                `${(value * 100).toFixed(1)}%`

            ]

        ),

        theme: "striped",

        headStyles: {

            fillColor: [30, 64, 175]

        }

    });

    /* ===========================
       Quality Metrics
    =========================== */

    autoTable(doc, {

        startY: doc.lastAutoTable.finalY + 12,

        head: [["Quality Metric", "Value"]],

        body: [

            ["Score", result.quality.quality_score],

            ["Brightness",
            Math.round(result.quality.brightness)],

            ["Contrast",
            Math.round(result.quality.contrast)],

            ["Sharpness",
            Math.round(result.quality.sharpness)],

            ["Dominant Color",
            result.quality.dominant_color]

        ],

        theme: "grid",

        headStyles: {

            fillColor: [245, 158, 11]

        }

    });
    /* ===========================
   Material Details
=========================== */

let materialStart = doc.lastAutoTable.finalY + 12;

if (materialStart > 190) {
    doc.addPage();
    materialStart = 20;
}

autoTable(doc, {

    startY: materialStart,

    head: [["Material Details", "Value"]],

    body: [

        ["Fabric Type",
            result.material_classification.fabric_type],

        ["Material Category",
            result.material_classification.material_category],

        ["Fiber Composition",
            result.material_classification.fiber_composition],

        ["Blend Identification",
            result.material_classification.blend_identification],

        ["Fabric Texture",
            result.material_classification.fabric_texture],

        ["Fabric Pattern",
            result.material_classification.fabric_pattern]

    ],

    theme: "grid",

    headStyles: {

        fillColor: [99, 102, 241]

    }

});

    /* ===========================
   Recommendation
=========================== */

let recommendationStart = doc.lastAutoTable.finalY + 12;

// If less than 80mm remains, move to a new page first
if (recommendationStart > 190) {

    doc.addPage();

    recommendationStart = 20;

}

autoTable(doc, {

    startY: recommendationStart,

    head: [["Recommendation", "Value"]],

    body: [

        ["Action", result.recommendation.recommended_action],

        ["Recyclability", result.recommendation.recyclability],

        ["Environmental Impact", result.recommendation.environmental_impact],

        ["Estimated Value", result.recommendation.estimated_value],

        ["Priority", result.recommendation.priority],

        ["Reason", result.recommendation.reason]

    ],

    theme: "grid",

    headStyles: {

        fillColor: [22, 163, 74]

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

        ["Category", result.waste_classification.category],

        ["Recyclability", result.waste_classification.recyclability],

        ["Reuse Potential", result.waste_classification.reuse_potential],

        ["Contamination", result.waste_classification.contamination_detection],

        ["Disposal", result.waste_classification.disposal_recommendation],

        ["Compostable",
            result.waste_classification.compostable ? "Yes" : "No"],

        ["Hazardous Textile",
            result.waste_classification.hazardous_textile ? "Yes" : "No"]

    ],

    theme: "grid",

    headStyles: {

        fillColor: [59,130,246]

    }

});
/* ===========================
   Recycling Recommendation Engine
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

        ["Method", result.recycling_engine.recommended_method],

        ["Fiber Recycling", result.recycling_engine.fiber_recycling],

        ["Mechanical", result.recycling_engine.mechanical_recycling],

        ["Chemical", result.recycling_engine.chemical_recycling],

        ["Fabric Reuse", result.recycling_engine.fabric_reuse],

        ["Industrial Recovery", result.recycling_engine.industrial_recovery],

        ["Donation", result.recycling_engine.donation],

        ["Waste Reduction",
            result.recycling_engine.waste_reduction_strategy],

        ["Upcycling Suggestions",
            result.recycling_engine.upcycling_suggestions.join(", ")]

    ],

    theme: "grid",

    headStyles: {

        fillColor: [16,185,129]

    }

});
    /* ===========================
   Sustainability Intelligence
=========================== */

let sustainabilityStart = doc.lastAutoTable.finalY + 12;

if (sustainabilityStart > 190) {
    doc.addPage();
    sustainabilityStart = 20;
}

autoTable(doc, {

    startY: sustainabilityStart,

    head: [["Sustainability Intelligence", "Value"]],

    body: [

        ["Sustainability Score",
            result.sustainability.score],

        ["Environmental Rating",
            result.sustainability.environmental_rating],

        

        ["Carbon Footprint",
            `${result.sustainability.carbon_footprint} kg CO2e`],

        ["CO2 Saved",
            `${result.sustainability.co2_saved} kg`],

        ["Water Saved",
            `${result.sustainability.water_saved} L`],

        ["Landfill Saved",
            `${result.sustainability.landfill_saved} kg`],

        ["Resource Conservation",
            result.sustainability.resource_conservation]

    ],

    theme: "grid",

    headStyles: {

        fillColor: [34, 197, 94]

    }

});
/* ===========================
   Environmental Analytics
=========================== */

let environmentStart = doc.lastAutoTable.finalY + 12;

if (environmentStart > 170) {
    doc.addPage();
    environmentStart = 20;
}

autoTable(doc, {

    startY: environmentStart,

    head: [["Environmental Analytics", "Value"]],

    body: [

        ["Carbon Reduction",
            `${result.environmental_analytics.carbon_reduction} kg`],

        ["Water Conservation",
            `${result.environmental_analytics.water_conservation} L`],

        ["Landfill Diversion",
            `${result.environmental_analytics.landfill_diversion} kg`],

        ["Environmental Impact",
            result.environmental_analytics.environmental_impact],

        ["Eco Rating", `${result.environmental_analytics.eco_rating}/5`]

    ],

    theme: "grid",

    headStyles: {

        fillColor: [6, 182, 212]

    }

});
//     let summaryY = doc.lastAutoTable.finalY + 10;

// // Split summary into multiple lines
// const summaryLines = doc.splitTextToSize(
//     result.environmental_analytics.summary,
//     180
// );

// // Check if a new page is needed
// const requiredHeight = summaryLines.length * 6;

// if (summaryY + requiredHeight > 280) {
//     doc.addPage();
//     summaryY = 20;
// }

// doc.setFont("helvetica", "bold");
// doc.setFontSize(12);
// doc.text("Summary", 14, summaryY);

// doc.setFont("helvetica", "normal");
// doc.setFontSize(10);

// doc.text(
//     summaryLines,
//     14,
//     summaryY + 8
// );
    
/* ===========================
   Waste Scoring Engine
=========================== */

let wasteScoreStart = doc.lastAutoTable.finalY + 15;

if (wasteScoreStart > 190) {
    doc.addPage();
    wasteScoreStart = 20;
}

autoTable(doc, {
    startY: wasteScoreStart,

    head: [["Waste Scoring Engine", "Value"]],

    body: [
        ["Recyclability Score", `${result.waste_scoring.recyclability_score}%`],
        ["Reuse Score", `${result.waste_scoring.reuse_score}%`],
        ["Sustainability Score", `${result.waste_scoring.sustainability_score}%`],
        ["Material Recovery Score", `${result.waste_scoring.material_recovery_score}%`],
        ["Processing Feasibility", `${result.waste_scoring.processing_feasibility_score}%`],
        ["Circularity Score", `${result.waste_scoring.circularity_score}%`],
        ["Circularity Category", result.waste_scoring.circularity_category]
    ],

    theme: "grid",

    headStyles: {
        fillColor: [249,115,22]
    }
});


/* ===========================
   Circular Economy Analytics
=========================== */

let circularStart = doc.lastAutoTable.finalY + 15;


if (circularStart > 190) {
    doc.addPage();
    circularStart = 20;
}

autoTable(doc, {
    startY: circularStart,

    head: [["Circular Economy Analytics", "Value"]],

    body: [
        ["Recycling Efficiency", `${result.circular_economy.recycling_efficiency}%`],
        ["Waste Diversion Rate", `${result.circular_economy.waste_diversion_rate}%`],
        ["Resource Recovery Rate", `${result.circular_economy.resource_recovery_rate}%`],
        ["Circular Economy Index", result.circular_economy.circular_economy_index],
        ["Overall Rating", result.circular_economy.rating]
    ],

    theme: "grid",

    headStyles: {
        fillColor: [16,185,129]
    }
});

/* ===========================
   Sustainability Benchmark
=========================== */

let benchmarkStart = doc.lastAutoTable.finalY + 15;

if (benchmarkStart > 190) {
    doc.addPage();
    benchmarkStart = 20;
}

autoTable(doc, {
    startY: benchmarkStart,

    head: [["Sustainability Benchmark", "Value"]],

    body: [
        ["Overall Score", `${result.benchmark.overall_score}%`],
        ["Sustainability Grade", result.benchmark.sustainability_grade],
        ["ESG Rating", result.benchmark.esg_rating],
        ["Industry Percentile", `${result.benchmark.industry_percentile}%`],
        ["Performance", result.benchmark.performance],
        [
            "Improvement Suggestions",
            result.benchmark.improvement_suggestions.join(", ")
        ]
    ],

    theme: "grid",

    headStyles: {
        fillColor: [37,99,235]
    }
});
    /* ===========================
   Summary
=========================== */

let summaryY = doc.lastAutoTable.finalY + 15;

// Check page space
if (summaryY > 235) {
    doc.addPage();
    summaryY = 20;
}

// Title
doc.setFont("helvetica", "bold");
doc.setFontSize(14);
doc.text("Summary", 14, summaryY);

// Divider
doc.setDrawColor(180);
doc.line(14, summaryY + 3, 195, summaryY + 3);

// Body
doc.setFont("helvetica", "normal");
doc.setFontSize(11);

const summary = [

    "• By following the recommended recycling method,",

    `• This textile has an estimated carbon footprint of ${result.sustainability.carbon_footprint} kg CO2e.`,
    
    `• This textile can save approximately ${result.environmental_analytics.carbon_reduction} kg of CO2 emissions.`,

    `• It can conserve around ${result.environmental_analytics.water_conservation.toLocaleString()} liters of water.`,

    `• It diverts approximately ${result.environmental_analytics.landfill_diversion} kg of waste from landfills.`

];

let y = summaryY + 12;

summary.forEach(line => {

    doc.text(line, 18, y);

    y += 8;

});

// Bottom Divider
doc.line(14, y, 195, y);

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

        `Textile_AI_Report_${new Date()

            .toISOString()  

            .slice(0, 10)}.pdf`

    );


}