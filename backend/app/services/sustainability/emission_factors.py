from typing import Dict

# Dictionary of emission factors per fabric type.
# Each value contains estimates of environmental impact for producing 1 kg of virgin fabric.
# Constants are placeholdered and can be updated with verified LCA (Life Cycle Assessment) data.
EMISSION_FACTORS: Dict[str, Dict[str, float]] = {
    "cotton": {
        "CO2e_per_kg": 8.3,          # REPLACE with cited LCA data
        "water_L_per_kg": 10000.0,    # REPLACE with cited LCA data
        "virgin_value_per_kg": 5.0,   # REPLACE with cited LCA data
        "energy_MJ_per_kg": 15.0,     # REPLACE with cited LCA data
    },
    "polyester": {
        "CO2e_per_kg": 9.7,          # REPLACE with cited LCA data
        "water_L_per_kg": 60.0,       # REPLACE with cited LCA data
        "virgin_value_per_kg": 3.0,   # REPLACE with cited LCA data
        "energy_MJ_per_kg": 45.0,     # REPLACE with cited LCA data
    },
    "wool": {
        "CO2e_per_kg": 13.8,         # REPLACE with cited LCA data
        "water_L_per_kg": 500.0,      # REPLACE with cited LCA data
        "virgin_value_per_kg": 12.0,  # REPLACE with cited LCA data
        "energy_MJ_per_kg": 22.0,     # REPLACE with cited LCA data
    },
    "silk": {
        "CO2e_per_kg": 25.0,         # REPLACE with cited LCA data
        "water_L_per_kg": 2000.0,     # REPLACE with cited LCA data
        "virgin_value_per_kg": 45.0,  # REPLACE with cited LCA data
        "energy_MJ_per_kg": 60.0,     # REPLACE with cited LCA data
    },
    "linen": {
        "CO2e_per_kg": 4.5,          # REPLACE with cited LCA data
        "water_L_per_kg": 2500.0,     # REPLACE with cited LCA data
        "virgin_value_per_kg": 8.0,   # REPLACE with cited LCA data
        "energy_MJ_per_kg": 12.0,     # REPLACE with cited LCA data
    },
    "denim": {
        "CO2e_per_kg": 11.0,         # REPLACE with cited LCA data
        "water_L_per_kg": 9000.0,     # REPLACE with cited LCA data
        "virgin_value_per_kg": 6.5,   # REPLACE with cited LCA data
        "energy_MJ_per_kg": 20.0,     # REPLACE with cited LCA data
    },
    "nylon": {
        "CO2e_per_kg": 12.4,         # REPLACE with cited LCA data
        "water_L_per_kg": 150.0,      # REPLACE with cited LCA data
        "virgin_value_per_kg": 4.5,   # REPLACE with cited LCA data
        "energy_MJ_per_kg": 48.0,     # REPLACE with cited LCA data
    },
    "acrylic": {
        "CO2e_per_kg": 11.5,         # REPLACE with cited LCA data
        "water_L_per_kg": 120.0,      # REPLACE with cited LCA data
        "virgin_value_per_kg": 3.8,   # REPLACE with cited LCA data
        "energy_MJ_per_kg": 42.0,     # REPLACE with cited LCA data
    },
    "blend": {
        "CO2e_per_kg": 9.0,          # REPLACE with cited LCA data
        "water_L_per_kg": 5000.0,     # REPLACE with cited LCA data
        "virgin_value_per_kg": 4.0,   # REPLACE with cited LCA data
        "energy_MJ_per_kg": 28.0,     # REPLACE with cited LCA data
    }
}

DEFAULT_FACTORS = {
    "CO2e_per_kg": 9.0,              # REPLACE with cited LCA data
    "water_L_per_kg": 5000.0,         # REPLACE with cited LCA data
    "virgin_value_per_kg": 4.0,       # REPLACE with cited LCA data
    "energy_MJ_per_kg": 28.0,         # REPLACE with cited LCA data
}

def get_emission_factors(fabric_type: str) -> Dict[str, float]:
    """
    Get environmental factors for a given fabric type. Falls back to 'blend' or defaults.
    """
    if not fabric_type:
        return DEFAULT_FACTORS.copy()
    
    clean_type = fabric_type.lower().strip()
    if clean_type in EMISSION_FACTORS:
        return EMISSION_FACTORS[clean_type].copy()
    
    # Handle composite names like "poly-cotton blend", "cotton-wool blend"
    for key, val in EMISSION_FACTORS.items():
        if key in clean_type:
            return val.copy()
            
    return DEFAULT_FACTORS.copy()
