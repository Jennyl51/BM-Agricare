import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(PROJECT_ROOT))

import random
import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Set

from sqlalchemy import text

from api.routes.database import get_engine


REGION = "us-east-2"
SECRET_NAME = "database-2"

engine = get_engine(SECRET_NAME, REGION)

VALID_REGIONS = ["Mekong", "Highland", "LamDong", "South East", "North"]

STATUSES = ["approved", "approved", "approved", "approved", "pending", "rejected"]

DEMO_PHOTO_PREFIX = "/demo-invoices/bm-demo-invoice"


def get_columns(conn, table_name: str) -> Set[str]:
    rows = conn.execute(
        text(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = :table_name;
            """
        ),
        {"table_name": table_name},
    ).fetchall()

    return {row[0] for row in rows}


def insert_dynamic(conn, table_name: str, data: Dict[str, Any]) -> None:
    columns = list(data.keys())
    column_sql = ", ".join(columns)
    value_sql = ", ".join([f":{column}" for column in columns])

    conn.execute(
        text(
            f"""
            INSERT INTO {table_name} ({column_sql})
            VALUES ({value_sql});
            """
        ),
        data,
    )


def fetch_retailers(conn) -> List[Dict[str, Any]]:
    rows = conn.execute(
        text(
            """
            SELECT
                user_id,
                region,
                assigned_tce_id
            FROM retailers
            WHERE region IN ('Mekong', 'Highland', 'LamDong', 'South East', 'North')
            ORDER BY user_id;
            """
        )
    ).mappings().all()

    retailers = [dict(row) for row in rows]

    if retailers:
        return retailers

    fallback_rows = conn.execute(
        text(
            """
            SELECT
                user_id,
                region,
                assigned_tce_id
            FROM retailers
            ORDER BY user_id
            LIMIT 30;
            """
        )
    ).mappings().all()

    return [dict(row) for row in fallback_rows]


def fetch_products(conn) -> List[Dict[str, Any]]:
    rows = conn.execute(
        text(
            """
            SELECT
                product_id,
                product_name,
                point_factor
            FROM products
            ORDER BY product_id;
            """
        )
    ).mappings().all()

    return [dict(row) for row in rows]


def delete_previous_demo_invoices(conn, invoice_columns: Set[str]) -> None:
    """
    Delete only invoices created by this seed script.

    Your real schema uses photo_url, not invoice_photo_url.
    """
    if "photo_url" not in invoice_columns:
        print("Skipping previous demo delete because photo_url column does not exist.")
        return

    demo_invoice_rows = conn.execute(
        text(
            """
            SELECT invoice_id
            FROM invoices
            WHERE photo_url LIKE :prefix;
            """
        ),
        {"prefix": f"{DEMO_PHOTO_PREFIX}%"},
    ).fetchall()

    demo_invoice_ids = [row[0] for row in demo_invoice_rows]

    if not demo_invoice_ids:
        print("No previous demo invoices found.")
        return

    conn.execute(
        text(
            """
            DELETE FROM invoice_items
            WHERE invoice_id = ANY(:invoice_ids);
            """
        ),
        {"invoice_ids": demo_invoice_ids},
    )

    conn.execute(
        text(
            """
            DELETE FROM invoices
            WHERE invoice_id = ANY(:invoice_ids);
            """
        ),
        {"invoice_ids": demo_invoice_ids},
    )

    print(f"Deleted {len(demo_invoice_ids)} previous demo invoices.")


def main() -> None:
    random.seed(42)

    with engine.begin() as conn:
        invoice_columns = get_columns(conn, "invoices")
        invoice_item_columns = get_columns(conn, "invoice_items")

        retailers = fetch_retailers(conn)
        products = fetch_products(conn)

        if not retailers:
            raise RuntimeError("No retailers found. Seed retailers first.")

        if not products:
            raise RuntimeError("No products found. Seed products first.")

        print(f"Found {len(retailers)} retailers.")
        print(f"Found {len(products)} products.")
        print(f"Invoices columns: {sorted(invoice_columns)}")
        print(f"Invoice items columns: {sorted(invoice_item_columns)}")

        delete_previous_demo_invoices(conn, invoice_columns)

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        created_count = 0
        created_items_count = 0

        for index in range(1, 101):
            invoice_id = str(uuid.uuid4())
            retailer = random.choice(retailers)

            days_back = random.randint(0, 364)
            created_at = now - timedelta(days=days_back)
            status = random.choice(STATUSES)

            item_count = random.randint(1, 4)
            selected_products = random.sample(products, k=min(item_count, len(products)))

            invoice_total_amount = 0
            invoice_total_points = 0
            prepared_items: List[Dict[str, Any]] = []

            for product in selected_products:
                quantity = random.randint(3, 30)
                price = random.choice(
                    [
                        150000,
                        180000,
                        220000,
                        250000,
                        280000,
                        320000,
                        360000,
                        420000,
                    ]
                )

                point_factor = int(product.get("point_factor") or 0)
                subtotal = quantity * price
                points = quantity * point_factor

                invoice_total_amount += subtotal
                invoice_total_points += points

                prepared_items.append(
                    {
                        "product_id": product["product_id"],
                        "quantity": quantity,
                        "price_at_purchase": price,
                    }
                )

            invoice_data: Dict[str, Any] = {}

            if "invoice_id" in invoice_columns:
                invoice_data["invoice_id"] = invoice_id

            if "invoice_number" in invoice_columns:
                invoice_data["invoice_number"] = f"DEMO-{index:04d}"

            if "retailer_id" in invoice_columns:
                invoice_data["retailer_id"] = retailer["user_id"]

            if "assigned_tce_id" in invoice_columns:
                invoice_data["assigned_tce_id"] = retailer.get("assigned_tce_id")

            if "region" in invoice_columns:
                invoice_data["region"] = retailer.get("region") or random.choice(VALID_REGIONS)

            if "photo_url" in invoice_columns:
                invoice_data["photo_url"] = f"{DEMO_PHOTO_PREFIX}-{index:03d}.jpg"

            if "status" in invoice_columns:
                invoice_data["status"] = status

            if "total_amount" in invoice_columns:
                invoice_data["total_amount"] = invoice_total_amount

            if "total_points" in invoice_columns:
                invoice_data["total_points"] = invoice_total_points

            if "approved_by" in invoice_columns:
                invoice_data["approved_by"] = (
                    retailer.get("assigned_tce_id") if status == "approved" else None
                )

            if "created_at" in invoice_columns:
                invoice_data["created_at"] = created_at

            insert_dynamic(conn, "invoices", invoice_data)
            created_count += 1

            for item in prepared_items:
                item_data: Dict[str, Any] = {}

                if "item_id" in invoice_item_columns:
                    item_data["item_id"] = str(uuid.uuid4())

                if "invoice_id" in invoice_item_columns:
                    item_data["invoice_id"] = invoice_id

                if "product_id" in invoice_item_columns:
                    item_data["product_id"] = item["product_id"]

                if "quantity" in invoice_item_columns:
                    item_data["quantity"] = item["quantity"]

                if "price_at_purchase" in invoice_item_columns:
                    item_data["price_at_purchase"] = item["price_at_purchase"]

                insert_dynamic(conn, "invoice_items", item_data)
                created_items_count += 1

        print(f"Created {created_count} demo invoices.")
        print(f"Created {created_items_count} demo invoice items.")
        print("Done.")


if __name__ == "__main__":
    main()