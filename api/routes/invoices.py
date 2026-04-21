from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from api.routes.users import get_current_user
from services.invoices_service import (
    get_invoice_detail,
    get_invoices_for_user,
    set_invoice_status,
    submit_invoice,
)

router = APIRouter(tags=["invoices"])


class InvoiceItem(BaseModel):
    product_id: str
    quantity: int
    price: float


class CreateInvoiceRequest(BaseModel):
    items: List[InvoiceItem]
    invoice_photo_url: str
    gps_lat: float
    gps_lon: float
    invoice_timestamp: str


class UpdateInvoiceStatusRequest(BaseModel):
    submission_status: str  # "approved" or "rejected"
    rejection_reason: Optional[str] = None


def require_retailer(user=Depends(get_current_user)):
    if user.get("user_type") not in ("base", "retailer"):
        raise HTTPException(status_code=403, detail="Retailer access required - Cần quyền retailer")
    return user


def require_tce_or_admin(user=Depends(get_current_user)):
    if user.get("user_type") not in ("tce", "admin"):
        raise HTTPException(status_code=403, detail="TCE or admin access required - Cần quyền TCE hoặc admin")
    return user


@router.post("/invoices")
def create_invoice(request: CreateInvoiceRequest, user=Depends(require_retailer)):
    return submit_invoice(data=request.model_dump(), user_id=user["user_id"])


@router.get("/invoices")
def list_invoices(user=Depends(get_current_user)):
    return get_invoices_for_user(user_id=user["user_id"], user_type=user.get("user_type"))


@router.get("/invoices/{invoice_id}")
def get_invoice(invoice_id: str, user=Depends(get_current_user)):
    return get_invoice_detail(invoice_id=invoice_id, user_id=user["user_id"], user_type=user.get("user_type"))


@router.patch("/invoices/{invoice_id}/status")
def update_invoice_status(invoice_id: str, request: UpdateInvoiceStatusRequest, user=Depends(require_tce_or_admin)):
    return set_invoice_status(
        invoice_id=invoice_id,
        status=request.submission_status,
        rejection_reason=request.rejection_reason,
        approver_id=user["user_id"],
    )
