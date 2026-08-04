from pathlib import Path
from re import sub
from typing import Any, Dict, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from pydantic import BaseModel

from api.routes.admin_auth import get_current_admin
from db.admin_products_db import (
    create_admin_product,
    delete_admin_product,
    get_admin_product,
    get_admin_product_metrics,
    list_admin_products,
    set_admin_product_active,
    update_admin_product,
)


router = APIRouter(prefix="/admin/products", tags=["Admin Products"])


class AdminProductPayload(BaseModel):
    product_name: Optional[str] = None
    brand: Optional[str] = None
    company: Optional[str] = None
    weight: Optional[str] = None
    formula: Optional[str] = None
    category_group: Optional[str] = None
    category: Optional[str] = None
    sub_cat: Optional[str] = None
    point_factor: Optional[int] = None
    price: Optional[int] = None
    short_desc: Optional[str] = None
    description: Optional[str] = None
    nutrients: Optional[str] = None
    key_features: Optional[str] = None
    application: Optional[str] = None
    image_url: Optional[str] = None
    brand_image_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_seasonal: Optional[bool] = None


def slugify_filename(filename: str) -> str:
    stem = Path(filename).stem.lower()
    suffix = Path(filename).suffix.lower()

    if suffix not in [".png", ".jpg", ".jpeg", ".webp"]:
        raise HTTPException(
            status_code=400,
            detail="Only PNG, JPG, JPEG, and WEBP images are allowed.",
        )

    clean_stem = sub(r"[^a-z0-9]+", "-", stem).strip("-")
    return f"{clean_stem}-{uuid4().hex[:8]}{suffix}"


@router.get("")
def admin_list_products(
    include_inactive: bool = Query(default=True),
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return list_admin_products(include_inactive=include_inactive)


@router.get("/{product_id}")
def admin_get_product(
    product_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return get_admin_product(product_id)


@router.get("/{product_id}/metrics")
def admin_get_product_metrics(
    product_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return get_admin_product_metrics(product_id)


@router.post("")
def admin_create_product(
    payload: AdminProductPayload,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return create_admin_product(payload.model_dump(exclude_unset=True))


@router.patch("/{product_id}")
def admin_update_product(
    product_id: str,
    payload: AdminProductPayload,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return update_admin_product(
        product_id=product_id,
        payload=payload.model_dump(exclude_unset=True),
    )


@router.patch("/{product_id}/active")
def admin_set_product_active(
    product_id: str,
    is_active: bool,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return set_admin_product_active(product_id=product_id, is_active=is_active)


@router.delete("/{product_id}")
def admin_delete_product(
    product_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return delete_admin_product(product_id)


@router.post("/upload-image")
async def admin_upload_product_image(
    file: UploadFile = File(...),
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing file name.")

    safe_name = slugify_filename(file.filename)

    repo_root = Path(__file__).resolve().parents[2]
    image_dir = repo_root / "bm-admin" / "public" / "product-images"
    image_dir.mkdir(parents=True, exist_ok=True)

    file_path = image_dir / safe_name
    file_bytes = await file.read()

    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 5MB.")

    file_path.write_bytes(file_bytes)

    return {
        "image_url": f"/product-images/{safe_name}",
        "filename": safe_name,
    }