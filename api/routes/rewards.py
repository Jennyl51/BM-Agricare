from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from services.rewards_service import (
    RedemptionStatus,
    create_redemption_request,
    get_my_redemptions,
    get_points_history_for_user,
    get_rewards_list,
    get_tce_redemption_detail,
    get_tce_redemptions_to_process,
    update_tce_redemption_request,
)
from api.routes.users import get_current_user, require_tce

router = APIRouter(tags=["rewards"])


class RewardOut(BaseModel):
    reward_id: str
    rwd_id: Optional[int] = None
    name: str
    points_needed: int
    quantity_available: Optional[int]
    tier_requirement: str
    description: Optional[str] = None
    related_product: Optional[str] = None
    image_url: Optional[str] = None
    is_pinned: Optional[bool] = False
    is_seasonal: Optional[bool] = False
    is_visible: Optional[bool] = True


@router.get("/rewards", response_model=List[RewardOut])
def rewards_get(user=Depends(get_current_user)):
    return get_rewards_list()

@router.get("/demo/rewards", response_model=List[RewardOut])
def demo_rewards_get():
    return get_rewards_list()


class PointsHistoryEntry(BaseModel):
    points_earned: int
    points_redeemed: int
    description: Optional[str]
    occurred_at: str


@router.get("/points/history", response_model=List[PointsHistoryEntry])
def points_history_get(user=Depends(get_current_user)):
    return get_points_history_for_user(user["user_id"])


class RedeemItemIn(BaseModel):
    reward_id: str
    quantity: int = Field(ge=1)


class CreateRedemptionIn(BaseModel):
    items: List[RedeemItemIn]
    retailer_location: Optional[str] = None


@router.post("/redemptions")
def redemptions_post(body: CreateRedemptionIn, user=Depends(get_current_user)):
    return create_redemption_request(
        user_id=user["user_id"],
        items=[{"reward_id": i.reward_id, "quantity": i.quantity} for i in body.items],
        retailer_location=body.retailer_location,
    )


class MyRedemptionOut(BaseModel):
    redemption_id: str
    created_at: str
    status: str
    task_done: bool


@router.get("/redemptions/me", response_model=List[MyRedemptionOut])
def redemptions_me_get(user=Depends(get_current_user)):
    return get_my_redemptions(user["user_id"])


class TceRedemptionSummary(BaseModel):
    redemption_id: str
    status: str


@router.get("/tce/redemptions", response_model=List[TceRedemptionSummary])
def tce_redemptions_get(pending_only: bool = True, user=Depends(require_tce)):
    return get_tce_redemptions_to_process(pending_only=pending_only)


class TceRedemptionItemOut(BaseModel):
    reward_id: str
    name: str
    quantity: int
    points_per_unit: int


class TceRedemptionDetail(BaseModel):
    redemption_id: str
    status: str
    task_done: bool
    retailer_user_id: str
    retailer_username: Optional[str]
    retailer_location: Optional[str]
    notes: Optional[str]
    created_at: str
    updated_at: str
    items: List[TceRedemptionItemOut]


@router.get("/tce/redemptions/{redemption_id}", response_model=TceRedemptionDetail)
def tce_redemption_get(redemption_id: str, user=Depends(require_tce)):
    return get_tce_redemption_detail(redemption_id=redemption_id)


class PatchRedemptionIn(BaseModel):
    status: Optional[RedemptionStatus] = None
    task_done: Optional[bool] = None
    notes: Optional[str] = None


@router.patch("/tce/redemptions/{redemption_id}")
def tce_redemptions_patch(redemption_id: str, body: PatchRedemptionIn, user=Depends(require_tce)):
    if body.status is None and body.task_done is None and body.notes is None:
        raise HTTPException(status_code=400, detail={"message": "No fields to update", "code": "NO_FIELDS"})
    return update_tce_redemption_request(
        redemption_id=redemption_id,
        status=body.status.value if body.status is not None else None,
        task_done=body.task_done,
        notes=body.notes,
    )

