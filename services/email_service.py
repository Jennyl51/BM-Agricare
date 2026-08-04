import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

import boto3
from botocore.exceptions import BotoCoreError, ClientError


AWS_REGION = os.getenv("AWS_REGION", "us-east-2")

ADMIN_EMAIL_SENDER = os.getenv(
    "ADMIN_EMAIL_SENDER",
    "no-reply@bm-agricare.com",
)

EMAIL_MODE = os.getenv("ADMIN_EMAIL_MODE", "ses")
# EMAIL_MODE options:
# "console" = print code in backend terminal
# "ses" = send real email using AWS SES


class EmailSendError(Exception):
    """Raised when email sending fails."""

    pass


def send_email_with_ses(
    to_email: str,
    subject: str,
    body_text: str,
    body_html: Optional[str] = None,
) -> None:
    """
    Send an email using AWS SES API.

    This requires:
    - boto3 installed
    - AWS credentials available
    - ADMIN_EMAIL_SENDER verified in SES
    - recipient verified too if SES is still in sandbox mode
    """
    ses_client = boto3.client("ses", region_name=AWS_REGION)

    body = {
        "Text": {
            "Charset": "UTF-8",
            "Data": body_text,
        }
    }

    if body_html:
        body["Html"] = {
            "Charset": "UTF-8",
            "Data": body_html,
        }

    try:
        ses_client.send_email(
            Source=ADMIN_EMAIL_SENDER,
            Destination={
                "ToAddresses": [to_email],
            },
            Message={
                "Subject": {
                    "Charset": "UTF-8",
                    "Data": subject,
                },
                "Body": body,
            },
        )
    except (BotoCoreError, ClientError) as error:
        raise EmailSendError(str(error)) from error


def send_admin_login_code_email(to_email: str, code: str) -> None:
    """
    Send the BM AgriCare admin login verification code.

    In local/dev mode, this prints the code.
    In production mode, this sends email through AWS SES.
    """
    subject = "BM AgriCare Admin Login Verification Code"

    body_text = f"""
Hello,

Your BM AgriCare Admin verification code is:

{code}

This code will expire soon. If you did not request this login, please ignore this email.

BM AgriCare Admin
""".strip()

    body_html = f"""
<html>
  <body style="font-family: Arial, sans-serif; color: #1f2937;">
    <h2>BM AgriCare Admin Verification</h2>
    <p>Your verification code is:</p>
    <div style="
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 4px;
      color: #06357A;
      padding: 14px 18px;
      border: 1px solid #d0d5dd;
      border-radius: 12px;
      display: inline-block;
      margin: 12px 0;
    ">
      {code}
    </div>
    <p>This code will expire soon.</p>
    <p>If you did not request this login, please ignore this email.</p>
    <br />
    <p>BM AgriCare Admin</p>
  </body>
</html>
""".strip()

    if EMAIL_MODE == "ses":
        send_email_with_ses(
            to_email=to_email,
            subject=subject,
            body_text=body_text,
            body_html=body_html,
        )
        return

    print("=" * 60)
    print(f"BM AgriCare admin login code for {to_email}: {code}")
    print("EMAIL_MODE is console, so no real email was sent.")
    print("=" * 60)

print("EMAIL_MODE:", EMAIL_MODE)
print("AWS_REGION:", AWS_REGION)
print("ADMIN_EMAIL_SENDER:", ADMIN_EMAIL_SENDER)