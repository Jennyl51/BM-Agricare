from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy import text
from database import get_engine
SECRET_NAME = "database-2"
REGION = "us-east-2"
engine = get_engine(SECRET_NAME, REGION)

'''
for create: 
INSERT INTO [table_name] 
(
 all the columns that you are inserting the values 
)
VALUES (
    :placeholder if value is coming from the dictionary being passed in each function
)




'''
#NEED TO IMPLEMENT ACTUAL DB QUERIES HERE, THIS IS JUST MOCK DATA
def create_consultation_request(data: Dict[str, Any]) -> Dict[str, Any]:

    # no actual consultation data yet so just a mock or test structure for creating
    # met will always be false when consultation is first made 
    query = """
        INSERT INTO consultations (
        location,
        retailer_id,
        tce_id,
        retailer_request,
        met
    )
    VALUES (
        :location,
        :retailer_id,
        :tce_id,
        :retailer_request
        FALSE 
    )
    RETURNING
        consultation_id,
        location,
        retailer_id,
        tce_id,
        retailer_request,
        created_at

    """

    with engine.begin() as conn:
        result = conn.execute(text(query), {
        "location":         data["location"],
        "retailer_id":      data["retailer_id"],
        "tce_id":           data["tce_id"],
        "retailer_request": data["retailer_request"],
    })
    row = result.mappings().first()
    return dict(row) if row else None
    
    '''return {
        "consultation_id": "mock_consultation_id",
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "debug": {
            "note": "THIS IS MOCK DATA",
            "input": data,
        },
    '''



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