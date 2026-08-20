class MaterialClassifier:
    """
    Material intelligence engine for TWIP.

    Converts the AI prediction into a normalized material profile
    consumed by:

        WasteClassifier
        ScoringEngine
        EnvironmentalEngine
        SustainabilityEngine
        RecommendationEngine
        AnalysisResult
    """

    MATERIALS = {
        "Cotton": {
            "primary_material": "Cotton",
            "secondary_material": None,
            "composition": "100% Cotton",
            "material_category": "Natural Fiber",
            "material_quality": "Premium",
            "durability": "High",
            "stretchability": "Low",
            "breathability": "Excellent",
            "moisture_absorption": "Excellent",
            "thermal_property": "Medium",
            "recycling_difficulty": "Easy",
            "biodegradable": True,
            "recyclable": True,
            "recycled_content": 0.0,
        },

        "Polyester": {
            "primary_material": "Polyester",
            "secondary_material": None,
            "composition": "100% Polyester",
            "material_category": "Synthetic Fiber",
            "material_quality": "High",
            "durability": "Very High",
            "stretchability": "Medium",
            "breathability": "Low",
            "moisture_absorption": "Low",
            "thermal_property": "Medium",
            "recycling_difficulty": "Medium",
            "biodegradable": False,
            "recyclable": True,
            "recycled_content": 0.0,
        },

        "Silk": {
            "primary_material": "Silk",
            "secondary_material": None,
            "composition": "100% Silk",
            "material_category": "Natural Fiber",
            "material_quality": "Luxury",
            "durability": "Medium",
            "stretchability": "Low",
            "breathability": "Excellent",
            "moisture_absorption": "High",
            "thermal_property": "High",
            "recycling_difficulty": "Easy",
            "biodegradable": True,
            "recyclable": True,
            "recycled_content": 0.0,
        },

        "Wool": {
            "primary_material": "Wool",
            "secondary_material": None,
            "composition": "100% Wool",
            "material_category": "Natural Fiber",
            "material_quality": "Premium",
            "durability": "High",
            "stretchability": "Medium",
            "breathability": "High",
            "moisture_absorption": "High",
            "thermal_property": "Excellent",
            "recycling_difficulty": "Easy",
            "biodegradable": True,
            "recyclable": True,
            "recycled_content": 0.0,
        },

        "Denim": {
            "primary_material": "Cotton",
            "secondary_material": None,
            "composition": "100% Cotton Denim",
            "material_category": "Natural Fiber",
            "material_quality": "High",
            "durability": "Very High",
            "stretchability": "Low",
            "breathability": "Medium",
            "moisture_absorption": "High",
            "thermal_property": "Medium",
            "recycling_difficulty": "Easy",
            "biodegradable": True,
            "recyclable": True,
            "recycled_content": 0.0,
        },

        "Linen": {
            "primary_material": "Linen",
            "secondary_material": None,
            "composition": "100% Linen",
            "material_category": "Natural Fiber",
            "material_quality": "Premium",
            "durability": "High",
            "stretchability": "Low",
            "breathability": "Excellent",
            "moisture_absorption": "Excellent",
            "thermal_property": "Medium",
            "recycling_difficulty": "Easy",
            "biodegradable": True,
            "recyclable": True,
            "recycled_content": 0.0,
        },

        "Rayon": {
            "primary_material": "Rayon",
            "secondary_material": None,
            "composition": "100% Rayon",
            "material_category": "Semi-Synthetic",
            "material_quality": "Medium",
            "durability": "Medium",
            "stretchability": "Medium",
            "breathability": "Good",
            "moisture_absorption": "Good",
            "thermal_property": "Medium",
            "recycling_difficulty": "Medium",
            "biodegradable": True,
            "recyclable": True,
            "recycled_content": 0.0,
        },

        "Nylon": {
            "primary_material": "Nylon",
            "secondary_material": None,
            "composition": "100% Nylon",
            "material_category": "Synthetic Fiber",
            "material_quality": "High",
            "durability": "Very High",
            "stretchability": "High",
            "breathability": "Medium",
            "moisture_absorption": "Low",
            "thermal_property": "Medium",
            "recycling_difficulty": "Medium",
            "biodegradable": False,
            "recyclable": True,
            "recycled_content": 0.0,
        },

        "Acrylic": {
            "primary_material": "Acrylic",
            "secondary_material": None,
            "composition": "100% Acrylic",
            "material_category": "Synthetic Fiber",
            "material_quality": "Medium",
            "durability": "High",
            "stretchability": "Medium",
            "breathability": "Low",
            "moisture_absorption": "Low",
            "thermal_property": "High",
            "recycling_difficulty": "Hard",
            "biodegradable": False,
            "recyclable": False,
            "recycled_content": 0.0,
        },

        "Blended": {
            "primary_material": "Cotton",
            "secondary_material": "Polyester",
            "composition": "60% Cotton / 40% Polyester",
            "material_category": "Blended Textile",
            "material_quality": "High",
            "durability": "High",
            "stretchability": "Medium",
            "breathability": "Good",
            "moisture_absorption": "Medium",
            "thermal_property": "Medium",
            "recycling_difficulty": "Hard",
            "biodegradable": False,
            "recyclable": True,
            "recycled_content": 0.0,
        },

        "Artificial_fur": {
            "primary_material": "Synthetic Fiber",
            "secondary_material": None,
            "composition": "100% Synthetic",
            "material_category": "Artificial Textile",
            "material_quality": "Medium",
            "durability": "High",
            "stretchability": "Low",
            "breathability": "Low",
            "moisture_absorption": "Low",
            "thermal_property": "High",
            "recycling_difficulty": "Hard",
            "biodegradable": False,
            "recyclable": False,
            "recycled_content": 0.0,
        },

        "Artificial_leather": {
            "primary_material": "PU",
            "secondary_material": "Polyester",
            "composition": "PU Coated Polyester",
            "material_category": "Composite Textile",
            "material_quality": "High",
            "durability": "Very High",
            "stretchability": "Low",
            "breathability": "Low",
            "moisture_absorption": "Very Low",
            "thermal_property": "Medium",
            "recycling_difficulty": "Very Hard",
            "biodegradable": False,
            "recyclable": False,
            "recycled_content": 0.0,
        },
    }

    DEFAULT = {
        "primary_material": "Unknown",
        "secondary_material": None,
        "composition": "Unknown",
        "material_category": "Unknown",
        "material_quality": "Unknown",
        "durability": "Unknown",
        "stretchability": "Unknown",
        "breathability": "Unknown",
        "moisture_absorption": "Unknown",
        "thermal_property": "Unknown",
        "recycling_difficulty": "Medium",
        "biodegradable": False,
        "recyclable": False,
        "recycled_content": 0.0,
    }

    # --------------------------------------------------
    # Prediction name normalization
    # --------------------------------------------------

    ALIASES = {
        "cotton": "Cotton",
        "polyester": "Polyester",
        "silk": "Silk",
        "wool": "Wool",
        "denim": "Denim",
        "linen": "Linen",
        "rayon": "Rayon",
        "nylon": "Nylon",
        "acrylic": "Acrylic",
        "blended": "Blended",
        "blend": "Blended",
        "artificial fur": "Artificial_fur",
        "artificial_fur": "Artificial_fur",
        "fake fur": "Artificial_fur",
        "artificial leather": "Artificial_leather",
        "artificial_leather": "Artificial_leather",
        "synthetic leather": "Artificial_leather",
        "pu": "Artificial_leather",
    }

    @classmethod
    def _normalize_material_name(cls, value):
        """
        Convert prediction labels into the exact MATERIALS key.
        """

        if value is None:
            return "Unknown"

        value = str(value).strip()

        if not value:
            return "Unknown"

        if value in cls.MATERIALS:
            return value

        normalized = value.lower().replace("-", " ").strip()

        if normalized in cls.ALIASES:
            return cls.ALIASES[normalized]

        # Case-insensitive direct match.
        for material_name in cls.MATERIALS:
            if material_name.lower() == normalized:
                return material_name

        return "Unknown"

    # --------------------------------------------------
    # Main classification
    # --------------------------------------------------

    @classmethod
    def classify(cls, prediction: dict) -> dict:
        """
        Convert AI prediction into a complete material intelligence
        dictionary.

        This method guarantees that every field required by the
        downstream analysis pipeline exists.
        """

        if not isinstance(prediction, dict):
            prediction = {}

        material_name = (
            prediction.get("material")
            or prediction.get("primary_material")
            or prediction.get("class_name")
            or prediction.get("label")
            or "Unknown"
        )

        material_name = cls._normalize_material_name(
            material_name
        )

        profile = cls.MATERIALS.get(
            material_name,
            cls.DEFAULT,
        ).copy()

        # --------------------------------------------------
        # Optional prediction-provided overrides
        # --------------------------------------------------

        for key in (
            "secondary_material",
            "composition",
            "material_category",
            "material_quality",
            "durability",
            "stretchability",
            "breathability",
            "moisture_absorption",
            "thermal_property",
            "recycling_difficulty",
            "biodegradable",
            "recyclable",
            "recycled_content",
        ):
            if key in prediction and prediction[key] is not None:
                profile[key] = prediction[key]

        # --------------------------------------------------
        # Absolute safety normalization
        # --------------------------------------------------

        required_defaults = {
            "primary_material": "Unknown",
            "secondary_material": None,
            "composition": "Unknown",
            "material_category": "Unknown",
            "material_quality": "Unknown",
            "durability": "Unknown",
            "stretchability": "Unknown",
            "breathability": "Unknown",
            "moisture_absorption": "Unknown",
            "thermal_property": "Unknown",
            "recycling_difficulty": "Medium",
            "biodegradable": False,
            "recyclable": False,
            "recycled_content": 0.0,
        }

        for key, default_value in required_defaults.items():
            if key not in profile:
                profile[key] = default_value

        # --------------------------------------------------
        # Numeric safety
        # --------------------------------------------------

        try:
            profile["recycled_content"] = float(
                profile.get("recycled_content", 0.0)
            )
        except (TypeError, ValueError):
            profile["recycled_content"] = 0.0

        profile["recycled_content"] = max(
            0.0,
            min(
                100.0,
                profile["recycled_content"],
            ),
        )

        # --------------------------------------------------
        # Boolean safety
        # --------------------------------------------------

        profile["biodegradable"] = bool(
            profile.get("biodegradable", False)
        )

        profile["recyclable"] = bool(
            profile.get("recyclable", False)
        )

        return profile