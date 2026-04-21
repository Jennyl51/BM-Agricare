"""
DB query functions for Rewards/Points/Redemptions.

IMPORTANT (assignment):
- Keep these function names stable (services call them).
- The outputs are intentionally obvious mock data for now.
"""


from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

#NEED TO IMPLEMENT ACTUAL DB QUERIES HERE, THIS IS JUST MOCK DATA
def fetch_reward_list() -> List[Dict[str, Any]]:
    return [
        {
            "reward_id": "mock_reward_id_1",
            "name": "Mock Reward (T-Shirt)",
            "points_needed": 100,
            "quantity_available": 999,
            "tier_requirement": "bronze",
        },
        {
            "reward_id": "mock_reward_id_2",
            "name": "Mock Reward (Cap)",
            "points_needed": 50,
            "quantity_available": None,
            "tier_requirement": "bronze",
        },
    ]


def fetch_points_history_by_user_id(user_id: str) -> List[Dict[str, Any]]:
    now = datetime.now(timezone.utc).isoformat()
    return [
        {
            "points_earned": 123,
            "points_redeemed": 0,
            "description": f"Mock earn for user {user_id}",
            "occurred_at": now,
        },
        {
            "points_earned": 0,
            "points_redeemed": 45,
            "description": "Mock redemption spend",
            "occurred_at": now,
        },
    ]


def create_reward_redemption_request(
    user_id: str,
    items: List[Dict[str, Any]],
    retailer_location: Optional[str],
) -> Dict[str, Any]:
    return {
        "redemption_id": "mock_redemption_id",
        "status": "pending",
        "points_spent": -99999,
        "debug": {"user_id": user_id, "items": items, "retailer_location": retailer_location},
    }


def fetch_redemption_history_by_user_id(user_id: str) -> List[Dict[str, Any]]:
    now = datetime.now(timezone.utc).isoformat()
    return [
        {
            "redemption_id": "mock_redemption_id",
            "created_at": now,
            "status": "pending",
            "task_done": False,
        }
    ]


def fetch_tce_redemptions_to_process(pending_only: bool = True) -> List[Dict[str, Any]]:
    return [
        {"redemption_id": "mock_redemption_id", "status": "pending" if pending_only else "delivered"},
    ]


def fetch_tce_redemption_detail(redemption_id: str) -> Dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    return {
        "redemption_id": redemption_id,
        "status": "pending",
        "task_done": False,
        "retailer_user_id": "mock_user_id",
        "retailer_username": "mock_username",
        "retailer_location": "mock_location",
        "notes": "mock_notes",
        "created_at": now,
        "updated_at": now,
        "items": [
            {
                "reward_id": "mock_reward_id_1",
                "name": "Mock Reward (T-Shirt)",
                "quantity": 1,
                "points_per_unit": 100,
            }
        ],
    }


def update_tce_redemption_request(
    redemption_id: str,
    status: Optional[str],
    task_done: Optional[bool],
    notes: Optional[str],
) -> Dict[str, Any]:
    return {
        "message": "Redemption updated",
        "redemption_id": redemption_id,
        "debug": {"status": status, "task_done": task_done, "notes": notes},
    }

