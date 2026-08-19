from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from collections import Counter, defaultdict
import re

from backend.database import get_db
from backend.models import PredictionHistory


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# ============================================================
# HELPER FUNCTION
# Convert stored carbon value into a number
# Example:
# "6.2 kg CO₂" -> 6.2
# ============================================================

def extract_carbon_value(value):

    if value is None:
        return 0.0

    try:
        # If database value is already numeric
        return float(value)

    except (ValueError, TypeError):
        pass

    try:
        # Extract first numeric value from text
        match = re.search(
            r"-?\d+(?:\.\d+)?",
            str(value)
        )

        if match:
            return float(match.group())

    except Exception:
        pass

    return 0.0


# ============================================================
# DASHBOARD SUMMARY
# ============================================================

@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Get all prediction records
    # --------------------------------------------------------

    predictions = (
        db.query(PredictionHistory)
        .all()
    )


    total_predictions = len(predictions)


    # --------------------------------------------------------
    # Sustainability Scores
    # --------------------------------------------------------

    scores = []

    for row in predictions:

        if row.sustainability_score is not None:

            try:

                scores.append(
                    float(
                        row.sustainability_score
                    )
                )

            except (ValueError, TypeError):

                pass


    if scores:

        total_score = sum(scores)

        average_score = (
            total_score /
            len(scores)
        )

    else:

        total_score = 0

        average_score = 0


    # --------------------------------------------------------
    # Total Carbon Saved
    # --------------------------------------------------------

    total_carbon = 0.0


    for row in predictions:

        total_carbon += (
            extract_carbon_value(
                row.carbon_saved
            )
        )


    # --------------------------------------------------------
    # Waste Diversion
    #
    # Reusable + Recyclable =
    # Waste diverted from disposal
    # --------------------------------------------------------

    diverted_count = 0


    for row in predictions:

        category = (
            str(
                row.waste_category or ""
            )
            .strip()
            .lower()
        )


        if category in [
            "reusable",
            "recyclable"
        ]:

            diverted_count += 1


    if total_predictions > 0:

        waste_diversion = (
            diverted_count /
            total_predictions
        ) * 100

    else:

        waste_diversion = 0


    # --------------------------------------------------------
    # Return Dashboard Data
    # --------------------------------------------------------

    return {

        "total_predictions":
            total_predictions,

        "total_sustainability_score":
            round(
                total_score,
                2
            ),

        "average_score":
            round(
                average_score,
                2
            ),

        "total_carbon_saved":
            round(
                total_carbon,
                2
            ),

        "waste_diversion":
            round(
                waste_diversion,
                2
            )

    }


# ============================================================
# DASHBOARD CHARTS
# ============================================================

@router.get("/charts")
def dashboard_charts(
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Get prediction records
    # --------------------------------------------------------

    predictions = (
        db.query(PredictionHistory)
        .all()
    )


    # --------------------------------------------------------
    # Fabric Distribution
    # --------------------------------------------------------

    fabric_counter = Counter()


    # --------------------------------------------------------
    # Waste Category Distribution
    # --------------------------------------------------------

    waste_counter = Counter()


    # --------------------------------------------------------
    # Carbon Savings
    # Group carbon savings by fabric type
    # --------------------------------------------------------

    carbon_by_fabric = defaultdict(float)


    # --------------------------------------------------------
    # Process records
    # --------------------------------------------------------

    for row in predictions:

        # -----------------------------
        # Fabric
        # -----------------------------

        fabric = (
            row.fabric_type
            or "Unknown"
        )


        fabric_counter[
            fabric
        ] += 1


        # -----------------------------
        # Waste Category
        # -----------------------------

        category = (
            row.waste_category
            or "Unknown"
        )


        waste_counter[
            category
        ] += 1


        # -----------------------------
        # Carbon
        # -----------------------------

        carbon_value = (
            extract_carbon_value(
                row.carbon_saved
            )
        )


        carbon_by_fabric[
            fabric
        ] += carbon_value


    # ========================================================
    # Fabric Chart
    # ========================================================

    fabric_labels = list(
        fabric_counter.keys()
    )

    fabric_values = list(
        fabric_counter.values()
    )


    # ========================================================
    # Waste Chart
    # ========================================================

    waste_labels = list(
        waste_counter.keys()
    )

    waste_values = list(
        waste_counter.values()
    )


    # ========================================================
    # Carbon Chart
    # ========================================================

    carbon_labels = list(
        carbon_by_fabric.keys()
    )

    carbon_values = [

        round(
            value,
            2
        )

        for value
        in carbon_by_fabric.values()

    ]


    # ========================================================
    # Return Chart Data
    # ========================================================

    return {

        "fabric": {

            "labels":
                fabric_labels,

            "values":
                fabric_values

        },


        "waste": {

            "labels":
                waste_labels,

            "values":
                waste_values

        },


        "carbon": {

            "labels":
                carbon_labels,

            "values":
                carbon_values

        }

    }