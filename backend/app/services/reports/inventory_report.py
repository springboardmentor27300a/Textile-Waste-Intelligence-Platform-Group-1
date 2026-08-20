from reportlab.platypus import Table

from .base_report import BaseReport

from .helpers import (
    section,
    body,
    build_table,
    kpi_card,
)

from .constants import (
    INVENTORY_REPORT,
)


class InventoryReport(BaseReport):

    def __init__(self, inventory):

        super().__init__(INVENTORY_REPORT)

        self.inventory = inventory

    # =====================================================
    # PUBLIC
    # =====================================================

    def generate(self):

        self.add_header()

        self.executive_summary()

        self.batch_information()

        self.material_information()

        self.storage_information()

        self.inventory_status()

        self.recommendations()

        self.add_footer()

        return self.build()

    # =====================================================
    # EXECUTIVE SUMMARY
    # =====================================================

    def executive_summary(self):

        self.add(section("Executive Summary"))

        summary = (

            f"This report presents the inventory details "
            f"for Batch {self.inventory.batch_id}. "
            f"It includes storage information, "
            f"material details, inventory status "
            f"and quantity available for further "
            f"processing."

        )

        self.add(body(summary))

        self.space()

    # =====================================================
    # BATCH
    # =====================================================

    def batch_information(self):

        self.add(section("Batch Information"))

        cards = Table([[
            kpi_card(
                "Batch ID",
                self.inventory.batch_id,
            ),

            kpi_card(
                "Quantity",
                f"{self.inventory.quantity:.2f} kg",
            ),

            kpi_card(
                "Status",
                self.inventory.status,
            ),
        ]])

        self.add(cards)

        self.space()

    # =====================================================
    # MATERIAL
    # =====================================================

    def material_information(self):

        self.add(section("Material Details"))

        data = [

            [
                "Property",
                "Value",
            ],

            [
                "Material",
                self.inventory.fabric,
            ],

            [
                "Source",
                self.inventory.source,
            ],

            [
                "Color",
                self.inventory.color,
            ],

            [
                "Condition",
                self.inventory.condition,
            ],

            [
                "Collection Date",
                str(
                    self.inventory.collection_date
                ),
            ],

        ]

        self.add(build_table(data))

        self.space()

    # =====================================================
    # STORAGE
    # =====================================================

    def storage_information(self):

        self.add(section("Storage Information"))

        data = [

            [
                "Property",
                "Value",
            ],

            [
                "Storage Location",
                self.inventory.storage_location
                or "-",
            ],

            [
                "Rack Number",
                self.inventory.rack_number
                or "-",
            ],

            [
                "Inventory Status",
                self.inventory.status,
            ],

        ]

        self.add(build_table(data))

        self.space()

    # =====================================================
    # STATUS
    # =====================================================

    def inventory_status(self):

        self.add(section("Inventory Assessment"))

        text = (

            f"The analysed textile has been stored "
            f"in inventory with a status of "
            f"{self.inventory.status}. "
            f"The current stock quantity available "
            f"for recycling or reuse is "
            f"{self.inventory.quantity:.2f} kg."

        )

        self.add(body(text))

        self.space()

    # =====================================================
    # RECOMMENDATION
    # =====================================================

    def recommendations(self):

        self.add(section("Recommendations"))

        recommendation = (

            "Maintain proper storage conditions, "
            "perform periodic inspections, "
            "prioritize recyclable materials "
            "for processing and update inventory "
            "records after every recovery cycle."

        )

        self.add(body(recommendation))