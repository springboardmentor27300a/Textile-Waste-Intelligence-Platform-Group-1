from app.models.user import User, UserRole
from app.models.supplier import Supplier
from app.models.inventory import Inventory, InventoryStatus, MaterialGrade
from app.models.waste_record import WasteRecord, WasteType, DisposalMethod
from app.models.image_record import TextileImage                               # Milestone 2
from app.models.sustainability_metric import SustainabilityMetric              # Milestone 3
from app.models.recycling_recommendation import RecyclingRecommendation        # Milestone 4
from app.models.environmental_report import EnvironmentalReport                # Milestone 4 — Environmental Impact
from app.models.circular_economy import CircularEconomyAnalytics               # Milestone 3 — Circular Economy Analytics Engine
from app.models.notification import Notification

__all__ = [
    "User", "UserRole",
    "Supplier",
    "Inventory", "InventoryStatus", "MaterialGrade",
    "WasteRecord", "WasteType", "DisposalMethod",
    "TextileImage",                                        # Milestone 2
    "SustainabilityMetric",                                # Milestone 3
    "RecyclingRecommendation",                             # Milestone 4
    "EnvironmentalReport",                                  # Milestone 4 — Environmental Impact
    "CircularEconomyAnalytics",                             # Milestone 3 — Circular Economy Analytics Engine
    "Notification",
]
