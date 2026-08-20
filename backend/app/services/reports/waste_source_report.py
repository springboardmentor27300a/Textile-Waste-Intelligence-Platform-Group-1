from reportlab.platypus import Table

from .base_report import BaseReport

from .helpers import (
    section,
    body,
    build_table,
    kpi_card,
)

from .constants import (
    WASTE_SOURCE_REPORT,
)


class WasteSourceReport(BaseReport):
    """
    =========================================================

            Waste Source Performance Report

    =========================================================
    """

    def __init__(self, data):

        super().__init__(WASTE_SOURCE_REPORT)

        self.data = data

    # =====================================================

    def generate(self):

        self.add_header()

        self.executive_summary()

        self.organization_profile()

        self.collection_statistics()

        self.environmental_performance()

        self.sustainability_assessment()

        self.recommendations()

        self.add_footer()

        return self.build()

    # =====================================================

    def executive_summary(self):

        self.add(section("Executive Summary"))

        self.add(

            body(

                "This report evaluates the overall textile "
                "waste contribution and sustainability "
                "performance of the registered organization. "
                "It summarizes operational activities, "
                "resource recovery and environmental impact."

            )

        )

        self.space()

    # =====================================================

    def organization_profile(self):

        self.add(section("Organization Profile"))

        cards = Table([[
            kpi_card(
                "Organization",
                self.data["organization_name"],
            ),
            kpi_card(
                "Industry",
                self.data["industry"],
            ),
            kpi_card(
                "Status",
                self.data["status"],
            ),
        ]])

        self.add(cards)

        self.space()

        table = [

            [
                "Property",
                "Value",
            ],

            [
                "Source Type",
                self.data["source_type"],
            ],

            [
                "Organization Size",
                self.data["organization_size"],
            ],

            [
                "City",
                self.data["city"],
            ],

            [
                "State",
                self.data["state"],
            ],

            [
                "Country",
                self.data["country"],
            ],

            [
                "Collection Frequency",
                self.data["collection_frequency"],
            ],

        ]

        self.add(
            build_table(table)
        )

        self.space()

    # =====================================================

    def collection_statistics(self):

        self.add(section("Collection Statistics"))

        cards = Table([[
            kpi_card(
                "Collections",
                str(self.data["total_collections"]),
            ),
            kpi_card(
                "Waste",
                f"{self.data['total_waste']:.2f} kg",
            ),
            kpi_card(
                "Recovered",
                f"{self.data['recovered_waste']:.2f} kg",
            ),
        ]])

        self.add(cards)

        self.space()

        table = [

            [
                "Metric",
                "Value",
            ],

            [
                "Recovery Rate",
                f"{self.data['recovery_rate']:.2f} %",
            ],

            [
                "Rejected Waste",
                f"{self.data['rejected_waste']:.2f} kg",
            ],

            [
                "Average Monthly Waste",
                f"{self.data['average_monthly_waste']:.2f} kg",
            ],

        ]

        self.add(
            build_table(table)
        )

        self.space()

    # =====================================================

    def environmental_performance(self):

        self.add(section("Environmental Performance"))

        table = [

            [
                "Indicator",
                "Value",
            ],

            [
                "Carbon Saved",
                f"{self.data['carbon_saved']:.2f} kg CO2",
            ],

            [
                "Water Saved",
                f"{self.data['water_saved']:.2f} L",
            ],

            [
                "Energy Saved",
                f"{self.data['energy_saved']:.2f} kWh",
            ],

            [
                "Landfill Diversion",
                f"{self.data['landfill_diversion']:.2f} %",
            ],

        ]

        self.add(
            build_table(table)
        )

        self.space()

    # =====================================================

    def sustainability_assessment(self):

        self.add(section("Sustainability Assessment"))

        cards = Table([[
            kpi_card(
                "Sustainability",
                f"{self.data['sustainability_score']:.2f}",
            ),
            kpi_card(
                "Circularity",
                f"{self.data['circularity_score']:.2f}",
            ),
            kpi_card(
                "Company Rank",
                str(self.data["company_rank"]),
            ),
        ]])

        self.add(cards)

        self.space()

        self.add(
            body(
                self.data["summary"]
            )
        )

        self.space()

    # =====================================================

    def recommendations(self):

        self.add(section("Recommendations"))

        self.add(
            body(
                self.data["recommendation"]
            )
        )
