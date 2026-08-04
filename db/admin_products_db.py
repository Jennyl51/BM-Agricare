from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
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


def get_product_columns() -> set[str]:
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'products';
                """
            )
        ).fetchall()

    return {row[0] for row in rows}


def ensure_product_admin_columns() -> None:
    """
    These are safe because ADD COLUMN IF NOT EXISTS will not overwrite existing data.
    """
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                ALTER TABLE products
                ADD COLUMN IF NOT EXISTS brand TEXT,
                ADD COLUMN IF NOT EXISTS company TEXT,
                ADD COLUMN IF NOT EXISTS weight TEXT,
                ADD COLUMN IF NOT EXISTS formula TEXT,
                ADD COLUMN IF NOT EXISTS category_group TEXT,
                ADD COLUMN IF NOT EXISTS sub_cat TEXT,
                ADD COLUMN IF NOT EXISTS short_desc TEXT,
                ADD COLUMN IF NOT EXISTS nutrients TEXT,
                ADD COLUMN IF NOT EXISTS key_features TEXT,
                ADD COLUMN IF NOT EXISTS application TEXT,
                ADD COLUMN IF NOT EXISTS image_url TEXT,
                ADD COLUMN IF NOT EXISTS brand_image_url TEXT,
                ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
                ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT FALSE;
                """
            )
        )


def normalize_product_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    product_columns = get_product_columns()

    allowed_data = {
        "product_name": payload.get("product_name"),
        "brand": payload.get("brand"),
        "company": payload.get("company") or payload.get("brand"),
        "weight": payload.get("weight"),
        "formula": payload.get("formula"),
        "category_group": payload.get("category_group") or "Fertilizer",
        "category": payload.get("category"),
        "sub_cat": payload.get("sub_cat"),
        "point_factor": payload.get("point_factor"),
        "price": payload.get("price"),
        "short_desc": payload.get("short_desc"),
        "description": payload.get("description"),
        "nutrients": payload.get("nutrients"),
        "key_features": payload.get("key_features"),
        "application": payload.get("application"),
        "image_url": payload.get("image_url"),
        "brand_image_url": payload.get("brand_image_url"),
        "is_active": payload.get("is_active"),
        "is_seasonal": payload.get("is_seasonal"),
    }

    cleaned: Dict[str, Any] = {}

    for key, value in allowed_data.items():
        if key not in product_columns:
            continue

        if value is None:
            continue

        if key in {"point_factor", "price"}:
            cleaned[key] = int(value or 0)
        elif key in {"is_active", "is_seasonal"}:
            cleaned[key] = bool(value)
        else:
            cleaned[key] = str(value).strip()

    return cleaned


def list_admin_products(include_inactive: bool = False) -> List[Dict[str, Any]]:
    ensure_product_admin_columns()

    where_sql = ""
    if not include_inactive:
        where_sql = "WHERE COALESCE(is_active, TRUE) = TRUE"

    with engine.connect() as conn:
        rows = conn.execute(
            text(
                f"""
                SELECT
                    product_id::text AS product_id,
                    product_name,
                    COALESCE(NULLIF(brand, ''), NULLIF(company, ''), 'Unknown') AS brand,
                    company,
                    weight,
                    formula,
                    category_group,
                    category,
                    sub_cat,
                    COALESCE(point_factor, 0) AS point_factor,
                    COALESCE(price, 0) AS price,
                    short_desc,
                    description,
                    nutrients,
                    key_features,
                    application,
                    image_url,
                    brand_image_url,
                    COALESCE(is_active, TRUE) AS is_active,
                    COALESCE(is_seasonal, FALSE) AS is_seasonal
                FROM products
                {where_sql}
                ORDER BY
                    COALESCE(NULLIF(brand, ''), NULLIF(company, ''), 'Unknown') ASC,
                    product_name ASC;
                """
            )
        ).mappings().all()

    return [clean_dict(dict(row)) for row in rows]


def get_admin_product(product_id: str) -> Dict[str, Any]:
    ensure_product_admin_columns()

    with engine.connect() as conn:
        row = conn.execute(
            text(
                """
                SELECT
                    product_id::text AS product_id,
                    product_name,
                    COALESCE(NULLIF(brand, ''), NULLIF(company, ''), 'Unknown') AS brand,
                    company,
                    weight,
                    formula,
                    category_group,
                    category,
                    sub_cat,
                    COALESCE(point_factor, 0) AS point_factor,
                    COALESCE(price, 0) AS price,
                    short_desc,
                    description,
                    nutrients,
                    key_features,
                    application,
                    image_url,
                    brand_image_url,
                    COALESCE(is_active, TRUE) AS is_active,
                    COALESCE(is_seasonal, FALSE) AS is_seasonal
                FROM products
                WHERE product_id = :product_id
                LIMIT 1;
                """
            ),
            {"product_id": product_id},
        ).mappings().first()

    if not row:
        raise HTTPException(status_code=404, detail="Product not found.")

    return clean_dict(dict(row))


def create_admin_product(payload: Dict[str, Any]) -> Dict[str, Any]:
    ensure_product_admin_columns()

    product_name = str(payload.get("product_name") or "").strip()
    if not product_name:
        raise HTTPException(status_code=400, detail="Product name is required.")

    data = normalize_product_payload(
        {
            **payload,
            "is_active": payload.get("is_active", True),
            "is_seasonal": payload.get("is_seasonal", False),
        }
    )

    if "product_name" not in data:
        data["product_name"] = product_name

    columns = list(data.keys())
    column_sql = ", ".join(columns)
    value_sql = ", ".join([f":{column}" for column in columns])

    with engine.begin() as conn:
        row = conn.execute(
            text(
                f"""
                INSERT INTO products ({column_sql})
                VALUES ({value_sql})
                RETURNING product_id::text AS product_id;
                """
            ),
            data,
        ).mappings().first()

    return get_admin_product(row["product_id"])


def update_admin_product(product_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    ensure_product_admin_columns()

    existing = get_admin_product(product_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found.")

    data = normalize_product_payload(payload)

    if not data:
        return get_admin_product(product_id)

    assignments = ", ".join([f"{column} = :{column}" for column in data.keys()])

    with engine.begin() as conn:
        conn.execute(
            text(
                f"""
                UPDATE products
                SET {assignments}
                WHERE product_id = :product_id;
                """
            ),
            {
                **data,
                "product_id": product_id,
            },
        )

    return get_admin_product(product_id)


def set_admin_product_active(product_id: str, is_active: bool) -> Dict[str, Any]:
    ensure_product_admin_columns()

    with engine.begin() as conn:
        result = conn.execute(
            text(
                """
                UPDATE products
                SET is_active = :is_active
                WHERE product_id = :product_id;
                """
            ),
            {
                "product_id": product_id,
                "is_active": is_active,
            },
        )

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Product not found.")

    return get_admin_product(product_id)

def get_admin_product_metrics(product_id: str) -> Dict[str, Any]:
    product = get_admin_product(product_id)

    with engine.connect() as conn:
        summary = conn.execute(
            text(
                """
                SELECT
                    COUNT(DISTINCT i.invoice_id) AS invoice_count,
                    COALESCE(SUM(COALESCE(ii.quantity, 0)), 0) AS units_sold,
                    COALESCE(
                        SUM(
                            COALESCE(ii.quantity, 0)
                            * COALESCE(p.point_factor, 0)
                        ),
                        0
                    ) AS points_issued,
                    COALESCE(
                        SUM(
                            COALESCE(ii.quantity, 0)
                            * COALESCE(ii.price_at_purchase, 0)
                        ),
                        0
                    ) AS total_sales
                FROM invoice_items ii
                JOIN invoices i
                    ON i.invoice_id = ii.invoice_id
                LEFT JOIN products p
                    ON p.product_id = ii.product_id
                WHERE ii.product_id = :product_id;
                """
            ),
            {"product_id": product_id},
        ).mappings().first()

        monthly_rows = conn.execute(
            text(
                """
                SELECT
                    TO_CHAR(DATE_TRUNC('month', i.created_at), 'Mon YYYY') AS month,
                    COALESCE(SUM(COALESCE(ii.quantity, 0)), 0) AS units_sold,
                    COUNT(DISTINCT i.invoice_id) AS invoice_count,
                    COALESCE(
                        SUM(
                            COALESCE(ii.quantity, 0)
                            * COALESCE(p.point_factor, 0)
                        ),
                        0
                    ) AS points_issued
                FROM invoice_items ii
                JOIN invoices i
                    ON i.invoice_id = ii.invoice_id
                LEFT JOIN products p
                    ON p.product_id = ii.product_id
                WHERE ii.product_id = :product_id
                GROUP BY DATE_TRUNC('month', i.created_at)
                ORDER BY DATE_TRUNC('month', i.created_at) ASC;
                """
            ),
            {"product_id": product_id},
        ).mappings().all()

    return {
        "product": product,
        "summary": clean_dict(dict(summary or {})),
        "monthlyUnits": [clean_dict(dict(row)) for row in monthly_rows],
    }

def delete_admin_product(product_id: str) -> Dict[str, Any]:
    """
    Permanently deletes a product only if it is not referenced by invoice_items,
    rewards, or redemption history.

    If referenced, this returns a clear error and the admin should hide it instead.
    """
    with engine.begin() as conn:
        reference_count = conn.execute(
            text(
                """
                SELECT
                    (
                        SELECT COUNT(*)
                        FROM invoice_items
                        WHERE product_id = :product_id
                    )
                    +
                    (
                        SELECT COUNT(*)
                        FROM rewards
                        WHERE related_product IN (
                            SELECT product_name FROM products WHERE product_id = :product_id
                        )
                    ) AS reference_count;
                """
            ),
            {"product_id": product_id},
        ).scalar()

        if int(reference_count or 0) > 0:
            raise HTTPException(
                status_code=409,
                detail=(
                    "This product is already connected to invoices or rewards. "
                    "Hide the product instead of permanently deleting it."
                ),
            )

        result = conn.execute(
            text(
                """
                DELETE FROM products
                WHERE product_id = :product_id;
                """
            ),
            {"product_id": product_id},
        )

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Product not found.")

    return {"ok": True, "deleted_product_id": product_id}