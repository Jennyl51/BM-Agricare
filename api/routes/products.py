from fastapi import APIRouter
from db.products_db import fetch_products_list, fetch_product_detail

router = APIRouter(tags=["products"])

@router.get("/products")
def products_get():
    products = fetch_products_list()
    # Friendlier demo data for frontend while DB is not connected.
    if products and products[0].get("name", "").startswith("MOCK"):
        return [
            {"product_id": "esta-kieserite", "name": "ESTA Kieserite", "category": "Straight Fertilizers", "price": 120, "points_factor": 20, "image_url": "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=700&q=80", "description": "Magnesium and sulphur fertilizer for healthier crops."},
            {"product_id": "nitrophoska", "name": "Nitrophoska", "category": "Compound Fertilizers", "price": 100, "points_factor": 18, "image_url": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=700&q=80", "description": "Balanced nutrient support for field productivity."},
            {"product_id": "nova-tec-suprem", "name": "NovaTec Suprem", "category": "Premium Fertilizers", "price": 155, "points_factor": 22, "image_url": "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=700&q=80", "description": "Premium stabilized nitrogen technology."},
        ]
    return products

@router.get("/products/{product_id}")
def product_detail_get(product_id: str):
    return fetch_product_detail(product_id)
