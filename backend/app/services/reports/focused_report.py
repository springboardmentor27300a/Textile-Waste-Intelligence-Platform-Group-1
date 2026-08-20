from reportlab.platypus import Table

from .base_report import BaseReport
from .helpers import (
    section,
    body,
    build_table,
    kpi_card,
)


class FocusedReport(BaseReport):
    """
    Focused dynamic report for:

    - Recycling
    - Environmental Impact
    - Circular Economy
    """

    def __init__(
        self,
        data,
        report_type,
        title,
    ):
        super().__init__(title)

        self.data = data
        self.report_type = report_type
        self.title = title

    # ========================================================
    # Generate
    # ========================================================

    def generate(self):

        self.add_header()

        self._summary()

        if self.report_type == "recycling":
            self._recycling()

        elif self.report_type == "environmental_impact":
            self._environmental()

        elif self.report_type == "circular_economy":
            self._circularity()

        else:
            self._summary_metrics()

        self._recommendations()

        self.add_footer()

        return self.build()

    # ========================================================
    # Executive Summary
    # ========================================================

    def _summary(self):

        self.add(
            section(
                "Executive Summary"
            )
        )

        self.add(
            body(
                self.data.get(
                    "executive_summary",
                    (
                        "Report generated from "
                        "the selected reporting period."
                    ),
                )
            )
        )

        self.space()

    # ========================================================
    # Generic Metrics
    # ========================================================

    def _summary_metrics(self):

        d = self.data

        self.add(
            section(
                "Key Metrics"
            )
        )

        self.add(
            Table(
                [[
                    kpi_card(
                        "Analyses",
                        str(
                            d.get(
                                "analysis_count",
                                0,
                            )
                        ),
                    ),

                    kpi_card(
                        "Overall Score",
                        f"{d.get('overall_score', 0):.1f}",
                    ),

                    kpi_card(
                        "Sustainability",
                        f"{d.get('sustainability_score', 0):.1f}",
                    ),
                ]]
            )
        )

        self.space()

    # ========================================================
    # Recycling
    # ========================================================

    def _recycling(self):

        d = self.data

        self.add(
            section(
                "Recycling Performance"
            )
        )

        self.add(
            Table(
                [[
                    kpi_card(
                        "Recyclability",
                        f"{d.get('recyclability_score', 0):.1f}%",
                    ),

                    kpi_card(
                        "Reuse",
                        f"{d.get('reuse_score', 0):.1f}%",
                    ),

                    kpi_card(
                        "Recovery",
                        f"{d.get('material_recovery_score', 0):.1f}%",
                    ),
                ]]
            )
        )

        self.space()

        self.add(
            build_table(
                [
                    [
                        "Metric",
                        "Value",
                    ],
                    [
                        "Recycling Methods",
                        d.get(
                            "recycling_methods",
                            "Not Available",
                        ),
                    ],
                    [
                        "Recyclable Analyses",
                        str(
                            d.get(
                                "recyclable_count",
                                0,
                            )
                        ),
                    ],
                    [
                        "Circularity Score",
                        f"{d.get('circularity_score', 0):.1f}%",
                    ],
                    [
                        "Recycling Target",
                        f"{d.get('recycling_target', 0):.1f}%",
                    ],
                    [
                        "Recycling Progress",
                        f"{d.get('recycling_progress', 0):.1f}%",
                    ],
                ]
            )
        )

        self.space()

    # ========================================================
    # Environmental Impact
    # ========================================================

    def _environmental(self):

        d = self.data

        self.add(
            section(
                "Environmental Impact Assessment"
            )
        )

        self.add(
            Table(
                [[
                    kpi_card(
                        "Carbon Saved",
                        f"{d.get('carbon_savings', 0):.2f} kg CO2",
                    ),

                    kpi_card(
                        "Water Saved",
                        f"{d.get('water_savings', 0):.2f} L",
                    ),

                    kpi_card(
                        "Energy Saved",
                        f"{d.get('energy_savings', 0):.2f} kWh",
                    ),
                ]]
            )
        )

        self.space()

        self.add(
            build_table(
                [
                    [
                        "Metric",
                        "Value",
                    ],
                    [
                        "Carbon Footprint",
                        f"{d.get('carbon_footprint', 0):.2f} kg CO2",
                    ],
                    [
                        "Carbon Savings",
                        f"{d.get('carbon_savings', 0):.2f} kg CO2",
                    ],
                    [
                        "Water Consumption",
                        f"{d.get('water_consumption', 0):.2f} L",
                    ],
                    [
                        "Water Savings",
                        f"{d.get('water_savings', 0):.2f} L",
                    ],
                    [
                        "Energy Consumption",
                        f"{d.get('energy_consumption', 0):.2f} kWh",
                    ],
                    [
                        "Energy Savings",
                        f"{d.get('energy_savings', 0):.2f} kWh",
                    ],
                    [
                        "Landfill Diversion",
                        f"{d.get('landfill_diversion', 0):.2f}%",
                    ],
                    [
                        "Resource Conservation",
                        f"{d.get('resource_conservation', 0):.2f}%",
                    ],
                ]
            )
        )

        self.space()

    # ========================================================
    # Circular Economy
    # ========================================================

    def _circularity(self):

        d = self.data

        self.add(
            section(
                "Circular Economy Assessment"
            )
        )

        self.add(
            Table(
                [[
                    kpi_card(
                        "Circularity",
                        f"{d.get('circularity_score', 0):.1f}",
                    ),

                    kpi_card(
                        "Reuse",
                        f"{d.get('reuse_score', 0):.1f}",
                    ),

                    kpi_card(
                        "Material Recovery",
                        f"{d.get('material_recovery_score', 0):.1f}",
                    ),
                ]]
            )
        )

        self.space()

        self.add(
            build_table(
                [
                    [
                        "Indicator",
                        "Score",
                    ],
                    [
                        "Recyclability",
                        f"{d.get('recyclability_score', 0):.2f}",
                    ],
                    [
                        "Reuse",
                        f"{d.get('reuse_score', 0):.2f}",
                    ],
                    [
                        "Material Recovery",
                        f"{d.get('material_recovery_score', 0):.2f}",
                    ],
                    [
                        "Circular Economy Index",
                        f"{d.get('circular_economy_index', 0):.2f}",
                    ],
                    [
                        "Environmental Score",
                        f"{d.get('environmental_score', 0):.2f}",
                    ],
                    [
                        "Sustainability Score",
                        f"{d.get('sustainability_score', 0):.2f}",
                    ],
                    [
                        "Overall Score",
                        f"{d.get('overall_score', 0):.2f}",
                    ],
                ]
            )
        )

        self.space()

    # ========================================================
    # Recommendations
    # ========================================================

    def _recommendations(self):

        self.add(
            section(
                "Recommendations"
            )
        )

        recommendation = (
            self.data.get(
                "recommendation"
            )
            or
            (
                "Maintain data quality and "
                "prioritize reuse, recovery "
                "and recycling pathways."
            )
        )

        self.add(
            body(
                recommendation
            )
        )