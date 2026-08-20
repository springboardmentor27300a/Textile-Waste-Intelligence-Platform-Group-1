"""
===========================================================
Textile Waste Intelligence Platform (TWIP)
Sustainability Knowledge Base

This module contains reference sustainability information
for textile materials.

All sustainability engines, recommendation engines,
environmental calculations, dashboard analytics and reports
should use this file instead of hardcoded values.

Units
-----
carbon_footprint          -> kg CO₂ / kg textile
water_consumption         -> Liters / kg textile
energy_consumption        -> kWh / kg textile

Scores
------
0 - 100 (Higher is Better)
===========================================================
"""

TEXTILE_SUSTAINABILITY_DATA = {

    # -----------------------------------------------------
    # NATURAL FIBERS
    # -----------------------------------------------------

    "Cotton": {

        "category": "Natural Fiber",

        "manufacturing": {

            "carbon_footprint": 5.8,
            "water_consumption": 10000,
            "energy_consumption": 18,

        },

        "recycling": {

            "recyclability": 95,
            "reuse_potential": 92,
            "recovery_efficiency": 90,
            "processing_difficulty": "Easy",

        },

        "environment": {

            "biodegradable": True,
            "landfill_risk": "Low",
            "circularity": 94,

        },

        "recommended_method": "Mechanical Recycling",

        "recovered_material": "Recycled Cotton Fiber",

        "industrial_use": [

            "New Fabric",
            "Cleaning Cloth",
            "Insulation",
            "Yarn Production"

        ]

    },

    "Denim": {

        "category": "Natural Fiber",

        "manufacturing": {

            "carbon_footprint": 7.2,
            "water_consumption": 8500,
            "energy_consumption": 20,

        },

        "recycling": {

            "recyclability": 90,
            "reuse_potential": 94,
            "recovery_efficiency": 88,
            "processing_difficulty": "Medium",

        },

        "environment": {

            "biodegradable": True,
            "landfill_risk": "Low",
            "circularity": 90,

        },

        "recommended_method": "Mechanical Recycling",

        "recovered_material": "Recovered Denim Fiber",

        "industrial_use": [

            "Denim Fabric",
            "Bags",
            "Insulation",
            "Furniture Filling"

        ]

    },

    "Wool": {

        "category": "Natural Fiber",

        "manufacturing": {

            "carbon_footprint": 22.0,
            "water_consumption": 6200,
            "energy_consumption": 24,

        },

        "recycling": {

            "recyclability": 88,
            "reuse_potential": 95,
            "recovery_efficiency": 86,
            "processing_difficulty": "Medium",

        },

        "environment": {

            "biodegradable": True,
            "landfill_risk": "Low",
            "circularity": 88,

        },

        "recommended_method": "Fiber Recovery",

        "recovered_material": "Recycled Wool",

        "industrial_use": [

            "Blankets",
            "Carpets",
            "Insulation"

        ]

    },

    "Silk": {

        "category": "Natural Fiber",

        "manufacturing": {

            "carbon_footprint": 11.5,
            "water_consumption": 3800,
            "energy_consumption": 22,

        },

        "recycling": {

            "recyclability": 82,
            "reuse_potential": 97,
            "recovery_efficiency": 80,
            "processing_difficulty": "Hard",

        },

        "environment": {

            "biodegradable": True,
            "landfill_risk": "Low",
            "circularity": 86,

        },

        "recommended_method": "Repair and Reuse",

        "recovered_material": "Recovered Silk Fiber",

        "industrial_use": [

            "Luxury Fabric",
            "Accessories"

        ]

    },

    "Linen": {

        "category": "Natural Fiber",

        "manufacturing": {

            "carbon_footprint": 4.6,
            "water_consumption": 6500,
            "energy_consumption": 16,

        },

        "recycling": {

            "recyclability": 90,
            "reuse_potential": 90,
            "recovery_efficiency": 88,
            "processing_difficulty": "Easy",

        },

        "environment": {

            "biodegradable": True,
            "landfill_risk": "Low",
            "circularity": 90,

        },

        "recommended_method": "Mechanical Recycling",

        "recovered_material": "Recovered Linen Fiber",

        "industrial_use": [

            "Fabric",
            "Paper",
            "Composites"

        ]

    },

    # -----------------------------------------------------
    # SYNTHETIC FIBERS
    # -----------------------------------------------------

    "Polyester": {

        "category": "Synthetic Fiber",

        "manufacturing": {

            "carbon_footprint": 9.5,
            "water_consumption": 95,
            "energy_consumption": 34,

        },

        "recycling": {

            "recyclability": 82,
            "reuse_potential": 72,
            "recovery_efficiency": 84,
            "processing_difficulty": "Medium",

        },

        "environment": {

            "biodegradable": False,
            "landfill_risk": "High",
            "circularity": 82,

        },

        "recommended_method": "Chemical Recycling",

        "recovered_material": "Recycled Polyester Pellets",

        "industrial_use": [

            "Polyester Fiber",
            "Plastic Products",
            "Packaging"

        ]

    },

    "Nylon": {

        "category": "Synthetic Fiber",

        "manufacturing": {

            "carbon_footprint": 8.9,
            "water_consumption": 140,
            "energy_consumption": 32,

        },

        "recycling": {

            "recyclability": 84,
            "reuse_potential": 74,
            "recovery_efficiency": 85,
            "processing_difficulty": "Medium",

        },

        "environment": {

            "biodegradable": False,
            "landfill_risk": "High",
            "circularity": 84,

        },

        "recommended_method": "Chemical Recycling",

        "recovered_material": "Recovered Nylon Granules",

        "industrial_use": [

            "Industrial Components",
            "New Textile Fiber"

        ]

    },

    "Rayon": {

        "category": "Semi Synthetic",

        "manufacturing": {

            "carbon_footprint": 6.8,
            "water_consumption": 2200,
            "energy_consumption": 22,

        },

        "recycling": {

            "recyclability": 80,
            "reuse_potential": 75,
            "recovery_efficiency": 82,
            "processing_difficulty": "Medium",

        },

        "environment": {

            "biodegradable": True,
            "landfill_risk": "Medium",
            "circularity": 80,

        },

        "recommended_method": "Fiber Recovery",

        "recovered_material": "Recovered Cellulose Fiber",

        "industrial_use": [

            "Viscose",
            "Paper",
            "Industrial Fiber"

        ]

    },

    "Acrylic": {

        "category": "Synthetic Fiber",

        "manufacturing": {

            "carbon_footprint": 12.4,
            "water_consumption": 120,
            "energy_consumption": 38,

        },

        "recycling": {

            "recyclability": 65,
            "reuse_potential": 60,
            "recovery_efficiency": 68,
            "processing_difficulty": "Hard",

        },

        "environment": {

            "biodegradable": False,
            "landfill_risk": "Very High",
            "circularity": 65,

        },

        "recommended_method": "Chemical Recycling",

        "recovered_material": "Synthetic Fiber",

        "industrial_use": [

            "Industrial Fillers",
            "Composite Material"

        ]

    },

    "Artificial_fur": {

        "category": "Synthetic Fiber",

        "manufacturing": {

            "carbon_footprint": 13.5,
            "water_consumption": 180,
            "energy_consumption": 40,

        },

        "recycling": {

            "recyclability": 58,
            "reuse_potential": 72,
            "recovery_efficiency": 60,
            "processing_difficulty": "Hard",

        },

        "environment": {

            "biodegradable": False,
            "landfill_risk": "Very High",
            "circularity": 60,

        },

        "recommended_method": "Material Separation",

        "recovered_material": "Synthetic Fiber",

        "industrial_use": [

            "Composite Boards",
            "Industrial Products"

        ]

    },

    "Artificial_leather": {

        "category": "Composite Material",

        "manufacturing": {

            "carbon_footprint": 14.2,
            "water_consumption": 260,
            "energy_consumption": 42,

        },

        "recycling": {

            "recyclability": 55,
            "reuse_potential": 65,
            "recovery_efficiency": 58,
            "processing_difficulty": "Very Hard",

        },

        "environment": {

            "biodegradable": False,
            "landfill_risk": "Very High",
            "circularity": 55,

        },

        "recommended_method": "Material Separation",

        "recovered_material": "Composite Material",

        "industrial_use": [

            "Industrial Sheets",
            "Construction Boards"

        ]

    }

}


DEFAULT_SUSTAINABILITY_PROFILE = {

    "category": "Unknown",

    "manufacturing": {

        "carbon_footprint": 8.0,
        "water_consumption": 2000,
        "energy_consumption": 25,

    },

    "recycling": {

        "recyclability": 70,
        "reuse_potential": 70,
        "recovery_efficiency": 70,
        "processing_difficulty": "Medium",

    },

    "environment": {

        "biodegradable": False,
        "landfill_risk": "Medium",
        "circularity": 70,

    },

    "recommended_method": "Manual Inspection",

    "recovered_material": "Mixed Textile Fiber",

    "industrial_use": [

        "General Recycling"

    ]

}