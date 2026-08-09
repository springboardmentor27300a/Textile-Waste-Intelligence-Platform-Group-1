from app.routers.auth import router as auth_router
from app.routers.inventory import router as inventory_router
from app.routers.waste import router as waste_router
from app.routers.suppliers import router as suppliers_router

__all__ = ["auth_router", "inventory_router", "waste_router", "suppliers_router"]
