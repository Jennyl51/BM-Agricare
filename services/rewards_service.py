from enum import Enum
from typing import Any, Dict, List, Optional

from fastapi import HTTPException

from db.rewards_db import (
    create_reward_redemption_request,
    fetch_points_history_by_user_id,
    fetch_redemption_history_by_user_id,
    fetch_reward_list,
    fetch_tce_redemption_detail,
    fetch_tce_redemptions_to_process,
    update_tce_redemption_request as db_update_tce_redemption_request,
)


class RedemptionStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


def get_rewards_list() -> List[Dict[str, Any]]:
    return fetch_reward_list()


def get_points_history_for_user(user_id: str) -> List[Dict[str, Any]]:
    return fetch_points_history_by_user_id(user_id)


def create_redemption_request(
    user_id: str,
    items: List[Dict[str, Any]],
    retailer_location: Optional[str],
) -> Dict[str, Any]:
    if not items:
        raise HTTPException(status_code=400, detail={"message": "At least one item is required", "code": "EMPTY_ITEMS"})
    return create_reward_redemption_request(user_id=user_id, items=items, retailer_location=retailer_location)


def get_my_redemptions(user_id: str) -> List[Dict[str, Any]]:
    return fetch_redemption_history_by_user_id(user_id)


def get_tce_redemptions_to_process(pending_only: bool = True) -> List[Dict[str, Any]]:
    return fetch_tce_redemptions_to_process(pending_only=pending_only)


def get_tce_redemption_detail(redemption_id: str) -> Dict[str, Any]:
    detail = fetch_tce_redemption_detail(redemption_id=redemption_id)
    if not detail:
        raise HTTPException(status_code=404, detail={"message": "Redemption not found", "code": "REDEMPTION_NOT_FOUND"})
    return detail


def update_tce_redemption_request(
    redemption_id: str,
    status: Optional[str],
    task_done: Optional[bool],
    notes: Optional[str],
) -> Dict[str, Any]:
    if status is None and task_done is None and notes is None:
        raise HTTPException(status_code=400, detail={"message": "No fields to update", "code": "NO_FIELDS"})
    return db_update_tce_redemption_request(
        redemption_id=redemption_id,
        status=status,
        task_done=task_done,
        notes=notes,
    )

