from fastapi import APIRouter

router = APIRouter(prefix="/admin/analytics", tags=["Admin Analytics"])

@router.get("/summary")
def get_admin_summary():
    return {
        "pending_invoices": 10,
        "total_invoices": 368,
        "total_retailers": 2054,
        "reward_requests": 10,
        "total_sales": 128450,
        "points_issued": 84200,
    }

@router.get("/sales")
def get_sales_over_time(range: str = "month", group_by: str = "product"):
    data = {
        "week": [
            {"date": "Mon", "Entec": 1200, "Nitrophoska": 900, "Fertiganic": 600},
            {"date": "Tue", "Entec": 1500, "Nitrophoska": 1000, "Fertiganic": 700},
            {"date": "Wed", "Entec": 1000, "Nitrophoska": 1400, "Fertiganic": 800},
            {"date": "Thu", "Entec": 1800, "Nitrophoska": 1300, "Fertiganic": 900},
            {"date": "Fri", "Entec": 2200, "Nitrophoska": 1600, "Fertiganic": 1200},
        ],
        "month": [
            {"date": "Week 1", "Entec": 7500, "Nitrophoska": 5200, "Fertiganic": 3400},
            {"date": "Week 2", "Entec": 8200, "Nitrophoska": 6100, "Fertiganic": 4200},
            {"date": "Week 3", "Entec": 9000, "Nitrophoska": 7000, "Fertiganic": 4800},
            {"date": "Week 4", "Entec": 10400, "Nitrophoska": 7600, "Fertiganic": 5300},
        ],
        "year": [
            {"date": "Jan", "Entec": 22000, "Nitrophoska": 18000, "Fertiganic": 12000},
            {"date": "Feb", "Entec": 26000, "Nitrophoska": 21000, "Fertiganic": 15000},
            {"date": "Mar", "Entec": 30000, "Nitrophoska": 24000, "Fertiganic": 18000},
            {"date": "Apr", "Entec": 34000, "Nitrophoska": 28000, "Fertiganic": 21000},
            {"date": "May", "Entec": 39000, "Nitrophoska": 31000, "Fertiganic": 24000},
        ],
    }

    return {
        "range": range,
        "group_by": group_by,
        "data": data.get(range, data["month"]),
    }

@router.get("/tier-composition")
def get_tier_composition():
    return [
        {"region": "West", "bronze": 20, "silver": 45, "gold": 25, "premium": 10},
        {"region": "North", "bronze": 35, "silver": 40, "gold": 20, "premium": 5},
        {"region": "South", "bronze": 25, "silver": 50, "gold": 15, "premium": 10},
        {"region": "East", "bronze": 15, "silver": 35, "gold": 35, "premium": 15},
    ]