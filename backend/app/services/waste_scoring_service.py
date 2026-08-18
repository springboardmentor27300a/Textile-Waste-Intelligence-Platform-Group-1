class WasteScoringService:

    def calculate(
        self,
        material,
        damage,
        quality,
        recommendation,
        sustainability
    ):

        # =====================================================
        # 1. MATERIAL RECYCLABILITY — 35%
        # =====================================================

        action = (
            recommendation.get(
                "recommended_action",
                ""
            )
        )

        action = str(action).strip()

        if action == "Recycle":

            recyclability_score = 90

        elif action == "Reuse":

            recyclability_score = 85

        elif action == "Repair":

            recyclability_score = 75

        elif action == "Upcycle":

            recyclability_score = 70

        elif action == "Donate":

            recyclability_score = 65

        else:

            recyclability_score = 40


        # =====================================================
        # 2. MATERIAL CONDITION — 20%
        # =====================================================

        damage_label = (
            damage.get(
                "label",
                "Defective"
            )
        )

        damage_label = str(
            damage_label
        ).strip().lower()


        if damage_label in [
            "clean",
            "none",
            "no damage",
            "undamaged"
        ]:

            condition_score = 100

        elif damage_label in [
            "minor",
            "minor damage",
            "low"
        ]:

            condition_score = 80

        elif damage_label in [
            "moderate",
            "moderate damage",
            "medium"
        ]:

            condition_score = 65

        elif damage_label in [
            "severe",
            "severe damage",
            "major",
            "major damage"
        ]:

            condition_score = 45

        else:

            condition_score = 50


        # =====================================================
        # 3. REUSE POTENTIAL — 20%
        # =====================================================

        reuse_potential = (
            recommendation.get(
                "reuse_potential",
                ""
            )
        )

        # Also support reuse_potential coming
        # from waste classification if recommendation
        # does not contain it.

        if not reuse_potential:

            reuse_potential = (
                recommendation.get(
                    "reuse",
                    ""
                )
            )

        reuse_potential = str(
            reuse_potential
        ).strip().lower()


        if reuse_potential in [
            "very high",
            "excellent"
        ]:

            reuse_score = 100

        elif reuse_potential == "high":

            reuse_score = 90

        elif reuse_potential in [
            "medium",
            "moderate"
        ]:

            reuse_score = 70

        elif reuse_potential == "low":

            reuse_score = 50

        elif reuse_potential in [
            "none",
            "very low"
        ]:

            reuse_score = 30

        else:

            # Fallback based on material condition

            if damage_label in [
                "clean",
                "none",
                "no damage",
                "undamaged"
            ]:

                reuse_score = 90

            elif damage_label in [
                "minor",
                "minor damage",
                "low"
            ]:

                reuse_score = 75

            else:

                reuse_score = 50


        # =====================================================
        # 4. ENVIRONMENTAL BENEFIT — 15%
        # =====================================================

        sustainability_score = (
            sustainability.get(
                "score",
                0
            )
        )

        try:

            sustainability_score = float(
                sustainability_score
            )

        except (
            TypeError,
            ValueError
        ):

            sustainability_score = 0


        environmental_benefit_score = max(
            0,
            min(
                100,
                sustainability_score
            )
        )


        # =====================================================
        # 5. PROCESSING FEASIBILITY — 10%
        # =====================================================

        quality_grade = (
            quality.get(
                "quality_grade",
                "C"
            )
        )

        quality_grade = str(
            quality_grade
        ).strip().upper()


        if quality_grade == "A":

            processing_score = 100

        elif quality_grade == "B":

            processing_score = 90

        elif quality_grade == "C":

            processing_score = 75

        elif quality_grade == "D":

            processing_score = 60

        else:

            processing_score = 40


        # =====================================================
        # 6. MATERIAL RECOVERY SCORE
        # =====================================================
        #
        # Kept for compatibility with the existing
        # HistoryService and AnalysisHistory database.
        #
        # This is NOT one of the five weighted components.
        # It remains an additional analytics metric.
        # =====================================================

        confidence = material.get(
            "confidence",
            0.80
        )

        try:

            confidence = float(
                confidence
            )

        except (
            TypeError,
            ValueError
        ):

            confidence = 0.80


        confidence = max(
            0,
            min(
                1,
                confidence
            )
        )

        material_recovery_score = round(
            confidence * 100
        )


        # =====================================================
        # 7. WEIGHTED CIRCULARITY SCORE
        # =====================================================
        #
        # Documentation:
        #
        # Material Recyclability      35%
        # Material Condition          20%
        # Reuse Potential             20%
        # Environmental Benefit       15%
        # Processing Feasibility      10%
        #
        # Total = 100%
        # =====================================================

        circularity_score = round(

            (
                recyclability_score * 0.35

                + condition_score * 0.20

                + reuse_score * 0.20

                + environmental_benefit_score * 0.15

                + processing_score * 0.10
            )

        )


        # =====================================================
        # 8. CIRCULARITY CATEGORY
        # =====================================================

        if circularity_score >= 90:

            category = (
                "Excellent Recovery Potential"
            )

        elif circularity_score >= 75:

            category = (
                "High Recovery Potential"
            )

        elif circularity_score >= 60:

            category = (
                "Moderate Recovery Potential"
            )

        elif circularity_score >= 40:

            category = (
                "Limited Recovery Potential"
            )

        else:

            category = (
                "Disposal Recommended"
            )


        # =====================================================
        # 9. RETURN RESULT
        # =====================================================

        return {

            # Required scoring values
            "recyclability_score":
                recyclability_score,

            "reuse_score":
                reuse_score,

            "sustainability_score":
                sustainability_score,

            "processing_feasibility_score":
                processing_score,

            "circularity_score":
                circularity_score,

            "circularity_category":
                category,

            # Additional documented components
            "material_condition_score":
                condition_score,

            "environmental_benefit_score":
                environmental_benefit_score,

            # Existing database compatibility
            "material_recovery_score":
                material_recovery_score
        }