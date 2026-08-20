class WasteClassifier:
    """
    Textile Waste Intelligence Platform
    ------------------------------------
    Waste Intelligence Engine

    Determines:
        - Waste category
        - Waste subcategory
        - Reuse potential
        - Recycling method
        - Disposal method
        - Material condition
        - Contamination level
        - Preliminary recovery scores

    Final Milestone-3 circularity scoring is performed by the
    dedicated scoring engine after environmental assessment.
    """

    @staticmethod
    def _clamp(value, minimum=0.0, maximum=100.0):
        return max(
            minimum,
            min(
                maximum,
                float(value),
            ),
        )

    @staticmethod
    def classify(
        material: dict,
        defects: dict,
        contamination: dict,
    ):
        material = material or {}
        defects = defects or {}
        contamination = contamination or {}

        # --------------------------------------------------
        # Material information
        # --------------------------------------------------

        quality = str(
            material.get(
                "material_quality",
                "Medium",
            )
        )

        difficulty = str(
            material.get(
                "recycling_difficulty",
                "Medium",
            )
        )

        # --------------------------------------------------
        # Defects
        # --------------------------------------------------

        defect_list = defects.get(
            "defects",
            [],
        )

        if not isinstance(defect_list, list):
            defect_list = []

        defect_count = len(defect_list)

        # --------------------------------------------------
        # Contamination
        # --------------------------------------------------

        contamination_list = contamination.get(
            "contamination",
            [],
        )

        if not isinstance(contamination_list, list):
            contamination_list = []

        contamination_count = len(
            contamination_list
        )

        contamination_level = WasteClassifier._clamp(
            contamination_count * 20
        )

        # --------------------------------------------------
        # Material condition
        # --------------------------------------------------

        condition_score = WasteClassifier._clamp(
            100
            - defect_count * 12
            - contamination_count * 15
        )

        # --------------------------------------------------
        # Waste category
        # --------------------------------------------------

        if contamination_count >= 3:

            waste_category = "Hazardous"

            waste_subcategory = (
                "Contaminated Textile"
            )

        elif condition_score >= 90:

            waste_category = "Reusable"

            waste_subcategory = (
                "Direct Reuse"
            )

        elif condition_score >= 70:

            waste_category = "Repairable"

            waste_subcategory = (
                "Minor Repair"
            )

        elif difficulty in (
            "Easy",
            "Medium",
        ):

            waste_category = "Recyclable"

            waste_subcategory = (
                "Material Recycling"
            )

        elif difficulty in (
            "Hard",
            "Very Hard",
        ):

            waste_category = "Upcyclable"

            waste_subcategory = (
                "Creative Reuse"
            )

        else:

            waste_category = "General Waste"

            waste_subcategory = (
                "Municipal Waste"
            )

        # --------------------------------------------------
        # Reuse potential
        # --------------------------------------------------

        if condition_score >= 90:

            reuse_potential = "High"

        elif condition_score >= 70:

            reuse_potential = "Medium"

        elif condition_score >= 50:

            reuse_potential = "Low"

        else:

            reuse_potential = "Very Low"

        # --------------------------------------------------
        # Recycling and disposal method
        # --------------------------------------------------

        if waste_category == "Reusable":

            recycling_method = (
                "Direct Reuse"
            )

            disposal_method = (
                "Donation / Resale"
            )

        elif waste_category == "Repairable":

            recycling_method = (
                "Repair & Reuse"
            )

            disposal_method = (
                "Repair Facility"
            )

        elif waste_category == "Recyclable":

            if difficulty == "Easy":

                recycling_method = (
                    "Mechanical Recycling"
                )

            else:

                recycling_method = (
                    "Chemical Recycling"
                )

            disposal_method = (
                "Recycling Plant"
            )

        elif waste_category == "Upcyclable":

            recycling_method = (
                "Upcycling"
            )

            disposal_method = (
                "Creative Manufacturing"
            )

        elif waste_category == "Hazardous":

            recycling_method = (
                "Specialized Processing"
            )

            disposal_method = (
                "Authorized Hazardous Facility"
            )

        else:

            recycling_method = (
                "Energy Recovery"
            )

            disposal_method = (
                "Landfill"
            )

        # --------------------------------------------------
        # Preliminary waste score
        # --------------------------------------------------

        waste_score = round(
            condition_score,
            2,
        )

        # --------------------------------------------------
        # Reuse score
        # --------------------------------------------------

        reuse_score = round(
            condition_score,
            2,
        )

        # --------------------------------------------------
        # Recyclability score
        # --------------------------------------------------

        recyclability_score = WasteClassifier._clamp(
            100
            - contamination_level * 0.5
        )

        recyclability_score = round(
            recyclability_score,
            2,
        )

        # --------------------------------------------------
        # Material recovery score
        # --------------------------------------------------

        material_recovery_score = round(
            (
                recyclability_score * 0.60
                +
                condition_score * 0.40
            ),
            2,
        )

        material_recovery_score = WasteClassifier._clamp(
            material_recovery_score
        )

        # --------------------------------------------------
        # Preliminary circularity score
        #
        # NOTE:
        # Final Milestone-3 weighted circularity is calculated
        # by the dedicated scoring engine after environmental
        # benefit and processing feasibility are available.
        # --------------------------------------------------

        preliminary_circularity_score = round(
            (
                reuse_score
                +
                recyclability_score
                +
                material_recovery_score
            ) / 3,
            2,
        )

        preliminary_circularity_score = (
            WasteClassifier._clamp(
                preliminary_circularity_score
            )
        )

        # --------------------------------------------------
        # Return
        # --------------------------------------------------

        return {
            "waste_category": waste_category,

            "waste_subcategory": waste_subcategory,

            "reuse_potential": reuse_potential,

            "recycling_method": recycling_method,

            "disposal_method": disposal_method,

            "condition_score": round(
                condition_score,
                2,
            ),

            "contamination_level": round(
                contamination_level,
                2,
            ),

            "waste_score": round(
                waste_score,
                2,
            ),

            "reuse_score": round(
                reuse_score,
                2,
            ),

            "recyclability_score": round(
                recyclability_score,
                2,
            ),

            "material_recovery_score": round(
                material_recovery_score,
                2,
            ),

            # Preliminary value.
            # The dedicated Waste Scoring Engine will replace
            # this with the Milestone-3 weighted circularity score.
            "circularity_score": round(
                preliminary_circularity_score,
                2,
            ),

            "quantity": 1,
        }