from fastapi import APIRouter, Depends, HTTPException, Query
from services.guidelines_services import (
    get_guidelines_list,
    get_guideline_by_id,
    get_news_list,
    create_guideline,
    update_guideline,
    create_news_item,
)
from auth import get_current_user

router = APIRouter()

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