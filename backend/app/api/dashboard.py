from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.database.database import get_db
from app.models.user import User

from app.services.analytics.dashboard_analytics import (
    DashboardAnalytics,
)

from app.services.analytics.kpi_service import (
    KPIService,
)

from app.services.analytics.company_analytics import (
    CompanyAnalytics,
)

from app.services.analytics.trend_analytics import (
    TrendAnalytics,
)

from app.services.analytics.environmental_analytics import (
    EnvironmentalAnalytics,
)

from app.services.analytics.sustainability_analytics import (
    SustainabilityAnalytics,
)

from app.services.analytics.role_dashboard import (
    get_role_dashboard_meta,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


ALL_ROLES = (
    "administrator",
    "manager",
    "manufacturer",
    "recycler",
)


ADMIN_MANAGER = (
    "administrator",
    "manager",
)


@router.get("/")
def dashboard(
    current_user: User = Depends(
        require_roles(*ALL_ROLES)
    ),
    db: Session = Depends(get_db),
):
    data = DashboardAnalytics.dashboard(db)

    meta = get_role_dashboard_meta(
        current_user.role
    )

    # Company ranking is an organization-comparison
    # capability.
    #
    # Keep it for administrators and sustainability
    # managers only.
    if current_user.role not in ADMIN_MANAGER:
        data["company_ranking"] = []
        data["company_summary"] = {}

    data["role"] = current_user.role

    data["dashboard_title"] = meta["title"]

    data["dashboard_subtitle"] = (
        meta["subtitle"]
    )

    return data


@router.get("/kpis")
def kpis(
    current_user: User = Depends(
        require_roles(*ALL_ROLES)
    ),
    db: Session = Depends(get_db),
):
    return KPIService.get_kpis(db)


@router.get("/companies")
def companies(
    current_user: User = Depends(
        require_roles(*ADMIN_MANAGER)
    ),
    db: Session = Depends(get_db),
):
    return CompanyAnalytics.get_company_ranking(db)


@router.get("/companies/summary")
def company_summary(
    current_user: User = Depends(
        require_roles(*ADMIN_MANAGER)
    ),
    db: Session = Depends(get_db),
):
    return CompanyAnalytics.comparison_summary(db)


@router.get("/trends")
def trends(
    current_user: User = Depends(
        require_roles(*ALL_ROLES)
    ),
    db: Session = Depends(get_db),
):
    return TrendAnalytics.dashboard_trends(db)


@router.get("/materials")
def material_distribution(
    current_user: User = Depends(
        require_roles(*ALL_ROLES)
    ),
    db: Session = Depends(get_db),
):
    return DashboardAnalytics.dashboard(db)[
        "material_distribution"
    ]


@router.get("/waste")
def waste_distribution(
    current_user: User = Depends(
        require_roles(*ALL_ROLES)
    ),
    db: Session = Depends(get_db),
):
    return DashboardAnalytics.dashboard(db)[
        "waste_distribution"
    ]


@router.get("/sustainability")
def sustainability_distribution(
    current_user: User = Depends(
        require_roles(*ALL_ROLES)
    ),
    db: Session = Depends(get_db),
):
    return DashboardAnalytics.dashboard(db)[
        "sustainability_distribution"
    ]


@router.get("/environment")
def environmental_distribution(
    current_user: User = Depends(
        require_roles(*ALL_ROLES)
    ),
    db: Session = Depends(get_db),
):
    return DashboardAnalytics.dashboard(db)[
        "environmental_distribution"
    ]


@router.get("/recycling")
def recycling_distribution(
    current_user: User = Depends(
        require_roles(*ALL_ROLES)
    ),
    db: Session = Depends(get_db),
):
    return DashboardAnalytics.dashboard(db)[
        "recycling_distribution"
    ]


@router.get("/summary")
def dashboard_summary(
    current_user: User = Depends(
        require_roles(*ALL_ROLES)
    ),
    db: Session = Depends(get_db),
):
    return DashboardAnalytics.dashboard(db)[
        "summary"
    ]


@router.get("/collections/recent")
def recent_collections(
    current_user: User = Depends(
        require_roles(*ALL_ROLES)
    ),
    db: Session = Depends(get_db),
):
    return DashboardAnalytics.dashboard(db)[
        "recent_collections"
    ]


@router.get("/analysis/recent")
def recent_analysis(
    current_user: User = Depends(
        require_roles(*ALL_ROLES)
    ),
    db: Session = Depends(get_db),
):
    return DashboardAnalytics.dashboard(db)[
        "recent_analysis"
    ]


@router.get("/environment/summary")
def environmental_summary(
    current_user: User = Depends(
        require_roles(*ALL_ROLES)
    ),
    db: Session = Depends(get_db),
):
    return EnvironmentalAnalytics.summary(db)


@router.get("/sustainability/summary")
def sustainability_summary(
    current_user: User = Depends(
        require_roles(*ALL_ROLES)
    ),
    db: Session = Depends(get_db),
):
    return SustainabilityAnalytics.summary(db)