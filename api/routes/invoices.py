import uuid

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from typing import Optional, List

from api.routes.database import get_engine
from api.routes.users import get_current_user

router = APIRouter(tags=["invoices"])

REGION = "us-east-2"
SECRET_NAME = "database-2"
engine = get_engine(SECRET_NAME, REGION)

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
    submission_status: str  # "approved" or "rejected" statuses 
    rejection_reason: Optional[str] = None

def require_retailer(user=Depends(get_current_user)):
    if user.get("user_type") not in ("base", "retailer"):
        raise HTTPException(status_code=403, detail="Retailer access required - Cần quyền retailer")
    return user

def require_tce_or_admin(user=Depends(get_current_user)):
    if user.get("user_type") not in ("tce", "admin"):
        raise HTTPException(status_code=403, detail="TCE or admin access required - Cần quyền TCE hoặc admin")
    return user



# POST /invoices - submit a new invoice
@router.post("/invoices")
def create_invoice(request: CreateInvoiceRequest, user=Depends(require_retailer)):
    if not request.items:
        raise HTTPException(status_code=400, detail="Missing required fields: items - Vui lòng nhập các mặt hàng trong hóa đơn")
    if not request.invoice_photo_url:
        raise HTTPException(status_code=400, detail="invoice_photo_url is required")
    if not (-90 <= request.gps_lat <= 90):
        raise HTTPException(status_code=400, detail="Invalid gps_lat: must be between -90 and 90")
    if not (-180 <= request.gps_lon <= 180):
        raise HTTPException(status_code=400, detail="Invalid gps_lon: must be between -180 and 180")
    try:
        datetime.fromisoformat(request.invoice_timestamp)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid invoice_timestamp: must be ISO 8601 format")

    invoice_id = str(uuid.uuid4())
    retailer_id = user["user_id"]
    now = datetime.now(timezone.utc).isoformat()

    try:
        with engine.connect() as conn:
            conn.execute(
                text("""
                    INSERT INTO invoices (invoice_id, retailer_id, invoice_photo_url, gps_lat, gps_lon,
                        invoice_timestamp, submission_status, created_at)
                    VALUES (:invoice_id, :retailer_id, :invoice_photo_url, :gps_lat, :gps_lon,
                        :invoice_timestamp, 'pending', :created_at)
                """),
                {
                    "invoice_id": invoice_id,
                    "retailer_id": retailer_id,
                    "invoice_photo_url": request.invoice_photo_url,
                    "gps_lat": request.gps_lat,
                    "gps_lon": request.gps_lon,
                    "invoice_timestamp": request.invoice_timestamp,
                    "created_at": now,
                },
            )
            for item in request.items:
                conn.execute(
                    text("""
                        INSERT INTO invoice_items (invoice_id, product_id, quantity, price)
                        VALUES (:invoice_id, :product_id, :quantity, :price)
                    """),
                    {
                        "invoice_id": invoice_id,
                        "product_id": item.product_id,
                        "quantity": item.quantity,
                        "price": item.price,
                    },
                )
            conn.commit()
    except IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Invalid data: {e.orig}")
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

    return {
        "message": "Invoice submitted successfully - Hóa đơn đã được gửi thành công",
        "invoice": {
            "invoice_id": invoice_id,
            "retailer_id": retailer_id,
            "submission_status": "pending",
            "invoice_photo_url": request.invoice_photo_url,
            "invoice_timestamp": request.invoice_timestamp,
            "items": [item.model_dump() for item in request.items],
        },
    }


# GET /invoices - list invoices (own for retailers, region for TCEs, all for admins)
@router.get("/invoices")
def list_invoices(user=Depends(get_current_user)):
    user_type = user.get("user_type")
    user_id = user["user_id"]

    try:
        with engine.connect() as conn:
            if user_type in ("base", "retailer"):
                result = conn.execute(
                    text("""
                        SELECT invoice_id, retailer_id, invoice_timestamp, submission_status, invoice_photo_url
                        FROM invoices WHERE retailer_id = :user_id
                        ORDER BY invoice_timestamp DESC
                    """),
                    {"user_id": user_id},
                )
            elif user_type == "tce":
                result = conn.execute(
                    text("""
                        SELECT i.invoice_id, i.retailer_id, i.invoice_timestamp, i.submission_status, i.invoice_photo_url
                        FROM invoices i
                        JOIN retailers r ON i.retailer_id = r.user_id
                        WHERE r.assigned_tce_id = :user_id
                        ORDER BY i.invoice_timestamp DESC
                    """),
                    {"user_id": user_id},
                )
            elif user_type == "admin":
                result = conn.execute(
                    text("""
                        SELECT invoice_id, retailer_id, invoice_timestamp, submission_status, invoice_photo_url
                        FROM invoices ORDER BY invoice_timestamp DESC
                    """)
                )
            else:
                raise HTTPException(status_code=403, detail="Not authorized - Bạn không có quyền truy cập")

            rows = [dict(row) for row in result.mappings()]
        return rows
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


# GET /invoices/:id - get details of a specific invoice
@router.get("/invoices/{invoice_id}")
def get_invoice(invoice_id: str, user=Depends(get_current_user)):
    user_type = user.get("user_type")
    user_id = user["user_id"]

    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT * FROM invoices WHERE invoice_id = :invoice_id"),
                {"invoice_id": invoice_id},
            )
            invoice = result.mappings().first()
            if not invoice:
                raise HTTPException(status_code=404, detail="Invoice not found - Không kiếm được")

            invoice = dict(invoice)

            # Authorization check
            if user_type in ("base", "retailer") and invoice["retailer_id"] != user_id:
                raise HTTPException(status_code=403, detail="Not authorized to view this invoice - Bạn không có quyền xem hóa đơn này")
            if user_type == "tce":
                tce_check = conn.execute(
                    text("SELECT 1 FROM retailers WHERE user_id = :retailer_id AND assigned_tce_id = :tce_id"),
                    {"retailer_id": invoice["retailer_id"], "tce_id": user_id},
                )
                if not tce_check.first():
                    raise HTTPException(status_code=403, detail="Not authorized to view this invoice - Bạn không có quyền xem hóa đơn này")

            items_result = conn.execute(
                text("SELECT product_id, quantity, price FROM invoice_items WHERE invoice_id = :invoice_id"),
                {"invoice_id": invoice_id},
            )
            invoice["items"] = [dict(row) for row in items_result.mappings()]

        return invoice
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


# PATCH /invoices/:id/status - approve or reject an invoice (TCE and admin only)
@router.patch("/invoices/{invoice_id}/status")
def update_invoice_status(invoice_id: str, request: UpdateInvoiceStatusRequest, user=Depends(require_tce_or_admin)):
    if request.submission_status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Invalid status: must be 'approved' or 'rejected' - Trạng thái không hợp lệ: phải là 'approved' hoặc 'rejected'")
    if request.submission_status == "rejected" and not request.rejection_reason:
        raise HTTPException(status_code=400, detail="rejection_reason is required when rejecting an invoice - Lý do từ chối là bắt buộc khi từ chối hóa đơn")

    now = datetime.now(timezone.utc).isoformat()

    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT submission_status FROM invoices WHERE invoice_id = :invoice_id"),
                {"invoice_id": invoice_id},
            )
            invoice = result.mappings().first()
            if not invoice:
                raise HTTPException(status_code=404, detail="Invoice not found - Không kiếm được")
            if invoice["submission_status"] != "pending":
                raise HTTPException(status_code=400, detail="Only pending invoices can be updated - Chỉ có thể cập nhật hóa đơn đang chờ xử lý")

            conn.execute(
                text("""
                    UPDATE invoices
                    SET submission_status = :status,
                        approved_by = :approved_by,
                        approved_at = :approved_at,
                        rejection_reason = :rejection_reason
                    WHERE invoice_id = :invoice_id
                """),
                {
                    "status": request.submission_status,
                    "approved_by": user["user_id"],
                    "approved_at": now,
                    "rejection_reason": request.rejection_reason,
                    "invoice_id": invoice_id,
                },
            )
            conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

    if request.submission_status == "approved":
        return {
            "message": "Invoice approved - Hóa đơn đã được duyệt",
            "invoice_id": invoice_id,
            "submission_status": "approved",
            "approved_by": user["user_id"],
            "approved_at": now,
            "points_awarded": None,  # plug in points logic when it is finalized 
        }
    else:
        return {
            "message": "Invoice rejected - Hóa đơn đã bị từ chối",
            "invoice_id": invoice_id,
            "submission_status": "rejected",
            "rejection_reason": request.rejection_reason,
        }
