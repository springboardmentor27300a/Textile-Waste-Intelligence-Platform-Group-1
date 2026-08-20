from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.units import inch

from reportlab.platypus import (
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from .styles import (
    TITLE_STYLE,
    REPORT_TITLE_STYLE,
    SECTION_TITLE_STYLE,
    BODY_STYLE,
    SMALL_STYLE,
    KPI_TITLE_STYLE,
    KPI_VALUE_STYLE,
    TABLE_STYLE,
    PRIMARY,
    SECONDARY,
)

from .constants import (
    PLATFORM_NAME,
    FOOTER_TEXT,
    DATE_FORMAT,
)


# ==========================================================
# PDF TEXT SAFETY
# ==========================================================

def _pdf_safe_text(value):
    """
    Keep generated PDFs compatible with ReportLab built-in fonts.

    CO2 is intentionally rendered as ASCII rather than using the
    Unicode subscript character , which can appear as a black
    square in viewers when the selected font lacks that glyph.
    """
    if value is None:
        return ""

    text = str(value)

    replacements = {
        "₂": "2",
        "₀": "0",
        "₁": "1",
        "₃": "3",
        "₄": "4",
        "₅": "5",
        "₆": "6",
        "₇": "7",
        "₈": "8",
        "₉": "9",
        "²": "2",
        "³": "3",
        "°": " deg",
        "–": "-",
        "—": "-",
        "’": "'",
        "‘": "'",
        "“": '"',
        "”": '"',
        "•": "-",
        "→": "->",
        "←": "<-",
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    return text.encode("latin-1", "replace").decode("latin-1")


# ==========================================================
# DATE HELPERS
# ==========================================================

def format_date(date_value):

    if not date_value:
        return "-"

    if isinstance(date_value, datetime):
        return date_value.strftime(DATE_FORMAT)

    return str(date_value)


# ==========================================================
# VALUE HELPERS
# ==========================================================

def format_percentage(value):

    if value is None:
        value = 0

    return f"{value:.2f} %"


def format_weight(value):

    if value is None:
        value = 0

    return f"{value:.2f} kg"


def format_carbon(value):

    if value is None:
        value = 0

    return f"{value:.2f} kg CO2"


def format_water(value):

    if value is None:
        value = 0

    return f"{value:.2f} L"


def format_energy(value):

    if value is None:
        value = 0

    return f"{value:.2f} kWh"


def format_score(value):

    if value is None:
        value = 0

    return f"{value:.1f}/100"


# ==========================================================
# PARAGRAPH HELPERS
# ==========================================================

def title(text):

    return Paragraph(_pdf_safe_text(text), TITLE_STYLE)


def report_title(text):

    return Paragraph(_pdf_safe_text(text), REPORT_TITLE_STYLE)


def section(text):

    return Paragraph(_pdf_safe_text(text), SECTION_TITLE_STYLE)


def body(text):

    return Paragraph(_pdf_safe_text(text), BODY_STYLE)


def small(text):

    return Paragraph(_pdf_safe_text(text), SMALL_STYLE)


# ==========================================================
# KPI CARD
# ==========================================================

def kpi_card(title_text, value_text):

    table = Table(

        [

            [

                Paragraph(
                    _pdf_safe_text(title_text),
                    KPI_TITLE_STYLE,
                )

            ],

            [

                Paragraph(
                    _pdf_safe_text(value_text),
                    KPI_VALUE_STYLE,
                )

            ],

        ],

        colWidths=[2.2 * inch],

    )

    table.setStyle(

        TableStyle(

            [

                ("BACKGROUND", (0, 0), (-1, -1), colors.white),

                ("BOX", (0, 0), (-1, -1), 1, PRIMARY),

                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),

                ("TOPPADDING", (0, 0), (-1, -1), 12),

                ("LEFTPADDING", (0, 0), (-1, -1), 8),

                ("RIGHTPADDING", (0, 0), (-1, -1), 8),

                ("ALIGN", (0, 0), (-1, -1), "CENTER"),

            ]

        )

    )

    return table


# ==========================================================
# TABLE
# ==========================================================

def build_table(data, column_widths=None):

    safe_data = [
        [
            _pdf_safe_text(cell)
            if not isinstance(cell, (Paragraph, Table))
            else cell
            for cell in row
        ]
        for row in data
    ]

    table = Table(
        safe_data,
        colWidths=column_widths,
        repeatRows=1,
    )

    table.setStyle(
        TableStyle(TABLE_STYLE)
    )

    return table


# ==========================================================
# SEPARATOR
# ==========================================================

def divider():

    table = Table(
        [[""]],
        colWidths=[7.2 * inch],
        rowHeights=[0.03 * inch],
    )

    table.setStyle(

        TableStyle(

            [

                ("BACKGROUND", (0, 0), (-1, -1), PRIMARY),

            ]

        )

    )

    return table


# ==========================================================
# SPACING
# ==========================================================

def gap(height=0.2):

    return Spacer(
        1,
        height * inch,
    )


# ==========================================================
# HEADER
# ==========================================================

def report_header(report_name):

    return [

        title(PLATFORM_NAME),

        report_title(report_name),

        body(

            f"Generated on : {format_date(datetime.now())}"

        ),

        gap(0.15),

        divider(),

        gap(0.20),

    ]


# ==========================================================
# FOOTER
# ==========================================================

def report_footer():

    return [

        gap(0.20),

        divider(),

        gap(0.10),

        small(FOOTER_TEXT),

    ]
