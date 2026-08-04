from fastapi import APIRouter, Depends, HTTPException, Query
from services.guidelines_services import (
    get_guidelines_list,
    get_guideline_by_id,
    get_news_list,
    create_guideline,
    update_guideline,
    create_news_item,
)
from api.routes.users import get_current_user
from sqlalchemy import text
from api.routes.database import get_engine

router = APIRouter()
REGION = "us-east-2"
SECRET_NAME = "database-2"
engine = get_engine(SECRET_NAME, REGION)

@router.get("/demo/guidelines")
def demo_guidelines_get():
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT
                    resource_id::text AS guideline_id,
                    title,
                    category,
                    related_products,
                    thumbnail_url,
                    article_url,
                    summary AS body,
                    published_date,
                    is_pinned,
                    is_visible
                FROM resources
                WHERE type = 'guideline'
                  AND is_visible = TRUE
                ORDER BY is_pinned DESC, published_date DESC, resource_id ASC;
            """)
        )

        rows = []
        for row in result.mappings().all():
            item = dict(row)
            item["published_date"] = item["published_date"].isoformat() if item["published_date"] else None

            # Keep frontend-compatible names
            item["hotlink"] = item["article_url"] or "/resources"
            item["summary"] = item["body"]

            rows.append(item)

        return rows

@router.get("/guidelines")
def guidelines_list(
    category: str = Query(None),
    product_id: int = Query(None),
    crop: str = Query(None),
    topic: str = Query(None),
    seasonal: bool = Query(None),
    user=Depends(get_current_user)
):
    return get_guidelines_list(category, product_id, crop, topic, seasonal)

@router.get("/guidelines/{guideline_id}")
def guidelines_detail(guideline_id: int, user=Depends(get_current_user)):
    return get_guideline_by_id(guideline_id)

@router.get("/news")
def news_list(user=Depends(get_current_user)):
    return get_news_list()

@router.post("/admin/guidelines")
def admin_create_guideline(body: dict, user=Depends(get_current_user)):
    return create_guideline(body, user)

@router.patch("/admin/guidelines/{guideline_id}")
def admin_update_guideline(guideline_id: int, body: dict, user=Depends(get_current_user)):
    return update_guideline(guideline_id, body, user)

@router.post("/admin/news")
def admin_create_news(body: dict, user=Depends(get_current_user)):
    return create_news_item(body, user)

@router.get("/demo/news")
def demo_news_get():
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT
                    resource_id::text AS news_id,
                    title,
                    category,
                    related_products,
                    thumbnail_url,
                    article_url,
                    summary AS body,
                    summary,
                    published_date,
                    is_pinned,
                    is_visible
                FROM resources
                WHERE type = 'news'
                  AND is_visible = TRUE
                ORDER BY is_pinned DESC, published_date DESC, resource_id ASC;
            """)
        )

        rows = []
        for row in result.mappings().all():
            item = dict(row)
            item["published_date"] = item["published_date"].isoformat() if item["published_date"] else None
            item["hotlink"] = item["article_url"] or "/resources"
            rows.append(item)

        return rows