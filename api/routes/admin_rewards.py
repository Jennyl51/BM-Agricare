from pathlib import Path
from re import sub
from typing import Any, Dict, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from pydantic import BaseModel

from api.routes.admin_auth import get_current_admin
from db.admin_rewards_db import (
    add_reward_activity_note,
    create_admin_reward,
    create_reward_pin_schedule,
    delete_admin_reward,
    get_admin_reward_detail,
    list_admin_rewards,
    set_reward_pinned,
    set_reward_visible,
    update_admin_reward,
)


router = APIRouter(prefix="/admin/rewards", tags=["Admin Rewards"])


class AdminRewardPayload(BaseModel):
    name: Optional[str] = None
    related_product: Optional[str] = None
    description: Optional[str] = None
    points_required: Optional[int] = None
    min_tier: Optional[str] = None
    stock_quantity: Optional[int] = None
    image_url: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_seasonal: Optional[bool] = None
    is_visible: Optional[bool] = None
    status: Optional[str] = None
    admin_notes: Optional[str] = None
    comment: Optional[str] = None


class ActivityNotePayload(BaseModel):
    comment: str


class PinSchedulePayload(BaseModel):
    action: str
    scheduled_at: str
    notes: Optional[str] = None


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
def admin_list_rewards(
    include_hidden: bool = Query(default=True),
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return list_admin_rewards(include_hidden=include_hidden)


@router.get("/{reward_id}")
def admin_get_reward_detail(
    reward_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return get_admin_reward_detail(reward_id)


@router.post("")
def admin_create_reward(
    payload: AdminRewardPayload,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return create_admin_reward(
        payload=payload.model_dump(exclude_unset=True),
        admin_email=current_admin["email"],
    )


@router.patch("/{reward_id}")
def admin_update_reward(
    reward_id: str,
    payload: AdminRewardPayload,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return update_admin_reward(
        reward_id=reward_id,
        payload=payload.model_dump(exclude_unset=True),
        admin_email=current_admin["email"],
    )


@router.patch("/{reward_id}/visible")
def admin_set_reward_visible(
    reward_id: str,
    is_visible: bool,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return set_reward_visible(
        reward_id=reward_id,
        is_visible=is_visible,
        admin_email=current_admin["email"],
    )


@router.patch("/{reward_id}/pinned")
def admin_set_reward_pinned(
    reward_id: str,
    is_pinned: bool,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return set_reward_pinned(
        reward_id=reward_id,
        is_pinned=is_pinned,
        admin_email=current_admin["email"],
    )


@router.post("/{reward_id}/activity-note")
def admin_add_reward_activity_note(
    reward_id: str,
    payload: ActivityNotePayload,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return add_reward_activity_note(
        reward_id=reward_id,
        comment=payload.comment,
        admin_email=current_admin["email"],
    )


@router.post("/{reward_id}/pin-schedule")
def admin_create_reward_pin_schedule(
    reward_id: str,
    payload: PinSchedulePayload,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return create_reward_pin_schedule(
        reward_id=reward_id,
        action=payload.action,
        scheduled_at=payload.scheduled_at,
        notes=payload.notes,
        admin_email=current_admin["email"],
    )


@router.delete("/{reward_id}")
def admin_delete_reward(
    reward_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    return delete_admin_reward(
        reward_id=reward_id,
        admin_email=current_admin["email"],
    )


@router.post("/upload-image")
async def admin_upload_reward_image(
    file: UploadFile = File(...),
    current_admin: Dict[str, Any] = Depends(get_current_admin),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing file name.")

    safe_name = slugify_filename(file.filename)

    repo_root = Path(__file__).resolve().parents[2]
    image_dir = repo_root / "bm-admin" / "public" / "reward-images"
    image_dir.mkdir(parents=True, exist_ok=True)

    file_path = image_dir / safe_name
    file_bytes = await file.read()

    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 5MB.")

    file_path.write_bytes(file_bytes)

    return {
        "image_url": f"/reward-images/{safe_name}",
        "filename": safe_name,
    }