import boto3

from botocore.exceptions import ClientError
from fastapi import APIRouter, Header, HTTPException, Depends
from pydantic import BaseModel

from typing import Optional

router = APIRouter(tags=["users"])

USER_POOL_ID = "us-east-2_8xjirMuVZ"
REGION = "us-east-2"

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


# GET /users/me - get current user's profile
@router.get("/users/me")
def get_user_me(user = Depends(get_current_user)):
    
    return user

class UpdateUserRequest(BaseModel):
    email: Optional[str] = None
    user_type: Optional[str] = None

# PATCH /users/me - update current user's profile
@router.patch("/users/me")
def update_user_me(request: UpdateUserRequest, user=Depends(get_current_user), authorization: str = Header()):
    token = authorization.replace("Bearer ", "")
    attributes = []
    if request.email:
        attributes.append({"Name": "email", "Value": request.email})
    if request.user_type:
        attributes.append({"Name": "custom:user_type", "Value": request.user_type})
    if not attributes:
        raise HTTPException(status_code=400, detail="No fields to update")
    cognito.update_user_attributes(AccessToken=token, UserAttributes=attributes)
    return {"message": "User updated"}


# GET /admin/users - list all users
@router.get("/admin/users")
def get_admin_users(user=Depends(require_admin)):
    try:
        response = cognito.list_users(UserPoolId=USER_POOL_ID)
        users = []
        for user in response["Users"]:
            attributes = {attr["Name"]: attr["Value"] for attr in user["Attributes"]}
            users.append({
                "username": user["Username"],
                "email": attributes.get("email"),
                "user_type": attributes.get("custom:user_type"),
                "status": user["UserStatus"],
            })
        return users
    except ClientError as e:
        raise HTTPException(status_code=400, detail=str(e))


class AdminUpdateUserRequest(BaseModel):
    email: Optional[str] = None
    user_type: Optional[str] = None

# PATCH /admin/users/:id - update a user (admin)
@router.patch("/admin/users/{user_id}")
def update_admin_user(user_id: str, request: AdminUpdateUserRequest, user=Depends(require_admin)):
    try:
        attributes = []
        if request.email:
            attributes.append({"Name": "email", "Value": request.email})
        if request.user_type:
            attributes.append({"Name": "custom:user_type", "Value": request.user_type})
        if not attributes:
            raise HTTPException(status_code=400, detail="No fields to update")
        cognito.admin_update_user_attributes(
            UserPoolId=USER_POOL_ID,
            Username=user_id,
            UserAttributes=attributes,
        )
        return {"message": f"User {user_id} updated"}
    except cognito.exceptions.UserNotFoundException:
        raise HTTPException(status_code=404, detail="User not found")
    except ClientError as e:
        raise HTTPException(status_code=400, detail=str(e))
