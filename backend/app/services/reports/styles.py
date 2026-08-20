from reportlab.lib import colors

from reportlab.lib.enums import (
    TA_CENTER,
    TA_LEFT,
    TA_RIGHT,
)

from reportlab.lib.styles import (
    ParagraphStyle,
    getSampleStyleSheet,
)

from reportlab.lib.units import inch


# ==========================================================
# BUILT-IN REPORTLAB FONTS
# ==========================================================
#
# Do NOT use an OS-specific TTF path here.
#
# Previous implementation attempted:
#
# /usr/share/fonts/truetype/dejavu/DejaVuSans.ttf
#
# which is a Linux path and does not exist on Windows.
#
# ReportLab's built-in Helvetica fonts require no external
# font files and therefore work on Windows, Linux and Docker.
#
# Unicode-sensitive characters should be sanitized by helpers.py
# before being rendered.
# ==========================================================

UNICODE_FONT = "Helvetica"
UNICODE_FONT_BOLD = "Helvetica-Bold"


styles = getSampleStyleSheet()


# ==========================================================
# THEME COLORS
# ==========================================================

PRIMARY = colors.HexColor("#1E3A5F")

SECONDARY = colors.HexColor("#2E8B57")

ACCENT = colors.HexColor("#3B82F6")


SUCCESS = colors.HexColor("#16A34A")

WARNING = colors.HexColor("#F59E0B")

ERROR = colors.HexColor("#DC2626")


BACKGROUND = colors.HexColor("#F8FAFC")

CARD = colors.white

BORDER = colors.HexColor("#E5E7EB")

TEXT = colors.HexColor("#111827")

TEXT_SECONDARY = colors.HexColor("#6B7280")


# ==========================================================
# PAGE
# ==========================================================

PAGE_MARGIN = 0.55 * inch


# ==========================================================
# TITLE
# ==========================================================

TITLE_STYLE = ParagraphStyle(
    "Title",
    parent=styles["Heading1"],
    fontName=UNICODE_FONT_BOLD,
    fontSize=24,
    leading=28,
    textColor=PRIMARY,
    alignment=TA_CENTER,
    spaceAfter=20,
)


# ==========================================================
# REPORT TITLE
# ==========================================================

REPORT_TITLE_STYLE = ParagraphStyle(
    "ReportTitle",
    parent=styles["Heading2"],
    fontName=UNICODE_FONT_BOLD,
    fontSize=18,
    leading=22,
    textColor=PRIMARY,
    alignment=TA_CENTER,
    spaceAfter=18,
)


# ==========================================================
# SECTION
# ==========================================================

SECTION_TITLE_STYLE = ParagraphStyle(
    "SectionTitle",
    parent=styles["Heading2"],
    fontName=UNICODE_FONT_BOLD,
    fontSize=15,
    leading=19,
    textColor=PRIMARY,
    spaceBefore=14,
    spaceAfter=10,
)


# ==========================================================
# SUBSECTION
# ==========================================================

SUBSECTION_STYLE = ParagraphStyle(
    "SubSection",
    parent=styles["Heading3"],
    fontName=UNICODE_FONT_BOLD,
    fontSize=12,
    leading=15,
    textColor=SECONDARY,
    spaceBefore=10,
    spaceAfter=6,
)


# ==========================================================
# BODY
# ==========================================================

BODY_STYLE = ParagraphStyle(
    "Body",
    parent=styles["BodyText"],
    fontName=UNICODE_FONT,
    fontSize=10,
    leading=18,
    textColor=TEXT,
    alignment=TA_LEFT,
)


# ==========================================================
# SMALL TEXT
# ==========================================================

SMALL_STYLE = ParagraphStyle(
    "Small",
    parent=BODY_STYLE,
    fontSize=8,
    leading=12,
    textColor=TEXT_SECONDARY,
)


# ==========================================================
# FOOTER
# ==========================================================

FOOTER_STYLE = ParagraphStyle(
    "Footer",
    parent=SMALL_STYLE,
    alignment=TA_CENTER,
)


# ==========================================================
# KPI
# ==========================================================

KPI_TITLE_STYLE = ParagraphStyle(
    "KPITitle",
    parent=BODY_STYLE,
    alignment=TA_CENTER,
    textColor=TEXT_SECONDARY,
    fontSize=10,
)


KPI_VALUE_STYLE = ParagraphStyle(
    "KPIValue",
    parent=BODY_STYLE,
    alignment=TA_CENTER,
    fontName=UNICODE_FONT_BOLD,
    fontSize=18,
    leading=22,
    textColor=PRIMARY,
)


# ==========================================================
# TABLE
# ==========================================================

TABLE_STYLE = [

    (
        "BACKGROUND",
        (0, 0),
        (-1, 0),
        PRIMARY,
    ),

    (
        "TEXTCOLOR",
        (0, 0),
        (-1, 0),
        colors.white,
    ),

    (
        "FONTNAME",
        (0, 0),
        (-1, 0),
        UNICODE_FONT_BOLD,
    ),

    (
        "FONTSIZE",
        (0, 0),
        (-1, -1),
        10,
    ),

    (
        "BOTTOMPADDING",
        (0, 0),
        (-1, 0),
        10,
    ),

    (
        "BACKGROUND",
        (0, 1),
        (-1, -1),
        colors.white,
    ),

    (
        "GRID",
        (0, 0),
        (-1, -1),
        0.3,
        BORDER,
    ),

    (
        "VALIGN",
        (0, 0),
        (-1, -1),
        "MIDDLE",
    ),

    (
        "LEFTPADDING",
        (0, 0),
        (-1, -1),
        8,
    ),

    (
        "RIGHTPADDING",
        (0, 0),
        (-1, -1),
        8,
    ),

    (
        "TOPPADDING",
        (0, 0),
        (-1, -1),
        8,
    ),

    (
        "BOTTOMPADDING",
        (0, 0),
        (-1, -1),
        8,
    ),

]


# ==========================================================
# COLORS FOR SCORES
# ==========================================================

GRADE_A = SUCCESS

GRADE_B = colors.HexColor("#65A30D")

GRADE_C = WARNING

GRADE_D = colors.HexColor("#FB923C")

GRADE_E = ERROR