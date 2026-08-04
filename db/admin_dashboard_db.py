from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from api.routes.database import get_engine


REGION = "us-east-2"
SECRET_NAME = "database-2"

engine = get_engine(SECRET_NAME, REGION)


def safe_int(value: Any) -> int:
    if value is None:
        return 0
    return int(value)


def safe_float(value: Any) -> float:
    if value is None:
        return 0.0
    return float(value)


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def get_summary_cards() -> Dict[str, Any]:
    """
    Dashboard summary numbers.

    Important:
    The real invoices table does not have total_sales or points columns.
    So total sales and issued points are calculated from invoice_items/products.
    """
    with engine.connect() as conn:
        invoice_summary = conn.execute(
            text(
                """
                WITH invoice_totals AS (
                    SELECT
                        i.invoice_id,
                        i.status,
                        COALESCE(
                            SUM(
                                COALESCE(ii.quantity, 0)
                                * COALESCE(ii.price_at_purchase, 0)
                            ),
                            0
                        ) AS invoice_sales,
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
                    GROUP BY i.invoice_id, i.status
                )
                SELECT
                    COUNT(*) AS total_invoices,
                    COUNT(*) FILTER (
                        WHERE LOWER(COALESCE(status, '')) = 'pending'
                    ) AS pending_invoices,
                    COALESCE(SUM(invoice_sales), 0) AS total_sales,
                    COALESCE(SUM(invoice_points), 0) AS points_issued
                FROM invoice_totals;
                """
            )
        ).mappings().first()

        retailer_summary = conn.execute(
            text(
                """
                SELECT COUNT(*) AS total_retailers
                FROM retailers;
                """
            )
        ).mappings().first()

        reward_requests = 0

        reward_result = conn.execute(
            text(
                """
                SELECT COUNT(*) AS reward_requests
                FROM reward_redemptions
                WHERE LOWER(COALESCE(status, '')) IN (
                    'requested',
                    'pending',
                    'processing',
                    'approved'
                );
                """
            )
        ).mappings().first()

        reward_requests = safe_int(reward_result["reward_requests"])

        return {
            "pendingInvoices": safe_int(invoice_summary["pending_invoices"]),
            "totalInvoices": safe_int(invoice_summary["total_invoices"]),
            "totalRetailers": safe_int(retailer_summary["total_retailers"]),
            "rewardRequests": reward_requests,
            "totalSales": safe_float(invoice_summary["total_sales"]),
            "pointsIssued": safe_int(invoice_summary["points_issued"]),
        }


def get_recent_invoices(limit: int = 8) -> List[Dict[str, Any]]:
    """
    Recent invoices with calculated total sales and points.
    """
    with engine.connect() as conn:
        rows = conn.execute(
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
                    GROUP BY i.invoice_id
                )
                SELECT
                    i.invoice_id,
                    i.retailer_id,
                    COALESCE(r.name, 'Retailer #' || i.retailer_id::text) AS retailer_name,
                    COALESCE(r.region, 'Unknown') AS region,
                    COALESCE(r.tier, 'Unknown') AS tier,
                    i.status,
                    i.created_at,
                    COALESCE(it.total_sales, 0) AS total_sales,
                    COALESCE(it.points, 0) AS points
                FROM invoices i
                LEFT JOIN invoice_totals it
                    ON it.invoice_id = i.invoice_id
                LEFT JOIN retailers r
                    ON r.user_id = i.retailer_id
                ORDER BY i.created_at DESC
                LIMIT :limit;
                """
            ),
            {"limit": limit},
        ).mappings().all()

        return [dict(row) for row in rows]


def get_top_retailers(limit: int = 5) -> List[Dict[str, Any]]:
    """
    Top retailers ranked by calculated invoice sales.
    """
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                WITH invoice_totals AS (
                    SELECT
                        i.invoice_id,
                        i.retailer_id,
                        COALESCE(
                            SUM(
                                COALESCE(ii.quantity, 0)
                                * COALESCE(ii.price_at_purchase, 0)
                            ),
                            0
                        ) AS invoice_sales
                    FROM invoices i
                    LEFT JOIN invoice_items ii
                        ON ii.invoice_id = i.invoice_id
                    GROUP BY i.invoice_id, i.retailer_id
                )
                SELECT
                    r.user_id,
                    COALESCE(r.name, 'Retailer #' || r.user_id::text) AS name,
                    r.phone_number,
                    COALESCE(r.tier, 'Unknown') AS tier,
                    COALESCE(r.total_points, 0) AS total_points,
                    r.assigned_tce_id,
                    COALESCE(r.region, 'Unknown') AS region,
                    COALESCE(SUM(it.invoice_sales), 0) AS total_sales,
                    COUNT(it.invoice_id) AS invoice_count
                FROM retailers r
                LEFT JOIN invoice_totals it
                    ON it.retailer_id = r.user_id
                GROUP BY
                    r.user_id,
                    r.name,
                    r.phone_number,
                    r.tier,
                    r.total_points,
                    r.assigned_tce_id,
                    r.region
                ORDER BY total_sales DESC
                LIMIT :limit;
                """
            ),
            {"limit": limit},
        ).mappings().all()

        return [dict(row) for row in rows]


def get_reward_requests(limit: int = 8) -> List[Dict[str, Any]]:
    """
    Recent reward redemption requests from the real rewards system.

    reward_redemptions = one redemption request/order
    redemption_items = line items inside that request
    rewards = redeemable reward products
    """
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT
                    rr.redemption_id::text AS order_id,
                    COALESCE(r.name, 'Retailer #' || rr.retailer_user_id::text) AS retailer_name,
                    COALESCE(
                        STRING_AGG(
                            COALESCE(rew.related_product, 'Reward') || ' x' || ri.quantity::text,
                            ', '
                            ORDER BY rew.rwd_id
                        ),
                        'No reward items'
                    ) AS gift_name,
                    rr.status,
                    rr.created_at,
                    COALESCE(SUM(ri.quantity * ri.points_per_unit), 0) AS total_points
                FROM reward_redemptions rr
                LEFT JOIN retailers r
                    ON r.user_id = rr.retailer_user_id
                LEFT JOIN redemption_items ri
                    ON ri.redemption_id = rr.redemption_id
                LEFT JOIN rewards rew
                    ON rew.reward_id = ri.reward_id
                GROUP BY
                    rr.redemption_id,
                    r.name,
                    rr.retailer_user_id,
                    rr.status,
                    rr.created_at
                ORDER BY rr.created_at DESC
                LIMIT :limit;
                """
            ),
            {"limit": limit},
        ).mappings().all()

        return [dict(row) for row in rows]


def get_sales_over_time() -> Dict[str, List[Dict[str, Any]]]:
    return {
        "week": get_sales_series(days_back=7, label_format="day"),
        "month": get_sales_series(days_back=30, label_format="week"),
        "year": get_sales_series(days_back=365, label_format="month"),
    }


def get_sales_series(days_back: int, label_format: str) -> List[Dict[str, Any]]:
    """
    Invoice sales chart data from invoice_items.

    This calculates invoice sales from:
    quantity * price_at_purchase

    Brand is normalized inside a CTE first, then grouped in the outer query.
    This avoids Postgres GROUP BY errors with p.brand / p.company.
    """
    start_date = utc_now() - timedelta(days=days_back)

    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                WITH line_sales AS (
                    SELECT
                        i.created_at::date AS sale_date,
                        COALESCE(
                            NULLIF(p.brand, ''),
                            NULLIF(p.company, ''),
                            CASE
                                WHEN LOWER(COALESCE(p.product_name, '')) LIKE '%entec%' THEN 'Entec'
                                WHEN LOWER(COALESCE(p.product_name, '')) LIKE '%nitrophoska%' THEN 'Nitrophoska'
                                WHEN LOWER(COALESCE(p.product_name, '')) LIKE '%fertiganic%' THEN 'Fertiganic'
                                WHEN LOWER(COALESCE(p.product_name, '')) LIKE '%novatec%' THEN 'Novatec'
                                WHEN LOWER(COALESCE(p.product_name, '')) LIKE '%yuroka%' THEN 'Yuroka'
                                WHEN LOWER(COALESCE(p.product_name, '')) LIKE '%gowin%' THEN 'Gowin'
                                WHEN LOWER(COALESCE(p.product_name, '')) LIKE '%growel%' THEN 'Growel'
                                ELSE 'Other'
                            END
                        ) AS brand,
                        COALESCE(ii.quantity, 0)
                        * COALESCE(ii.price_at_purchase, 0) AS line_total
                    FROM invoices i
                    JOIN invoice_items ii
                        ON ii.invoice_id = i.invoice_id
                    LEFT JOIN products p
                        ON p.product_id = ii.product_id
                    WHERE i.created_at >= :start_date
                      AND LOWER(COALESCE(i.status, '')) != 'rejected'
                )
                SELECT
                    sale_date,
                    brand,
                    COALESCE(SUM(line_total), 0) AS sales
                FROM line_sales
                GROUP BY sale_date, brand
                ORDER BY sale_date ASC;
                """
            ),
            {"start_date": start_date},
        ).mappings().all()

    grouped: Dict[str, Dict[str, Any]] = defaultdict(lambda: {"date": ""})

    for row in rows:
        sale_date = row["sale_date"]
        brand = row["brand"] or "Other"
        sales = safe_float(row["sales"])

        if label_format == "month":
            label = sale_date.strftime("%b")
        elif label_format == "week":
            week_number = ((sale_date.day - 1) // 7) + 1
            label = f"Week {week_number}"
        else:
            label = sale_date.strftime("%a")

        grouped[label]["date"] = label
        grouped[label][brand] = grouped[label].get(brand, 0) + sales

    return list(grouped.values())


def get_tier_composition_by_region() -> List[Dict[str, Any]]:
    """
    Retailer tier chart data.

    Only keeps BM Vietnam operating regions:
    - Mekong
    - Highland
    - LamDong
    - South East
    - North

    Uses diamond instead of premium because the real DB has diamond tiers.
    """
    valid_regions = ["Mekong", "Highland", "LamDong", "South East", "North"]

    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT
                    region,
                    LOWER(COALESCE(tier, 'bronze')) AS tier,
                    COUNT(*) AS retailer_count
                FROM retailers
                WHERE region IN ('Mekong', 'Highland', 'LamDong', 'South East', 'North')
                GROUP BY region, tier
                ORDER BY region ASC;
                """
            )
        ).mappings().all()

    grouped: Dict[str, Dict[str, Any]] = {
        region: {
            "region": region,
            "bronze": 0,
            "silver": 0,
            "gold": 0,
            "diamond": 0,
        }
        for region in valid_regions
    }

    for row in rows:
        region = row["region"]
        tier = row["tier"] or "bronze"
        retailer_count = safe_int(row["retailer_count"])

        if tier in ["bronze", "silver", "gold", "diamond"]:
            grouped[region][tier] += retailer_count
        elif tier == "premium":
            grouped[region]["diamond"] += retailer_count
        else:
            grouped[region]["bronze"] += retailer_count

    return list(grouped.values())


def get_admin_dashboard_overview() -> Dict[str, Any]:
    return {
        "summaryCards": get_summary_cards(),
        "recentInvoices": get_recent_invoices(),
        "topRetailers": get_top_retailers(),
        "rewardRequests": get_reward_requests(),
        "salesOverTime": get_sales_over_time(),
        "tierCompositionByRegion": get_tier_composition_by_region(),
    }