from reportlab.platypus import Table

from .base_report import BaseReport

from .helpers import (
    section,
    body,
    build_table,
    kpi_card,
    gap,
)

from .constants import (
    ANALYSIS_REPORT,
)


class AnalysisReport(BaseReport):

    def __init__(self, analysis):

        super().__init__(ANALYSIS_REPORT)

        self.analysis = analysis

    # =====================================================
    # PUBLIC
    # =====================================================

    def generate(self):

        self.add_header()

        self.executive_summary()

        self.ai_prediction()

        self.material_information()

        self.image_analysis()

        self.environmental_analysis()

        self.sustainability()

        self.recommendations()

        self.add_footer()

        return self.build()

    # =====================================================
    # EXECUTIVE SUMMARY
    # =====================================================

    def executive_summary(self):

        self.add(section("Executive Summary"))

        summary = (
            f"The uploaded textile image was analysed using the "
            f"TWIP AI Engine. The material was identified as "
            f"{self.analysis.material} with a confidence of "
            f"{self.analysis.confidence:.2f}%."
        )

        self.add(body(summary))

        self.space()

    # =====================================================
    # AI PREDICTION
    # =====================================================

    def ai_prediction(self):

        self.add(section("AI Prediction"))

        cards = Table(
            [[
                kpi_card(
                    "Material",
                    self.analysis.material,
                ),
                kpi_card(
                    "Confidence",
                    f"{self.analysis.confidence:.2f} %",
                ),
            ]]
        )

        self.add(cards)

        self.space()

    # =====================================================
    # MATERIAL INFORMATION
    # =====================================================

    def material_information(self):

        self.add(section("Material Intelligence"))

        data = [

            [
                "Property",
                "Value",
            ],

            [
                "Category",
                self.analysis.material_category,
            ],

            [
                "Biodegradable",
                str(self.analysis.biodegradable),
            ],

            [
                "Recyclable",
                str(self.analysis.recyclable),
            ],

            [
                "Recycled Content",
                f"{self.analysis.recycled_content} %",
            ],

        ]

        self.add(build_table(data))

        self.space()

    # =====================================================
    # IMAGE ANALYSIS
    # =====================================================

    def image_analysis(self):

        self.add(section("Waste Classification"))

        data = [

            [
                "Property",
                "Value",
            ],

            [
                "Waste Category",
                self.analysis.waste_category,
            ],

            [
                "Waste Subcategory",
                self.analysis.waste_subcategory,
            ],

            [
                "Reuse Potential",
                self.analysis.reuse_potential,
            ],

            [
                "Recycling Method",
                self.analysis.recycling_method,
            ],

        ]

        self.add(build_table(data))

        self.space()

    # =====================================================
    # ENVIRONMENTAL
    # =====================================================

    def environmental_analysis(self):

        self.add(section("Environmental Impact"))

        data = [

            [
                "Metric",
                "Value",
            ],

            [
                "Carbon Footprint",
                f"{self.analysis.carbon_footprint:.2f} kg CO2",
            ],

            [
                "Carbon Savings",
                f"{self.analysis.carbon_savings:.2f} kg CO2",
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

    # =====================================================
    # SUSTAINABILITY
    # =====================================================

    def sustainability(self):

        self.add(section("Sustainability Assessment"))

        cards = Table(
            [[
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
            ]]
        )

        self.add(cards)

        self.space()

    # =====================================================
    # RECOMMENDATIONS
    # =====================================================

    def recommendations(self):

        self.add(section("AI Recommendations"))

        self.add(
            body(
                f"<b>Priority:</b> {self.analysis.priority}"
            )
        )

        self.add(gap(0.08))

        self.add(
            body(
                f"<b>Recommendation:</b><br/>"
                f"{self.analysis.recommendation}"
            )
        )

        self.add(gap(0.08))

        self.add(
            body(
                f"<b>Next Step:</b><br/>"
                f"{self.analysis.next_step}"
            )
        )

        self.add(gap(0.08))

        self.add(
            body(
                f"<b>Expected Benefit:</b><br/>"
                f"{self.analysis.expected_benefit}"
            )
        )
