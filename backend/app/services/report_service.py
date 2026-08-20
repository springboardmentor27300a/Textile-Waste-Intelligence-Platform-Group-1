from pathlib import Path
from datetime import date

from openpyxl import Workbook
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

from sqlalchemy.orm import Session

from app.models.report import Report
from app.services.analysis_service import get_latest_analysis


REPORT_DIR = Path(__file__).resolve().parents[2] / "generated_reports"
REPORT_DIR.mkdir(parents=True, exist_ok=True)


def _get_analysis(db: Session, current_user, batch_id: int):
    return get_latest_analysis(
        db=db,
        current_user=current_user,
        batch_id=batch_id,
    )


def generate_pdf_report(
    db: Session,
    current_user,
    batch_id: int,
):
    analysis = _get_analysis(db, current_user, batch_id)

    batch_code = analysis["batch_code"]
    material = analysis["material"]

    file_name = f"{batch_code}_textile_report.pdf"
    file_path = REPORT_DIR / file_name

    doc = SimpleDocTemplate(
        str(file_path),
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()
    story = []

    story.append(
        Paragraph(
            "Textile Waste Intelligence Report",
            styles["Title"],
        )
    )

    story.append(
        Paragraph(
            f"Batch: {batch_code}",
            styles["Normal"],
        )
    )

    story.append(
        Paragraph(
            f"Material: {material}",
            styles["Normal"],
        )
    )

    story.append(Spacer(1, 15))

    story.append(
        Paragraph(
            "1. Material Classification",
            styles["Heading2"],
        )
    )

    classification_data = [
        ["Material", analysis["material"]],
        ["Confidence", f'{analysis["confidence"]}%'],
        ["Condition", analysis["condition"]],
        [
            "Condition Confidence",
            f'{analysis["condition_confidence"]}%',
        ],
    ]

    table = Table(classification_data, colWidths=[180, 280])

    table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )

    story.append(table)
    story.append(Spacer(1, 15))

    score = analysis["waste_score"]

    story.append(
        Paragraph(
            "2. Waste & Circularity Assessment",
            styles["Heading2"],
        )
    )

    score_data = [
        ["Waste Category", score["waste_category"]],
        ["Recyclability", f'{score["recyclability_score"]}%'],
        ["Condition", f'{score["condition_score"]}%'],
        ["Reuse Potential", f'{score["reuse_potential_score"]}%'],
        [
            "Environmental Benefit",
            f'{score["environmental_benefit_score"]}%',
        ],
        [
            "Processing Feasibility",
            f'{score["processing_feasibility_score"]}%',
        ],
        ["Circularity", f'{score["circularity_score"]}%'],
    ]

    table = Table(score_data, colWidths=[220, 240])

    table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
            ]
        )
    )

    story.append(table)
    story.append(Spacer(1, 15))

    story.append(
        Paragraph(
            "3. Recovery Recommendations",
            styles["Heading2"],
        )
    )

    recommendation_data = [
        ["Rank", "Action", "Suitability", "Reason"]
    ]

    for item in analysis.get("recommendations", []):
        recommendation_data.append(
            [
                str(item["rank"]),
                item["action"],
                f'{item["suitability_score"]}%',
                item["reason"],
            ]
        )

    table = Table(
        recommendation_data,
        colWidths=[40, 100, 80, 240],
    )

    table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )

    story.append(table)
    story.append(Spacer(1, 15))

    impact = analysis.get("impact", {})

    story.append(
        Paragraph(
            "4. Environmental Impact",
            styles["Heading2"],
        )
    )

    impact_data = [
        [
            "CO2 Avoided",
            f'{impact.get("co2_avoided_kg", 0)} kg',
        ],
        [
            "Water Saved",
            f'{impact.get("water_saved_liters", 0)} L',
        ],
        [
            "Landfill Avoided",
            f'{impact.get("landfill_avoided_kg", 0)} kg',
        ],
        [
            "Material Recovered",
            f'{impact.get("material_recovered_kg", 0)} kg',
        ],
        [
            "Diversion",
            f'{impact.get("diversion_percentage", 0)}%',
        ],
    ]

    table = Table(impact_data, colWidths=[220, 240])

    table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
            ]
        )
    )

    story.append(table)

    doc.build(story)

    report = Report(
        generated_by=current_user.id,
        report_type="TEXTILE_ANALYSIS",
        title=f"Textile Waste Analysis - {batch_code}",
        file_name=file_name,
        file_path=str(file_path),
        file_format="PDF",
        date_from=date.today(),
        date_to=date.today(),
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "report_id": report.id,
        "file_name": file_name,
        "file_format": "PDF",
        "download_url": f"/api/reports/download/{report.id}",
    }


def generate_excel_report(
    db: Session,
    current_user,
    batch_id: int,
):
    analysis = _get_analysis(db, current_user, batch_id)

    batch_code = analysis["batch_code"]
    file_name = f"{batch_code}_textile_report.xlsx"
    file_path = REPORT_DIR / file_name

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Analysis Report"

    rows = [
        ["TEXTILE WASTE INTELLIGENCE REPORT", ""],
        ["Batch Code", batch_code],
        ["Material", analysis["material"]],
        ["Confidence", analysis["confidence"]],
        ["Condition", analysis["condition"]],
        [
            "Condition Confidence",
            analysis["condition_confidence"],
        ],
        ["", ""],
        ["WASTE ASSESSMENT", ""],
    ]

    score = analysis["waste_score"]

    rows.extend(
        [
            ["Waste Category", score["waste_category"]],
            ["Recyclability", score["recyclability_score"]],
            ["Condition Score", score["condition_score"]],
            ["Reuse Potential", score["reuse_potential_score"]],
            [
                "Environmental Benefit",
                score["environmental_benefit_score"],
            ],
            [
                "Processing Feasibility",
                score["processing_feasibility_score"],
            ],
            ["Circularity", score["circularity_score"]],
            ["", ""],
            ["RECOVERY RECOMMENDATIONS", ""],
            ["Rank", "Action", "Suitability", "Reason"],
        ]
    )

    for item in analysis.get("recommendations", []):
        rows.append(
            [
                item["rank"],
                item["action"],
                item["suitability_score"],
                item["reason"],
            ]
        )

    impact = analysis.get("impact", {})

    rows.extend(
        [
            ["", ""],
            ["ENVIRONMENTAL IMPACT", ""],
            [
                "CO2 Avoided (kg)",
                impact.get("co2_avoided_kg", 0),
            ],
            [
                "Water Saved (liters)",
                impact.get("water_saved_liters", 0),
            ],
            [
                "Landfill Avoided (kg)",
                impact.get("landfill_avoided_kg", 0),
            ],
            [
                "Material Recovered (kg)",
                impact.get("material_recovered_kg", 0),
            ],
            [
                "Diversion (%)",
                impact.get("diversion_percentage", 0),
            ],
        ]
    )

    for row in rows:
        sheet.append(row)

    sheet.column_dimensions["A"].width = 30
    sheet.column_dimensions["B"].width = 25
    sheet.column_dimensions["C"].width = 20
    sheet.column_dimensions["D"].width = 60

    workbook.save(file_path)

    report = Report(
        generated_by=current_user.id,
        report_type="TEXTILE_ANALYSIS",
        title=f"Textile Waste Analysis - {batch_code}",
        file_name=file_name,
        file_path=str(file_path),
        file_format="XLSX",
        date_from=date.today(),
        date_to=date.today(),
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "report_id": report.id,
        "file_name": file_name,
        "file_format": "XLSX",
        "download_url": f"/api/reports/download/{report.id}",
    }