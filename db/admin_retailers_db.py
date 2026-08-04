from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import text

from api.routes.database import get_engine


REGION = "us-east-2"
SECRET_NAME = "database-2"

engine = get_engine(SECRET_NAME, REGION)


def clean_value(value: Any) -> Any:
    if isinstance(value, UUID):
        return str(value)

    if isinstance(value, Decimal):
        return float(value)

    if isinstance(value, (datetime, date)):
        return value.isoformat()

    return value


def clean_dict(row: Dict[str, Any]) -> Dict[str, Any]:
    return {key: clean_value(value) for key, value in row.items()}


def get_admin_retailers_overview() -> Dict[str, Any]:
    """
    Retailers overview based on the real Postgres tables.

    Existing activity we can infer:
    - invoice count
    - total invoice sales
    - earned points
    - last invoice date
    - reward redemption count

    True app-open tracking needs a future retailer_activity_events table.
    """
    with engine.connect() as conn:
        summary = conn.execute(
            text(
                """
                WITH retailer_invoice_totals AS (
                    SELECT
                        i.retailer_id,
                        COUNT(DISTINCT i.invoice_id) AS invoice_count,
                        MAX(i.created_at) AS last_invoice_at,
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
                        ) AS invoice_points
                    FROM invoices i
                    LEFT JOIN invoice_items ii
                        ON ii.invoice_id = i.invoice_id
                    LEFT JOIN products p
                        ON p.product_id = ii.product_id
                    GROUP BY i.retailer_id
                ),
                retailer_redemptions AS (
                    SELECT
                        retailer_user_id,
                        COUNT(*) AS redemption_count,
                        MAX(created_at) AS last_redemption_at
                    FROM reward_redemptions
                    GROUP BY retailer_user_id
                )
                SELECT
                    COUNT(r.user_id) AS total_retailers,
                    COUNT(DISTINCT r.region) AS active_regions,
                    COALESCE(SUM(r.total_points), 0) AS total_points,
                    COALESCE(SUM(rit.total_sales), 0) AS total_sales,
                    COALESCE(SUM(rit.invoice_count), 0) AS total_invoices,
                    COALESCE(SUM(rr.redemption_count), 0) AS total_redemptions
                FROM retailers r
                LEFT JOIN retailer_invoice_totals rit
                    ON rit.retailer_id = r.user_id
                LEFT JOIN retailer_redemptions rr
                    ON rr.retailer_user_id = r.user_id;
                """
            )
        ).mappings().first()

        retailers = conn.execute(
            text(
                """
                WITH retailer_invoice_totals AS (
                    SELECT
                        i.retailer_id,
                        COUNT(DISTINCT i.invoice_id) AS invoice_count,
                        MAX(i.created_at) AS last_invoice_at,
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
                        ) AS invoice_points
                    FROM invoices i
                    LEFT JOIN invoice_items ii
                        ON ii.invoice_id = i.invoice_id
                    LEFT JOIN products p
                        ON p.product_id = ii.product_id
                    GROUP BY i.retailer_id
                ),
                retailer_redemptions AS (
                    SELECT
                        retailer_user_id,
                        COUNT(*) AS redemption_count,
                        MAX(created_at) AS last_redemption_at
                    FROM reward_redemptions
                    GROUP BY retailer_user_id
                )
                SELECT
                    r.user_id::text AS user_id,
                    r.user_id::text AS retailer_id,
                    COALESCE(r.name, 'Unnamed Retailer') AS name,
                    COALESCE(r.phone_number, '—') AS phone_number,
                    COALESCE(r.region, 'Unknown') AS region,
                    COALESCE(r.tier, 'bronze') AS tier,
                    COALESCE(r.total_points, 0) AS total_points,
                    r.assigned_tce_id::text AS assigned_tce_id,
                    COALESCE(rit.invoice_count, 0) AS invoice_count,
                    COALESCE(rit.total_sales, 0) AS total_sales,
                    COALESCE(rit.invoice_points, 0) AS invoice_points,
                    rit.last_invoice_at,
                    COALESCE(rr.redemption_count, 0) AS redemption_count,
                    rr.last_redemption_at,
                    GREATEST(
                        COALESCE(rit.last_invoice_at, '1970-01-01'::timestamp),
                        COALESCE(rr.last_redemption_at, '1970-01-01'::timestamp)
                    ) AS last_business_activity_at
                FROM retailers r
                LEFT JOIN retailer_invoice_totals rit
                    ON rit.retailer_id = r.user_id
                LEFT JOIN retailer_redemptions rr
                    ON rr.retailer_user_id = r.user_id
                ORDER BY r.region ASC, r.name ASC;
                """
            )
        ).mappings().all()

    summary_dict = clean_dict(dict(summary or {}))
    retailer_list = [clean_dict(dict(row)) for row in retailers]

    return {
        "summary": {
            "totalRetailers": int(summary_dict.get("total_retailers") or 0),
            "activeRegions": int(summary_dict.get("active_regions") or 0),
            "totalPoints": int(summary_dict.get("total_points") or 0),
            "totalSales": float(summary_dict.get("total_sales") or 0),
            "totalInvoices": int(summary_dict.get("total_invoices") or 0),
            "totalRedemptions": int(summary_dict.get("total_redemptions") or 0),
        },
        "retailers": retailer_list,
    }


def get_admin_retailer_detail(retailer_id: str) -> Dict[str, Any]:
    with engine.connect() as conn:
        retailer = conn.execute(
            text(
                """
                WITH retailer_invoice_totals AS (
                    SELECT
                        i.retailer_id,
                        COUNT(DISTINCT i.invoice_id) AS invoice_count,
                        MAX(i.created_at) AS last_invoice_at,
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
                        ) AS invoice_points
                    FROM invoices i
                    LEFT JOIN invoice_items ii
                        ON ii.invoice_id = i.invoice_id
                    LEFT JOIN products p
                        ON p.product_id = ii.product_id
                    WHERE i.retailer_id = :retailer_id
                    GROUP BY i.retailer_id
                ),
                retailer_redemptions AS (
                    SELECT
                        retailer_user_id,
                        COUNT(*) AS redemption_count,
                        MAX(created_at) AS last_redemption_at
                    FROM reward_redemptions
                    WHERE retailer_user_id = :retailer_id
                    GROUP BY retailer_user_id
                )
                SELECT
                    r.user_id::text AS user_id,
                    r.user_id::text AS retailer_id,
                    COALESCE(r.name, 'Unnamed Retailer') AS name,
                    COALESCE(r.phone_number, '—') AS phone_number,
                    COALESCE(r.region, 'Unknown') AS region,
                    COALESCE(r.tier, 'bronze') AS tier,
                    COALESCE(r.total_points, 0) AS total_points,
                    r.assigned_tce_id::text AS assigned_tce_id,
                    COALESCE(rit.invoice_count, 0) AS invoice_count,
                    COALESCE(rit.total_sales, 0) AS total_sales,
                    COALESCE(rit.invoice_points, 0) AS invoice_points,
                    rit.last_invoice_at,
                    COALESCE(rr.redemption_count, 0) AS redemption_count,
                    rr.last_redemption_at
                FROM retailers r
                LEFT JOIN retailer_invoice_totals rit
                    ON rit.retailer_id = r.user_id
                LEFT JOIN retailer_redemptions rr
                    ON rr.retailer_user_id = r.user_id
                WHERE r.user_id = :retailer_id
                LIMIT 1;
                """
            ),
            {"retailer_id": retailer_id},
        ).mappings().first()

        if not retailer:
            raise HTTPException(status_code=404, detail="Retailer not found.")

        invoices = conn.execute(
            text(
                """
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
                        ) AS points
                    FROM invoices i
                    LEFT JOIN invoice_items ii
                        ON ii.invoice_id = i.invoice_id
                    LEFT JOIN products p
                        ON p.product_id = ii.product_id
                    WHERE i.retailer_id = :retailer_id
                    GROUP BY i.invoice_id
                )
                SELECT
                    i.invoice_id::text,
                    i.invoice_number,
                    i.status,
                    i.tce_status,
                    i.admin_status,
                    i.created_at,
                    COALESCE(it.total_sales, 0) AS total_sales,
                    COALESCE(it.points, 0) AS points
                FROM invoices i
                LEFT JOIN invoice_totals it
                    ON it.invoice_id = i.invoice_id
                WHERE i.retailer_id = :retailer_id
                ORDER BY i.created_at DESC
                LIMIT 8;
                """
            ),
            {"retailer_id": retailer_id},
        ).mappings().all()

        redemptions = conn.execute(
            text(
                """
                SELECT
                    rr.redemption_id::text,
                    rr.status,
                    rr.created_at,
                    COALESCE(
                        STRING_AGG(
                            COALESCE(rew.related_product, 'Reward') || ' x' || ri.quantity::text,
                            ', '
                            ORDER BY rew.rwd_id
                        ),
                        'No reward items'
                    ) AS reward_items,
                    COALESCE(SUM(ri.quantity * ri.points_per_unit), 0) AS total_points
                FROM reward_redemptions rr
                LEFT JOIN redemption_items ri
                    ON ri.redemption_id = rr.redemption_id
                LEFT JOIN rewards rew
                    ON rew.reward_id = ri.reward_id
                WHERE rr.retailer_user_id = :retailer_id
                GROUP BY rr.redemption_id, rr.status, rr.created_at
                ORDER BY rr.created_at DESC
                LIMIT 8;
                """
            ),
            {"retailer_id": retailer_id},
        ).mappings().all()

    return {
        "retailer": clean_dict(dict(retailer)),
        "recentInvoices": [clean_dict(dict(row)) for row in invoices],
        "recentRedemptions": [clean_dict(dict(row)) for row in redemptions],
    }