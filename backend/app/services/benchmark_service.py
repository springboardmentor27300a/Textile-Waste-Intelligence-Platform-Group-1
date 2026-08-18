class BenchmarkService:

    def generate(
        self,
        sustainability: dict,
        waste_scoring: dict,
        circular_economy: dict
    ):

        sustainability_score = sustainability["score"]
        circularity_score = waste_scoring["circularity_score"]
        recycling_efficiency = circular_economy["recycling_efficiency"]

        overall = (
            sustainability_score * 0.40 +
            circularity_score * 0.35 +
            recycling_efficiency * 0.25
        )

        # ==================================
        # Sustainability Grade
        # ==================================

        if overall >= 90:
            grade = "A+"

        elif overall >= 80:
            grade = "A"

        elif overall >= 70:
            grade = "B"

        elif overall >= 60:
            grade = "C"

        else:
            grade = "D"

        # ==================================
        # ESG Rating
        # ==================================

        if overall >= 90:
            esg = "Excellent"

        elif overall >= 80:
            esg = "Very Good"

        elif overall >= 70:
            esg = "Good"

        elif overall >= 60:
            esg = "Average"

        else:
            esg = "Needs Improvement"

        # ==================================
        # Industry Percentile
        # ==================================

        percentile = round(min(99, overall + 5), 1)

        # ==================================
        # Performance
        # ==================================

        if overall >= 90:
            performance = "Industry Leader"

        elif overall >= 80:
            performance = "Above Industry Average"

        elif overall >= 70:
            performance = "Industry Average"

        else:
            performance = "Below Industry Average"

        # ==================================
        # Improvement Suggestions
        # ==================================

        suggestions = []

        if sustainability_score < 90:
            suggestions.append(
                "Increase sustainability initiatives."
            )

        if circularity_score < 90:
            suggestions.append(
                "Improve textile circularity."
            )

        if recycling_efficiency < 90:
            suggestions.append(
                "Increase recycling efficiency."
            )

        if len(suggestions) == 0:
            suggestions.append(
                "Current sustainability performance is excellent."
            )

        return {

            "overall_score": round(overall, 1),

            "sustainability_grade": grade,

            "esg_rating": esg,

            "industry_percentile": percentile,

            "performance": performance,

            "improvement_suggestions": suggestions

        }