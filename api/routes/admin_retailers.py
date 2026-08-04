from typing import Any, Dict

from fastapi import APIRouter, Depends

from api.routes.admin_auth import get_current_admin
from db.admin_retailers_db import (
    get_admin_retailer_detail,
    get_admin_retailers_overview,
)


router = APIRouter(prefix="/admin/retailers", tags=["Admin Retailers"])


@router.get("/overview")
def admin_retailers_overview(
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return get_admin_retailers_overview()


@router.get("/{retailer_id}")
def admin_retailer_detail(
    retailer_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return get_admin_retailer_detail(retailer_id)