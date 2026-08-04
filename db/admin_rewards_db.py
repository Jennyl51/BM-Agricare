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


def ensure_admin_reward_schema() -> None:
    with engine.begin() as conn:
        conn.execute(text("""
            ALTER TABLE rewards
            ADD COLUMN IF NOT EXISTS reward_name TEXT,
            ADD COLUMN IF NOT EXISTS description TEXT,
            ADD COLUMN IF NOT EXISTS min_tier TEXT DEFAULT 'Bronze',
            ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 100,
            ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
            ADD COLUMN IF NOT EXISTS admin_notes TEXT,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP WITH TIME ZONE,
            ADD COLUMN IF NOT EXISTS unpinned_at TIMESTAMP WITH TIME ZONE;
        """))

        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS reward_activity_log (
                log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                reward_id UUID REFERENCES rewards(reward_id) ON DELETE CASCADE,
                action TEXT NOT NULL,
                comment TEXT,
                admin_email TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
        """))

        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS reward_pin_schedules (
                schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                reward_id UUID REFERENCES rewards(reward_id) ON DELETE CASCADE,
                action TEXT NOT NULL CHECK (action IN ('pin', 'unpin')),
                scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
                status TEXT DEFAULT 'scheduled',
                notes TEXT,
                created_by TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
        """))


def log_reward_activity(
    conn,
    reward_id: str,
    action: str,
    admin_email: Optional[str],
    comment: Optional[str] = None,
) -> None:
    conn.execute(
        text("""
            INSERT INTO reward_activity_log (
                reward_id,
                action,
                comment,
                admin_email
            )
            VALUES (
                :reward_id,
                :action,
                :comment,
                :admin_email
            );
        """),
        {
            "reward_id": reward_id,
            "action": action,
            "comment": comment,
            "admin_email": admin_email,
        },
    )


def reward_select_sql() -> str:
    return """
        SELECT
            reward_id::text AS reward_id,
            rwd_id,
            COALESCE(reward_name, related_product, 'Reward') AS name,
            related_product,
            COALESCE(
                description,
                'Redeem points for ' || COALESCE(related_product, reward_name, 'this reward') || '.'
            ) AS description,
            COALESCE(points_needed, 0) AS points_required,
            COALESCE(min_tier, 'Bronze') AS min_tier,
            COALESCE(stock_quantity, 100) AS stock_quantity,
            image_url,
            COALESCE(is_pinned, FALSE) AS is_pinned,
            COALESCE(is_seasonal, FALSE) AS is_seasonal,
            COALESCE(is_visible, TRUE) AS is_visible,
            CASE
                WHEN COALESCE(is_visible, TRUE) = FALSE THEN 'Hidden'
                ELSE COALESCE(status, 'Active')
            END AS status,
            admin_notes,
            created_at,
            updated_at,
            pinned_at,
            unpinned_at
        FROM rewards
    """


def list_admin_rewards(include_hidden: bool = True) -> Dict[str, Any]:
    ensure_admin_reward_schema()

    where_sql = ""
    if not include_hidden:
        where_sql = "WHERE COALESCE(is_visible, TRUE) = TRUE"

    with engine.connect() as conn:
        rows = conn.execute(
            text(f"""
                {reward_select_sql()}
                {where_sql}
                ORDER BY
                    COALESCE(is_pinned, FALSE) DESC,
                    COALESCE(is_seasonal, FALSE) DESC,
                    COALESCE(rwd_id, 999999) ASC,
                    COALESCE(reward_name, related_product, 'Reward') ASC;
            """)
        ).mappings().all()

        summary = conn.execute(text("""
            SELECT
                COUNT(*) AS total_rewards,
                COUNT(*) FILTER (WHERE COALESCE(is_visible, TRUE) = TRUE) AS visible_rewards,
                COUNT(*) FILTER (WHERE COALESCE(is_visible, TRUE) = FALSE) AS hidden_rewards,
                COUNT(*) FILTER (WHERE COALESCE(is_pinned, FALSE) = TRUE) AS pinned_rewards,
                COUNT(*) FILTER (WHERE COALESCE(is_seasonal, FALSE) = TRUE) AS seasonal_rewards
            FROM rewards;
        """)).mappings().first()

    return {
        "summary": clean_dict(dict(summary or {})),
        "rewards": [clean_dict(dict(row)) for row in rows],
    }


def get_admin_reward_detail(reward_id: str) -> Dict[str, Any]:
    ensure_admin_reward_schema()

    with engine.connect() as conn:
        reward = conn.execute(
            text(f"""
                {reward_select_sql()}
                WHERE reward_id = :reward_id
                LIMIT 1;
            """),
            {"reward_id": reward_id},
        ).mappings().first()

        if not reward:
            raise HTTPException(status_code=404, detail="Reward not found.")

        stats = conn.execute(
            text("""
                SELECT
                    COUNT(DISTINCT ri.redemption_id) AS redemption_count,
                    COALESCE(SUM(ri.quantity), 0) AS quantity_redeemed,
                    COALESCE(SUM(ri.quantity * ri.points_per_unit), 0) AS points_deducted,
                    COUNT(DISTINCT rr.retailer_user_id) AS unique_retailers
                FROM redemption_items ri
                JOIN reward_redemptions rr
                    ON rr.redemption_id = ri.redemption_id
                WHERE ri.reward_id = :reward_id;
            """),
            {"reward_id": reward_id},
        ).mappings().first()

        redemptions = conn.execute(
            text("""
                SELECT
                    rr.redemption_id::text AS redemption_id,
                    rr.retailer_user_id::text AS retailer_user_id,
                    rr.status,
                    rr.created_at,
                    ri.quantity,
                    ri.points_per_unit,
                    ri.quantity * ri.points_per_unit AS points_deducted
                FROM redemption_items ri
                JOIN reward_redemptions rr
                    ON rr.redemption_id = ri.redemption_id
                WHERE ri.reward_id = :reward_id
                ORDER BY rr.created_at DESC
                LIMIT 20;
            """),
            {"reward_id": reward_id},
        ).mappings().all()

        activity = conn.execute(
            text("""
                SELECT
                    log_id::text AS log_id,
                    action,
                    comment,
                    admin_email,
                    created_at
                FROM reward_activity_log
                WHERE reward_id = :reward_id
                ORDER BY created_at DESC
                LIMIT 30;
            """),
            {"reward_id": reward_id},
        ).mappings().all()

        schedules = conn.execute(
            text("""
                SELECT
                    schedule_id::text AS schedule_id,
                    action,
                    scheduled_at,
                    status,
                    notes,
                    created_by,
                    created_at
                FROM reward_pin_schedules
                WHERE reward_id = :reward_id
                ORDER BY scheduled_at ASC
                LIMIT 20;
            """),
            {"reward_id": reward_id},
        ).mappings().all()

    reward_dict = clean_dict(dict(reward))

    synthetic_activity = [
        {
            "log_id": "created",
            "action": "created",
            "comment": "Reward record created.",
            "admin_email": None,
            "created_at": reward_dict.get("created_at"),
        }
    ]

    return {
        "reward": reward_dict,
        "stats": clean_dict(dict(stats or {})),
        "recentRedemptions": [clean_dict(dict(row)) for row in redemptions],
        "activityLog": [clean_dict(dict(row)) for row in activity] + synthetic_activity,
        "pinSchedules": [clean_dict(dict(row)) for row in schedules],
    }


def next_rwd_id(conn) -> int:
    value = conn.execute(text("""
        SELECT COALESCE(MAX(rwd_id), 9000) + 1
        FROM rewards;
    """)).scalar()

    return int(value or 9001)


def create_admin_reward(payload: Dict[str, Any], admin_email: str) -> Dict[str, Any]:
    ensure_admin_reward_schema()

    name = str(payload.get("name") or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Reward name is required.")

    with engine.begin() as conn:
        rwd_id = payload.get("rwd_id") or next_rwd_id(conn)

        row = conn.execute(
            text("""
                INSERT INTO rewards (
                    rwd_id,
                    reward_name,
                    related_product,
                    description,
                    points_needed,
                    min_tier,
                    stock_quantity,
                    image_url,
                    is_pinned,
                    is_seasonal,
                    is_visible,
                    status,
                    admin_notes,
                    updated_at
                )
                VALUES (
                    :rwd_id,
                    :reward_name,
                    :related_product,
                    :description,
                    :points_needed,
                    :min_tier,
                    :stock_quantity,
                    :image_url,
                    :is_pinned,
                    :is_seasonal,
                    :is_visible,
                    :status,
                    :admin_notes,
                    now()
                )
                RETURNING reward_id::text AS reward_id;
            """),
            {
                "rwd_id": rwd_id,
                "reward_name": name,
                "related_product": payload.get("related_product") or name,
                "description": payload.get("description") or f"Redeem points for {name}.",
                "points_needed": int(payload.get("points_required") or 150),
                "min_tier": payload.get("min_tier") or "Bronze",
                "stock_quantity": int(payload.get("stock_quantity") or 100),
                "image_url": payload.get("image_url"),
                "is_pinned": bool(payload.get("is_pinned") or False),
                "is_seasonal": bool(payload.get("is_seasonal") or False),
                "is_visible": bool(payload.get("is_visible", True)),
                "status": payload.get("status") or "Active",
                "admin_notes": payload.get("admin_notes"),
            },
        ).mappings().first()

        reward_id = row["reward_id"]
        log_reward_activity(
            conn,
            reward_id=reward_id,
            action="created",
            admin_email=admin_email,
            comment="Reward created from BM admin dashboard.",
        )

    return get_admin_reward_detail(reward_id)["reward"]


def update_admin_reward(
    reward_id: str,
    payload: Dict[str, Any],
    admin_email: str,
) -> Dict[str, Any]:
    ensure_admin_reward_schema()

    allowed = {
        "name": "reward_name",
        "related_product": "related_product",
        "description": "description",
        "points_required": "points_needed",
        "min_tier": "min_tier",
        "stock_quantity": "stock_quantity",
        "image_url": "image_url",
        "is_pinned": "is_pinned",
        "is_seasonal": "is_seasonal",
        "is_visible": "is_visible",
        "status": "status",
        "admin_notes": "admin_notes",
    }

    updates = {}
    for frontend_key, db_column in allowed.items():
        if frontend_key in payload:
            updates[db_column] = payload[frontend_key]

    if not updates:
        return get_admin_reward_detail(reward_id)["reward"]

    assignments = ", ".join([f"{column} = :{column}" for column in updates.keys()])
    updates["reward_id"] = reward_id

    with engine.begin() as conn:
        result = conn.execute(
            text(f"""
                UPDATE rewards
                SET
                    {assignments},
                    updated_at = now()
                WHERE reward_id = :reward_id;
            """),
            updates,
        )

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Reward not found.")

        log_reward_activity(
            conn,
            reward_id=reward_id,
            action="updated",
            admin_email=admin_email,
            comment=payload.get("comment") or "Reward information updated.",
        )

    return get_admin_reward_detail(reward_id)["reward"]


def set_reward_visible(
    reward_id: str,
    is_visible: bool,
    admin_email: str,
) -> Dict[str, Any]:
    with engine.begin() as conn:
        result = conn.execute(
            text("""
                UPDATE rewards
                SET
                    is_visible = :is_visible,
                    status = CASE WHEN :is_visible THEN 'Active' ELSE 'Hidden' END,
                    updated_at = now()
                WHERE reward_id = :reward_id;
            """),
            {"reward_id": reward_id, "is_visible": is_visible},
        )

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Reward not found.")

        log_reward_activity(
            conn,
            reward_id,
            "visibility_changed",
            admin_email,
            "Reward shown to retailers." if is_visible else "Reward hidden from retailers.",
        )

    return get_admin_reward_detail(reward_id)["reward"]


def set_reward_pinned(
    reward_id: str,
    is_pinned: bool,
    admin_email: str,
) -> Dict[str, Any]:
    with engine.begin() as conn:
        result = conn.execute(
            text("""
                UPDATE rewards
                SET
                    is_pinned = :is_pinned,
                    pinned_at = CASE WHEN :is_pinned THEN now() ELSE pinned_at END,
                    unpinned_at = CASE WHEN :is_pinned THEN unpinned_at ELSE now() END,
                    updated_at = now()
                WHERE reward_id = :reward_id;
            """),
            {"reward_id": reward_id, "is_pinned": is_pinned},
        )

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Reward not found.")

        log_reward_activity(
            conn,
            reward_id,
            "pinned" if is_pinned else "unpinned",
            admin_email,
            "Reward pinned to the top of retailer rewards page."
            if is_pinned
            else "Reward unpinned from retailer rewards page.",
        )

    return get_admin_reward_detail(reward_id)["reward"]


def add_reward_activity_note(
    reward_id: str,
    comment: str,
    admin_email: str,
) -> Dict[str, Any]:
    if not comment.strip():
        raise HTTPException(status_code=400, detail="Comment is required.")

    with engine.begin() as conn:
        exists = conn.execute(
            text("SELECT reward_id FROM rewards WHERE reward_id = :reward_id"),
            {"reward_id": reward_id},
        ).first()

        if not exists:
            raise HTTPException(status_code=404, detail="Reward not found.")

        log_reward_activity(
            conn,
            reward_id,
            "comment",
            admin_email,
            comment.strip(),
        )

    return get_admin_reward_detail(reward_id)


def create_reward_pin_schedule(
    reward_id: str,
    action: str,
    scheduled_at: str,
    notes: Optional[str],
    admin_email: str,
) -> Dict[str, Any]:
    if action not in ("pin", "unpin"):
        raise HTTPException(status_code=400, detail="action must be pin or unpin.")

    with engine.begin() as conn:
        exists = conn.execute(
            text("SELECT reward_id FROM rewards WHERE reward_id = :reward_id"),
            {"reward_id": reward_id},
        ).first()

        if not exists:
            raise HTTPException(status_code=404, detail="Reward not found.")

        conn.execute(
            text("""
                INSERT INTO reward_pin_schedules (
                    reward_id,
                    action,
                    scheduled_at,
                    notes,
                    created_by
                )
                VALUES (
                    :reward_id,
                    :action,
                    :scheduled_at,
                    :notes,
                    :created_by
                );
            """),
            {
                "reward_id": reward_id,
                "action": action,
                "scheduled_at": scheduled_at,
                "notes": notes,
                "created_by": admin_email,
            },
        )

        log_reward_activity(
            conn,
            reward_id,
            "pin_schedule_created",
            admin_email,
            f"Scheduled reward to {action} at {scheduled_at}.",
        )

    return get_admin_reward_detail(reward_id)


def delete_admin_reward(reward_id: str, admin_email: str) -> Dict[str, Any]:
    with engine.begin() as conn:
        used_count = conn.execute(
            text("""
                SELECT COUNT(*)
                FROM redemption_items
                WHERE reward_id = :reward_id;
            """),
            {"reward_id": reward_id},
        ).scalar()

        if int(used_count or 0) > 0:
            raise HTTPException(
                status_code=409,
                detail=(
                    "This reward already has redemption history. "
                    "Hide it instead of permanently deleting it."
                ),
            )

        result = conn.execute(
            text("""
                DELETE FROM rewards
                WHERE reward_id = :reward_id;
            """),
            {"reward_id": reward_id},
        )

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Reward not found.")

    return {"ok": True, "deleted_reward_id": reward_id}