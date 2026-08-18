from typing import Dict


class DecisionEngine:

    def __init__(self):

        self.material_db = {

            "Cotton": {
                "category": "Natural Fiber",
                "fiber_composition": "100% Cotton",
                "blend": "No Blend",
                "recyclability": "High",
                "recycling_method": "Mechanical Recycling",
                "compostable": True,
                "hazardous": False,
                "upcycling": [
                    "Cleaning Cloth",
                    "Reusable Bags",
                    "Home Decor"
                ]
            },

            "Polyester": {
                "category": "Synthetic Fiber",
                "fiber_composition": "100% Polyester",
                "blend": "No Blend",
                "recyclability": "High",
                "recycling_method": "Chemical Recycling",
                "compostable": False,
                "hazardous": False,
                "upcycling": [
                    "Pillows",
                    "Bags",
                    "Carpets"
                ]
            },

            "Wool": {
                "category": "Natural Fiber",
                "fiber_composition": "100% Wool",
                "blend": "No Blend",
                "recyclability": "Medium",
                "recycling_method": "Fiber Recovery",
                "compostable": True,
                "hazardous": False,
                "upcycling": [
                    "Blankets",
                    "Insulation",
                    "Handmade Crafts"
                ]
            },

            "Silk": {
                "category": "Natural Fiber",
                "fiber_composition": "100% Silk",
                "blend": "No Blend",
                "recyclability": "Medium",
                "recycling_method": "Fabric Reuse",
                "compostable": True,
                "hazardous": False,
                "upcycling": [
                    "Scarves",
                    "Accessories",
                    "Decorative Items"
                ]
            },

            "Denim": {
                "category": "Natural Fiber",
                "fiber_composition": "Cotton Denim",
                "blend": "Possible Blend",
                "recyclability": "High",
                "recycling_method": "Mechanical Recycling",
                "compostable": False,
                "hazardous": False,
                "upcycling": [
                    "Tote Bags",
                    "Wallets",
                    "Aprons"
                ]
            },

            "Linen": {
                "category": "Natural Fiber",
                "fiber_composition": "100% Linen",
                "blend": "No Blend",
                "recyclability": "High",
                "recycling_method": "Fiber Recovery",
                "compostable": True,
                "hazardous": False,
                "upcycling": [
                    "Curtains",
                    "Reusable Napkins",
                    "Kitchen Towels"
                ]
            },

            "Nylon": {
                "category": "Synthetic Fiber",
                "fiber_composition": "100% Nylon",
                "blend": "No Blend",
                "recyclability": "High",
                "recycling_method": "Chemical Recycling",
                "compostable": False,
                "hazardous": False,
                "upcycling": [
                    "Backpacks",
                    "Ropes",
                    "Outdoor Gear"
                ]
            },

            "Rayon": {
                "category": "Semi Synthetic",
                "fiber_composition": "Rayon Fiber",
                "blend": "Possible Blend",
                "recyclability": "Medium",
                "recycling_method": "Fiber Recovery",
                "compostable": True,
                "hazardous": False,
                "upcycling": [
                    "Fashion Accessories",
                    "Craft Materials",
                    "Decor"
                ]
            },

            "Acrylic": {
                "category": "Synthetic Fiber",
                "fiber_composition": "100% Acrylic",
                "blend": "No Blend",
                "recyclability": "Medium",
                "recycling_method": "Mechanical Recycling",
                "compostable": False,
                "hazardous": False,
                "upcycling": [
                    "Winter Accessories",
                    "Soft Toys",
                    "Blankets"
                ]
            },

            "Mixed Fabrics": {
                "category": "Mixed Fiber",
                "fiber_composition": "Cotton + Polyester",
                "blend": "Yes",
                "recyclability": "Medium",
                "recycling_method": "Material Separation",
                "compostable": False,
                "hazardous": False,
                "upcycling": [
                    "Industrial Rags",
                    "Reusable Products",
                    "Craft Items"
                ]
            }

        }

    def classify(
        self,
        material: Dict,
        damage: Dict,
        quality: Dict
    ):

        material_name = material["label"]

        info = self.material_db.get(
            material_name,
            self.material_db["Mixed Fabrics"]
        )

        quality_grade = quality["quality_grade"]

        damage_label = damage["label"]
        # Fabric Texture
        if material_name in ["Silk", "Rayon"]:
            texture = "Smooth"

        elif material_name in ["Denim", "Linen"]:
            texture = "Coarse"

        elif material_name in ["Wool", "Acrylic"]:
            texture = "Soft"

        elif material_name in ["Cotton", "Polyester", "Nylon"]:
            texture = "Medium"

        else:
            texture = "Mixed Texture"
        
        # Fabric Pattern
        if material_name == "Denim":
            pattern = "Twill"

        elif material_name == "Linen":
            pattern = "Plain"

        elif material_name == "Silk":
            pattern = "Plain"

        elif material_name == "Cotton":
            pattern = "Solid"

        elif material_name == "Polyester":
            pattern = "Printed"

        elif material_name == "Wool":
            pattern = "Knitted"

        elif material_name == "Mixed Fabrics":
            pattern = "Mixed"

        else:
            pattern = "Unknown"

        if quality_grade == "A" and damage_label.lower() == "clean":
            waste_category = "Reusable"
            reuse = "Very High"

        elif quality_grade == "B":
            waste_category = "Repairable"
            reuse = "High"

        elif quality_grade == "C":
            waste_category = "Upcyclable"
            reuse = "Medium"

        else:
            waste_category = "Recyclable"
            reuse = "Low"

        contamination = (
            "Detected"
            if damage_label.lower() in [
                "dirty",
                "contaminated",
                "stained"
            ]
            else "None"
        )

        disposal = {

            "Reusable": "Reuse",

            "Repairable": "Repair and Reuse",

            "Upcyclable": "Upcycle",

            "Recyclable": "Recycle"

        }[waste_category]

        return {

            "material_classification": {

    "fabric_type": material_name,

    "material_category": info["category"],

    "fiber_composition": info["fiber_composition"],

    "blend_identification": info["blend"],

    "fabric_texture": texture,

    "fabric_pattern": pattern

},

            "waste_classification": {

                "category": waste_category,

                "recyclability": info["recyclability"],

                "reuse_potential": reuse,

                "contamination_detection": contamination,

                "disposal_recommendation": disposal,

                "compostable": info["compostable"],

                "hazardous_textile": info["hazardous"]

            },

            "recycling_engine": {

                "recommended_method": info["recycling_method"],

                "fiber_recycling": "Recommended",

                "mechanical_recycling": (
                    "Yes"
                    if info["recycling_method"] == "Mechanical Recycling"
                    else "No"
                ),

                "chemical_recycling": (
                    "Yes"
                    if info["recycling_method"] == "Chemical Recycling"
                    else "No"
                ),

                "fabric_reuse": "Recommended",

                "industrial_recovery": "Available",

                "donation": (
                    "Recommended"
                    if waste_category == "Reusable"
                    else "Not Recommended"
                ),

                "upcycling_suggestions": info["upcycling"],

                "waste_reduction_strategy": (
                    "Reuse before Recycling"
                )

            }

        }
        