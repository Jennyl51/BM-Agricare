from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from api.routes.admin_auth import get_current_admin
from db.admin_invoices_db import (
    get_admin_invoice_detail,
    list_admin_invoices,
    review_admin_invoice,
)


router = APIRouter(prefix="/admin/invoices", tags=["Admin Invoices"])


class AdminInvoiceReviewRequest(BaseModel):
    review_status: str
    rejection_reason: Optional[str] = None


@router.get("")
def admin_list_invoices(
    status: Optional[str] = Query(default="all"),
    limit: int = Query(default=100, ge=1, le=500),
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return list_admin_invoices(status=status, limit=limit)


@router.get("/{invoice_id}")
def admin_get_invoice_detail(
    invoice_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return get_admin_invoice_detail(invoice_id)


@router.patch("/{invoice_id}/review")
def admin_review_invoice(
    invoice_id: str,
    payload: AdminInvoiceReviewRequest,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return review_admin_invoice(
        invoice_id=invoice_id,
        review_status=payload.review_status,
        rejection_reason=payload.rejection_reason,
        admin_email=current_admin["email"],
    )