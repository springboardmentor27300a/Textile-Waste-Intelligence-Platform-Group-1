import csv

from io import StringIO
from io import BytesIO


class CSVService:
    """
    =========================================================

        Textile Waste Intelligence Platform

            CSV Export Service

    =========================================================
    """

    @staticmethod
    def export(
        rows: list[dict],
    ):

        output = StringIO()

        if rows:

            writer = csv.DictWriter(

                output,

                fieldnames=rows[0].keys(),

            )

            writer.writeheader()

            writer.writerows(rows)

        buffer = BytesIO()

        buffer.write(
            output.getvalue().encode("utf-8")
        )

        buffer.seek(0)

        return buffer