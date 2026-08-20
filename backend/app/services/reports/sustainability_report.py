from reportlab.platypus import Table

from .base_report import BaseReport

from .helpers import (
    section,
    body,
    build_table,
    kpi_card,
    format_carbon,
)

from .constants import (
    SUSTAINABILITY_REPORT,
)


class SustainabilityReport(BaseReport):

    def __init__(self, analysis):

        super().__init__(SUSTAINABILITY_REPORT)

        self.analysis = analysis

    # ======================================================
    # PUBLIC
    # ======================================================

    def generate(self):

        self.add_header()

        self.executive_summary()

        self.environmental_metrics()

        self.sustainability_scores()

        self.circular_economy()

        self.resource_conservation()

        self.recommendations()

        self.add_footer()

        return self.build()

    # ======================================================
    # EXECUTIVE SUMMARY
    # ======================================================

    def executive_summary(self):

        self.add(section("Executive Summary"))

        summary = (
            f"This sustainability assessment evaluates the "
            f"environmental impact of the analysed textile, "
            f"its recycling potential, estimated carbon "
            f"footprint, resource recovery opportunity and "
            f"overall contribution towards a circular economy."
        )

        self.add(body(summary))

        self.space()

    # ======================================================
    # ENVIRONMENTAL METRICS
    # ======================================================

    def environmental_metrics(self):

        self.add(section("Environmental Metrics"))

        cards = Table([[
            kpi_card(
                "Carbon Saved",
                format_carbon(self.analysis.carbon_savings),
            ),
            kpi_card(
                "Water Saved",
                f"{self.analysis.water_savings:.2f} L",
            ),
            kpi_card(
                "Energy Saved",
                f"{self.analysis.energy_savings:.2f} kWh",
            ),
        ]])

        self.add(cards)

        self.space()

        data = [

            ["Metric", "Value"],

            [
                "Carbon Footprint",
                format_carbon(self.analysis.carbon_footprint),
            ],

            [
                "Carbon Savings",
                format_carbon(self.analysis.carbon_savings),
            ],

            [
                "Water Consumption",
                f"{self.analysis.water_consumption:.2f} L",
            ],

            [
                "Water Savings",
                f"{self.analysis.water_savings:.2f} L",
            ],

            [
                "Energy Consumption",
                f"{self.analysis.energy_consumption:.2f} kWh",
            ],

            [
                "Energy Savings",
                f"{self.analysis.energy_savings:.2f} kWh",
            ],

            [
                "Landfill Diversion",
                f"{self.analysis.landfill_diversion:.2f} %",
            ],

            [
                "Resource Conservation",
                f"{self.analysis.resource_conservation:.2f} %",
            ],

        ]

        self.add(build_table(data))

        self.space()

    # ======================================================
    # SUSTAINABILITY SCORES
    # ======================================================

    def sustainability_scores(self):

        self.add(section("Sustainability Assessment"))

        cards = Table([[
            kpi_card(
                "Sustainability",
                f"{self.analysis.sustainability_score:.1f}",
            ),
            kpi_card(
                "Circularity",
                f"{self.analysis.circularity_score:.1f}",
            ),
            kpi_card(
                "Recovery",
                f"{self.analysis.material_recovery_score:.1f}",
            ),
        ]])

        self.add(cards)

        self.space()

        data = [

            ["Indicator", "Value"],

            [
                "Sustainability Rating",
                self.analysis.sustainability_rating,
            ],

            [
                "Environmental Impact",
                self.analysis.environmental_impact,
            ],

            [
                "Circular Economy Index",
                f"{self.analysis.circular_economy_index:.2f}",
            ],

            [
                "Recycling Target",
                f"{self.analysis.recycling_target:.2f} %",
            ],

            [
                "Current Progress",
                f"{self.analysis.recycling_progress:.2f} %",
            ],

        ]

        self.add(build_table(data))

        self.space()

    # ======================================================
    # CIRCULAR ECONOMY
    # ======================================================

    def circular_economy(self):

        self.add(section("Circular Economy Assessment"))

        text = (
            f"The analysed textile demonstrates a "
            f"circular economy index of "
            f"{self.analysis.circular_economy_index:.2f}. "
            f"This value estimates the capability of "
            f"recovering materials through reuse, "
            f"remanufacturing and recycling while "
            f"minimising landfill disposal."
        )

        self.add(body(text))

        self.space()

    # ======================================================
    # RESOURCE CONSERVATION
    # ======================================================

    def resource_conservation(self):

        self.add(section("Resource Conservation"))

        text = (
            f"Recovering this textile instead of "
            f"manufacturing virgin material can reduce "
            f"carbon emissions, conserve water resources, "
            f"reduce energy consumption and contribute "
            f"towards sustainable textile production."
        )

        self.add(body(text))

        self.space()

    # ======================================================
    # RECOMMENDATIONS
    # ======================================================

    def recommendations(self):

        self.add(section("Recommendations"))

        self.add(
            body(
                f"<b>Priority:</b> {self.analysis.priority}"
            )
        )

        self.space(0.08)

        self.add(
            body(
                f"<b>Recommendation</b><br/>"
                f"{self.analysis.recommendation}"
            )
        )

        self.space(0.08)

        self.add(
            body(
                f"<b>Expected Benefit</b><br/>"
                f"{self.analysis.expected_benefit}"
            )
        )
