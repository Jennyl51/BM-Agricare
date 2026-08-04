from typing import Any, Dict

from fastapi import APIRouter, Depends

from api.routes.admin_auth import get_current_admin
from db.admin_dashboard_db import get_admin_dashboard_overview


router = APIRouter(prefix="/admin/dashboard", tags=["Admin Dashboard"])


@router.get("/overview")
def admin_dashboard_overview(
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return get_admin_dashboard_overview()