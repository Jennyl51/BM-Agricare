# hash/verify passwords
# generate 6-digit codes
# hash/verify codes
# create JWT tokens

import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Dict, Any
from jose import jwt, JWTError
from passlib.context import CryptContext

from db.admin_auth_db import (
    get_admin_by_email,
    create_admin_login_code,
    get_latest_valid_login_code,
    increment_login_code_attempts,
    mark_login_code_used,
)

from services.email_service import send_admin_login_code_email
from dotenv import load_dotenv

load_dotenv()


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.getenv("ADMIN_JWT_SECRET", "dev-only-change-this-secret")
JWT_ALGORITHM = os.getenv("ADMIN_JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("ADMIN_JWT_EXPIRE_MINUTES", "480"))

CODE_EXPIRE_MINUTES = int(os.getenv("ADMIN_LOGIN_CODE_EXPIRE_MINUTES", "10"))
MAX_CODE_ATTEMPTS = int(os.getenv("ADMIN_LOGIN_MAX_ATTEMPTS", "5"))

class AdminAuthError(Exception):
    """Expected Admin authentication failure."""

    def __init__(self, message: str = "Invalid login credentials."):
        self.message = message
        super().__init__(message)

def utc_now() -> datetime:
    """
    Return current UTC time without timezone info.

    We use this because the Postgres columns were created as TIMESTAMP,
    not TIMESTAMPTZ.
    """
    return datetime.now(timezone.utc).replace(tzinfo=None)

def normalize_email(email: str) -> str:
    return email.strip().lower()

def hash_value(value: str) -> str:
    """Convert secret into 1-way hash
    Used for admin passwords & temporary email verification codes
    """
    return pwd_context.hash(value)

def verify_value(raw_value: str, hashed_value: str) -> bool:
    """
    Check if password input match with hash
    """
    try:
        return pwd_context.verify(raw_value, hashed_value)
    except Exception:
        return False

def generate_login_code() -> str:
    """Generate 6-digit random verification code as string"""
    return f"{secrets.randbelow(900000) + 100000}"

def create_admin_token(email: str, role: str = "admin") -> str:
    """
    Create a signed JWT token after successful password + email verification
    The Frontend stores this token & send it on future admin requests"""
    expires_at = utc_now() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {
        "sub": normalize_email(email),
        "role": role,
        "exp": expires_at,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_admin_token(token: str) -> Dict[str, Any]:
    """
    Read & verifies a JWT token to protect admin routes"""
    try: 
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise AdminAuthError("Invalid or expired admin token.")
    
# def send_login_code_email(email: str, code: str) -> None:
#     """
#     Temporary email sending function, 
#     need to be replace with real email sending (AWS SES, SMTP, SendGrid)
#     """
#     print("=" * 60)
#     print(f"BM Agricare admin login code for {email}: {code}")
#     print("This code expires soon.")
#     print("=" * 60)

def start_admin_login(email: str, password: str) -> Dict[str, Any]:
    """
    input: email + pwd
    backend: chedk email exists, verify password's hash value
    create new temporary code, store, then send code
    """
    normalized_email = normalize_email(email)
    admin = get_admin_by_email(normalized_email)

    if not admin:
        raise AdminAuthError("Invalid email or password.")
    password_is_correct = verify_value(password, admin["password_hash"])

    if not password_is_correct:
        raise AdminAuthError("Invalid email or password.")
    
    code = generate_login_code()
    code_hash = hash_value(code)
    expires_at = utc_now() + timedelta(minutes=CODE_EXPIRE_MINUTES)

    create_admin_login_code(
        email=normalized_email,
        code_hash=code_hash,
        expires_at=expires_at,
    )

    send_admin_login_code_email(normalized_email, code)
    return {
        "requires_code": True,
        "message": "Verification code sent.",
        "email": normalized_email,
    }

def verify_admin_login_code(email: str, code: str) -> Dict[str, Any]:
    """
    check user submitted 6-digit code
    mark code as used
    return JWT token
    """
    normalized_email = normalize_email(email)
    clean_code = code.strip()

    if not clean_code:
        raise AdminAuthError("Verification code is required.")
    
    admin = get_admin_by_email(normalized_email)

    if not admin: 
        raise AdminAuthError("Verification code is invalid or expired.")

    now = utc_now()
    login_code = get_latest_valid_login_code(normalized_email, now)

    if not login_code:
        raise AdminAuthError("Verification code is invalid or expired.")
    
    code_id = login_code["code_id"]
    attempts = login_code["attempts"] or 0

    if attempts >= MAX_CODE_ATTEMPTS:
        mark_login_code_used(code_id)
        raise AdminAuthError("Too many incorrect attempts, Please request a new code.")
    
    code_is_correct = verify_value(clean_code, login_code["code_hash"])
    
    if not code_is_correct:
        increment_login_code_attempts(code_id)
        raise AdminAuthError("Verification code is invalid or expired.")
    
    mark_login_code_used(code_id)

    token = create_admin_token(
        email = normalized_email,
        role=admin.get("role", "admin"),
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "admin": {
            "email": admin["email"],
            "display_name": admin["display_name"],
            "role": admin["role"],
        },
    }

