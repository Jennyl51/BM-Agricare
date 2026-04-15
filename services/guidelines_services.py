from fastapi import HTTPException
from db.guidelines_db import (
    fetch_guidelines_list,
    fetch_guideline_by_id,
    fetch_news_list,
    insert_guideline,
    update_guideline_by_id,
    insert_news_item,
)
from sqlalchemy.exc import SQLAlchemyError

def get_guidelines_list(category, product_id, crop, topic, seasonal):
    try:
        return fetch_guidelines_list(category, product_id, crop, topic, seasonal)
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Database unavailable - Cơ sở dữ liệu không khả dụng")
    
def get_guideline_by_id(guideline_id):
    try:
        result = fetch_guideline_by_id(guideline_id)
        if result is None:
            raise HTTPException(status_code=404, detail="Guideline not found - Không kiếm được")
        return result
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Database unavailable - Cơ sở dữ liệu không khả dụng")
    
def get_news_list():
    try:
        return fetch_news_list()
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Database unavailable - Cơ sở dữ liệu không khả dụng")

REQUIRED_GUIDELINE_FIELDS = {"title", "author", "category", "is_seasonal", "pdf_url", "thumbnail_url", "body"}

def create_guideline(body: dict, user: dict):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required - Cần quyền admin")
    missing = REQUIRED_GUIDELINE_FIELDS - body.keys()
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required fields - Vui lòng điền các thông tin còn thiếu: {missing}")
    try:
        guideline_id = insert_guideline(body)
        return {"message": "Guideline created - Món đồ đã được tạo ra", "guideline_id": guideline_id}
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Database unavailable - Cơ sở dữ liệu không khả dụng")

def update_guideline(guideline_id: int, body: dict, user: dict):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required - Cần quyền admin")
    if not body:
        raise HTTPException(status_code=400, detail="No fields provided - Vui lòng nhập liệu")
    try:
        result = update_guideline_by_id(guideline_id, body)
        if result is None:
            raise HTTPException(status_code=404, detail="Guideline not found - Không kiếm được")
        return {"message": "Guideline updated - Món hàng đã được cập nhật", "guideline_id": guideline_id}
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Database unavailable - Cơ sở dữ liệu không khả dụng")

REQUIRED_NEWS_FIELDS = {"title", "published_at", "thumbnail_url", "website_url"}

def create_news_item(body: dict, user: dict):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required - Cần quyền admin")
    missing = REQUIRED_NEWS_FIELDS - body.keys()
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required fields: {missing}")
    try:
        news_id = insert_news_item(body)
        return {"message": "News item created - Món đồ đã được tạo ra", "news_id": news_id}
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Database unavailable - Cơ sở dữ liệu không khả dụng")
