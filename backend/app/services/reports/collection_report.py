from reportlab.platypus import Table

from .base_report import BaseReport

from .helpers import (
    section,
    body,
    build_table,
    kpi_card,
)

from .constants import (
    COLLECTION_REPORT,
)


class CollectionReport(BaseReport):
    """
    =========================================================

            Textile Collection Report

    =========================================================
    """

    def __init__(self, data):

        super().__init__(COLLECTION_REPORT)

        self.data = data

    # =====================================================

    def generate(self):

        self.add_header()

        self.executive_summary()

        self.collection_information()

        self.collection_metrics()

        self.material_summary()

        self.operational_summary()

        self.recommendations()

        self.add_footer()

        return self.build()

    # =====================================================

    def executive_summary(self):

        self.add(section("Executive Summary"))

        self.add(
            body(
                "This report summarizes a textile waste "
                "collection operation including waste source, "
                "collection details, recovered quantity and "
                "operational performance."
            )
        )

        self.space()

    # =====================================================

    def collection_information(self):

        self.add(section("Collection Information"))

        cards = Table([[
            kpi_card(
                "Collection ID",
                self.data["collection_code"],
            ),
            kpi_card(
                "Status",
                self.data["collection_status"],
            ),
            kpi_card(
                "Weight",
                f"{self.data['total_weight']:.2f} kg",
            ),
        ]])

        self.add(cards)

        self.space()

        table = [

            ["Property", "Value"],

            [
                "Collection Date",
                str(self.data["collection_date"]),
            ],

            [
                "Collected By",
                self.data["collected_by"],
            ],

            [
                "Vehicle",
                self.data["vehicle_number"] or "-",
            ],

            [
                "Collection Method",
                self.data["collection_method"],
            ],

            [
                "Remarks",
                self.data["remarks"] or "-",
            ],

        ]

        self.add(build_table(table))

        self.space()

    # =====================================================

    def collection_metrics(self):

        self.add(section("Collection Metrics"))

        table = [

            ["Metric", "Value"],

            [
                "Total Weight",
                f"{self.data['total_weight']:.2f} kg",
            ],

            [
                "Recovered Weight",
                f"{self.data['recovered_weight']:.2f} kg",
            ],

            [
                "Rejected Weight",
                f"{self.data['rejected_weight']:.2f} kg",
            ],

            [
                "Recovery Rate",
                f"{self.data['recovery_percentage']:.2f} %",
            ],

        ]

        self.add(build_table(table))

        self.space()

    # =====================================================

    def material_summary(self):

        self.add(section("Material Summary"))

        self.add(
            body(
                self.data["material_summary"]
            )
        )

        self.space()

    # =====================================================

    def operational_summary(self):

        self.add(section("Operational Summary"))

        self.add(
            body(
                self.data["operational_summary"]
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