"""Domain knowledge tables for textile materials.

Impact figures are order-of-magnitude planning values drawn from published
life-cycle-assessment ranges for virgin fibre production. They are deliberately
kept in one place so they can be replaced with a client's own LCA data without
touching the engines.
"""
from __future__ import annotations

MATERIALS = [
    "Cotton", "Polyester", "Wool", "Silk", "Linen",
    "Denim", "Nylon", "Rayon", "Acrylic", "Mixed Fabrics",
]

# Visual signature of each fibre: (mean, std) per feature. Used to synthesise a
# bootstrap training corpus and as a fallback nearest-prototype classifier.
PROFILES: dict[str, dict[str, tuple[float, float]]] = {
    "Cotton": {
        "lightness": (0.62, 0.14), "saturation": (0.28, 0.12), "glcm_contrast": (0.26, 0.08),
        "glcm_homogeneity": (0.62, 0.09), "specular_ratio": (0.14, 0.07),
        "fft_periodicity": (0.30, 0.13), "diagonal_bias": (0.30, 0.10),
        "highfreq_ratio": (0.38, 0.11), "lbp_uniformity": (0.42, 0.10),
    },
    "Polyester": {
        "lightness": (0.58, 0.16), "saturation": (0.52, 0.16), "glcm_contrast": (0.16, 0.06),
        "glcm_homogeneity": (0.78, 0.07), "specular_ratio": (0.44, 0.12),
        "fft_periodicity": (0.42, 0.14), "diagonal_bias": (0.28, 0.10),
        "highfreq_ratio": (0.26, 0.09), "lbp_uniformity": (0.58, 0.10),
    },
    "Wool": {
        "lightness": (0.46, 0.14), "saturation": (0.26, 0.11), "glcm_contrast": (0.58, 0.11),
        "glcm_homogeneity": (0.40, 0.09), "specular_ratio": (0.10, 0.05),
        "fft_periodicity": (0.24, 0.11), "diagonal_bias": (0.34, 0.12),
        "highfreq_ratio": (0.62, 0.11), "lbp_uniformity": (0.28, 0.09),
    },
    "Silk": {
        "lightness": (0.68, 0.13), "saturation": (0.44, 0.16), "glcm_contrast": (0.11, 0.05),
        "glcm_homogeneity": (0.84, 0.06), "specular_ratio": (0.72, 0.12),
        "fft_periodicity": (0.20, 0.10), "diagonal_bias": (0.26, 0.10),
        "highfreq_ratio": (0.18, 0.07), "lbp_uniformity": (0.66, 0.09),
    },
    "Linen": {
        "lightness": (0.66, 0.12), "saturation": (0.22, 0.10), "glcm_contrast": (0.40, 0.10),
        "glcm_homogeneity": (0.50, 0.09), "specular_ratio": (0.18, 0.08),
        "fft_periodicity": (0.66, 0.12), "diagonal_bias": (0.24, 0.09),
        "highfreq_ratio": (0.54, 0.11), "lbp_uniformity": (0.34, 0.09),
    },
    "Denim": {
        "lightness": (0.38, 0.11), "saturation": (0.40, 0.12), "glcm_contrast": (0.36, 0.09),
        "glcm_homogeneity": (0.54, 0.08), "specular_ratio": (0.16, 0.07),
        "fft_periodicity": (0.52, 0.13), "diagonal_bias": (0.76, 0.10),
        "highfreq_ratio": (0.46, 0.10), "lbp_uniformity": (0.36, 0.09),
    },
    "Nylon": {
        "lightness": (0.54, 0.16), "saturation": (0.46, 0.16), "glcm_contrast": (0.14, 0.06),
        "glcm_homogeneity": (0.80, 0.07), "specular_ratio": (0.56, 0.13),
        "fft_periodicity": (0.56, 0.14), "diagonal_bias": (0.30, 0.10),
        "highfreq_ratio": (0.22, 0.08), "lbp_uniformity": (0.62, 0.10),
    },
    "Rayon": {
        "lightness": (0.64, 0.14), "saturation": (0.40, 0.15), "glcm_contrast": (0.20, 0.07),
        "glcm_homogeneity": (0.72, 0.08), "specular_ratio": (0.40, 0.12),
        "fft_periodicity": (0.28, 0.12), "diagonal_bias": (0.28, 0.10),
        "highfreq_ratio": (0.30, 0.10), "lbp_uniformity": (0.52, 0.10),
    },
    "Acrylic": {
        "lightness": (0.52, 0.15), "saturation": (0.56, 0.15), "glcm_contrast": (0.48, 0.10),
        "glcm_homogeneity": (0.46, 0.09), "specular_ratio": (0.24, 0.10),
        "fft_periodicity": (0.34, 0.13), "diagonal_bias": (0.32, 0.11),
        "highfreq_ratio": (0.58, 0.11), "lbp_uniformity": (0.32, 0.09),
    },
    "Mixed Fabrics": {
        "lightness": (0.55, 0.20), "saturation": (0.44, 0.20), "glcm_contrast": (0.38, 0.18),
        "glcm_homogeneity": (0.56, 0.16), "specular_ratio": (0.34, 0.20),
        "fft_periodicity": (0.40, 0.20), "diagonal_bias": (0.38, 0.18),
        "highfreq_ratio": (0.44, 0.18), "lbp_uniformity": (0.44, 0.16),
    },
}

# Typical blend partners, used for fibre-composition estimates.
BLEND_PARTNERS = {
    "Cotton": "Polyester", "Polyester": "Cotton", "Wool": "Acrylic", "Silk": "Polyester",
    "Linen": "Cotton", "Denim": "Polyester", "Nylon": "Elastane", "Rayon": "Polyester",
    "Acrylic": "Wool", "Mixed Fabrics": "Cotton",
}

# recyclability: how well the fibre survives mechanical/chemical recovery (0-1)
# co2_kg_per_kg / water_l_per_kg: virgin production burden avoided per kg diverted
IMPACT = {
    "Cotton":        {"recyclability": 0.72, "co2_kg_per_kg": 5.9,  "water_l_per_kg": 9800, "compostable": True,  "chemical_route": False},
    "Polyester":     {"recyclability": 0.85, "co2_kg_per_kg": 9.5,  "water_l_per_kg": 60,   "compostable": False, "chemical_route": True},
    "Wool":          {"recyclability": 0.68, "co2_kg_per_kg": 24.0, "water_l_per_kg": 6000, "compostable": True,  "chemical_route": False},
    "Silk":          {"recyclability": 0.45, "co2_kg_per_kg": 18.0, "water_l_per_kg": 4200, "compostable": True,  "chemical_route": False},
    "Linen":         {"recyclability": 0.70, "co2_kg_per_kg": 3.4,  "water_l_per_kg": 2500, "compostable": True,  "chemical_route": False},
    "Denim":         {"recyclability": 0.66, "co2_kg_per_kg": 7.2,  "water_l_per_kg": 8500, "compostable": False, "chemical_route": False},
    "Nylon":         {"recyclability": 0.80, "co2_kg_per_kg": 11.5, "water_l_per_kg": 130,  "compostable": False, "chemical_route": True},
    "Rayon":         {"recyclability": 0.55, "co2_kg_per_kg": 6.8,  "water_l_per_kg": 3200, "compostable": True,  "chemical_route": True},
    "Acrylic":       {"recyclability": 0.38, "co2_kg_per_kg": 10.8, "water_l_per_kg": 210,  "compostable": False, "chemical_route": False},
    "Mixed Fabrics": {"recyclability": 0.35, "co2_kg_per_kg": 8.0,  "water_l_per_kg": 3000, "compostable": False, "chemical_route": False},
}

LANDFILL_DIVERSION_KG_CO2 = 2.1  # methane-equivalent avoided per kg kept out of landfill

CONDITION_QUALITY = {
    "excellent": 1.0, "good": 0.78, "fair": 0.55, "poor": 0.30, "unusable": 0.10,
}
