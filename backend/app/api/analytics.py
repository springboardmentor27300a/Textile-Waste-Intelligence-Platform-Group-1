from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.core.dependencies import require_roles

from app.models.user import User

from app.services.analytics.material_analytics import (
    MaterialAnalytics,
)

from app.services.analytics.waste_analytics import (
    WasteAnalytics,
)

from app.services.analytics.environmental_analytics import (
    EnvironmentalAnalytics,
)

from app.services.analytics.sustainability_analytics import (
    SustainabilityAnalytics,
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


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


# ==========================================================
# KPI Analytics
# ==========================================================

@router.get("/kpis")
def kpis(

    current_user: User = Depends(
        require_roles(
            "administrator",
            "manager",
            "manufacturer",
            "recycler",
        )
    ),

    db: Session = Depends(get_db),

):

    return KPIService.get_kpis(db)


# ==========================================================
# Material Analytics
# ==========================================================

@router.get("/materials")
def materials(

    current_user: User = Depends(
        require_roles(
            "administrator",
            "manager",
            "manufacturer",
            "recycler",
        )
    ),

    db: Session = Depends(get_db),

):

    return MaterialAnalytics.distribution(db)


@router.get("/material-categories")
def material_categories(

    current_user: User = Depends(
        require_roles(
            "administrator",
            "manager",
            "manufacturer",
            "recycler",
        )
    ),

    db: Session = Depends(get_db),

):

    return MaterialAnalytics.categories(db)


# ==========================================================
# Waste Analytics
# ==========================================================

@router.get("/waste")
def waste(

    current_user: User = Depends(
        require_roles(
            "administrator",
            "manager",
            "manufacturer",
            "recycler",
        )
    ),

    db: Session = Depends(get_db),

):

    return WasteAnalytics.categories(db)


@router.get("/reuse")
def reuse(

    current_user: User = Depends(
        require_roles(
            "administrator",
            "manager",
            "manufacturer",
            "recycler",
        )
    ),

    db: Session = Depends(get_db),

):

    return WasteAnalytics.reuse(db)


# ==========================================================
# Environmental Analytics
# ==========================================================

@router.get("/environment")
def environment(

    current_user: User = Depends(
        require_roles(
            "administrator",
            "manager",
            "manufacturer",
            "recycler",
        )
    ),

    db: Session = Depends(get_db),

):

    return EnvironmentalAnalytics.summary(db)


# ==========================================================
# Sustainability Analytics
# ==========================================================

@router.get("/sustainability")
def sustainability(

    current_user: User = Depends(
        require_roles(
            "administrator",
            "manager",
            "manufacturer",
            "recycler",
        )
    ),

    db: Session = Depends(get_db),

):

    return SustainabilityAnalytics.summary(db)


# ==========================================================
# Company Analytics
# ==========================================================

@router.get("/companies")
def companies(

    current_user: User = Depends(
        require_roles(
            "administrator",
            "manager",
        )
    ),

    db: Session = Depends(get_db),

):

    return CompanyAnalytics.get_company_ranking(db)


@router.get("/companies/summary")
def company_summary(

    current_user: User = Depends(
        require_roles(
            "administrator",
            "manager",
        )
    ),

    db: Session = Depends(get_db),

):

    return CompanyAnalytics.comparison_summary(db)


# ==========================================================
# Trend Analytics
# ==========================================================

@router.get("/trends")
def trends(

    current_user: User = Depends(
        require_roles(
            "administrator",
            "manager",
            "manufacturer",
            "recycler",
        )
    ),

    db: Session = Depends(get_db),

):

    return TrendAnalytics.dashboard_trends(db)