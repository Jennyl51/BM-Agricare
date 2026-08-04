# POST /admin/auth/start-login
# POST /admin/auth/verify-code
# GET /admin/auth/me
from typing import Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Depends, Header, status
from pydantic import BaseModel

from services.admin_auth_service import (
    AdminAuthError,
    start_admin_login,
    verify_admin_login_code,
    decode_admin_token,
)
from db.admin_auth_db import get_admin_by_email


router = APIRouter(prefix="/admin/auth", tags=["Admin Auth"])


class StartLoginRequest(BaseModel):
    email: str
    password: str


class StartLoginResponse(BaseModel):
    requires_code: bool
    message: str
    email: str


class VerifyCodeRequest(BaseModel):
    email: str
    code: str


class AdminInfo(BaseModel):
    email: str
    display_name: Optional[str] = None
    role: str = "admin"


class VerifyCodeResponse(BaseModel):
    access_token: str
    token_type: str
    admin: AdminInfo


def get_bearer_token(authorization: Optional[str] = Header(default=None)) -> str:
    """
    Read the JWT token from the Authorization header.

    Expected format:
    Authorization: Bearer <token>
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token.",
        )

    parts = authorization.split(" ", 1)

    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format.",
        )

    token = parts[1].strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token.",
        )

    return token


def get_current_admin(token: str = Depends(get_bearer_token)) -> Dict[str, Any]:
    """
    Verify JWT token and return the active admin user.

    This function can later be reused to protect admin-only routes.
    """
    try:
        payload = decode_admin_token(token)
    except AdminAuthError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error.message,
        )

    email = payload.get("sub")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin token.",
        )

    admin = get_admin_by_email(email)

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin account is inactive or no longer exists.",
        )

    return {
        "email": admin["email"],
        "display_name": admin["display_name"],
        "role": admin["role"],
    }


@router.post("/start-login", response_model=StartLoginResponse)
def admin_start_login(payload: StartLoginRequest):
    """
    Step 1:
    Admin submits email + password.

    If correct, backend creates a temporary verification code.
    """
    try:
        return start_admin_login(
            email=payload.email,
            password=payload.password,
        )
    except AdminAuthError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error.message,
        )


@router.post("/verify-code", response_model=VerifyCodeResponse)
def admin_verify_code(payload: VerifyCodeRequest):
    """
    Step 2:
    Admin submits email + verification code.

    If correct, backend returns JWT access token.
    """
    try:
        return verify_admin_login_code(
            email=payload.email,
            code=payload.code,
        )
    except AdminAuthError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error.message,
        )


@router.get("/me", response_model=AdminInfo)
def admin_me(current_admin: Dict[str, Any] = Depends(get_current_admin)):
    """
    Check who is currently logged in.

    Frontend can call this with:
    Authorization: Bearer <token>
    """
    return current_admin