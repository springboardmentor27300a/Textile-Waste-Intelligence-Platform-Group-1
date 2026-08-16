from app.database.session import Base
from app.models.user import Role, Organization, User
from app.models.waste_batch import WasteBatch, TextileInventory
from app.models.dataset import Dataset
from app.models.support import Session, Notification, ActivityLog

# Milestone 2 — AI Prediction Models
from app.models.prediction import UploadedImage, Prediction, ClassificationResult, PredictionReport

# Milestone 3 — Sustainability Intelligence
from app.models.sustainability import (
    SustainabilityAnalysis,
    RecyclingRecommendation,
    EnvironmentalImpact,
    CircularityScore,
    SustainabilityReport,
)

__all__ = [
    "Base",
    "Role",
    "Organization",
    "User",
    "WasteBatch",
    "TextileInventory",
    "Dataset",
    "Session",
    "Notification",
    "ActivityLog",
    # Milestone 2
    "UploadedImage",
    "Prediction",
    "ClassificationResult",
    "PredictionReport",
    # Milestone 3
    "SustainabilityAnalysis",
    "RecyclingRecommendation",
    "EnvironmentalImpact",
    "CircularityScore",
    "SustainabilityReport",
]

