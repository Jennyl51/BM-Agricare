import boto3

from botocore.exceptions import ClientError
from fastapi import APIRouter, Header, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import text
from api.routes.database import get_engine

from typing import Optional

router = APIRouter(tags=["users"])

COGNITO_CLIENT_ID = "58u6mgvkgd913nbhm86oe7mahq"
USER_POOL_ID = "us-east-2_8xjirMuVZ"
REGION = "us-east-2"
SECRET_NAME = "database-2"
engine = get_engine(SECRET_NAME, REGION)

cognito = boto3.client("cognito-idp", region_name=REGION)

def get_current_user(authorization: str = Header()):
    try:
        token = authorization.replace("Bearer ", "")
        response = cognito.get_user(AccessToken = token)
        attributes = {attr["Name"]: attr["Value"] for attr in response["UserAttributes"]}
        return {
            "username": response["Username"],
            "email": attributes.get("email"),
            "user_id": attributes["sub"],
            "user_type": attributes.get("custom:user_type"),
        }
    except Exception:
            raise HTTPException(status_code=401, detail="Invalid or expired token")


def require_admin(user=Depends(get_current_user)):
    if user.get("user_type") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def require_tce(user=Depends(get_current_user)):
    if user.get("user_type") != "tce":
        raise HTTPException(status_code=403, detail="TCE access required")
    return user


# GET /users/me - get current user's profile
@router.get("/users/me")
def get_user_me(user=Depends(get_current_user)):
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT * FROM retailers WHERE user_id = :user_id"),
            {"user_id": user["user_id"]},
        )
        row = result.mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="User not found in database")
        return dict(row)

class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    region: Optional[str] = None

# PATCH /users/me - update current user's profile
@router.patch("/users/me")
def update_user_me(request: UpdateUserRequest, user=Depends(get_current_user)):
    updates = {}
    if request.name is not None:
        updates["name"] = request.name
    if request.phone_number is not None:
        updates["phone_number"] = request.phone_number
    if request.region is not None:
        updates["region"] = request.region
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    set_clause = ", ".join(f"{key} = :{key}" for key in updates)
    updates["user_id"] = user["user_id"]
    with engine.connect() as conn:
        conn.execute(
            text(f"UPDATE retailers SET {set_clause} WHERE user_id = :user_id"),
            updates,
        )
        conn.commit()
    return {"message": "User updated"}


# GET /admin/users - list all users
@router.get("/admin/users")
def get_admin_users(user=Depends(require_admin)):
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT * FROM retailers"),
            )
        conn.commit()
        return result
    except ClientError as e:
        raise HTTPException(status_code=400, detail=str(e))


class AdminCreateUserRequest(BaseModel):
    username: str
    password: str
    name: str
    email: str
    phone_number: str
    user_type: str


# POST /admin/users - create a user (admin)
@router.post("/admin/users")
def create_admin_user(request: AdminCreateUserRequest, user=Depends(require_admin)):
    try:
        response = cognito.sign_up(
            ClientId=COGNITO_CLIENT_ID,
            Username=request.username,
            Password=request.password,
            UserAttributes=[
                {"Name": "name", "Value": request.name},
                {"Name": "email", "Value": request.email},
                {"Name": "phone_number", "Value": request.phone_number},
                {"Name": "custom:user_type", "Value": request.user_type},
            ],
        )
        user_id = response["UserSub"]
        cognito.admin_confirm_sign_up(
            UserPoolId=USER_POOL_ID,
            Username=request.username,
        )
        with engine.connect() as conn:
            conn.execute(
                text("""
                    INSERT INTO retailers (user_id, username, name, email, phone_number, region, tier, total_points, assigned_tce_id)
                    VALUES (:user_id, :username, :name, :email, :phone_number, :region, :tier, :total_points, :assigned_tce_id)
                """),
                {
                    "user_id": user_id,
                    "username": request.username,
                    "name": request.name,
                    "email": request.email,
                    "phone_number": request.phone_number,
                    "region": None,
                    "tier": "bronze",
                    "total_points": 0,
                    "assigned_tce_id": None,
                },
            )
            conn.commit()
        return {"message": f"User created: {request.username}", "user_id": user_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class AdminUpdateUserRequest(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    region: Optional[str] = None
    tier: Optional[str] = None
    total_points: Optional[int] = None
    assigned_tce_id: Optional[str] = None

# PATCH /admin/users/:id - update a user (admin)
@router.patch("/admin/users/{user_id}")
def update_admin_user(user_id: str, request: AdminUpdateUserRequest, user=Depends(require_admin)):
    updates = {}
    if request.name is not None:
        updates["name"] = request.name
    if request.phone_number is not None:
        updates["phone_number"] = request.phone_number
    if request.region is not None:
        updates["region"] = request.region
    if request.tier is not None:
        updates["tier"] = request.tier
    if request.total_points is not None:
        updates["total_points"] = request.total_points
    if request.assigned_tce_id is not None:
        updates["assigned_tce_id"] = request.assigned_tce_id
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    set_clause = ", ".join(f"{key} = :{key}" for key in updates)
    updates["user_id"] = user_id
    with engine.connect() as conn:
        result = conn.execute(
            text(f"UPDATE retailers SET {set_clause} WHERE user_id = :user_id"),
            updates,
        )
        conn.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {user_id} updated"}
