from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import text
from api.routes.database import get_engine

REGION = "us-east-2"
SECRET_NAME = "datebase-2"

engine = get_engine(SECRET_NAME, REGION)

def get_admin_by_email(email: str) -> Optional[Dict[str, Any]]:
    """
    Look up an active admin user by email
    """
    with engine.connect() as conn:
        result = conn.execute(
            text(
                """
                SELECT
                    admin_id, email, password_hash, display_name, role, is_active
                FROM admin_users
                WHERE LOWER(email) = :email
                    AND is_active = TRUE
                LIMIT 1;
                """
            ), {"email": email},
        )
        
        row = result.mappings().first()
        return dict(row) if row else None

def create_admin_login_code(email: str, code_hash: str, expires_at: datetime) -> None:
    """
    Store a new hashed login code for an admin email
    Mark old unused codes for that email as used
    """
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                UPDATE admin_login_codes
                SET used = TRUE
                WHERE LOWER(email) = :email
                    AND used = FALSE;
                """
            ),
            {"email": email},
        )

        conn.execute(
            text(
                """
                INSERT INTO admin_login_codes
                    (email, code_hash, expires_at, used, attempts)
                VALUES
                    (:email, :code_hash, :expires_at, FALSE, 0);
                """
            ),
            {
                "email": email,
                "code_hash": code_hash,
                "expires_at": expires_at,
            },
        )

def get_latest_valid_login_code(email: str, now: datetime) -> Optional[Dict[str, Any]]:
    """
    Get the newest ununsed and unexpired login code for an email
    Return Nonw if there is no valid code.
    """
    with engine.connect() as conn:
        result = conn.execute(
            text(
                """
                SELECT
                    code_id, email, code_hash, expires_at, used, attempts, created_at
                FROM admin_login_codes
                WHERE LOWER(email) = :email
                    AND used = FALSE
                    AND expires_at > :now
                ORDER BY created_at DESC
                LIMIT 1;
                """
            ),
            {
                "email": email,
                "now": now, 
            },
        )

        row = result.mappings().first()
        return dict(row) if row else None
    
def increment_login_code_attempts(code_id: int) -> None:
    """
    Increase failed attempts count for a login code
    """
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                UPDATE admin_login_codes
                SET attempts = attempts + 1
                WHERE code_id = :code_id;
                """
            ),
            {"code_id": code_id},
        )
def mark_login_code_used(code_id: int) -> None:
    """
    Mark a login code as used for successful verification or too many failed attempts.
    """
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                UPDATE admin_login_codes
                SET used = TRUE
                WHERE code_id = :code_id;
                """
            ),
            {"code_id": code_id},
        )