from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER

from backend.database import get_db
from backend.models import PredictionHistory

from datetime import datetime
import os
import re


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/report",
    tags=["PDF Report"]
)


# ============================================================
# HELPER - EXTRACT NUMERIC CARBON VALUE
# ============================================================

def extract_carbon_value(value):

    if value is None:
        return 0.0

    try:
        return float(value)

    except (ValueError, TypeError):
        pass

    try:

        match = re.search(
            r"-?\d+(?:\.\d+)?",
            str(value)
        )

        if match:
            return float(match.group())

    except Exception:
        pass

    return 0.0


# ============================================================
# PDF REPORT
# ============================================================

@router.get("/download")
def download_report(
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Get prediction history
    # --------------------------------------------------------

    predictions = (
        db.query(PredictionHistory)
        .order_by(
            PredictionHistory.created_at.desc()
        )
        .all()
    )


    # --------------------------------------------------------
    # File location
    # --------------------------------------------------------

    pdf_file = os.path.join(
        os.getcwd(),
        "Sustainability_Report.pdf"
    )


    # --------------------------------------------------------
    # PDF Document
    # --------------------------------------------------------

    doc = SimpleDocTemplate(
        pdf_file,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )


    styles = getSampleStyleSheet()


    # --------------------------------------------------------
    # Custom Styles
    # --------------------------------------------------------

    title_style = styles["Title"]

    title_style.alignment = TA_CENTER

    title_style.textColor = colors.HexColor(
        "#00695C"
    )


    heading_style = styles["Heading2"]

    heading_style.textColor = colors.HexColor(
        "#00695C"
    )


    normal_style = styles["BodyText"]


    # --------------------------------------------------------
    # PDF Elements
    # --------------------------------------------------------

    elements = []


    # ========================================================
    # TITLE
    # ========================================================

    elements.append(
        Paragraph(
            "AI-Powered Textile Waste<br/>"
            "Intelligence Platform",
            title_style
        )
    )

    elements.append(
        Spacer(1, 10)
    )


    elements.append(
        Paragraph(
            "Sustainability Report",
            heading_style
        )
    )


    elements.append(
        Spacer(1, 10)
    )


    elements.append(
        Paragraph(
            f"Generated on: "
            f"{datetime.now().strftime('%d-%m-%Y %H:%M')}",
            normal_style
        )
    )


    elements.append(
        Spacer(1, 20)
    )


    # ========================================================
    # SUMMARY CALCULATIONS
    # ========================================================

    total_predictions = len(
        predictions
    )


    scores = []

    total_carbon = 0.0

    reusable_count = 0

    recyclable_count = 0

    damaged_count = 0


    for item in predictions:

        # Sustainability score

        if item.sustainability_score is not None:

            try:

                scores.append(
                    float(
                        item.sustainability_score
                    )
                )

            except (ValueError, TypeError):

                pass


        # Carbon

        total_carbon += (
            extract_carbon_value(
                item.carbon_saved
            )
        )


        # Waste category

        category = (
            str(
                item.waste_category or ""
            )
            .strip()
            .lower()
        )


        if category == "reusable":

            reusable_count += 1

        elif category == "recyclable":

            recyclable_count += 1

        elif category == "damaged":

            damaged_count += 1


    # --------------------------------------------------------
    # Average Score
    # --------------------------------------------------------

    if scores:

        average_score = (
            sum(scores) /
            len(scores)
        )

    else:

        average_score = 0


    # --------------------------------------------------------
    # Waste Diversion
    # --------------------------------------------------------

    diverted_count = (
        reusable_count +
        recyclable_count
    )


    if total_predictions > 0:

        waste_diversion = (
            diverted_count /
            total_predictions
        ) * 100

    else:

        waste_diversion = 0


    # ========================================================
    # EXECUTIVE SUMMARY
    # ========================================================

    elements.append(
        Paragraph(
            "Executive Summary",
            heading_style
        )
    )


    summary_data = [

        [
            "Metric",
            "Value"
        ],

        [
            "Total Predictions",
            str(total_predictions)
        ],

        [
            "Average Sustainability Score",
            f"{average_score:.2f}"
        ],

        [
            "Total Carbon Saved",
            f"{total_carbon:.2f} kg CO₂"
        ],

        [
            "Waste Diversion",
            f"{waste_diversion:.2f}%"
        ],

        [
            "Reusable Waste",
            str(reusable_count)
        ],

        [
            "Recyclable Waste",
            str(recyclable_count)
        ],

        [
            "Damaged Waste",
            str(damaged_count)
        ]

    ]


    summary_table = Table(
        summary_data,
        colWidths=[260, 180]
    )


    summary_table.setStyle(
        TableStyle([

            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                colors.HexColor("#00695C")
            ),

            (
                "TEXTCOLOR",
                (0, 0),
                (-1, 0),
                colors.white
            ),

            (
                "FONTNAME",
                (0, 0),
                (-1, 0),
                "Helvetica-Bold"
            ),

            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.5,
                colors.grey
            ),

            (
                "PADDING",
                (0, 0),
                (-1, -1),
                8
            ),

            (
                "BACKGROUND",
                (0, 1),
                (-1, -1),
                colors.whitesmoke
            )

        ])
    )


    elements.append(
        summary_table
    )


    elements.append(
        Spacer(1, 25)
    )


    # ========================================================
    # PREDICTION DETAILS
    # ========================================================

    elements.append(
        Paragraph(
            "Prediction Details",
            heading_style
        )
    )


    elements.append(
        Spacer(1, 10)
    )


    if not predictions:

        elements.append(
            Paragraph(
                "No prediction records are available.",
                normal_style
            )
        )

    else:

        table_data = [

            [
                "ID",
                "Fabric",
                "Confidence",
                "Category",
                "Carbon Saved",
                "Score"
            ]

        ]


        for item in predictions:

            table_data.append(

                [

                    str(
                        item.id
                    ),

                    str(
                        item.fabric_type or "-"
                    ),

                    str(
                        item.confidence or "-"
                    ),

                    str(
                        item.waste_category or "-"
                    ),

                    str(
                        item.carbon_saved or "-"
                    ),

                    str(
                        item.sustainability_score or "-"
                    )

                ]

            )


        prediction_table = Table(
            table_data,
            repeatRows=1,
            colWidths=[
                35,
                90,
                75,
                80,
                80,
                55
            ]
        )


        prediction_table.setStyle(
            TableStyle([

                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#00695C")
                ),

                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white
                ),

                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),

                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    8
                ),

                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),

                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    5
                ),

                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                )

            ])
        )


        elements.append(
            prediction_table
        )


    elements.append(
        Spacer(1, 25)
    )


    # ========================================================
    # ENVIRONMENTAL IMPACT
    # ========================================================

    elements.append(
        Paragraph(
            "Environmental Impact",
            heading_style
        )
    )


    elements.append(
        Spacer(1, 8)
    )


    elements.append(
        Paragraph(
            f"The system recorded "
            f"{total_predictions} textile waste predictions "
            f"with an estimated total carbon saving of "
            f"{total_carbon:.2f} kg CO₂. "
            f"The calculated waste diversion rate is "
            f"{waste_diversion:.2f}%.",
            normal_style
        )
    )


    elements.append(
        Spacer(1, 15)
    )


    elements.append(
        Paragraph(
            "This report provides a consolidated view "
            "of AI-based textile classification, "
            "waste categorization, carbon savings, "
            "and sustainability performance.",
            normal_style
        )
    )


    elements.append(
        Spacer(1, 25)
    )


    # ========================================================
    # FOOTER
    # ========================================================

    elements.append(
        Paragraph(
            "AI-Powered Textile Waste Intelligence Platform "
            "© 2026",
            normal_style
        )
    )


    # ========================================================
    # BUILD PDF
    # ========================================================

    doc.build(
        elements
    )


    # ========================================================
    # RETURN PDF
    # ========================================================

    return FileResponse(

        path=pdf_file,

        media_type="application/pdf",

        filename="Sustainability_Report.pdf"
    )