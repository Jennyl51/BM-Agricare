from typing import List, Dict, Any

#NEED TO IMPLEMENT ACTUAL DB QUERIES HERE, THIS IS JUST MOCK DATA
def create_invoice_submission(data: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "invoice_id": "mock_invoice_id",
        "status": "pending",
        "submitted_at": "2099-01-01T00:00:00Z",
        "points_awarded": -9999,
        "debug": {
            "note": "MOCK INVOICE CREATED",
            "input": data,
        },
    }


def fetch_invoices(user_id: str) -> List[Dict[str, Any]]:
    return [
        {
            "invoice_id": "mock_invoice_id",
            "retailer_id": user_id,
            "invoice_timestamp": "2099-01-01T00:00:00Z",
            "status": "pending",
            "invoice_photo_url": "https://mock.url/invoice.jpg",
        }
    ]


def fetch_invoice_detail(invoice_id: str) -> Dict[str, Any]:
    return {
        "invoice_id": invoice_id,
        "retailer_id": "mock_user_id",
        "invoice_photo_url": "https://mock.url/invoice.jpg",
        "gps_lat": -999.0,
        "gps_lon": -999.0,
        "status": "pending",
        "items": [
            {
                "product_id": "mock_product_id",
                "quantity": -999,
                "price": -999,
            }
        ],
    }


def update_invoice_status(invoice_id: str, status: str) -> Dict[str, Any]:
    return {
        "message": "Mock invoice status updated",
        "invoice_id": invoice_id,
        "status": status,
    }