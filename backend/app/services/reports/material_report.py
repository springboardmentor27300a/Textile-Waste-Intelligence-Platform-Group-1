from reportlab.platypus import Table

from .base_report import BaseReport

from .helpers import (
    section,
    body,
    build_table,
    kpi_card,
)

from .constants import (
    MATERIAL_REPORT,
)


class MaterialReport(BaseReport):
    """
    =========================================================

        Material Intelligence Report

    =========================================================
    """

    def __init__(self, data):

        super().__init__(MATERIAL_REPORT)

        self.data = data

    # =====================================================

    def generate(self):

        self.add_header()

        self.executive_summary()

        self.material_overview()

        self.material_distribution()

        self.recyclability()

        self.recommendations()

        self.add_footer()

        return self.build()

    # =====================================================

    def executive_summary(self):

        self.add(section("Executive Summary"))

        self.add(
            body(
                "This report presents material intelligence "
                "derived from textile image analysis. "
                "It summarizes detected textile materials, "
                "their composition, recyclability and "
                "recommended recovery pathways."
            )
        )

        self.space()

    # =====================================================

    def material_overview(self):

        self.add(section("Material Overview"))

        cards = Table([[
            kpi_card(
                "Primary Material",
                self.data["material"],
            ),
            kpi_card(
                "Category",
                self.data["material_category"],
            ),
            kpi_card(
                "Confidence",
                f"{self.data['confidence']:.2f}%",
            ),
        ]])

        self.add(cards)

        self.space()

    # =====================================================

    def material_distribution(self):

        self.add(section("Material Properties"))

        table = [

            [
                "Property",
                "Value",
            ],

            [
                "Material",
                self.data["material"],
            ],

            [
                "Category",
                self.data["material_category"],
            ],

            [
                "Biodegradable",
                "Yes"
                if self.data["biodegradable"]
                else "No",
            ],

            [
                "Recyclable",
                "Yes"
                if self.data["recyclable"]
                else "No",
            ],

            [
                "Recycled Content",
                f"{self.data['recycled_content']} %",
            ],

        ]

        self.add(
            build_table(table)
        )

        self.space()

    # =====================================================

    def recyclability(self):

        self.add(section("Recyclability Assessment"))

        table = [

            [
                "Indicator",
                "Value",
            ],

            [
                "Reuse Potential",
                self.data["reuse_potential"],
            ],

            [
                "Recycling Method",
                self.data["recycling_method"],
            ],

            [
                "Recovery Score",
                f"{self.data['material_recovery_score']:.2f}",
            ],

            [
                "Circularity Score",
                f"{self.data['circularity_score']:.2f}",
            ],

            [
                "Sustainability Score",
                f"{self.data['sustainability_score']:.2f}",
            ],

        ]

        self.add(
            build_table(table)
        )

        self.space()

    # =====================================================

    def recommendations(self):

        self.add(section("AI Recommendations"))

        self.add(
            body(
                f"<b>Recommendation</b><br/><br/>"
                f"{self.data['recommendation']}"
            )
        )

        self.space(0.08)

        self.add(
            body(
                f"<b>Next Step</b><br/><br/>"
                f"{self.data['next_step']}"
            )
        )

        self.space(0.08)

        self.add(
            body(
                f"<b>Expected Benefit</b><br/><br/>"
                f"{self.data['expected_benefit']}"
            )
        )