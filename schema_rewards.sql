-- Run once against the BM-Agricare Postgres database (after retailers exists).

CREATE TABLE IF NOT EXISTS rewards (
    reward_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    points_needed INTEGER NOT NULL CHECK (points_needed > 0),
    quantity_available INTEGER,
    tier_requirement VARCHAR(32) NOT NULL DEFAULT 'bronze',
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS points_ledger (
    ledger_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_user_id UUID NOT NULL REFERENCES retailers(user_id) ON DELETE CASCADE,
    points_earned INTEGER NOT NULL DEFAULT 0 CHECK (points_earned >= 0),
    points_redeemed INTEGER NOT NULL DEFAULT 0 CHECK (points_redeemed >= 0),
    description TEXT,
    redemption_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reward_redemptions (
    redemption_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_user_id UUID NOT NULL REFERENCES retailers(user_id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    task_done BOOLEAN NOT NULL DEFAULT FALSE,
    retailer_location TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS redemption_items (
    redemption_id UUID NOT NULL REFERENCES reward_redemptions(redemption_id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES rewards(reward_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    points_per_unit INTEGER NOT NULL,
    PRIMARY KEY (redemption_id, reward_id)
);

ALTER TABLE points_ledger
    DROP CONSTRAINT IF EXISTS points_ledger_redemption_fk;

ALTER TABLE points_ledger
    ADD CONSTRAINT points_ledger_redemption_fk
    FOREIGN KEY (redemption_id) REFERENCES reward_redemptions(redemption_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_points_ledger_user ON points_ledger(retailer_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON reward_redemptions(retailer_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON reward_redemptions(status, created_at DESC);
