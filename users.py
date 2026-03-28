import boto3

from botocore.exceptions import ClientError
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from typing import Optional

router = APIRouter(tags=["users"])

USER_POOL_ID = "us-east-2_8xjirMuVZ"
REGION = "us-east-2"

cognito = boto3.client("cognito-idp", region_name=REGION)


class UpdateUserRequest(BaseModel):
    email: Optional[str] = None
    user_type: Optional[str] = None


class AdminCreateUserRequest(BaseModel):
    username: str
    password: str
    email: str
    user_type: str


class AdminUpdateUserRequest(BaseModel):
    email: Optional[str] = None
    user_type: Optional[str] = None


# GET /users/me - get current user's profile
@router.get("/users/me")
def get_user_me(authorization: str = Header()):
    try:
        token = authorization.replace("Bearer ", "")
        response = cognito.get_user(AccessToken=token)
        attributes = {attr["Name"]: attr["Value"] for attr in response["UserAttributes"]}
        return {
            "username": response["Username"],
            "email": attributes.get("email"),
            "user_type": attributes.get("custom:user_type"),
        }
    except cognito.exceptions.NotAuthorizedException:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    except ClientError as e:
        raise HTTPException(status_code=400, detail=str(e))


# PATCH /users/me - update current user's profile
@router.patch("/users/me")
def update_user_me(request: UpdateUserRequest, authorization: str = Header()):
    try:
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
    except cognito.exceptions.NotAuthorizedException:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    except ClientError as e:
        raise HTTPException(status_code=400, detail=str(e))


# GET /admin/users - list all users
@router.get("/admin/users")
def get_admin_users():
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


# POST /admin/users - create a user (admin)
@router.post("/admin/users")
def create_admin_user(request: AdminCreateUserRequest):
    try:
        cognito.admin_create_user(
            UserPoolId=USER_POOL_ID,
            Username=request.username,
            TemporaryPassword=request.password,
            UserAttributes=[
                {"Name": "email", "Value": request.email},
                {"Name": "email_verified", "Value": "true"},
                {"Name": "custom:user_type", "Value": request.user_type},
            ],
            MessageAction="SUPPRESS",
        )
        cognito.admin_set_user_password(
            UserPoolId=USER_POOL_ID,
            Username=request.username,
            Password=request.password,
            Permanent=True,
        )
        return {"message": f"User created: {request.username}"}
    except cognito.exceptions.UsernameExistsException:
        raise HTTPException(status_code=409, detail="Username already exists")
    except ClientError as e:
        raise HTTPException(status_code=400, detail=str(e))


# PATCH /admin/users/:id - update a user (admin)
@router.patch("/admin/users/{user_id}")
def update_admin_user(user_id: str, request: AdminUpdateUserRequest):
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
