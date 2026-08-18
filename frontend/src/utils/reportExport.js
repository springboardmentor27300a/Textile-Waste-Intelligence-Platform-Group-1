import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";


// ==========================================
// PDF PLATFORM REPORT
// ==========================================

export const downloadPDFReport = (reportData) => {

    const {
        users,
        inventory,
        analysis,
        sustainability
    } = reportData;

    const doc = new jsPDF();

    const today = new Date().toLocaleDateString();

    // --------------------------------------
    // Header
    // --------------------------------------

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");

    doc.text(
        "Textile Waste Intelligence Platform",
        20,
        20
    );

    doc.setFontSize(15);

    doc.text(
        "Platform Report",
        20,
        30
    );

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(
        `Generated on: ${today}`,
        20,
        38
    );


    // --------------------------------------
    // Platform Report Table
    // --------------------------------------

    autoTable(doc, {

        startY: 48,

        head: [
            [
                "Category",
                "Metric",
                "Value"
            ]
        ],

        body: [

            // Users

            [
                "Users",
                "Total Users",
                users.total
            ],

            [
                "Users",
                "Active Users",
                users.active
            ],

            [
                "Users",
                "Inactive Users",
                users.inactive
            ],


            // Inventory

            [
                "Inventory",
                "Total Batches",
                inventory.total_batches
            ],

            [
                "Inventory",
                "Total Waste",
                `${inventory.total_quantity} kg`
            ],


            // Analysis

            [
                "Analysis",
                "Total AI Analyses",
                analysis.total_analyses
            ],


            // Sustainability

            [
                "Sustainability",
                "Average Score",
                sustainability.average_score
            ],

            [
                "Sustainability",
                "CO2 Saved",
                `${sustainability.co2_saved} kg`
            ],

            [
                "Sustainability",
                "Water Saved",
                `${sustainability.water_saved} L`
            ],

            [
                "Sustainability",
                "Landfill Saved",
                `${sustainability.landfill_saved} kg`
            ]

        ],

        theme: "grid"

    });


    // --------------------------------------
    // Footer
    // --------------------------------------

    const finalY =
        doc.lastAutoTable?.finalY || 100;

    doc.setFontSize(9);

    doc.text(
        "Textile Waste Intelligence Platform",
        20,
        finalY + 15
    );


    // --------------------------------------
    // Download
    // --------------------------------------

    doc.save(
        "Textile_Waste_Platform_Report.pdf"
    );
};



// ==========================================
// EXCEL PLATFORM REPORT
// ==========================================

export const downloadExcelReport = (reportData) => {

    const {
        users,
        inventory,
        analysis,
        sustainability
    } = reportData;


    // Create workbook

    const workbook = XLSX.utils.book_new();


    // ======================================
    // PLATFORM SUMMARY
    // ======================================

    const summaryData = [

        [
            "TEXTILE WASTE INTELLIGENCE PLATFORM"
        ],

        [
            "PLATFORM REPORT"
        ],

        [],

        [
            "Category",
            "Metric",
            "Value"
        ],

        [
            "Users",
            "Total Users",
            users.total
        ],

        [
            "Users",
            "Active Users",
            users.active
        ],

        [
            "Users",
            "Inactive Users",
            users.inactive
        ],

        [
            "Inventory",
            "Total Batches",
            inventory.total_batches
        ],

        [
            "Inventory",
            "Total Waste (kg)",
            inventory.total_quantity
        ],

        [
            "Analysis",
            "Total AI Analyses",
            analysis.total_analyses
        ],

        [
            "Sustainability",
            "Average Sustainability Score",
            sustainability.average_score
        ],

        [
            "Sustainability",
            "CO₂ Saved (kg)",
            sustainability.co2_saved
        ],

        [
            "Sustainability",
            "Water Saved (L)",
            sustainability.water_saved
        ],

        [
            "Sustainability",
            "Landfill Saved (kg)",
            sustainability.landfill_saved
        ]

    ];


    const summarySheet =
        XLSX.utils.aoa_to_sheet(summaryData);


    XLSX.utils.book_append_sheet(
        workbook,
        summarySheet,
        "Platform Summary"
    );


    // ======================================
    // USERS
    // ======================================

    const usersSheet =
        XLSX.utils.aoa_to_sheet([

            [
                "User Metric",
                "Value"
            ],

            [
                "Total Users",
                users.total
            ],

            [
                "Active Users",
                users.active
            ],

            [
                "Inactive Users",
                users.inactive
            ]

        ]);


    XLSX.utils.book_append_sheet(
        workbook,
        usersSheet,
        "Users"
    );


    // ======================================
    // INVENTORY
    // ======================================

    const inventorySheet =
        XLSX.utils.aoa_to_sheet([

            [
                "Inventory Metric",
                "Value"
            ],

            [
                "Total Batches",
                inventory.total_batches
            ],

            [
                "Total Waste (kg)",
                inventory.total_quantity
            ]

        ]);


    XLSX.utils.book_append_sheet(
        workbook,
        inventorySheet,
        "Inventory"
    );


    // ======================================
    // ANALYSIS
    // ======================================

    const analysisSheet =
        XLSX.utils.aoa_to_sheet([

            [
                "Analysis Metric",
                "Value"
            ],

            [
                "Total AI Analyses",
                analysis.total_analyses
            ]

        ]);


    XLSX.utils.book_append_sheet(
        workbook,
        analysisSheet,
        "Analysis"
    );


    // ======================================
    // SUSTAINABILITY
    // ======================================

    const sustainabilitySheet =
        XLSX.utils.aoa_to_sheet([

            [
                "Sustainability Metric",
                "Value"
            ],

            [
                "Average Sustainability Score",
                sustainability.average_score
            ],

            [
                "CO₂ Saved (kg)",
                sustainability.co2_saved
            ],

            [
                "Water Saved (L)",
                sustainability.water_saved
            ],

            [
                "Landfill Saved (kg)",
                sustainability.landfill_saved
            ]

        ]);


    XLSX.utils.book_append_sheet(
        workbook,
        sustainabilitySheet,
        "Sustainability"
    );


    // ======================================
    // DOWNLOAD EXCEL FILE
    // ======================================

    XLSX.writeFile(
        workbook,
        "Textile_Waste_Platform_Report.xlsx"
    );

};