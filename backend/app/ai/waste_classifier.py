from typing import Dict


class WasteClassifier:
    """
    Textile Waste Classification Engine

    Uses the predicted material to estimate
    waste category and reuse potential.
    """

    def __init__(self):
        self.rules = {
            "Cotton": {
                "category": "Recyclable",
                "reuse": "High",
                "disposal": "Mechanical Recycling",
                "contamination": "Low to moderate contamination risk",
                "reuse_potential": "High reuse potential for apparel and wiping cloths",
            },
            "Polyester": {
                "category": "Reusable",
                "reuse": "Very High",
                "disposal": "Chemical Recycling",
                "contamination": "Moderate contamination risk",
                "reuse_potential": "Strong reuse potential after sorting",
            },
            "Wool": {
                "category": "Repairable",
                "reuse": "Medium",
                "disposal": "Repair / Reuse",
                "contamination": "Moderate contamination risk",
                "reuse_potential": "Good for repair and insulation applications",
            },
            "Silk": {
                "category": "Upcyclable",
                "reuse": "High",
                "disposal": "Upcycling",
                "contamination": "Low contamination risk",
                "reuse_potential": "Excellent for high-value upcycling",
            },
            "Linen": {
                "category": "Recyclable",
                "reuse": "Medium",
                "disposal": "Fiber Recovery",
                "contamination": "Low contamination risk",
                "reuse_potential": "Suitable for repair and secondary textile uses",
            },
            "Denim": {
                "category": "Reusable",
                "reuse": "High",
                "disposal": "Donation",
                "contamination": "Moderate contamination risk",
                "reuse_potential": "Strong for resale and donation channels",
            },
            "Nylon": {
                "category": "Recyclable",
                "reuse": "High",
                "disposal": "Chemical Recycling",
                "contamination": "Moderate contamination risk",
                "reuse_potential": "Good for advanced fiber recovery",
            },
            "Rayon": {
                "category": "Repairable",
                "reuse": "Medium",
                "disposal": "Repair",
                "contamination": "Moderate contamination risk",
                "reuse_potential": "Suitable for blending and repair",
            },
            "Acrylic": {
                "category": "Compostable",
                "reuse": "Low",
                "disposal": "Industrial Composting",
                "contamination": "High contamination risk",
                "reuse_potential": "Limited reuse without processing",
            },
            "Mixed Fabrics": {
                "category": "Hazardous Textile Waste",
                "reuse": "Very Low",
                "disposal": "Special Disposal",
                "contamination": "High contamination risk",
                "reuse_potential": "Needs manual sorting for recovery",
            },
        }

    def classify(self, material: str) -> Dict:
        normalized = material.strip().title() if isinstance(material, str) else "Unknown"
        if normalized not in self.rules:
            return {
                "category": "Unknown",
                "reuse": "Unknown",
                "disposal": "Manual Inspection",
                "contamination": "Manual sorting recommended",
                "reuse_potential": "Inspect tissue condition before reuse",
            }

        return self.rules[normalized]


if __name__ == "__main__":

    classifier = WasteClassifier()

    result = classifier.classify("001")

    print(result)