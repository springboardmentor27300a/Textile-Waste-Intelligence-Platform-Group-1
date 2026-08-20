from sqlalchemy.orm import Session
from app.core.sustainability_data import (
    TEXTILE_SUSTAINABILITY_DATA,
    DEFAULT_SUSTAINABILITY_PROFILE,
)


class EnvironmentalAnalytics:
    """
    =========================================================

        Textile Waste Intelligence Platform

            Environmental Intelligence Engine

    Purpose
    -------
    Estimates environmental impact before and after
    textile recovery.

    Uses
    ----
    • Dashboard KPIs
    • Sustainability Engine
    • Reports
    • Recommendation Engine
    • Company Benchmarking

    Calculates
    ----------
    • Manufacturing Carbon Footprint
    • Carbon Savings
    • CO₂ Reduction
    • Water Consumption
    • Water Savings
    • Energy Consumption
    • Energy Savings
    • Landfill Diversion
    • Waste Diversion
    • Resource Recovery
    • Circular Economy Contribution
    • Pollution Reduction
    • Environmental Impact
    • Environmental Status

    =========================================================
    """

    @staticmethod
    def calculate(
        material: dict,
        waste: dict,
        scores: dict,
    ):

        # --------------------------------------------------
        # Material Profile
        # --------------------------------------------------

        material_name = material.get(
            "primary_material",
            "Unknown",
        )

        profile = TEXTILE_SUSTAINABILITY_DATA.get(
            material_name,
            DEFAULT_SUSTAINABILITY_PROFILE,
        )

        manufacturing = profile[
            "manufacturing"
        ]

        recycling = profile[
            "recycling"
        ]

        environment = profile[
            "environment"
        ]

        # --------------------------------------------------
        # Manufacturing Values
        # --------------------------------------------------

        carbon_per_kg = manufacturing[
            "carbon_footprint"
        ]

        water_per_kg = manufacturing[
            "water_consumption"
        ]

        energy_per_kg = manufacturing[
            "energy_consumption"
        ]

        # --------------------------------------------------
        # Waste Information
        # --------------------------------------------------

        quantity = waste.get(
            "quantity",
            1,
        )

        condition_score = waste.get(
            "condition_score",
            80,
        )

        contamination_level = waste.get(
            "contamination_level",
            0,
        )

        # --------------------------------------------------
        # Scores
        # --------------------------------------------------

        recovery = (
            scores[
                "material_recovery_score"
            ]
            / 100
        )

        circularity = (
            scores[
                "circularity_score"
            ]
            / 100
        )

        sustainability = (
            scores[
                "sustainability_score"
            ]
            / 100
        )

        environmental = (
            scores[
                "environmental_score"
            ]
            / 100
        )

        # --------------------------------------------------
        # Manufacturing Impact
        # --------------------------------------------------

        manufacturing_carbon = round(
            carbon_per_kg * quantity,
            2,
        )

        manufacturing_water = round(
            water_per_kg * quantity,
            2,
        )

        manufacturing_energy = round(
            energy_per_kg * quantity,
            2,
        )

        # Current Footprint

        carbon_footprint = (
            manufacturing_carbon
        )

        water_consumption = (
            manufacturing_water
        )

        energy_consumption = (
            manufacturing_energy
        )

        # --------------------------------------------------
        # Recycling Benefits
        # --------------------------------------------------

        carbon_savings = round(

            manufacturing_carbon
            * recovery,

            2,

        )

        water_savings = round(

            manufacturing_water
            * recovery,

            2,

        )

        energy_savings = round(

            manufacturing_energy
            * recovery,

            2,

        )

        # --------------------------------------------------
        # CO₂ Reduction
        # --------------------------------------------------

        co2_reduction = round(

            (
                carbon_savings
                / max(
                    manufacturing_carbon,
                    1,
                )
            )
            * 100,

            2,

        )

        # --------------------------------------------------
        # Landfill Diversion
        # --------------------------------------------------

        landfill_diversion = round(

            quantity
            * recovery,

            2,

        )

        # landfill_diversion is a quantity; waste_diversion is a rate.
        waste_diversion = round(
            recovery * 100,
            2,
        )

        recovered_material_quantity = round(
            quantity * recovery,
            2,
        )

        landfill_remaining = round(
            max(quantity - landfill_diversion, 0),
            2,
        )

        # --------------------------------------------------
        # Resource Recovery
        # --------------------------------------------------

        resource_recovery = round(

            scores[
                "material_recovery_score"
            ],

            2,

        )

        resource_conservation = round(

            recovery
            * 100,

            2,

        )

        # --------------------------------------------------
        # Circular Economy
        # --------------------------------------------------

        circular_economy_contribution = round(

            (

                circularity

                *

                sustainability

                *

                recovery

            )

            * 100,

            2,

        )

        # --------------------------------------------------
        # Pollution Reduction
        # --------------------------------------------------

        pollution_reduction = round(

            (

                environmental

                *

                recovery

            )

            * 100,

            2,

        )

        # --------------------------------------------------
        # Manufacturing vs Recycling
        # --------------------------------------------------

        manufacturing_emissions = round(

            manufacturing_carbon,

            2,

        )

        recycling_emissions = round(

            manufacturing_carbon
            - carbon_savings,

            2,

        )

        net_carbon_impact = round(

            manufacturing_emissions
            - recycling_emissions,

            2,

        )

        # --------------------------------------------------
        # Environmental Benefit Index
        # --------------------------------------------------

        environmental_benefit = round(

            (

                carbon_savings * 0.30

                +

                water_savings / 1000 * 0.25

                +

                energy_savings * 0.15

                +

                resource_conservation * 0.15

                +

                circular_economy_contribution
                * 0.15

            ),

            2,

        )

        # --------------------------------------------------
        # Environmental Impact
        # --------------------------------------------------

        if pollution_reduction >= 85:

            environmental_impact = "Very Low"

            environmental_status = "Excellent"

        elif pollution_reduction >= 70:

            environmental_impact = "Low"

            environmental_status = "Good"

        elif pollution_reduction >= 55:

            environmental_impact = "Moderate"

            environmental_status = "Average"

        else:

            environmental_impact = "High"

            environmental_status = "Needs Improvement"

        # --------------------------------------------------
        # Sustainability Recommendation
        # --------------------------------------------------

        if resource_recovery >= 90:

            recommendation = (
                "Continue direct recycling and maximize "
                "closed-loop material recovery."
            )

        elif resource_recovery >= 75:

            recommendation = (
                "Suitable for mechanical recycling with "
                "high recovery potential."
            )

        elif resource_recovery >= 60:

            recommendation = (
                "Consider chemical recycling or blended "
                "material recovery."
            )

        else:

            recommendation = (
                "Material recovery is limited. Consider "
                "upcycling or energy recovery."
            )

        # --------------------------------------------------
        # Environmental Summary
        # --------------------------------------------------

        summary = {

            "manufacturing_emissions":
                manufacturing_emissions,

            "recycling_emissions":
                recycling_emissions,

            "net_carbon_impact":
                net_carbon_impact,

            "co2_reduction":
                co2_reduction,

            "pollution_reduction":
                pollution_reduction,

            "environmental_benefit":
                environmental_benefit,

        }

        # --------------------------------------------------
        # Final Output
        # --------------------------------------------------

        return {

            # Manufacturing

            "manufacturing_carbon":
                manufacturing_carbon,

            "manufacturing_water":
                manufacturing_water,

            "manufacturing_energy":
                manufacturing_energy,

            # Current Impact

            "carbon_footprint":
                carbon_footprint,

            "water_consumption":
                water_consumption,

            "energy_consumption":
                energy_consumption,

            # Savings

            "carbon_savings":
                carbon_savings,

            "water_savings":
                water_savings,

            "energy_savings":
                energy_savings,

            # Reduction

            "co2_reduction":
                co2_reduction,

            "pollution_reduction":
                pollution_reduction,

            # Diversion

            "landfill_diversion":
                landfill_diversion,

            "landfill_diversion_rate":
                waste_diversion,

            "landfill_remaining":
                landfill_remaining,

            "waste_diversion":
                waste_diversion,

            # Recovery

            "resource_recovery":
                resource_recovery,

            "recovered_material_quantity":
                recovered_material_quantity,

            "resource_conservation":
                resource_conservation,

            # Circular Economy

            "circular_economy_contribution":
                circular_economy_contribution,

            # Overall Environmental

            "environmental_benefit":
                environmental_benefit,

            "environmental_impact":
                environmental_impact,

            "environmental_status":
                environmental_status,

            # Report Summary

            "summary":
                summary,

            # Recommendation

            "recommendation":
                recommendation,
        }

    @staticmethod
    def summary(db: Session):
        """
        Return a dashboard-safe aggregate of the environmental fields
        that are actually persisted by the current Analysis model.

        IMPORTANT:
        Do not reference derived columns that are not present in Analysis.
        Derived metrics are calculated here from persisted values using the
        same formulas used by EnvironmentalAnalytics.calculate().
        """
        from sqlalchemy import func
        from app.models.analysis import Analysis

        def avg(column):
            value = db.query(
                func.coalesce(func.avg(column), 0)
            ).scalar()
            return round(float(value or 0), 2)

        avg_carbon = avg(Analysis.carbon_footprint)
        avg_carbon_savings = avg(Analysis.carbon_savings)
        avg_water = avg(Analysis.water_consumption)
        avg_water_savings = avg(Analysis.water_savings)
        avg_energy = avg(Analysis.energy_consumption)
        avg_energy_savings = avg(Analysis.energy_savings)
        avg_landfill = avg(Analysis.landfill_diversion)
        avg_resource = avg(Analysis.resource_conservation)
        avg_environmental_score = avg(Analysis.environmental_score)
        avg_circularity = avg(Analysis.circularity_score)
        avg_sustainability = avg(Analysis.sustainability_score)
        avg_recovery = avg(Analysis.material_recovery_score)

        # EnvironmentalEngine/EnvironmentalAnalytics uses recovery as the
        # waste-diversion rate and resource-recovery percentage.
        waste_diversion = round(avg_recovery, 2)
        resource_recovery = round(avg_recovery, 2)

        # Same CO2 reduction concept as calculate(): avoided carbon / current
        # manufacturing carbon. Clamp to [0, 100] for dashboard safety.
        if avg_carbon > 0:
            co2_reduction = round(
                min(max((avg_carbon_savings / avg_carbon) * 100, 0), 100),
                2,
            )
        else:
            co2_reduction = 0.0

        # Same pollution-reduction relationship as calculate():
        # environmental score * recovery fraction.
        pollution_reduction = round(
            min(
                max(
                    (avg_environmental_score * avg_recovery) / 100,
                    0,
                ),
                100,
            ),
            2,
        )

        # Same circular-economy contribution formula used by calculate().
        circular_economy_contribution = round(
            (
                (avg_circularity / 100)
                * (avg_sustainability / 100)
                * (avg_recovery / 100)
            )
            * 100,
            2,
        )

        environmental_benefit = round(
            (
                avg_carbon_savings * 0.30
                + (avg_water_savings / 1000) * 0.25
                + avg_energy_savings * 0.15
                + avg_resource * 0.15
                + circular_economy_contribution * 0.15
            ),
            2,
        )

        if pollution_reduction >= 85:
            environmental_impact = "Very Low"
            environmental_status = "Excellent"
        elif pollution_reduction >= 70:
            environmental_impact = "Low"
            environmental_status = "Good"
        elif pollution_reduction >= 55:
            environmental_impact = "Moderate"
            environmental_status = "Average"
        else:
            environmental_impact = "High"
            environmental_status = "Needs Improvement"

        if resource_recovery >= 90:
            recommendation = (
                "Continue direct recycling and maximize "
                "closed-loop material recovery."
            )
        elif resource_recovery >= 75:
            recommendation = (
                "Suitable for mechanical recycling with "
                "high recovery potential."
            )
        elif resource_recovery >= 60:
            recommendation = (
                "Consider chemical recycling or blended "
                "material recovery."
            )
        else:
            recommendation = (
                "Material recovery is limited. Consider "
                "upcycling or energy recovery."
            )

        # Manufacturing-vs-recycling values are derived from persisted
        # averages. A quantity-level landfill remainder is not persisted on
        # Analysis, so it is deliberately left at 0 rather than invented.
        manufacturing_emissions = avg_carbon
        recycling_emissions = round(
            max(avg_carbon - avg_carbon_savings, 0),
            2,
        )
        net_carbon_impact = round(
            manufacturing_emissions - recycling_emissions,
            2,
        )

        summary = {
            "manufacturing_emissions": manufacturing_emissions,
            "recycling_emissions": recycling_emissions,
            "net_carbon_impact": net_carbon_impact,
            "co2_reduction": co2_reduction,
            "pollution_reduction": pollution_reduction,
            "environmental_benefit": environmental_benefit,
        }

        return {
            "manufacturing_carbon": avg_carbon,
            "manufacturing_water": avg_water,
            "manufacturing_energy": avg_energy,
            "carbon_footprint": avg_carbon,
            "carbon_savings": avg_carbon_savings,
            "water_consumption": avg_water,
            "water_savings": avg_water_savings,
            "energy_consumption": avg_energy,
            "energy_savings": avg_energy_savings,
            "co2_reduction": co2_reduction,
            "pollution_reduction": pollution_reduction,
            "landfill_diversion": avg_landfill,
            "landfill_diversion_rate": waste_diversion,
            "landfill_remaining": 0.0,
            "waste_diversion": waste_diversion,
            "resource_recovery": resource_recovery,
            "recovered_material_quantity": 0.0,
            "resource_conservation": avg_resource,
            "circular_economy_contribution": circular_economy_contribution,
            "environmental_benefit": environmental_benefit,
            "environmental_impact": environmental_impact,
            "environmental_status": environmental_status,
            "environmental_score": avg_environmental_score,
            "summary": summary,
            "recommendation": recommendation,
        }