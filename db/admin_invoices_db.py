from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional

from fastapi import HTTPException
from sqlalchemy import text

from api.routes.database import get_engine


REGION = "us-east-2"
SECRET_NAME = "database-2"

engine = get_engine(SECRET_NAME, REGION)


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def to_plain_value(value: Any) -> Any:
    if isinstance(value, Decimal):
        return float(value)

    if isinstance(value, datetime):
        return value.isoformat()

    return value


def clean_dict(row: Dict[str, Any]) -> Dict[str, Any]:
    return {key: to_plain_value(value) for key, value in row.items()}

def list_admin_invoices(
    status: Optional[str] = None,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    """
    List invoices for the admin invoice page.
    """
    params: Dict[str, Any] = {"limit": limit}

    status_filter_sql = ""

    if status and status.lower() != "all":
        status_filter_sql = "WHERE LOWER(COALESCE(i.status, '')) = :status"
        params["status"] = status.lower()

    with engine.connect() as conn:
        rows = conn.execute(
            text(
                f"""
                WITH invoice_totals AS (
                    SELECT
                        i.invoice_id,
                        COALESCE(
                            SUM(
                                COALESCE(ii.quantity, 0)
                                * COALESCE(ii.price_at_purchase, 0)
                            ),
                            0
                        ) AS total_sales,
                        COALESCE(
                            SUM(
                                COALESCE(ii.quantity, 0)
                                * COALESCE(p.point_factor, 0)
                            ),
                            0
                        ) AS points,
                        COUNT(ii.item_id) AS item_count
                    FROM invoices i
                    LEFT JOIN invoice_items ii
                        ON ii.invoice_id = i.invoice_id
                    LEFT JOIN products p
                        ON p.product_id = ii.product_id
                    GROUP BY i.invoice_id
                )
                SELECT
                    i.invoice_id,
                    i.invoice_number,
                    i.retailer_id,
                    COALESCE(r.name, 'Retailer #' || i.retailer_id::text) AS retailer_name,
                    COALESCE(i.region, r.region, 'Unknown') AS region,
                    COALESCE(r.tier, 'Unknown') AS tier,
                    i.status,
                    i.tce_status,
                    i.admin_status,
                    i.created_at,
                    i.photo_url,
                    COALESCE(i.total_amount, it.total_sales, 0) AS total_sales,
                    COALESCE(i.total_points, it.points, 0) AS points,
                    COALESCE(it.item_count, 0) AS item_count
                FROM invoices i
                LEFT JOIN invoice_totals it
                    ON it.invoice_id = i.invoice_id
                LEFT JOIN retailers r
                    ON r.user_id = i.retailer_id
                {status_filter_sql}
                ORDER BY i.created_at DESC
                LIMIT :limit;
                """
            ),
            params,
        ).mappings().all()

    return [clean_dict(dict(row)) for row in rows]


def get_admin_invoice_detail(invoice_id: str) -> Dict[str, Any]:
    with engine.connect() as conn:
        invoice_row = conn.execute(
            text(
                """
                SELECT
                    i.invoice_id,
                    i.invoice_number,
                    i.retailer_id,
                    COALESCE(r.name, 'Retailer #' || i.retailer_id::text) AS retailer_name,
                    r.phone_number AS retailer_phone,
                    COALESCE(i.region, r.region, 'Unknown') AS region,
                    COALESCE(r.tier, 'Unknown') AS tier,
                    i.photo_url,
                    i.status,
                    i.tce_status,
                    i.tce_reviewed_by,
                    i.tce_reviewed_at,
                    i.tce_rejection_reason,
                    i.admin_status,
                    i.admin_reviewed_by,
                    i.admin_reviewed_at,
                    i.admin_rejection_reason,
                    i.assigned_tce_id,
                    i.approved_by,
                    i.created_at,
                    COALESCE(i.total_amount, 0) AS total_amount,
                    COALESCE(i.total_points, 0) AS total_points
                FROM invoices i
                LEFT JOIN retailers r
                    ON r.user_id = i.retailer_id
                WHERE i.invoice_id = :invoice_id
                LIMIT 1;
                """
            ),
            {"invoice_id": invoice_id},
        ).mappings().first()

        if not invoice_row:
            raise HTTPException(status_code=404, detail="Invoice not found.")

        item_rows = conn.execute(
            text(
                """
                SELECT
                    ii.item_id,
                    ii.product_id,
                    COALESCE(p.product_name, 'Product #' || ii.product_id::text) AS product_name,
                    COALESCE(p.point_factor, 0) AS point_factor,
                    COALESCE(ii.quantity, 0) AS quantity,
                    COALESCE(ii.price_at_purchase, 0) AS price_at_purchase,
                    COALESCE(ii.quantity, 0) * COALESCE(ii.price_at_purchase, 0) AS subtotal,
                    COALESCE(ii.quantity, 0) * COALESCE(p.point_factor, 0) AS points
                FROM invoice_items ii
                LEFT JOIN products p
                    ON p.product_id = ii.product_id
                WHERE ii.invoice_id = :invoice_id
                ORDER BY ii.item_id;
                """
            ),
            {"invoice_id": invoice_id},
        ).mappings().all()

    invoice = clean_dict(dict(invoice_row))
    invoice["items"] = [clean_dict(dict(row)) for row in item_rows]

    return invoice


def review_admin_invoice(
    invoice_id: str,
    review_status: str,
    rejection_reason: Optional[str],
    admin_email: str,
) -> Dict[str, Any]:
    if review_status not in ("approved", "rejected"):
        raise HTTPException(
            status_code=400,
            detail="review_status must be 'approved' or 'rejected'.",
        )

    if review_status == "rejected" and not rejection_reason:
        raise HTTPException(
            status_code=400,
            detail="rejection_reason is required when rejecting an invoice.",
        )

    now = utc_now()

    with engine.begin() as conn:
        invoice_row = conn.execute(
            text(
                """
                SELECT
                    invoice_id,
                    status,
                    tce_status,
                    admin_status
                FROM invoices
                WHERE invoice_id = :invoice_id
                LIMIT 1;
                """
            ),
            {"invoice_id": invoice_id},
        ).mappings().first()

        if not invoice_row:
            raise HTTPException(status_code=404, detail="Invoice not found.")

        invoice = dict(invoice_row)
        tce_status = (invoice.get("tce_status") or "").lower()

        if tce_status != "approved":
            raise HTTPException(
                status_code=400,
                detail="This invoice cannot be admin-reviewed until TCE approval is complete.",
            )

        final_status = "approved" if review_status == "approved" else "rejected"

        conn.execute(
            text(
                """
                UPDATE invoices
                SET
                    admin_status = :admin_status,
                    admin_reviewed_by = :admin_reviewed_by,
                    admin_reviewed_at = :admin_reviewed_at,
                    admin_rejection_reason = :admin_rejection_reason,
                    status = :final_status
                WHERE invoice_id = :invoice_id;
                """
            ),
            {
                "admin_status": review_status,
                "admin_reviewed_by": admin_email,
                "admin_reviewed_at": now,
                "admin_rejection_reason": rejection_reason,
                "final_status": final_status,
                "invoice_id": invoice_id,
            },
        )

    return get_admin_invoice_detail(invoice_id)