from reportlab.platypus import Table

from .base_report import BaseReport

from .helpers import (
    section,
    body,
    build_table,
    kpi_card,
)

from .constants import (
    WASTE_REPORT,
)


class WasteReport(BaseReport):
    """
    =========================================================

        Waste Classification Report

    =========================================================
    """

    def __init__(self, data):

        super().__init__(WASTE_REPORT)

        self.data = data

    # =====================================================

    def generate(self):

        self.add_header()

        self.executive_summary()

        self.waste_overview()

        self.classification()

        self.circularity()

        self.recommendations()

        self.add_footer()

        return self.build()

    # =====================================================

    def executive_summary(self):

        self.add(section("Executive Summary"))

        self.add(
            body(
                "This report summarizes the waste "
                "classification performed by the AI engine. "
                "It identifies waste category, reuse "
                "potential, recycling pathway and circular "
                "economy indicators."
            )
        )

        self.space()

    # =====================================================

    def waste_overview(self):

        self.add(section("Waste Overview"))

        cards = Table([[
            kpi_card(
                "Waste Category",
                self.data["waste_category"],
            ),
            kpi_card(
                "Sub Category",
                self.data["waste_subcategory"],
            ),
            kpi_card(
                "Reuse Potential",
                self.data["reuse_potential"],
            ),
        ]])

        self.add(cards)

        self.space()

    # =====================================================

    def classification(self):

        self.add(section("Waste Classification"))

        table = [

            [
                "Property",
                "Value",
            ],

            [
                "Waste Category",
                self.data["waste_category"],
            ],

            [
                "Waste Subcategory",
                self.data["waste_subcategory"],
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
                "Priority",
                self.data["priority"],
            ],

        ]

        self.add(
            build_table(table)
        )

        self.space()

    # =====================================================

    def circularity(self):

        self.add(section("Circular Economy Assessment"))

        table = [

            [
                "Indicator",
                "Score",
            ],

            [
                "Reuse Score",
                f"{self.data['reuse_score']:.2f}",
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