# This package __init__.py re-exports everything from the sibling schemas.py
# module so that `from app.schemas import XYZ` resolves correctly even though
# Python resolves `app.schemas` to this package directory first.
#
# Do NOT add any other logic here — schemas.py is the single source of truth.

from app.schemas_module import (  # noqa: F401
    UserCreate, UserLogin, UserOut, Token, TokenData,
    UserRoleUpdate, UserStatusUpdate,
    SupplierBase, SupplierCreate, SupplierOut,
    InventoryBase, InventoryCreate, InventoryUpdate, InventoryOut,
    WasteRecordBase, WasteRecordCreate, WasteRecordOut,
    WasteAnalytics, DashboardStats,
    NotificationOut, NotificationCreate,
)

# Milestone 3 — Sustainability Intelligence Engine schemas
from app.schemas.sustainability import (  # noqa: F401
    SustainabilityCalculateRequest,
    SustainabilityMetricOut,
    SustainabilityListItem,
    # Benchmarking Extension
    MetricComparisonOut,
    BenchmarkReportOut,
)

# Milestone 4 — Environmental Impact Assessment Engine schemas
from app.schemas.environmental import (  # noqa: F401
    EnvironmentalGenerateRequest,
    EnvironmentalImpactSummary,
    EnvironmentalPerformanceRating,
    EnvironmentalImpactStats,
    SustainabilityReportOut,
    EnvironmentalReportOut,
    EnvironmentalReportListItem,
)

# Milestone 3 — Circular Economy Analytics Engine schemas
from app.schemas.circular_analytics import (  # noqa: F401
    CircularStatistics,
    CircularWasteCategoryStats,
    CircularAnalyticsGenerateResponse,
    CircularAnalyticsHistoryItem,
)
