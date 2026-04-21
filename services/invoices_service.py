from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import HTTPException

from db.invoice_db import (
    create_invoice_submission,
    fetch_invoice_detail,
    fetch_invoices,
    update_invoice_status as db_update_invoice_status,
)


def submit_invoice(data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    if not data.get("items"):
        raise HTTPException(status_code=400, detail="Missing required fields: items - Vui lòng nhập các mặt hàng trong hóa đơn")
    if not data.get("invoice_photo_url"):
        raise HTTPException(status_code=400, detail="invoice_photo_url is required")
    if not (-90 <= data.get("gps_lat", 0) <= 90):
        raise HTTPException(status_code=400, detail="Invalid gps_lat: must be between -90 and 90")
    if not (-180 <= data.get("gps_lon", 0) <= 180):
        raise HTTPException(status_code=400, detail="Invalid gps_lon: must be between -180 and 180")
    try:
        datetime.fromisoformat(data.get("invoice_timestamp", ""))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid invoice_timestamp: must be ISO 8601 format")

    return create_invoice_submission({**data, "retailer_id": user_id})


def get_invoices_for_user(user_id: str, user_type: str) -> List[Dict[str, Any]]:
    # Branching kept here so real db queries can be swapped in per role later
    if user_type in ("base", "retailer"):
        return fetch_invoices(user_id)
    elif user_type == "tce":
        return fetch_invoices(user_id)
    elif user_type == "admin":
        return fetch_invoices(user_id)
    else:
        raise HTTPException(status_code=403, detail="Not authorized - Bạn không có quyền truy cập")


def get_invoice_detail(invoice_id: str, user_id: str, user_type: str) -> Dict[str, Any]:
    invoice = fetch_invoice_detail(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found - Không kiếm được")

    # Authorization check — preserved for when real data is wired in
    if user_type in ("base", "retailer") and invoice.get("retailer_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this invoice - Bạn không có quyền xem hóa đơn này")

    return invoice


def set_invoice_status(
    invoice_id: str,
    status: str,
    rejection_reason: Optional[str],
    approver_id: str,
) -> Dict[str, Any]:
    if status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Invalid status: must be 'approved' or 'rejected' - Trạng thái không hợp lệ: phải là 'approved' hoặc 'rejected'")
    if status == "rejected" and not rejection_reason:
        raise HTTPException(status_code=400, detail="rejection_reason is required when rejecting an invoice - Lý do từ chối là bắt buộc khi từ chối hóa đơn")

    return db_update_invoice_status(invoice_id=invoice_id, status=status)
