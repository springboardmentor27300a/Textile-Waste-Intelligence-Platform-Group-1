class RecommendationService:

    def __init__(self):
        pass

    def recommend(self, material, damage, quality):

        material_label = material["label"]
        damage_label = damage["label"]
        score = quality["quality_score"]
        grade = quality["quality_grade"]

        recommendation = {
            "recommended_action": "",
            "recyclability": "",
            "environmental_impact": "",
            "estimated_value": "",
            "reason": ""
        }

        # ----------------------------
        # Poor Quality
        # ----------------------------
        if score < 60:
            recommendation["recommended_action"] = "Dispose Responsibly"
            recommendation["recyclability"] = "Low"
            recommendation["environmental_impact"] = "High"
            recommendation["estimated_value"] = "Low"
            recommendation["reason"] = (
                "The textile quality is too poor for reuse or recycling."
            )
            return recommendation

        # ----------------------------
        # Acrylic
        # ----------------------------
        if material_label == "Acrylic":

            if damage_label == "Clean":
                recommendation["recommended_action"] = "Reuse"
                recommendation["recyclability"] = "High"
                recommendation["environmental_impact"] = "Low"
                recommendation["estimated_value"] = "High"
                recommendation["reason"] = (
                    "Clean acrylic fabric can be reused."
                )

            else:
                recommendation["recommended_action"] = "Recycle"
                recommendation["recyclability"] = "High"
                recommendation["environmental_impact"] = "Medium"
                recommendation["estimated_value"] = "Medium"
                recommendation["reason"] = (
                    "Defective acrylic is suitable for recycling."
                )

        # ----------------------------
        # Cotton
        # ----------------------------
        elif material_label == "Cotton":

            if damage_label == "Clean":

                recommendation["recommended_action"] = "Reuse"
                recommendation["recyclability"] = "Very High"
                recommendation["environmental_impact"] = "Very Low"
                recommendation["estimated_value"] = "High"
                recommendation["reason"] = (
                    "Cotton is reusable and biodegradable."
                )

            else:

                recommendation["recommended_action"] = "Repair and Reuse"
                recommendation["recyclability"] = "High"
                recommendation["environmental_impact"] = "Low"
                recommendation["estimated_value"] = "Medium"
                recommendation["reason"] = (
                    "Repairing cotton reduces textile waste."
                )

        # ----------------------------
        # Polyamide
        # ----------------------------
        elif material_label == "Polyamide":

            if damage_label == "Clean":

                recommendation["recommended_action"] = "Reuse"
                recommendation["recyclability"] = "High"
                recommendation["environmental_impact"] = "Low"
                recommendation["estimated_value"] = "High"
                recommendation["reason"] = (
                    "Polyamide fabric is durable and reusable."
                )

            else:

                recommendation["recommended_action"] = "Recycle"
                recommendation["recyclability"] = "High"
                recommendation["environmental_impact"] = "Medium"
                recommendation["estimated_value"] = "Medium"
                recommendation["reason"] = (
                    "Damaged polyamide should be recycled."
                )

        # ----------------------------
        # Polyester
        # ----------------------------
        elif material_label == "Polyester":

            if damage_label == "Clean":

                recommendation["recommended_action"] = "Recycle"
                recommendation["recyclability"] = "Very High"
                recommendation["environmental_impact"] = "Medium"
                recommendation["estimated_value"] = "Medium"
                recommendation["reason"] = (
                    "Polyester is best processed through recycling."
                )

            else:

                recommendation["recommended_action"] = "Downcycle"
                recommendation["recyclability"] = "Medium"
                recommendation["environmental_impact"] = "Medium"
                recommendation["estimated_value"] = "Low"
                recommendation["reason"] = (
                    "Damaged polyester can be converted into lower-value products."
                )

        # ----------------------------
        # Quality Override
        # ----------------------------
        if grade == "A":
            recommendation["priority"] = "Immediate Reuse"

        elif grade == "B":
            recommendation["priority"] = "Reuse Preferred"

        elif grade == "C":
            recommendation["priority"] = "Recycle Preferred"

        elif grade == "D":
            recommendation["priority"] = "Recycle"

        else:
            recommendation["priority"] = "Inspection Required"

        return recommendation