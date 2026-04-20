from typing import List, Dict, Any

#NEED TO IMPLEMENT ACTUAL DB QUERIES HERE, THIS IS JUST MOCK DATA
def fetch_tce_retailers() -> List[Dict[str, Any]]:
    return [
        {
            "retailer_id": "mock_retailer_id",
            "name": "MOCK RETAILER",
            "location": "mock_location",
            "contact": "000-000-0000",
        }
    ]


def fetch_retailer_detail(retailer_id: str) -> Dict[str, Any]:
    return {
        "retailer_id": retailer_id,
        "name": "MOCK RETAILER DETAIL",
        "tier": "bronze",
        "location": "mock_location",
        "total_points": -9999,
    }


def fetch_tce_tasks() -> List[Dict[str, Any]]:
    return [
        {
            "task_id": "mock_task_id",
            "category": "mock_task_category",
            "status": "pending",
            "due_date": "2099-01-01",
        }
    ]


def fetch_admin_dashboard() -> Dict[str, Any]:
    return {
        "total_users": -9999,
        "pending_invoices": -999,
        "pending_redemptions": -999,
        "top_products": ["MOCK_PRODUCT"],
        "active_region": "mock_region",
    }


def update_product(product_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "message": "Mock product updated",
        "product_id": product_id,
        "debug": updates,
    }


def create_reward(data: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "reward_id": "mock_reward_id",
        "message": "Mock reward created",
        "debug": data,
    }


def update_reward(reward_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "message": "Mock reward updated",
        "reward_id": reward_id,
        "debug": updates,
    }