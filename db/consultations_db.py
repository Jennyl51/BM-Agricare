from typing import List, Dict, Any
from datetime import datetime

#NEED TO IMPLEMENT ACTUAL DB QUERIES HERE, THIS IS JUST MOCK DATA
def create_consultation_request(data: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "consultation_id": "mock_consultation_id",
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "debug": {
            "note": "THIS IS MOCK DATA",
            "input": data,
        },
    }


def fetch_consultations_by_user(user_id: str) -> List[Dict[str, Any]]:
    return [
        {
            "consultation_id": "mock_consultation_id_1",
            "title": f"Mock consultation for {user_id}",
            "date": "2099-01-01T00:00:00Z",
        }
    ]


def fetch_consultation_detail(consultation_id: str) -> Dict[str, Any]:
    return {
        "consultation_id": consultation_id,
        "title": "MOCK CONSULTATION TITLE",
        "body": "mock_problem_description",
        "notes": "mock_notes_from_tce",
        "status": "pending",
        "date": "2099-01-01T00:00:00Z",
    }


def fetch_tce_consultations() -> List[Dict[str, Any]]:
    return [
        {
            "consultation_id": "mock_consultation_id",
            "status": "pending",
        }
    ]


def update_consultation(consultation_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "message": "Mock consultation updated",
        "consultation_id": consultation_id,
        "debug": updates,
    }