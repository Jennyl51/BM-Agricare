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
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    consultation_id = f"{data['retailer_id']}-{timestamp}"
    query = """
        INSERT INTO consultations (
        consultation_id
        location,
        retailer_id,
        tce_id,
        retailer_request,
        consultation_detail,
        created_at
        met
    )
    VALUES (
        :consultation_id,
        :location,
        :retailer_id,
        :tce_id,
        :retailer_request,
        :consultation_detail,
        timestamp
        FALSE 
    )
    RETURNING
        consultation_id,
        location,
        retailer_id,
        tce_id,
        retailer_request,
        consultation_detail,
        created_at
    """

    with engine.begin() as conn:
        result = conn.execute(text(query), {
        "consultation_id":   data["consultation_id"],
        "location":         data["location"],
        "retailer_id":      data["retailer_id"],
        "tce_id":           data["tce_id"],
        "retailer_request": data["retailer_request"],
        "met":              data["met"],
        "created_at":       timestamp
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
   query= """
        SELECT
            consultation_id,
            location,
            retailer_id,
            tce_id,
            retailer_request,
            met,
            created_at
        FROM consultations
        WHERE user_id = :user_id
        ORDER BY created_at DESC
   """
   with engine.connect() as conn:
        result = conn.execute(text(query), {"user_id": user_id})
        rows = result.mappings().all()
        return [dict(row) for row in rows]

   '''
   return [
        {
            "consultation_id": "mock_consultation_id_1",
            "title": f"Mock consultation for {user_id}",
            "date": "2099-01-01T00:00:00Z",
        }
    ]
   '''
    


def fetch_consultation_detail(consultation_id: str) -> Dict[str, Any]:
    query = """
        SELECT
            consultation_id,
            location,
            retailer_id,
            tce_id,
            retailer_request,
            consultation_detail,
            met,
            created_at
        FROM consultations
        WHERE consultation_id = :consultation_id
    """
    with engine.connect() as conn:
        result = conn.execute(text(query), {"consultation_id": consultation_id})
        row = result.mappings().first()
        return dict(row) if row else None

def fetch_tce_consultations() -> List[Dict[str, Any]]:
    query = """
        SELECT
            consultation_id,
            location,
            retailer_id,
            tce_id,
            retailer_request,
            met,
            created_at
        FROM consultations
        ORDER BY created_at DESC
    """
    with engine.connect() as conn:
        result = conn.execute(text(query))
        rows = result.mappings().all()
        return [dict(row) for row in rows]
    """
    return [
        {
            "consultation_id": "mock_consultation_id",
            "status": "pending",
        }
    ]
    """


def update_consultation(consultation_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:

    query = """
        UPDATE consultations
        SET
            location           = :location,
            retailer_request   = :retailer_request,
            consultation_detail = :consultation_detail,
            met                = :met
        WHERE consultation_id = :consultation_id
        RETURNING
            consultation_id,
            location,
            retailer_id,
            tce_id,
            retailer_request,
            consultation_detail,
            met,
            created_at
    """

    with engine.begin() as conn:
        result = conn.execute(text(query), {
            "consultation_id":    consultation_id,
            "location":           updates.get("location"),
            "retailer_request":   updates.get("retailer_request"),
            "consultation_detail": updates.get("consultation_detail"),
            "met":                updates.get("met"),
        })
        row = result.mappings().first()
        return dict(row) if row else None
    """
    return {
        "message": "Mock consultation updated",
        "consultation_id": consultation_id,
        "debug": updates,
        
    }
    """