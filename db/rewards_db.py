"""
DB query functions for Rewards / Points / Redemptions.

This file is the database layer for rewards-related features.
Routes call services, services call these functions.

Flow:
api/routes/rewards.py
→ services/rewards_service.py
→ db/rewards_db.py
→ AWS RDS PostgreSQL
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError, ProgrammingError

from api.routes.database import get_engine


REGION = "us-east-2"
SECRET_NAME = "database-2"

engine = get_engine(SECRET_NAME, REGION)


TIER_RANK = {
    "bronze": 0,
    "silver": 1,
    "gold": 2,
    "diamond": 3,
    "platinum": 4,
}


def _tier_meets(user_tier: Optional[str], required_tier: Optional[str]) -> bool:
    user_value = (user_tier or "bronze").lower()
    required_value = (required_tier or "bronze").lower()
    return TIER_RANK.get(user_value, 0) >= TIER_RANK.get(required_value, 0)


def _iso(value: Any) -> Optional[str]:
    return value.isoformat() if value else None


def fetch_reward_list() -> List[Dict[str, Any]]:
    """
    Return all active + visible rewards for the retailer rewards page.
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text(
                    """
                    SELECT
                        reward_id::text,
                        rwd_id,
                        name,
                        points_needed,
                        quantity_available,
                        tier_requirement,
                        description,
                        related_product,
                        image_url,
                        is_pinned,
                        is_seasonal,
                        is_visible
                    FROM rewards
                    WHERE active = TRUE
                      AND is_visible = TRUE
                      AND rwd_id IS NOT NULL
                    ORDER BY is_pinned DESC, rwd_id ASC;
                    """
                )
            )
            return [dict(row) for row in result.mappings().all()]

    except ProgrammingError as e:
        raise HTTPException(
            status_code=503,
            detail={
                "message": "Rewards table missing or not migrated",
                "code": "REWARDS_TABLE_ERROR",
            },
        ) from e


def fetch_points_history_by_user_id(user_id: str) -> List[Dict[str, Any]]:
    """
    Return points history for one retailer.
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text(
                    """
                    SELECT
                        points_earned,
                        points_redeemed,
                        description,
                        created_at AS occurred_at
                    FROM points_ledger
                    WHERE retailer_user_id = :user_id
                    ORDER BY created_at DESC;
                    """
                ),
                {"user_id": user_id},
            )

            rows = []
            for row in result.mappings().all():
                item = dict(row)
                item["occurred_at"] = _iso(item["occurred_at"])
                rows.append(item)

            return rows

    except ProgrammingError as e:
        raise HTTPException(
            status_code=503,
            detail={
                "message": "Points ledger table missing or not migrated",
                "code": "POINTS_TABLE_ERROR",
            },
        ) from e


def create_reward_redemption_request(
    user_id: str,
    items: List[Dict[str, Any]],
    retailer_location: Optional[str],
) -> Dict[str, Any]:
    """
    Create a reward redemption request.

    Steps:
    1. Merge duplicate reward IDs.
    2. Check retailer profile, tier, and points.
    3. Check reward status, tier requirement, and stock.
    4. Insert reward_redemptions row.
    5. Insert redemption_items rows.
    6. Decrease stock if stock is not unlimited.
    7. Add points_ledger redeemed row.
    8. Deduct retailer total_points.
    """
    if not items:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "At least one item is required",
                "code": "EMPTY_ITEMS",
            },
        )

    merged: Dict[str, int] = {}

    for item in items:
        reward_id = item["reward_id"]
        quantity = int(item["quantity"])

        if quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Quantity must be greater than 0",
                    "code": "INVALID_QUANTITY",
                },
            )

        merged[reward_id] = merged.get(reward_id, 0) + quantity

    try:
        with engine.begin() as conn:
            retailer = conn.execute(
                text(
                    """
                    SELECT
                        user_id::text,
                        tier,
                        total_points
                    FROM retailers
                    WHERE user_id = :user_id;
                    """
                ),
                {"user_id": user_id},
            ).mappings().first()

            if not retailer:
                raise HTTPException(
                    status_code=404,
                    detail={
                        "message": "Retailer profile not found",
                        "code": "RETAILER_NOT_FOUND",
                    },
                )

            user_tier = retailer["tier"] or "bronze"
            current_points = int(retailer["total_points"] or 0)

            total_cost = 0
            reward_lines: List[Dict[str, Any]] = []

            for reward_id, quantity in merged.items():
                reward = conn.execute(
                    text(
                        """
                        SELECT
                            reward_id::text,
                            name,
                            points_needed,
                            quantity_available,
                            tier_requirement,
                            active,
                            is_visible
                        FROM rewards
                        WHERE reward_id = :reward_id
                        FOR UPDATE;
                        """
                    ),
                    {"reward_id": reward_id},
                ).mappings().first()

                if not reward or not reward["active"] or not reward["is_visible"]:
                    raise HTTPException(
                        status_code=404,
                        detail={
                            "message": f"Reward not found or inactive: {reward_id}",
                            "code": "REWARD_NOT_FOUND",
                        },
                    )

                if not _tier_meets(user_tier, reward["tier_requirement"]):
                    raise HTTPException(
                        status_code=400,
                        detail={
                            "message": f"Tier too low for reward: {reward['name']}",
                            "code": "TIER_TOO_LOW",
                        },
                    )

                available = reward["quantity_available"]

                if available is not None and int(available) < quantity:
                    raise HTTPException(
                        status_code=400,
                        detail={
                            "message": f"Insufficient stock for reward: {reward['name']}",
                            "code": "INSUFFICIENT_STOCK",
                        },
                    )

                points_per_unit = int(reward["points_needed"])
                line_cost = points_per_unit * quantity
                total_cost += line_cost

                reward_lines.append(
                    {
                        "reward_id": reward_id,
                        "quantity": quantity,
                        "points_per_unit": points_per_unit,
                        "name": reward["name"],
                    }
                )

            if current_points < total_cost:
                raise HTTPException(
                    status_code=400,
                    detail={
                        "message": f"Insufficient points: need {total_cost}, have {current_points}",
                        "code": "INSUFFICIENT_POINTS",
                    },
                )

            redemption = conn.execute(
                text(
                    """
                    INSERT INTO reward_redemptions (
                        retailer_user_id,
                        status,
                        task_done,
                        retailer_location,
                        notes
                    )
                    VALUES (
                        :retailer_user_id,
                        'pending',
                        FALSE,
                        :retailer_location,
                        NULL
                    )
                    RETURNING redemption_id::text;
                    """
                ),
                {
                    "retailer_user_id": user_id,
                    "retailer_location": retailer_location,
                },
            ).mappings().first()

            redemption_id = redemption["redemption_id"]

            for line in reward_lines:
                conn.execute(
                    text(
                        """
                        INSERT INTO redemption_items (
                            redemption_id,
                            reward_id,
                            quantity,
                            points_per_unit
                        )
                        VALUES (
                            :redemption_id,
                            :reward_id,
                            :quantity,
                            :points_per_unit
                        );
                        """
                    ),
                    {
                        "redemption_id": redemption_id,
                        "reward_id": line["reward_id"],
                        "quantity": line["quantity"],
                        "points_per_unit": line["points_per_unit"],
                    },
                )

                conn.execute(
                    text(
                        """
                        UPDATE rewards
                        SET quantity_available = quantity_available - :quantity
                        WHERE reward_id = :reward_id
                          AND quantity_available IS NOT NULL;
                        """
                    ),
                    {
                        "reward_id": line["reward_id"],
                        "quantity": line["quantity"],
                    },
                )

            conn.execute(
                text(
                    """
                    INSERT INTO points_ledger (
                        retailer_user_id,
                        points_earned,
                        points_redeemed,
                        description,
                        redemption_id
                    )
                    VALUES (
                        :retailer_user_id,
                        0,
                        :points_redeemed,
                        :description,
                        :redemption_id
                    );
                    """
                ),
                {
                    "retailer_user_id": user_id,
                    "points_redeemed": total_cost,
                    "description": "Reward redemption",
                    "redemption_id": redemption_id,
                },
            )

            conn.execute(
                text(
                    """
                    UPDATE retailers
                    SET total_points = total_points - :points_spent
                    WHERE user_id = :user_id;
                    """
                ),
                {
                    "points_spent": total_cost,
                    "user_id": user_id,
                },
            )

            return {
                "redemption_id": redemption_id,
                "status": "pending",
                "points_spent": total_cost,
            }

    except HTTPException:
        raise
    except IntegrityError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "message": str(e),
                "code": "INTEGRITY_ERROR",
            },
        ) from e
    except ProgrammingError as e:
        raise HTTPException(
            status_code=503,
            detail={
                "message": "Rewards/redemption tables missing or not migrated",
                "code": "REDEMPTION_TABLE_ERROR",
            },
        ) from e


def fetch_redemption_history_by_user_id(user_id: str) -> List[Dict[str, Any]]:
    """
    Return redemption history for one retailer.
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text(
                    """
                    SELECT
                        redemption_id::text,
                        created_at,
                        status,
                        task_done
                    FROM reward_redemptions
                    WHERE retailer_user_id = :user_id
                    ORDER BY created_at DESC;
                    """
                ),
                {"user_id": user_id},
            )

            rows = []
            for row in result.mappings().all():
                item = dict(row)
                item["created_at"] = _iso(item["created_at"])
                rows.append(item)

            return rows

    except ProgrammingError as e:
        raise HTTPException(
            status_code=503,
            detail={
                "message": "Redemptions table missing or not migrated",
                "code": "REDEMPTIONS_TABLE_ERROR",
            },
        ) from e


def fetch_tce_redemptions_to_process(pending_only: bool = True) -> List[Dict[str, Any]]:
    """
    Return redemption tasks for TCE users.
    """
    try:
        with engine.connect() as conn:
            if pending_only:
                query = text(
                    """
                    SELECT
                        redemption_id::text,
                        status
                    FROM reward_redemptions
                    WHERE status IN ('pending', 'processing')
                       OR task_done = FALSE
                    ORDER BY created_at ASC;
                    """
                )
            else:
                query = text(
                    """
                    SELECT
                        redemption_id::text,
                        status
                    FROM reward_redemptions
                    ORDER BY created_at DESC;
                    """
                )

            result = conn.execute(query)
            return [dict(row) for row in result.mappings().all()]

    except ProgrammingError as e:
        raise HTTPException(
            status_code=503,
            detail={
                "message": "Redemptions table missing or not migrated",
                "code": "REDEMPTIONS_TABLE_ERROR",
            },
        ) from e


def fetch_tce_redemption_detail(redemption_id: str) -> Dict[str, Any]:
    """
    Return one redemption request with its reward items.
    """
    try:
        with engine.connect() as conn:
            redemption = conn.execute(
                text(
                    """
                    SELECT
                        rr.redemption_id::text,
                        rr.status,
                        rr.task_done,
                        rr.retailer_user_id::text,
                        ret.username AS retailer_username,
                        rr.retailer_location,
                        rr.notes,
                        rr.created_at,
                        rr.updated_at
                    FROM reward_redemptions rr
                    LEFT JOIN retailers ret
                        ON ret.user_id = rr.retailer_user_id
                    WHERE rr.redemption_id = :redemption_id;
                    """
                ),
                {"redemption_id": redemption_id},
            ).mappings().first()

            if not redemption:
                return {}

            items = conn.execute(
                text(
                    """
                    SELECT
                        ri.reward_id::text,
                        r.name,
                        ri.quantity,
                        ri.points_per_unit
                    FROM redemption_items ri
                    JOIN rewards r
                        ON r.reward_id = ri.reward_id
                    WHERE ri.redemption_id = :redemption_id;
                    """
                ),
                {"redemption_id": redemption_id},
            ).mappings().all()

            data = dict(redemption)
            data["created_at"] = _iso(data["created_at"])
            data["updated_at"] = _iso(data["updated_at"])
            data["items"] = [dict(item) for item in items]

            return data

    except ProgrammingError as e:
        raise HTTPException(
            status_code=503,
            detail={
                "message": "Redemption detail query failed",
                "code": "REDEMPTION_DETAIL_ERROR",
            },
        ) from e


def update_tce_redemption_request(
    redemption_id: str,
    status: Optional[str],
    task_done: Optional[bool],
    notes: Optional[str],
) -> Dict[str, Any]:
    """
    Update one TCE redemption task.
    """
    updates: Dict[str, Any] = {}

    if status is not None:
        updates["status"] = status
    if task_done is not None:
        updates["task_done"] = task_done
    if notes is not None:
        updates["notes"] = notes

    if not updates:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "No fields to update",
                "code": "NO_FIELDS",
            },
        )

    set_clause = ", ".join(f"{key} = :{key}" for key in updates.keys())
    updates["redemption_id"] = redemption_id

    try:
        with engine.begin() as conn:
            result = conn.execute(
                text(
                    f"""
                    UPDATE reward_redemptions
                    SET {set_clause},
                        updated_at = NOW()
                    WHERE redemption_id = :redemption_id;
                    """
                ),
                updates,
            )

            if result.rowcount == 0:
                raise HTTPException(
                    status_code=404,
                    detail={
                        "message": "Redemption not found",
                        "code": "REDEMPTION_NOT_FOUND",
                    },
                )

            return {
                "message": "Redemption updated",
                "redemption_id": redemption_id,
            }

    except HTTPException:
        raise
    except ProgrammingError as e:
        raise HTTPException(
            status_code=503,
            detail={
                "message": "Redemption update failed",
                "code": "REDEMPTION_UPDATE_ERROR",
            },
        ) from e