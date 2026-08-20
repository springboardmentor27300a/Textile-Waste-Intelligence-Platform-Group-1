from app.core.sustainability_data import (
    TEXTILE_SUSTAINABILITY_DATA,
    DEFAULT_SUSTAINABILITY_PROFILE,
)


class EnvironmentalEngine:
    """
    =========================================================
        Textile Waste Intelligence Platform

            Environmental Assessment Engine

    =========================================================

    Estimates environmental impact and environmental benefits
    associated with textile recovery.

    Calculates
    ----------

    Manufacturing Impact
        • Carbon Footprint
        • Water Consumption
        • Energy Consumption

    Environmental Savings
        • CO2 Savings
        • Water Savings
        • Energy Savings

    Waste Diversion
        • Landfill Diversion
        • Landfill Reduction
        • Waste Diversion Rate
        • Remaining Landfill Waste

    Resource Intelligence
        • Resource Recovery
        • Recovered Material Quantity
        • Resource Conservation

    Circular Economy
        • Circular Economy Contribution

    Environmental Performance
        • CO2 Reduction
        • Pollution Reduction
        • Environmental Benefit
        • Environmental Impact
        • Environmental Status

    Recommendations
        • AI Environmental Recommendation

    This engine is consumed by:
        • Sustainability Engine
        • Sustainability Dashboard
        • Reports
        • Analytics
        • Recommendation Engine
        • Company Benchmarking

    =========================================================
    """

    # --------------------------------------------------
    # Helpers
    # --------------------------------------------------

    @staticmethod
    def _number(
        value,
        default=0.0,
    ):
        """
        Safely convert a value to float.
        """

        try:
            if value is None:
                return float(default)

            return float(value)

        except (
            TypeError,
            ValueError,
        ):
            return float(default)

    @staticmethod
    def _clamp(
        value,
        minimum=0.0,
        maximum=100.0,
    ):
        """
        Keep a percentage/score within a valid range.
        """

        value = EnvironmentalEngine._number(
            value,
            minimum,
        )

        return max(
            minimum,
            min(
                maximum,
                value,
            ),
        )

    @staticmethod
    def _round(
        value,
        digits=2,
    ):
        return round(
            EnvironmentalEngine._number(
                value,
                0,
            ),
            digits,
        )

    # --------------------------------------------------
    # Main Environmental Calculation
    # --------------------------------------------------

    @staticmethod
    def calculate(
        material: dict,
        waste: dict,
        scores: dict,
    ):
        material = material or {}
        waste = waste or {}
        scores = scores or {}

        # ==================================================
        # Material Profile
        # ==================================================

        material_name = (
            material.get(
                "primary_material"
            )
            or material.get(
                "material"
            )
            or "Unknown"
        )

        material_name = str(
            material_name
        ).strip()

        profile = TEXTILE_SUSTAINABILITY_DATA.get(
            material_name,
            DEFAULT_SUSTAINABILITY_PROFILE,
        )

        profile = (
            profile
            or DEFAULT_SUSTAINABILITY_PROFILE
            or {}
        )

        manufacturing = profile.get(
            "manufacturing",
            {},
        )

        recycling = profile.get(
            "recycling",
            {},
        )

        environment = profile.get(
            "environment",
            {},
        )

        # ==================================================
        # Manufacturing Baseline
        # ==================================================

        carbon_per_kg = EnvironmentalEngine._number(
            manufacturing.get(
                "carbon_footprint",
                0,
            )
        )

        water_per_kg = EnvironmentalEngine._number(
            manufacturing.get(
                "water_consumption",
                0,
            )
        )

        energy_per_kg = EnvironmentalEngine._number(
            manufacturing.get(
                "energy_consumption",
                0,
            )
        )

        # ==================================================
        # Waste Information
        # ==================================================

        quantity = EnvironmentalEngine._number(
            waste.get(
                "quantity",
                1,
            ),
            1,
        )

        quantity = max(
            quantity,
            0,
        )

        condition_score = EnvironmentalEngine._clamp(
            waste.get(
                "condition_score",
                80,
            )
        )

        contamination_level = EnvironmentalEngine._clamp(
            waste.get(
                "contamination_level",
                0,
            )
        )

        # ==================================================
        # Waste Scoring Results
        # ==================================================

        recovery_score = EnvironmentalEngine._clamp(
            scores.get(
                "material_recovery_score",
                0,
            )
        )

        circularity_score = EnvironmentalEngine._clamp(
            scores.get(
                "circularity_score",
                0,
            )
        )

        sustainability_score = EnvironmentalEngine._clamp(
            scores.get(
                "sustainability_score",
                0,
            )
        )

        environmental_score = EnvironmentalEngine._clamp(
            scores.get(
                "environmental_score",
                0,
            )
        )

        recyclability_score = EnvironmentalEngine._clamp(
            scores.get(
                "recyclability_score",
                0,
            )
        )

        reuse_score = EnvironmentalEngine._clamp(
            scores.get(
                "reuse_score",
                0,
            )
        )

        # ==================================================
        # Manufacturing Impact
        # ==================================================

        manufacturing_carbon = (
            carbon_per_kg
            * quantity
        )

        manufacturing_water = (
            water_per_kg
            * quantity
        )

        manufacturing_energy = (
            energy_per_kg
            * quantity
        )

        manufacturing_carbon = EnvironmentalEngine._round(
            manufacturing_carbon
        )

        manufacturing_water = EnvironmentalEngine._round(
            manufacturing_water
        )

        manufacturing_energy = EnvironmentalEngine._round(
            manufacturing_energy
        )

        # Current manufacturing footprint.
        carbon_footprint = (
            manufacturing_carbon
        )

        water_consumption = (
            manufacturing_water
        )

        energy_consumption = (
            manufacturing_energy
        )

        # ==================================================
        # Recovery Rate
        # ==================================================

        recovery_rate = (
            recovery_score / 100
        )

        recovery_rate = max(
            0,
            min(
                1,
                recovery_rate,
            ),
        )

        # ==================================================
        # CO2 Savings
        # ==================================================

        carbon_savings = (
            manufacturing_carbon
            * recovery_rate
        )

        carbon_savings = EnvironmentalEngine._round(
            carbon_savings
        )

        # ==================================================
        # Water Savings
        # ==================================================

        water_savings = (
            manufacturing_water
            * recovery_rate
        )

        water_savings = EnvironmentalEngine._round(
            water_savings
        )

        # ==================================================
        # Energy Savings
        # ==================================================

        energy_savings = (
            manufacturing_energy
            * recovery_rate
        )

        energy_savings = EnvironmentalEngine._round(
            energy_savings
        )

        # ==================================================
        # CO2 Reduction Percentage
        # ==================================================

        if manufacturing_carbon > 0:

            co2_reduction = (
                carbon_savings
                / manufacturing_carbon
            ) * 100

        else:

            co2_reduction = 0

        co2_reduction = EnvironmentalEngine._clamp(
            co2_reduction
        )

        co2_reduction = EnvironmentalEngine._round(
            co2_reduction
        )

        # ==================================================
        # Landfill Diversion
        # ==================================================

        recovered_material_quantity = (
            quantity
            * recovery_rate
        )

        landfill_diversion = (
            recovered_material_quantity
        )

        landfill_remaining = max(
            quantity
            - landfill_diversion,
            0,
        )

        landfill_diversion = EnvironmentalEngine._round(
            landfill_diversion
        )

        landfill_remaining = EnvironmentalEngine._round(
            landfill_remaining
        )

        # ==================================================
        # Landfill Reduction Percentage
        # ==================================================

        if quantity > 0:

            landfill_reduction = (
                landfill_diversion
                / quantity
            ) * 100

        else:

            landfill_reduction = 0

        landfill_reduction = EnvironmentalEngine._clamp(
            landfill_reduction
        )

        landfill_reduction = EnvironmentalEngine._round(
            landfill_reduction
        )

        # Waste diversion is the same recovery-based rate.
        waste_diversion = landfill_reduction

        # ==================================================
        # Resource Recovery
        # ==================================================

        resource_recovery = EnvironmentalEngine._round(
            recovery_score
        )

        # ==================================================
        # Resource Conservation
        # ==================================================
        #
        # Indicates how much virgin-resource demand can
        # potentially be avoided by recovering the textile.
        #
        # Recovery score is used as the recovery basis.
        # Material condition and recyclability influence
        # the final conservation estimate.
        # ==================================================

        resource_conservation = (
            recovery_rate
            * (
                (
                    recyclability_score
                    * 0.50
                )
                +
                (
                    condition_score
                    * 0.30
                )
                +
                (
                    reuse_score
                    * 0.20
                )
            )
        )

        resource_conservation = (
            EnvironmentalEngine._clamp(
                resource_conservation
            )
        )

        resource_conservation = (
            EnvironmentalEngine._round(
                resource_conservation
            )
        )

        # ==================================================
        # Resource Conservation Quantity
        # ==================================================

        resource_conserved_quantity = (
            quantity
            * (
                resource_conservation
                / 100
            )
        )

        resource_conserved_quantity = (
            EnvironmentalEngine._round(
                resource_conserved_quantity
            )
        )

        # ==================================================
        # Circular Economy Contribution
        # ==================================================
        #
        # Circular economy contribution combines:
        #
        #   Circularity
        #   Recovery
        #   Reuse
        #   Sustainability
        #
        # This represents the contribution of the recovered
        # textile to a closed-loop material system.
        # ==================================================

        circular_economy_contribution = (
            circularity_score * 0.35
            +
            recovery_score * 0.30
            +
            reuse_score * 0.20
            +
            sustainability_score * 0.15
        )

        circular_economy_contribution = (
            EnvironmentalEngine._clamp(
                circular_economy_contribution
            )
        )

        circular_economy_contribution = (
            EnvironmentalEngine._round(
                circular_economy_contribution
            )
        )

        # ==================================================
        # Pollution Reduction
        # ==================================================
        #
        # Environmental score + recovery performance are
        # used to estimate pollution reduction potential.
        # ==================================================

        pollution_reduction = (
            environmental_score * 0.40
            +
            recovery_score * 0.30
            +
            circularity_score * 0.20
            +
            sustainability_score * 0.10
        )

        pollution_reduction = (
            EnvironmentalEngine._clamp(
                pollution_reduction
            )
        )

        pollution_reduction = (
            EnvironmentalEngine._round(
                pollution_reduction
            )
        )

        # ==================================================
        # Manufacturing vs Recovery
        # ==================================================

        manufacturing_emissions = (
            manufacturing_carbon
        )

        recycling_emissions = max(
            manufacturing_carbon
            - carbon_savings,
            0,
        )

        net_carbon_impact = (
            manufacturing_emissions
            - recycling_emissions
        )

        manufacturing_emissions = (
            EnvironmentalEngine._round(
                manufacturing_emissions
            )
        )

        recycling_emissions = (
            EnvironmentalEngine._round(
                recycling_emissions
            )
        )

        net_carbon_impact = (
            EnvironmentalEngine._round(
                net_carbon_impact
            )
        )

        # ==================================================
        # Environmental Benefit Index
        # ==================================================
        #
        # This is a normalized 0-100 performance score.
        #
        # It intentionally does NOT directly add kg, litres,
        # and kWh together.
        # ==================================================

        environmental_benefit = (
            environmental_score * 0.30
            +
            co2_reduction * 0.20
            +
            landfill_reduction * 0.15
            +
            resource_conservation * 0.15
            +
            circular_economy_contribution * 0.10
            +
            waste_diversion * 0.10
        )

        environmental_benefit = (
            EnvironmentalEngine._clamp(
                environmental_benefit
            )
        )

        environmental_benefit = (
            EnvironmentalEngine._round(
                environmental_benefit
            )
        )

        # ==================================================
        # Environmental Impact Classification
        # ==================================================

        if pollution_reduction >= 85:

            environmental_impact = "Very Low"

            environmental_status = "Excellent"

        elif pollution_reduction >= 70:

            environmental_impact = "Low"

            environmental_status = "Good"

        elif pollution_reduction >= 55:

            environmental_impact = "Moderate"

            environmental_status = "Average"

        elif pollution_reduction >= 40:

            environmental_impact = "High"

            environmental_status = "Needs Improvement"

        else:

            environmental_impact = "Very High"

            environmental_status = "Poor"

        # ==================================================
        # Environmental Recommendation
        # ==================================================

        if (
            recovery_score >= 85
            and
            recyclability_score >= 80
        ):

            recommendation = (
                "Prioritize closed-loop recycling and "
                "maximize material recovery. This textile "
                "has strong potential to reduce virgin "
                "material demand, carbon emissions and "
                "landfill disposal."
            )

        elif (
            reuse_score >= 80
            and
            condition_score >= 75
        ):

            recommendation = (
                "Prioritize direct reuse, repair, donation "
                "or resale before mechanical recycling. "
                "Extending the useful life of the textile "
                "can maximize environmental benefit."
            )

        elif recovery_score >= 70:

            recommendation = (
                "Route the material to an appropriate "
                "recycling process. Recovery can provide "
                "meaningful carbon, water and landfill "
                "reduction benefits."
            )

        elif recovery_score >= 55:

            recommendation = (
                "Consider specialized recycling, blended "
                "material recovery or controlled upcycling. "
                "Improve sorting and contamination removal "
                "to increase recovery efficiency."
            )

        else:

            recommendation = (
                "Material recovery potential is limited. "
                "Prioritize contamination removal and "
                "upcycling where feasible. If recovery is "
                "not technically viable, use an appropriate "
                "controlled disposal or energy-recovery route."
            )

        # ==================================================
        # Environmental Summary
        # ==================================================

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

            "water_savings":
                water_savings,

            "energy_savings":
                energy_savings,

            "landfill_reduction":
                landfill_reduction,

            "resource_conservation":
                resource_conservation,

            "environmental_benefit":
                environmental_benefit,
        }

        # ==================================================
        # Final Output
        # ==================================================

        return {

            # ==================================================
            # Manufacturing Impact
            # ==================================================

            "manufacturing_carbon":
                manufacturing_carbon,

            "manufacturing_water":
                manufacturing_water,

            "manufacturing_energy":
                manufacturing_energy,

            # ==================================================
            # Current Environmental Footprint
            # ==================================================

            "carbon_footprint":
                carbon_footprint,

            "water_consumption":
                water_consumption,

            "energy_consumption":
                energy_consumption,

            # ==================================================
            # Environmental Savings
            # ==================================================

            "carbon_savings":
                carbon_savings,

            "water_savings":
                water_savings,

            "energy_savings":
                energy_savings,

            # ==================================================
            # CO2 / Pollution Reduction
            # ==================================================

            "co2_reduction":
                co2_reduction,

            "pollution_reduction":
                pollution_reduction,

            # ==================================================
            # Landfill / Waste Diversion
            # ==================================================

            "landfill_diversion":
                landfill_diversion,

            "landfill_diversion_rate":
                landfill_reduction,

            "landfill_reduction":
                landfill_reduction,

            "landfill_remaining":
                landfill_remaining,

            "waste_diversion":
                waste_diversion,

            # ==================================================
            # Resource Recovery
            # ==================================================

            "resource_recovery":
                resource_recovery,

            "recovered_material_quantity":
                recovered_material_quantity,

            "resource_conservation":
                resource_conservation,

            "resource_conserved_quantity":
                resource_conserved_quantity,

            # ==================================================
            # Circular Economy
            # ==================================================

            "circular_economy_contribution":
                circular_economy_contribution,

            # ==================================================
            # Environmental Performance
            # ==================================================

            "environmental_benefit":
                environmental_benefit,

            "environmental_impact":
                environmental_impact,

            "environmental_status":
                environmental_status,

            # ==================================================
            # Recommendation
            # ==================================================

            "recommendation":
                recommendation,

            # ==================================================
            # Summary
            # ==================================================

            "summary":
                summary,
        }