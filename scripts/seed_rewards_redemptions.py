# Create mock redemption rows
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(PROJECT_ROOT))

import random
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Set

from sqlalchemy import text

from api.routes.database import get_engine


REGION = "us-east-2"
SECRET_NAME = "database-2"

engine = get_engine(SECRET_NAME, REGION)

VALID_REWARD_BRANDS = ["Entec", "Nitrophoska", "Novatec"]
VALID_REGIONS = ["Mekong", "Highland", "LamDong", "South East", "North"]

DEMO_REWARD_START_ID = 9001
DEMO_NOTES_PREFIX = "DEMO_REWARD_SEED"

REDEMPTION_STATUSES = [
    "pending",
    "pending",
    "pending",
    "approved",
    "approved",
    "fulfilled",
    "rejected",
]


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def get_columns(conn, table_name: str) -> Set[str]:
    rows = conn.execute(
        text(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = :table_name
            ORDER BY ordinal_position;
            """
        ),
        {"table_name": table_name},
    ).fetchall()

    return {row[0] for row in rows}


def get_column_types(conn, table_name: str) -> Dict[str, str]:
    rows = conn.execute(
        text(
            """
            SELECT column_name, udt_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = :table_name;
            """
        ),
        {"table_name": table_name},
    ).mappings().all()

    return {row["column_name"]: row["udt_name"] for row in rows}


def print_table_columns(conn, table_name: str) -> None:
    rows = conn.execute(
        text(
            """
            SELECT
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = :table_name
            ORDER BY ordinal_position;
            """
        ),
        {"table_name": table_name},
    ).mappings().all()

    print(f"\n=== {table_name} columns ===")
    for row in rows:
        print(
            f"{row['column_name']}: {row['data_type']}, "
            f"nullable={row['is_nullable']}, "
            f"default={row['column_default']}"
        )


def filter_to_existing_columns(data: Dict[str, Any], columns: Set[str]) -> Dict[str, Any]:
    return {key: value for key, value in data.items() if key in columns}


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


def update_dynamic(conn, table_name: str, id_column: str, id_value: Any, data: Dict[str, Any]) -> None:
    assignments = ", ".join([f"{column} = :{column}" for column in data.keys()])

    conn.execute(
        text(
            f"""
            UPDATE {table_name}
            SET {assignments}
            WHERE {id_column} = :id_value;
            """
        ),
        {
            **data,
            "id_value": id_value,
        },
    )


def fetch_products_for_rewards(conn) -> List[Dict[str, Any]]:
    rows = conn.execute(
        text(
            """
            SELECT
                product_id,
                product_name,
                COALESCE(NULLIF(brand, ''), NULLIF(company, ''), product_name) AS brand,
                point_factor,
                image_url
            FROM products
            WHERE LOWER(COALESCE(brand, company, product_name, '')) LIKE '%entec%'
               OR LOWER(COALESCE(brand, company, product_name, '')) LIKE '%nitrophoska%'
               OR LOWER(COALESCE(brand, company, product_name, '')) LIKE '%novatec%'
               OR LOWER(COALESCE(product_name, '')) LIKE '%entec%'
               OR LOWER(COALESCE(product_name, '')) LIKE '%nitrophoska%'
               OR LOWER(COALESCE(product_name, '')) LIKE '%novatec%'
            ORDER BY brand, product_name
            LIMIT 10;
            """
        )
    ).mappings().all()

    products = [dict(row) for row in rows]

    if len(products) < 10:
        print(
            f"Warning: found only {len(products)} Entec/Nitrophoska/NovaTec products. "
            "The script will seed that many reward items."
        )

    return products


def fetch_retailers(conn) -> List[Dict[str, Any]]:
    rows = conn.execute(
        text(
            """
            SELECT
                user_id,
                name,
                phone_number,
                region,
                tier,
                total_points
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
                name,
                phone_number,
                region,
                tier,
                total_points
            FROM retailers
            ORDER BY user_id
            LIMIT 30;
            """
        )
    ).mappings().all()

    return [dict(row) for row in fallback_rows]


def delete_previous_demo_redemptions(conn, redemption_columns: Set[str]) -> None:
    if "notes" not in redemption_columns:
        print("Skipping old demo redemption delete because reward_redemptions.notes does not exist.")
        return

    old_ids = conn.execute(
        text(
            """
            SELECT redemption_id
            FROM reward_redemptions
            WHERE notes LIKE :notes_prefix;
            """
        ),
        {"notes_prefix": f"{DEMO_NOTES_PREFIX}%"},
    ).fetchall()

    redemption_ids = [row[0] for row in old_ids]

    if not redemption_ids:
        print("No previous demo reward redemptions found.")
        return

    conn.execute(
        text(
            """
            DELETE FROM redemption_items
            WHERE redemption_id = ANY(:redemption_ids);
            """
        ),
        {"redemption_ids": redemption_ids},
    )

    conn.execute(
        text(
            """
            DELETE FROM reward_redemptions
            WHERE redemption_id = ANY(:redemption_ids);
            """
        ),
        {"redemption_ids": redemption_ids},
    )

    print(f"Deleted {len(redemption_ids)} previous demo redemption requests.")


def upsert_demo_rewards(
    conn,
    products: List[Dict[str, Any]],
    reward_columns: Set[str],
    reward_types: Dict[str, str],
) -> List[Dict[str, Any]]:
    seeded_rewards: List[Dict[str, Any]] = []

    for index, product in enumerate(products, start=0):
        demo_rwd_id = DEMO_REWARD_START_ID + index
        reward_id = str(uuid.uuid4())

        product_name = product["product_name"]
        point_factor = int(product.get("point_factor") or 1)
        points_needed = max(100, point_factor * 120)

        reward_name = f"{product_name} Reward Pack"
        image_url = product.get("image_url") or ""

        existing_reward_id: Optional[Any] = None

        if "rwd_id" in reward_columns:
            existing = conn.execute(
                text(
                    """
                    SELECT reward_id
                    FROM rewards
                    WHERE rwd_id = :rwd_id
                    LIMIT 1;
                    """
                ),
                {"rwd_id": demo_rwd_id},
            ).first()

            if existing:
                existing_reward_id = existing[0]

        if not existing_reward_id:
            name_column = None
            for possible_name_column in ["name", "reward_name", "title"]:
                if possible_name_column in reward_columns:
                    name_column = possible_name_column
                    break

            if name_column:
                existing = conn.execute(
                    text(
                        f"""
                        SELECT reward_id
                        FROM rewards
                        WHERE LOWER({name_column}) = LOWER(:reward_name)
                        LIMIT 1;
                        """
                    ),
                    {"reward_name": reward_name},
                ).first()

                if existing:
                    existing_reward_id = existing[0]

        raw_reward_data = {
            "reward_id": existing_reward_id or reward_id,
            "rwd_id": demo_rwd_id,
            "name": reward_name,
            "reward_name": reward_name,
            "title": reward_name,
            "description": f"Retailers can redeem points for {product_name} as a promoted product reward.",
            "points_needed": points_needed,
            "points_required": points_needed,
            "points_cost": points_needed,
            "stock_quantity": 80,
            "quantity_available": 80,
            "inventory": 80,
            "related_product": product_name,
            "related_product_id": product["product_id"],
            "product_id": product["product_id"],
            "image_url": image_url,
            "status": "active",
            "is_pinned": index < 3,
            "is_seasonal": False,
            "is_visible": True,
            "created_at": utc_now(),
            "updated_at": utc_now(),
        }

        reward_data = filter_to_existing_columns(raw_reward_data, reward_columns)

        # If reward_id is UUID and exists, keep UUID string. If reward_id has a default,
        # including it is still okay.
        if "reward_id" in reward_columns and "reward_id" not in reward_data:
            reward_data["reward_id"] = reward_id

        if existing_reward_id:
            update_data = {
                key: value
                for key, value in reward_data.items()
                if key != "reward_id"
            }
            update_dynamic(conn, "rewards", "reward_id", existing_reward_id, update_data)
            final_reward_id = existing_reward_id
        else:
            insert_dynamic(conn, "rewards", reward_data)
            final_reward_id = reward_data.get("reward_id", reward_id)

        seeded_rewards.append(
            {
                "reward_id": final_reward_id,
                "reward_name": reward_name,
                "points_needed": points_needed,
                "image_url": image_url,
                "product_name": product_name,
            }
        )

    return seeded_rewards


def insert_demo_redemptions(
    conn,
    rewards: List[Dict[str, Any]],
    retailers: List[Dict[str, Any]],
    redemption_columns: Set[str],
    item_columns: Set[str],
) -> None:
    if not rewards:
        raise RuntimeError("No rewards available to seed redemption items.")

    if not retailers:
        raise RuntimeError("No retailers available to seed reward redemptions.")

    now = utc_now()
    redemption_count = 0
    redemption_item_count = 0

    # 20 redemption requests, exactly 50 item rows:
    # first 10 requests have 3 items, next 10 requests have 2 items.
    item_counts = [3] * 10 + [2] * 10

    for request_index in range(20):
        redemption_id = str(uuid.uuid4())
        retailer = random.choice(retailers)
        created_at = now - timedelta(days=random.randint(0, 90))
        updated_at = created_at + timedelta(days=random.randint(0, 7))
        status = random.choice(REDEMPTION_STATUSES)

        selected_rewards = random.sample(
            rewards,
            k=min(item_counts[request_index], len(rewards)),
        )

        item_rows = []
        total_points = 0

        for reward in selected_rewards:
            quantity = random.choice([1, 1, 1, 2])
            points_per_unit = int(reward["points_needed"])
            total_points += quantity * points_per_unit

            item_rows.append(
                {
                    "redemption_id": redemption_id,
                    "reward_id": reward["reward_id"],
                    "quantity": quantity,
                    "points_per_unit": points_per_unit,
                }
            )

        raw_redemption_data = {
            "redemption_id": redemption_id,
            "retailer_user_id": retailer["user_id"],
            "retailer_id": retailer["user_id"],
            "user_id": retailer["user_id"],
            "status": status,
            "total_points": total_points,
            "points_used": total_points,
            "points_spent": total_points,
            "retailer_name": retailer.get("name"),
            "retailer_phone": retailer.get("phone_number"),
            "retailer_location": retailer.get("region"),
            "notes": f"{DEMO_NOTES_PREFIX} request {request_index + 1:02d}",
            "created_at": created_at,
            "updated_at": updated_at,
        }

        redemption_data = filter_to_existing_columns(raw_redemption_data, redemption_columns)

        insert_dynamic(conn, "reward_redemptions", redemption_data)
        redemption_count += 1

        for item in item_rows:
            item_data = filter_to_existing_columns(item, item_columns)
            insert_dynamic(conn, "redemption_items", item_data)
            redemption_item_count += 1

    print(f"Created demo redemption requests: {redemption_count}")
    print(f"Created demo redemption item rows: {redemption_item_count}")


def main() -> None:
    random.seed(88)

    with engine.begin() as conn:
        reward_columns = get_columns(conn, "rewards")
        reward_types = get_column_types(conn, "rewards")
        redemption_columns = get_columns(conn, "reward_redemptions")
        item_columns = get_columns(conn, "redemption_items")

        print_table_columns(conn, "rewards")
        print_table_columns(conn, "reward_redemptions")
        print_table_columns(conn, "redemption_items")

        products = fetch_products_for_rewards(conn)
        retailers = fetch_retailers(conn)

        print(f"\nProducts available for reward seeding: {len(products)}")
        print(f"Retailers available for redemption seeding: {len(retailers)}")

        if not products:
            raise RuntimeError(
                "No Entec/Nitrophoska/NovaTec products found. Run sync_product_catalog.py first."
            )

        if not retailers:
            raise RuntimeError("No retailers found.")

        delete_previous_demo_redemptions(conn, redemption_columns)

        seeded_rewards = upsert_demo_rewards(
            conn=conn,
            products=products,
            reward_columns=reward_columns,
            reward_types=reward_types,
        )

        print(f"Upserted demo rewards: {len(seeded_rewards)}")

        insert_demo_redemptions(
            conn=conn,
            rewards=seeded_rewards,
            retailers=retailers,
            redemption_columns=redemption_columns,
            item_columns=item_columns,
        )

        print("\nReward items will reuse product images:")
        print("-" * 72)

        for reward in seeded_rewards:
            print(f"{reward['reward_name']} -> {reward['image_url']}")

        print("-" * 72)
        print("Done.")


if __name__ == "__main__":
    main()