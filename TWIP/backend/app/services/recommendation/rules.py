from typing import List, Tuple, Dict

# Standard strategies constants
FIBER_RECYCLING = "FIBER_RECYCLING"
MECHANICAL_RECYCLING = "MECHANICAL_RECYCLING"
CHEMICAL_RECYCLING = "CHEMICAL_RECYCLING"
FABRIC_REUSE = "FABRIC_REUSE"
UPCYCLING = "UPCYCLING"
DONATION = "DONATION"
INDUSTRIAL_RECOVERY = "INDUSTRIAL_RECOVERY"
DISPOSAL = "DISPOSAL"

# Declarative rule definitions:
# Each rule is a tuple containing:
# (fabric_type_pattern, condition_pattern, contamination_allowed, recyclability_min, ranked_strategies)
# Where fabric_type_pattern & condition_pattern can be "any" or specific keys.
RECOMMENDATION_RULES: List[Tuple[str, str, bool, float, List[str]]] = [
    # 1. Premium Clean Natural Fibers -> Reused or Upcycled first
    ("cotton", "clean", False, 0.80, [UPCYCLING, FABRIC_REUSE, DONATION, FIBER_RECYCLING]),
    ("wool", "clean", False, 0.80, [UPCYCLING, FABRIC_REUSE, DONATION, FIBER_RECYCLING]),
    ("silk", "clean", False, 0.80, [UPCYCLING, FABRIC_REUSE, DONATION, FIBER_RECYCLING]),
    ("linen", "clean", False, 0.80, [UPCYCLING, FABRIC_REUSE, DONATION, FIBER_RECYCLING]),
    
    # 2. Damaged Clean Natural Fibers -> Mechanical/Fiber recycling
    ("cotton", "damaged", False, 0.60, [FIBER_RECYCLING, MECHANICAL_RECYCLING, INDUSTRIAL_RECOVERY]),
    ("wool", "damaged", False, 0.60, [FIBER_RECYCLING, MECHANICAL_RECYCLING, INDUSTRIAL_RECOVERY]),
    ("linen", "damaged", False, 0.60, [FIBER_RECYCLING, MECHANICAL_RECYCLING, INDUSTRIAL_RECOVERY]),

    # 3. Polyester/Synthetic Clean -> Chemical recycling or Mechanical recycling
    ("polyester", "clean", False, 0.70, [CHEMICAL_RECYCLING, MECHANICAL_RECYCLING, INDUSTRIAL_RECOVERY]),
    ("nylon", "clean", False, 0.70, [CHEMICAL_RECYCLING, MECHANICAL_RECYCLING, INDUSTRIAL_RECOVERY]),
    
    # 4. Synthetics Damaged -> Chemical recycling
    ("polyester", "damaged", False, 0.50, [CHEMICAL_RECYCLING, INDUSTRIAL_RECOVERY]),
    ("nylon", "damaged", False, 0.50, [CHEMICAL_RECYCLING, INDUSTRIAL_RECOVERY]),
    
    # 5. Any Contaminated batches (regardless of material) -> CHEMICAL_RECYCLING or INDUSTRIAL_RECOVERY
    ("any", "any", True, 0.00, [CHEMICAL_RECYCLING, INDUSTRIAL_RECOVERY, DISPOSAL]),
    
    # 6. Low Recyclability / Wet or heavily soiled batches -> INDUSTRIAL_RECOVERY or DISPOSAL
    ("any", "wet", False, 0.00, [INDUSTRIAL_RECOVERY, DISPOSAL]),
    ("any", "contaminated", False, 0.00, [INDUSTRIAL_RECOVERY, DISPOSAL]),
    
    # 7. Fallback general rules based on condition & composition
    ("any", "clean", False, 0.50, [FABRIC_REUSE, MECHANICAL_RECYCLING, INDUSTRIAL_RECOVERY]),
    ("any", "damaged", False, 0.00, [MECHANICAL_RECYCLING, INDUSTRIAL_RECOVERY, DISPOSAL]),
    ("any", "any", False, 0.00, [INDUSTRIAL_RECOVERY, DISPOSAL])
]

def map_recyclability_to_band(rate: float) -> str:
    if rate >= 0.85:
        return "high"
    elif rate >= 0.50:
        return "medium"
    return "low"
