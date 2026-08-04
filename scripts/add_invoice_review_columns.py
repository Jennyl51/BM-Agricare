import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(PROJECT_ROOT))

from sqlalchemy import text

from api.routes.database import get_engine


REGION = "us-east-2"
SECRET_NAME = "database-2"

engine = get_engine(SECRET_NAME, REGION)


def main() -> None:
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                ALTER TABLE invoices
                ADD COLUMN IF NOT EXISTS tce_status TEXT,
                ADD COLUMN IF NOT EXISTS tce_reviewed_by TEXT,
                ADD COLUMN IF NOT EXISTS tce_reviewed_at TIMESTAMP,
                ADD COLUMN IF NOT EXISTS tce_rejection_reason TEXT,
                ADD COLUMN IF NOT EXISTS admin_status TEXT,
                ADD COLUMN IF NOT EXISTS admin_reviewed_by TEXT,
                ADD COLUMN IF NOT EXISTS admin_reviewed_at TIMESTAMP,
                ADD COLUMN IF NOT EXISTS admin_rejection_reason TEXT;
                """
            )
        )

        conn.execute(
            text(
                """
                UPDATE invoices
                SET tce_status =
                    CASE
                        WHEN LOWER(COALESCE(status, '')) = 'approved' THEN 'approved'
                        WHEN LOWER(COALESCE(status, '')) = 'rejected' THEN 'rejected'
                        ELSE 'pending'
                    END
                WHERE tce_status IS NULL;
                """
            )
        )

        conn.execute(
            text(
                """
                UPDATE invoices
                SET admin_status =
                    CASE
                        WHEN LOWER(COALESCE(status, '')) = 'approved' THEN 'pending'
                        WHEN LOWER(COALESCE(status, '')) = 'rejected' THEN 'not_required'
                        ELSE 'waiting_tce'
                    END
                WHERE admin_status IS NULL;
                """
            )
        )

        conn.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS idx_invoices_created_at
                ON invoices (created_at);

                CREATE INDEX IF NOT EXISTS idx_invoices_retailer_id
                ON invoices (retailer_id);

                CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id
                ON invoice_items (invoice_id);

                CREATE INDEX IF NOT EXISTS idx_invoices_admin_status
                ON invoices (admin_status);

                CREATE INDEX IF NOT EXISTS idx_invoices_tce_status
                ON invoices (tce_status);
                """
            )
        )

    print("Invoice review columns and indexes are ready.")


if __name__ == "__main__":
    main()