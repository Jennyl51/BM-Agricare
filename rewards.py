from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError, ProgrammingError

from database import get_engine
from users import get_current_user, require_tce

REGION = "us-east-2"
SECRET_NAME = "database-2"
engine = get_engine(SECRET_NAME, REGION)

router = APIRouter(tags=["rewards"])

TIER_RANK = {"bronze": 0, "silver": 1, "gold": 2, "platinum": 3}


def _tier_meets(user_tier: Optional[str], required: str) -> bool:
    ut = (user_tier or "bronze").lower()
    req = (required or "bronze").lower()
    return TIER_RANK.get(ut, 0) >= TIER_RANK.get(req, 0)


class RedemptionStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class RewardOut(BaseModel):
    reward_id: str
    name: str
    points_needed: int
    quantity_available: Optional[int]
    tier_requirement: str


@router.get("/rewards", response_model=List[RewardOut])
def list_rewards(user=Depends(get_current_user)):
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT reward_id::text, name, points_needed, quantity_available, tier_requirement
                    FROM rewards
                    WHERE active = TRUE
                    ORDER BY points_needed ASC, name ASC
                """)
            )
            rows = result.mappings().all()
        return [dict(r) for r in rows]
    except ProgrammingError as e:
        raise HTTPException(
            status_code=503,
            detail="Rewards tables missing. Apply schema_rewards.sql to the database.",
        ) from e


class PointsHistoryEntry(BaseModel):
    points_earned: int
    points_redeemed: int
    description: Optional[str]
    occurred_at: datetime


@router.get("/points/history", response_model=List[PointsHistoryEntry])
def points_history(user=Depends(get_current_user)):
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT points_earned, points_redeemed, description, created_at AS occurred_at
                    FROM points_ledger
                    WHERE retailer_user_id = :uid
                    ORDER BY created_at DESC
                """),
                {"uid": user["user_id"]},
            )
            rows = result.mappings().all()
        return [dict(r) for r in rows]
    except ProgrammingError as e:
        raise HTTPException(
            status_code=503,
            detail="Rewards tables missing. Apply schema_rewards.sql to the database.",
        ) from e


class RedeemItemIn(BaseModel):
    reward_id: str
    quantity: int = Field(ge=1)


class CreateRedemptionIn(BaseModel):
    items: List[RedeemItemIn]
    retailer_location: Optional[str] = None


@router.post("/redemptions")
def create_redemption(body: CreateRedemptionIn, user=Depends(get_current_user)):
    if not body.items:
        raise HTTPException(status_code=400, detail="At least one item is required")
    merged: dict[str, int] = {}
    for item in body.items:
        merged[item.reward_id] = merged.get(item.reward_id, 0) + item.quantity
    cart_items = [RedeemItemIn(reward_id=rid, quantity=q) for rid, q in merged.items()]
    uid = user["user_id"]
    try:
        with engine.begin() as conn:
            prof = conn.execute(
                text("SELECT tier, total_points FROM retailers WHERE user_id = :uid"),
                {"uid": uid},
            ).mappings().first()
            if not prof:
                raise HTTPException(status_code=404, detail="Retailer profile not found")
            user_tier = prof["tier"]
            balance = int(prof["total_points"] or 0)

            total_cost = 0
            lines: List[dict] = []
            for item in cart_items:
                row = conn.execute(
                    text("""
                        SELECT reward_id::text, name, points_needed, quantity_available, tier_requirement, active
                        FROM rewards
                        WHERE reward_id = :rid
                        FOR UPDATE
                    """),
                    {"rid": item.reward_id},
                ).mappings().first()
                if not row or not row["active"]:
                    raise HTTPException(status_code=404, detail=f"Reward not found: {item.reward_id}")
                if not _tier_meets(user_tier, row["tier_requirement"]):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Tier too low for reward: {row['name']}",
                    )
                avail = row["quantity_available"]
                if avail is not None and int(avail) < item.quantity:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Insufficient quantity for: {row['name']}",
                    )
                line_cost = int(row["points_needed"]) * item.quantity
                total_cost += line_cost
                lines.append(
                    {
                        "reward_id": item.reward_id,
                        "quantity": item.quantity,
                        "points_per_unit": int(row["points_needed"]),
                    }
                )

            if balance < total_cost:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient points: need {total_cost}, have {balance}",
                )

            rid_row = conn.execute(text("SELECT gen_random_uuid() AS id")).mappings().first()
            redemption_id = str(rid_row["id"])

            conn.execute(
                text("""
                    INSERT INTO reward_redemptions (
                        redemption_id, retailer_user_id, status, task_done, retailer_location, notes
                    )
                    VALUES (
                        :redemption_id, :retailer_user_id, 'pending', FALSE, :retailer_location, NULL
                    )
                """),
                {
                    "redemption_id": redemption_id,
                    "retailer_user_id": uid,
                    "retailer_location": body.retailer_location,
                },
            )

            for ln in lines:
                conn.execute(
                    text("""
                        INSERT INTO redemption_items (redemption_id, reward_id, quantity, points_per_unit)
                        VALUES (:redemption_id, :reward_id, :quantity, :points_per_unit)
                    """),
                    {
                        "redemption_id": redemption_id,
                        "reward_id": ln["reward_id"],
                        "quantity": ln["quantity"],
                        "points_per_unit": ln["points_per_unit"],
                    },
                )

            for ln in lines:
                conn.execute(
                    text("""
                        UPDATE rewards
                        SET quantity_available = quantity_available - :qty
                        WHERE reward_id = :reward_id
                          AND (quantity_available IS NULL OR quantity_available >= :qty)
                    """),
                    {"qty": ln["quantity"], "reward_id": ln["reward_id"]},
                )

            conn.execute(
                text("UPDATE retailers SET total_points = total_points - :cost WHERE user_id = :uid"),
                {"cost": total_cost, "uid": uid},
            )

            conn.execute(
                text("""
                    INSERT INTO points_ledger (
                        retailer_user_id, points_earned, points_redeemed, description, redemption_id
                    )
                    VALUES (:uid, 0, :redeemed, :desc, :redemption_id)
                """),
                {
                    "uid": uid,
                    "redeemed": total_cost,
                    "desc": "Reward redemption",
                    "redemption_id": redemption_id,
                },
            )

        return {"redemption_id": redemption_id, "status": "pending", "points_spent": total_cost}
    except HTTPException:
        raise
    except ProgrammingError as e:
        raise HTTPException(
            status_code=503,
            detail="Rewards tables missing. Apply schema_rewards.sql to the database.",
        ) from e
    except IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e))


class MyRedemptionOut(BaseModel):
    redemption_id: str
    created_at: datetime
    status: str
    task_done: bool


@router.get("/redemptions/me", response_model=List[MyRedemptionOut])
def my_redemptions(user=Depends(get_current_user)):
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT redemption_id::text, created_at, status, task_done
                    FROM reward_redemptions
                    WHERE retailer_user_id = :uid
                    ORDER BY created_at DESC
                """),
                {"uid": user["user_id"]},
            )
            rows = result.mappings().all()
        return [dict(r) for r in rows]
    except ProgrammingError as e:
        raise HTTPException(
            status_code=503,
            detail="Rewards tables missing. Apply schema_rewards.sql to the database.",
        ) from e


class TceRedemptionSummary(BaseModel):
    redemption_id: str
    status: str


@router.get("/tce/redemptions", response_model=List[TceRedemptionSummary])
def tce_list_redemptions(
    pending_only: bool = True,
    user=Depends(require_tce),
):
    try:
        with engine.connect() as conn:
            if pending_only:
                result = conn.execute(
                    text("""
                        SELECT redemption_id::text, status
                        FROM reward_redemptions
                        WHERE status IN ('pending', 'processing')
                           OR task_done = FALSE
                        ORDER BY created_at ASC
                    """)
                )
            else:
                result = conn.execute(
                    text("""
                        SELECT redemption_id::text, status
                        FROM reward_redemptions
                        ORDER BY created_at DESC
                    """)
                )
            rows = result.mappings().all()
        return [dict(r) for r in rows]
    except ProgrammingError as e:
        raise HTTPException(
            status_code=503,
            detail="Rewards tables missing. Apply schema_rewards.sql to the database.",
        ) from e


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
    created_at: datetime
    updated_at: datetime
    items: List[TceRedemptionItemOut]


@router.get("/tce/redemptions/{redemption_id}", response_model=TceRedemptionDetail)
def tce_redemption_detail(redemption_id: str, user=Depends(require_tce)):
    try:
        with engine.connect() as conn:
            red = conn.execute(
                text("""
                    SELECT
                        r.redemption_id::text,
                        r.status,
                        r.task_done,
                        r.retailer_user_id::text,
                        r.retailer_location,
                        r.notes,
                        r.created_at,
                        r.updated_at,
                        ret.username AS retailer_username
                    FROM reward_redemptions r
                    LEFT JOIN retailers ret ON ret.user_id = r.retailer_user_id
                    WHERE r.redemption_id = :rid
                """),
                {"rid": redemption_id},
            ).mappings().first()
            if not red:
                raise HTTPException(status_code=404, detail="Redemption not found")
            items = conn.execute(
                text("""
                    SELECT i.reward_id::text, rw.name, i.quantity, i.points_per_unit
                    FROM redemption_items i
                    JOIN rewards rw ON rw.reward_id = i.reward_id
                    WHERE i.redemption_id = :rid
                """),
                {"rid": redemption_id},
            ).mappings().all()
        data = dict(red)
        data["items"] = [dict(i) for i in items]
        return data
    except HTTPException:
        raise
    except ProgrammingError as e:
        raise HTTPException(
            status_code=503,
            detail="Rewards tables missing. Apply schema_rewards.sql to the database.",
        ) from e


class PatchRedemptionIn(BaseModel):
    status: Optional[RedemptionStatus] = None
    task_done: Optional[bool] = None
    notes: Optional[str] = None


@router.patch("/tce/redemptions/{redemption_id}")
def tce_patch_redemption(
    redemption_id: str,
    body: PatchRedemptionIn,
    user=Depends(require_tce),
):
    if body.status is None and body.task_done is None and body.notes is None:
        raise HTTPException(status_code=400, detail="No fields to update")
    updates = {}
    if body.status is not None:
        updates["status"] = body.status.value
    if body.task_done is not None:
        updates["task_done"] = body.task_done
    if body.notes is not None:
        updates["notes"] = body.notes
    set_parts = [f"{k} = :{k}" for k in updates]
    updates["redemption_id"] = redemption_id
    updates["updated_at"] = datetime.now(timezone.utc)
    set_parts.append("updated_at = :updated_at")
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text(f"""
                    UPDATE reward_redemptions
                    SET {", ".join(set_parts)}
                    WHERE redemption_id = :redemption_id
                """),
                updates,
            )
            conn.commit()
            if result.rowcount == 0:
                raise HTTPException(status_code=404, detail="Redemption not found")
    except HTTPException:
        raise
    except ProgrammingError as e:
        raise HTTPException(
            status_code=503,
            detail="Rewards tables missing. Apply schema_rewards.sql to the database.",
        ) from e
    return {"message": "Redemption updated", "redemption_id": redemption_id}
