from reportlab.platypus import Table

from .base_report import BaseReport

from .helpers import (
    section,
    body,
    build_table,
    kpi_card,
)

from .constants import (
    DASHBOARD_REPORT,
)


class DashboardReport(BaseReport):
    """
    ========================================================

            Executive Dashboard Report

    ========================================================
    """

    def __init__(self, data):

        super().__init__(DASHBOARD_REPORT)

        self.data = data

    # =====================================================

    def generate(self):

        self.add_header()

        self.executive_summary()

        self.kpi_summary()

        self.company_summary()

        self.environment_summary()

        self.material_summary()

        self.waste_summary()

        self.recommendations()

        self.add_footer()

        return self.build()

    # =====================================================

    def executive_summary(self):

        self.add(section("Executive Summary"))

        self.add(

            body(

                "This dashboard report provides an executive "
                "overview of textile waste management "
                "performance across the platform including "
                "companies, collections, sustainability, "
                "inventory and environmental impact."

            )

        )

        self.space()

    # =====================================================

    def kpi_summary(self):

        self.add(section("Key Performance Indicators"))

        cards = Table([[
            kpi_card(
                "Companies",
                str(self.data["total_companies"]),
            ),
            kpi_card(
                "Collections",
                str(self.data["total_collections"]),
            ),
            kpi_card(
                "Inventory",
                str(self.data["total_inventory"]),
            ),
        ]])

        self.add(cards)

        self.space()

    # =====================================================

    def company_summary(self):

        self.add(section("Company Performance"))

        table = [

            [
                "Metric",
                "Value",
            ],

            [
                "Best Company",
                self.data["best_company"],
            ],

            [
                "Average Sustainability",
                f"{self.data['average_sustainability']:.2f}",
            ],

            [
                "Recovery Rate",
                f"{self.data['recovery_rate']:.2f} %",
            ],

        ]

        self.add(build_table(table))

        self.space()

    # =====================================================

    def environment_summary(self):

        self.add(section("Environmental Impact"))

        table = [

            [
                "Indicator",
                "Value",
            ],

            [
                "Carbon Saved",
                f"{self.data['carbon_saved']:.2f} kg",
            ],

            [
                "Water Saved",
                f"{self.data['water_saved']:.2f} L",
            ],

            [
                "Energy Saved",
                f"{self.data['energy_saved']:.2f} kWh",
            ],

        ]

        self.add(build_table(table))

        self.space()

    # =====================================================

    def material_summary(self):

        self.add(section("Material Intelligence"))

        self.add(
            body(
                self.data["material_summary"]
            )
        )

        self.space()

    # =====================================================

    def waste_summary(self):

        self.add(section("Waste Intelligence"))

        self.add(
            body(
                self.data["waste_summary"]
            )
        )

        self.space()

    # =====================================================

    def recommendations(self):

        self.add(section("Executive Recommendation"))

        self.add(
            body(
                self.data["recommendation"]
            )
        )