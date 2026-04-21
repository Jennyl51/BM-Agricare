from typing import List, Dict, Any, Optional
from sqlalchemy import text

from database import get_engine
SECRET_NAME = "database-2"
REGION = "us-east-2"
engine = get_engine(SECRET_NAME, REGION)

# #NEED TO IMPLEMENT ACTUAL DB QUERIES HERE, THIS IS JUST MOCK DATA
# def fetch_products_list() -> List[Dict[str, Any]]:
#     return [
#         {
#             "product_id": "mock_product_id_1",
#             "name": "MOCK PRODUCT (Fertilizer)",
#             "category": "mock_category",
#             "price": -9999,
#             "image_url": "https://mock.url/product.jpg",
#             "seasonal": False,
#             "description": "mock_description_product",
#         },
#         {
#             "product_id": "mock_product_id_2",
#             "name": "MOCK PRODUCT (Pesticide)",
#             "category": "mock_category",
#             "price": -8888,
#             "image_url": "https://mock.url/product2.jpg",
#             "seasonal": True,
#             "description": "mock_description_product",
#         },
#     ]

def fetch_products_list() -> List[Dict[str, Any]]:
	query = """
	SELECT
		product_id,
		product_name,
		category,
		price,
		point_factor
	FROM products;
	"""
	with engine.connect() as conn:
		result = conn.execute(text(query))
		rows = result.mappings().all()
		return [dict(row) for row in rows]


# def fetch_product_detail(product_id: str) -> Dict[str, Any]:
#     return {
#         "product_id": product_id,
#         "name": "MOCK PRODUCT DETAIL",
#         "category": "mock_category",
#         "points_factor": -999,
#         "nutrients": ["mock_nutrient_1", "mock_nutrient_2"],
#         "features": ["mock_feature"],
#         "instructions": "mock_instruction_text",
#         "images": ["https://mock.url/detail.jpg"],
#     }

def fetch_product_by_id(product_id: str) -> Optional[Dict[str, Any]]:
    query = """
        SELECT
            product_id,
            product_name,
            point_factor,
            price,
            category
        FROM products
        WHERE product_id = :product_id;
    """

    with engine.connect() as conn:
        result = conn.execute(text(query), {"product_id": product_id})
        row = result.mappings().first()
        return dict(row) if row else None