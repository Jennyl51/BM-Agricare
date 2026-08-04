#
import json
import os

import boto3
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine


load_dotenv()


def get_db_credentials(secret_name: str, region: str = "us-east-2") -> dict:
    """
    Load database credentials from AWS Secrets Manager.

    Expected secret fields:
    - username
    - password
    - host
    - port
    - dbname optional; fallback is test
    """
    client = boto3.client("secretsmanager", region_name=region)
    response = client.get_secret_value(SecretId=secret_name)

    # IMPORTANT: do not print response here because it contains the DB password.
    return json.loads(response["SecretString"])


def get_engine(secret_name: str = "database-2", region: str = "us-east-2") -> Engine:
    """
    Create a SQLAlchemy engine.

    Priority:
    1. Use DATABASE_URL from .env for local development / SSH tunnel.
    2. Otherwise load RDS credentials from AWS Secrets Manager.

    Local tunnel example:
    DATABASE_URL=postgresql+psycopg2://postgres:bmoppass2026@127.0.0.1:5434/test?sslmode=require
    """

    direct_url = os.getenv("DATABASE_URL")

    if direct_url:
        return create_engine(
            direct_url,
            pool_pre_ping=True,
            pool_recycle=300,
        )

    creds = get_db_credentials(secret_name, region)

    username = creds["username"]
    password = creds["password"]
    host = creds["host"]
    port = creds.get("port", 5432)
    dbname = creds.get("dbname") or creds.get("database") or "test"

    database_url = (
        f"postgresql+psycopg2://{username}:{password}@{host}:{port}/{dbname}"
        f"?sslmode=require"
    )

    return create_engine(
        database_url,
        pool_pre_ping=True,
        pool_recycle=300,
    )


if __name__ == "__main__":
    try:
        engine = get_engine()

        with engine.connect() as conn:
            version = conn.execute(text("SELECT version();")).scalar()
            database = conn.execute(text("SELECT current_database();")).scalar()

            print("Connected to:", version)
            print("Database:", database)

            result = conn.execute(
                text(
                    """
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                    ORDER BY table_name;
                    """
                )
            )

            tables = [row[0] for row in result]
            print("Tables:", tables if tables else "No tables found")

    except Exception as e:
        print(f"Connection failed: {e}")


#  import json
# import os

# import boto3

# from botocore.exceptions import ClientError
# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel

# from sqlalchemy import create_engine, text
# from sqlalchemy.orm import sessionmaker


# def get_db_credentials(secret_name: str, region: str = "us-east-2") -> dict:
#     client = boto3.client("secretsmanager", region_name=region)
#     response = client.get_secret_value(SecretId=secret_name)
#     print("response:", response)
#     return json.loads(response["SecretString"])


# def get_engine(secret_name: str, region: str):
#     """Use DATABASE_URL for local dev; otherwise load credentials from Secrets Manager."""
#     direct_url = os.environ.get("DATABASE_URL")
#     if direct_url:
#         return create_engine(direct_url)
#     creds = get_db_credentials(secret_name, region)
#     dbname = creds.get("dbname", "test")
#     url = (
#         f"postgresql://{creds['username']}:{creds['password']}"
#         f"@{creds['host']}:{creds['port']}/{dbname}"
#     )
#     return create_engine(url)


# if __name__ == "__main__":
#     SECRET_NAME = "database-2"
#     REGION = "us-east-2"

#     try:
#         engine = get_engine(SECRET_NAME, REGION)
#         with engine.connect() as conn:
#             result = conn.execute(text("SELECT version();"))
#             print("Connected to:", result.scalar())

#             result = conn.execute(text("SELECT current_database();"))
#             print("Database:", result.scalar())

#             result = conn.execute(text("""
#                 SELECT user_id FROM retailers;
#             """))
#             tables = [row[0] for row in result]
#             print("Tables:", tables if tables else "No tables found")
#     except Exception as e:
#         print(f"Connection failed: {e}")
