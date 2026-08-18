class InventorySustainabilityService:
    """
    Sustainability calculations for textile inventory batches.

    This service is separate from the image-analysis sustainability
    service.

    Input:
        - fabric type
        - quantity in kg
        - condition
        - recommended action

    Output:
        - carbon footprint
        - CO2 savings
        - water savings
        - landfill diversion
        - resource conservation
        - sustainability score
    """

    # ==========================================================
    # Reference factors
    # ==========================================================

    MATERIAL_FACTORS = {

        "cotton": {
            "carbon_footprint_factor": 4.17,
            "water_impact_factor": 3177.4,

            "impact_source": (
                "Textile Exchange - "
                "Life Cycle Assessment for Cotton, 2026"
            ),

            "impact_boundary": "Cradle-to-gate",

            "impact_factor_status": (
                "Official published factor - "
                "India country average"
            ),

            "impact_region": "India",

            "impact_scenario": "Country average cotton"
        },

        # Other materials will be added only when
        # an appropriate published factor is configured.
    }


    # ==========================================================
    # Analyze inventory batch
    # ==========================================================

    def calculate(
        self,
        fabric_type,
        quantity,
        condition,
        recommended_action
    ):

        fabric = (
            fabric_type or ""
        ).strip().lower()

        condition = (
            condition or ""
        ).strip().lower()

        quantity = float(
            quantity or 0
        )


        # ======================================================
        # 1. Material factor
        # ======================================================

        factor = self.MATERIAL_FACTORS.get(
            fabric
        )


        # ======================================================
        # 2. Environmental impact
        # ======================================================

        carbon_footprint = None
        water_impact = None

        impact_source = "No configured official LCA factor"
        impact_boundary = "Not available"

        impact_factor_status = (
            "Official factor unavailable "
            "for this material/scenario"
        )

        impact_region = "Not available"
        impact_scenario = "Not available"


        if factor:

            carbon_footprint = round(
                quantity *
                factor["carbon_footprint_factor"],
                2
            )

            water_impact = round(
                quantity *
                factor["water_impact_factor"],
                2
            )

            impact_source = factor[
                "impact_source"
            ]

            impact_boundary = factor[
                "impact_boundary"
            ]

            impact_factor_status = factor[
                "impact_factor_status"
            ]

            impact_region = factor[
                "impact_region"
            ]

            impact_scenario = factor[
                "impact_scenario"
            ]


        # ======================================================
        # 3. Sustainability score
        # ======================================================

        if condition == "recyclable":

            recyclability_score = 90
            reuse_score = 70
            material_recovery_score = 90

        elif condition == "good":

            recyclability_score = 85
            reuse_score = 90
            material_recovery_score = 80

        elif condition in [
            "poor",
            "damaged"
        ]:

            recyclability_score = 70
            reuse_score = 40
            material_recovery_score = 75

        else:

            recyclability_score = 60
            reuse_score = 60
            material_recovery_score = 60


        sustainability_score = round(
            (
                recyclability_score
                + reuse_score
                + material_recovery_score
            ) / 3,
            2
        )


        # ======================================================
        # 4. Resource conservation
        # ======================================================

        if sustainability_score >= 90:

            resource_conservation = "Very High"

        elif sustainability_score >= 80:

            resource_conservation = "High"

        elif sustainability_score >= 70:

            resource_conservation = "Medium"

        else:

            resource_conservation = "Low"


        # ======================================================
        # 5. CO2 Savings Estimate
        # ======================================================

        co2_saved = None

        if factor:

            # Platform decision-support estimate.
            # This is NOT a certified LCA avoided-emissions result.
            recovery_factor = 0.88

            co2_saved = round(
                quantity
                * factor["carbon_footprint_factor"]
                * recovery_factor,
                2
            )


        # ======================================================
        # 6. Water Savings Estimate
        # ======================================================

        water_saved = None

        if factor:

            # Platform decision-support estimate.
            # This is NOT a certified LCA avoided-water result.
            recovery_factor = 0.80

            water_saved = round(
                quantity
                * factor["water_impact_factor"]
                * recovery_factor,
                2
            )

        # ======================================================
        # 7. Landfill diversion
        # ======================================================

        if quantity > 0:

            if recommended_action == "Recycle":

                landfill_diversion = round(
                    quantity * 0.90,
                    2
                )

            elif recommended_action == "Recover":

                landfill_diversion = round(
                    quantity * 0.70,
                    2
                )

            elif recommended_action == "Reuse":

                landfill_diversion = round(
                    quantity * 0.80,
                    2
                )

            else:

                landfill_diversion = 0

        else:

            landfill_diversion = 0


        # ======================================================
        # 8. Return result
        # ======================================================

        return {

            "carbon_footprint": carbon_footprint,

            "co2_saved": co2_saved,

            "water_impact": water_impact,

            "water_saved": water_saved,

            "landfill_diversion": landfill_diversion,

            "resource_conservation": (
                resource_conservation
            ),

            "sustainability_score": (
                sustainability_score
            ),

            "recyclability_score": (
                recyclability_score
            ),

            "reuse_score": (
                reuse_score
            ),

            "material_recovery_score": (
                material_recovery_score
            ),

            "impact_source": impact_source,

            "impact_boundary": impact_boundary,

            "impact_factor_status": (
                impact_factor_status
            ),

            "impact_region": impact_region,

            "impact_scenario": impact_scenario,

            "environmental_estimation_method": (
                "Decision-support estimate using configured "
                "material LCA factor and platform recovery scenario"
            ),

            "co2_savings_status": (
                "Estimated - comparative recovery baseline"
            ),

            "water_savings_status": (
                "Estimated - comparative recovery baseline"
            )
        }