from typing import Dict, Any


class SustainabilityEngine:
    """
    Modules 7 & 8: Sustainability Intelligence & Environmental Impact Assessment Engine
    (Document Page 5 & 6)

    Calculates:
    - Carbon footprint estimation (kg CO2 saved)
    - Water savings estimation (liters saved)
    - Landfill reduction analysis (kg diverted)
    - Resource conservation estimation (energy in kWh, raw virgin material replaced)
    - Sustainability benchmarking & ESG reporting metrics
    """

    # Environmental impact savings per kg of textile waste diverted from landfill
    MATERIAL_IMPACT_FACTORS = {
        "Cotton": {"co2_per_kg": 3.8, "water_per_kg": 2400.0, "energy_kwh_per_kg": 8.5},
        "Polyester": {"co2_per_kg": 4.2, "water_per_kg": 900.0, "energy_kwh_per_kg": 14.0},
        "Wool": {"co2_per_kg": 5.5, "water_per_kg": 3100.0, "energy_kwh_per_kg": 11.0},
        "Silk": {"co2_per_kg": 6.2, "water_per_kg": 2800.0, "energy_kwh_per_kg": 12.5},
        "Linen": {"co2_per_kg": 3.4, "water_per_kg": 1900.0, "energy_kwh_per_kg": 7.0},
        "Denim": {"co2_per_kg": 4.0, "water_per_kg": 2600.0, "energy_kwh_per_kg": 9.0},
        "Nylon": {"co2_per_kg": 5.1, "water_per_kg": 1200.0, "energy_kwh_per_kg": 16.0},
        "Rayon": {"co2_per_kg": 3.6, "water_per_kg": 1700.0, "energy_kwh_per_kg": 10.0},
        "Acrylic": {"co2_per_kg": 4.8, "water_per_kg": 1100.0, "energy_kwh_per_kg": 15.0},
        "Mixed Fabrics": {"co2_per_kg": 2.2, "water_per_kg": 800.0, "energy_kwh_per_kg": 5.0},
    }

    def calculate_impact(
        self, material: str, weight_kg: float = 1.0
    ) -> Dict[str, Any]:
        """
        Calculates environmental savings and circular economy analytics for a given mass of material.
        """
        normalized = material.strip().title() if isinstance(material, str) else "Cotton"
        factors = self.MATERIAL_IMPACT_FACTORS.get(
            normalized, self.MATERIAL_IMPACT_FACTORS["Cotton"]
        )

        co2_saved = round(factors["co2_per_kg"] * weight_kg, 2)
        water_saved = round(factors["water_per_kg"] * weight_kg, 1)
        energy_saved = round(factors["energy_kwh_per_kg"] * weight_kg, 2)
        landfill_diverted_kg = round(weight_kg, 2)

        # Waste diversion rate benchmark (assuming 85% recoverable for clean fibers)
        waste_diversion_rate = 85.0 if normalized in ["Cotton", "Polyester", "Denim", "Wool"] else 70.0

        # Circular Economy Analytics
        circular_economy_score = round(
            min(100.0, (co2_saved / (4.5 * max(weight_kg, 0.1))) * 100.0), 1
        )

        summary = (
            f"Processing {weight_kg:.1f} kg of {normalized} achieves an estimated environmental saving of "
            f"{co2_saved:.1f} kg CO₂, {int(water_saved):,} liters of water, and {energy_saved:.1f} kWh of energy, "
            f"diverting {landfill_diverted_kg:.1f} kg of waste from landfills with an {waste_diversion_rate:.0f}% recovery rate."
        )

        return {
            "estimated_carbon_saving_kg": co2_saved,
            "estimated_water_saving_liters": water_saved,
            "estimated_energy_saving_kwh": energy_saved,
            "landfill_diverted_kg": landfill_diverted_kg,
            "waste_diversion_rate_pct": waste_diversion_rate,
            "circular_economy_score": circular_economy_score,
            "sustainability_benchmark": "Industry Leader" if co2_saved > 3.5 else "Standard Circularity",
            "environmental_impact_summary": summary,
        }
