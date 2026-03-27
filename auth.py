import boto3
from botocore.exceptions import ClientError
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

COGNITO_CLIENT_ID = "us-east-2_8xjirMuVZ"  # replace this
REGION = "us-east-2"

cognito = boto3.client("cognito-idp", region_name=REGION)


class LoginRequest(BaseModel):
    username: str
    password: str


class SignupRequest(BaseModel):
    username: str
    password: str
    email: str


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
        cognito.sign_up(
            ClientId=COGNITO_CLIENT_ID,
            Username=request.username,
            Password=request.password,
            UserAttributes=[
                {"Name": "email", "Value": request.email},
            ],
        )
        return {"message": "User created. Check email for verification code."}
    except cognito.exceptions.UsernameExistsException:
        raise HTTPException(status_code=409, detail="Username already exists")
    except ClientError as e:
        raise HTTPException(status_code=400, detail=str(e))


class ConfirmRequest(BaseModel):
    username: str
    code: str


@router.post("/confirm")
def confirm(request: ConfirmRequest):
    try:
        cognito.confirm_sign_up(
            ClientId=COGNITO_CLIENT_ID,
            Username=request.username,
            ConfirmationCode=request.code,
        )
        return {"message": "Account confirmed"}
    except ClientError as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    USER_POOL_ID = "us-east-2_8xjirMuVZ"
    try:
        response = cognito.describe_user_pool(UserPoolId=USER_POOL_ID)
        pool = response["UserPool"]
        print(f"Connected to Cognito User Pool: {pool['Name']}")
        print(f"ID: {pool['Id']}")
        print(f"Status: {pool['Status']}")
    except ClientError as e:
        print(f"Failed to connect: {e}")
