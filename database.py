import json

import boto3

from botocore.exceptions import ClientError
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

router = APIRouter(prefix="/database", tags=["database"])

def get_db_credentials(secret_name: str, region: str = "us-east-2") -> dict:
    client = boto3.client("secretsmanager", region_name=region)
    response = client.get_secret_value(SecretId=secret_name)
    print("response:", response)
    return json.loads(response["SecretString"])


def get_engine(secret_name: str, region: str):
    creds = get_db_credentials(secret_name, region)
    dbname = creds.get("dbname", "test")
    url = (
        f"postgresql://{creds['username']}:{creds['password']}"
        f"@{creds['host']}:{creds['port']}/{dbname}"
    )
    return create_engine(url)


if __name__ == "__main__":
    SECRET_NAME = "database-2"
    REGION = "us-east-2"

    try:
        engine = get_engine(SECRET_NAME, REGION)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            print("Connected to:", result.scalar())

            result = conn.execute(text("SELECT current_database();"))
            print("Database:", result.scalar())

            result = conn.execute(text("""
                SELECT user_id FROM retailers;
            """))
            tables = [row[0] for row in result]
            print("Tables:", tables if tables else "No tables found")
    except Exception as e:
        print(f"Connection failed: {e}")
