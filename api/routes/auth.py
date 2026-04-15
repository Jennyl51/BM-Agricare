import boto3

from enum import Enum

from botocore.exceptions import ClientError
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from api.routes.database import get_engine

# Run these to signin and login

# curl -X POST http://127.0.0.1:8000/auth/signup \
#   -H "Content-Type: application/json" \
#   -d '{"username": "testuser", "password": "TestPass123!", "name": "Test User", "email": "test@example.com", "phone_number": "+11234567890", "user_type": "base"}'

# curl -X POST http://127.0.0.1:8000/auth/login \
#   -H "Content-Type: application/json" \
#   -d '{"username": "testuser", "password": "TestPass123!"}'


router = APIRouter(prefix="/auth", tags=["auth"])

COGNITO_CLIENT_ID = "58u6mgvkgd913nbhm86oe7mahq"
USER_POOL_ID = "us-east-2_8xjirMuVZ"
REGION = "us-east-2"

cognito = boto3.client("cognito-idp", region_name=REGION)

SECRET_NAME = "database-2"
engine = get_engine(SECRET_NAME, REGION)


class UserType(str, Enum):
    base = "base"
    tce = "tce"
    ADMIN = "admin"


class SignupRequest(BaseModel):
    username: str
    password: str
    name: str
    email: str
    phone_number: str
    user_type: UserType

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(request: LoginRequest):
    try:
        response = cognito.initiate_auth(
            ClientId=COGNITO_CLIENT_ID,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={
                "USERNAME": request.username,
                "PASSWORD": request.password,
            },
        )
        tokens = response["AuthenticationResult"]
        return {
            "access_token": tokens["AccessToken"],
            "id_token": tokens["IdToken"],
            "refresh_token": tokens["RefreshToken"],
        }
    except cognito.exceptions.NotAuthorizedException:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except cognito.exceptions.UserNotFoundException:
        raise HTTPException(status_code=404, detail="User not found")
    except ClientError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/signup")
def signup(request: SignupRequest):
    try:
        response = cognito.sign_up(
            ClientId=COGNITO_CLIENT_ID,
            Username=request.username,
            Password=request.password,
            UserAttributes=[
                {"Name": "name", "Value": request.name},
                {"Name": "email", "Value": request.email},
                {"Name": "phone_number", "Value": request.phone_number},
                {"Name": "custom:user_type", "Value": request.user_type.value},
            ],
        )
        user_id = response["UserSub"]
        cognito.admin_confirm_sign_up(
            UserPoolId=USER_POOL_ID,
            Username=request.username
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
        
        return {"message": f"User created: {request.username}"}
    except cognito.exceptions.UsernameExistsException:
        raise HTTPException(status_code=409, detail="Username already exists")
    except ClientError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":
    USER_POOL_ID = "us-east-2_8xjirMuVZ"
    try:
        response = cognito.describe_user_pool(UserPoolId=USER_POOL_ID)
        pool = response["UserPool"]
        print(f"Connected to Cognito User Pool: {pool['Name']}")
        print(f"ID: {pool['Id']}")
    except ClientError as e:
        print(f"Failed to connect: {e}")
