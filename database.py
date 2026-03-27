import json

import boto3
from botocore.exceptions import ClientError

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker


def get_db_credentials(secret_name: str, region: str = "us-east-2") -> dict:
    client = boto3.client("secretsmanager", region_name=region)
    response = client.get_secret_value(SecretId=secret_name)
    print("response:", response)
    return json.loads(response["SecretString"])


def get_engine(secret_name: str, region: str):
    creds = get_db_credentials(secret_name, region)
    url = (
        f"postgresql://{creds['username']}:{creds['password']}"
        f"@{creds['host']}:{creds['port']}/{creds['dbname']}"
    )
    return create_engine(url)


# Quick test
if __name__ == "__main__":
    SECRET_NAME = "database-2"  
    REGION = "us-east-2"

    print(get_db_credentials(SECRET_NAME, REGION))


    # engine = get_engine(SECRET_NAME, REGION)
    # Session = sessionmaker(bind=engine)

    # with Session() as session:
    #     result = session.execute(text("SELECT version();"))
    #     print("Connected to:", result.scalar())
