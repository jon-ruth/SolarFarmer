-- SunCity Database Schema
-- PostgreSQL / Supabase compatible

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PLAYERS TABLE
-- ============================================
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    town_name TEXT NOT NULL,

    -- Token balances (stored as strings to handle large numbers)
    solar_balance TEXT DEFAULT '0',
    eth_rewards_claimed TEXT DEFAULT '0',
    eth_rewards_pending TEXT DEFAULT '0',

    -- Streak tracking
    streak_days INTEGER DEFAULT 1,
    streak_last_claim_date DATE,
    last_daily_claim_at TIMESTAMPTZ,

    -- Stats
    total_solar_earned TEXT DEFAULT '0',
    total_eth_earned TEXT DEFAULT '0',
    development_score INTEGER DEFAULT 0,

    -- Referral
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES players(id),
    referral_bonus_claimed BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for leaderboard queries
CREATE INDEX idx_players_development_score ON players(development_score DESC);
CREATE INDEX idx_players_wallet ON players(wallet_address);
CREATE INDEX idx_players_referral_code ON players(referral_code);

-- ============================================
-- TOWNS TABLE
-- ============================================
CREATE TABLE towns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    name TEXT NOT NULL,

    -- Calculated stats (cached for performance)
    total_power_capacity INTEGER DEFAULT 0,
    total_power_demand INTEGER DEFAULT 0,
    buildings_powered INTEGER DEFAULT 0,
    total_buildings INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_towns_player ON towns(player_id);

-- ============================================
-- SOLAR PANELS TABLE
-- ============================================
CREATE TABLE solar_panels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    town_id UUID REFERENCES towns(id) ON DELETE CASCADE,

    panel_type TEXT NOT NULL CHECK (panel_type IN ('basic', 'array', 'farm', 'megaFarm')),
    level INTEGER DEFAULT 1,
    power_output INTEGER DEFAULT 0,

    -- Construction
    is_constructing BOOLEAN DEFAULT FALSE,
    construction_started_at TIMESTAMPTZ,
    construction_ends_at TIMESTAMPTZ,
    assigned_worker_id UUID,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_solar_panels_town ON solar_panels(town_id);
CREATE INDEX idx_solar_panels_constructing ON solar_panels(is_constructing) WHERE is_constructing = TRUE;

-- ============================================
-- BATTERIES TABLE
-- ============================================
CREATE TABLE batteries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    town_id UUID REFERENCES towns(id) ON DELETE CASCADE,

    level INTEGER DEFAULT 1,
    capacity INTEGER DEFAULT 50, -- kWh
    current_charge INTEGER DEFAULT 0,

    -- Construction
    is_constructing BOOLEAN DEFAULT FALSE,
    construction_ends_at TIMESTAMPTZ,
    assigned_worker_id UUID,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_batteries_town ON batteries(town_id);

-- ============================================
-- BUILDINGS TABLE
-- ============================================
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    town_id UUID REFERENCES towns(id) ON DELETE CASCADE,

    building_type TEXT NOT NULL CHECK (building_type IN ('home', 'school', 'hospital', 'factory')),
    level INTEGER DEFAULT 1,
    power_required INTEGER NOT NULL,
    is_powered BOOLEAN DEFAULT FALSE,
    reward_multiplier DECIMAL(4,2) DEFAULT 1.0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_buildings_town ON buildings(town_id);

-- ============================================
-- WORKERS TABLE
-- ============================================
CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    town_id UUID REFERENCES towns(id) ON DELETE CASCADE,

    level INTEGER DEFAULT 1,
    speed_multiplier DECIMAL(4,2) DEFAULT 1.0,
    is_working BOOLEAN DEFAULT FALSE,
    current_task_type TEXT, -- 'solar_panel', 'battery', etc.
    current_task_id UUID,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workers_town ON workers(town_id);
CREATE INDEX idx_workers_available ON workers(town_id, is_working) WHERE is_working = FALSE;

-- ============================================
-- TRANSACTIONS TABLE (Game economy tracking)
-- ============================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,

    transaction_type TEXT NOT NULL CHECK (transaction_type IN (
        'solar_purchase',
        'battery_purchase',
        'building_purchase',
        'worker_hire',
        'worker_upgrade',
        'panel_upgrade',
        'daily_claim',
        'epoch_reward',
        'referral_bonus'
    )),

    -- Amounts
    solar_amount TEXT, -- Can be negative for spending
    eth_amount TEXT,

    -- Reference to what was purchased/earned
    reference_type TEXT,
    reference_id UUID,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_player ON transactions(player_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- ============================================
-- EPOCH SNAPSHOTS TABLE (Daily reward distribution)
-- ============================================
CREATE TABLE epoch_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    epoch_date DATE UNIQUE NOT NULL,

    -- Pool totals
    total_eth_pool TEXT NOT NULL,
    total_development_score BIGINT NOT NULL,
    total_players INTEGER NOT NULL,

    -- Distribution status
    is_distributed BOOLEAN DEFAULT FALSE,
    distributed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_epochs_date ON epoch_snapshots(epoch_date DESC);

-- ============================================
-- EPOCH REWARDS TABLE (Individual player rewards per epoch)
-- ============================================
CREATE TABLE epoch_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    epoch_id UUID REFERENCES epoch_snapshots(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,

    development_score INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    eth_reward TEXT NOT NULL,

    is_claimed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMPTZ,
    claim_tx_hash TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(epoch_id, player_id)
);

CREATE INDEX idx_epoch_rewards_player ON epoch_rewards(player_id);
CREATE INDEX idx_epoch_rewards_unclaimed ON epoch_rewards(is_claimed) WHERE is_claimed = FALSE;

-- ============================================
-- LEADERBOARD VIEW
-- ============================================
CREATE VIEW leaderboard AS
SELECT
    p.id,
    p.wallet_address,
    p.town_name,
    p.development_score,
    t.total_power_capacity,
    p.total_eth_earned,
    RANK() OVER (ORDER BY p.development_score DESC) as rank
FROM players p
LEFT JOIN towns t ON t.player_id = p.id
ORDER BY p.development_score DESC;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update timestamp on row update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables with updated_at
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_towns_updated_at BEFORE UPDATE ON towns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_solar_panels_updated_at BEFORE UPDATE ON solar_panels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_batteries_updated_at BEFORE UPDATE ON batteries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code for new players
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_player_referral_code BEFORE INSERT ON players
    FOR EACH ROW EXECUTE FUNCTION set_referral_code();

-- Function to recalculate town stats
CREATE OR REPLACE FUNCTION recalculate_town_stats(town_uuid UUID)
RETURNS VOID AS $$
DECLARE
    power_cap INTEGER;
    power_dem INTEGER;
    powered INTEGER;
    total INTEGER;
BEGIN
    -- Calculate total power capacity from completed solar panels
    SELECT COALESCE(SUM(power_output), 0) INTO power_cap
    FROM solar_panels
    WHERE town_id = town_uuid AND is_constructing = FALSE;

    -- Calculate total power demand
    SELECT COALESCE(SUM(power_required), 0), COUNT(*) INTO power_dem, total
    FROM buildings
    WHERE town_id = town_uuid;

    -- Count powered buildings
    SELECT COUNT(*) INTO powered
    FROM buildings
    WHERE town_id = town_uuid AND is_powered = TRUE;

    -- Update town
    UPDATE towns SET
        total_power_capacity = power_cap,
        total_power_demand = power_dem,
        buildings_powered = powered,
        total_buildings = total
    WHERE id = town_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (for Supabase)
-- ============================================

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE towns ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE batteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE epoch_rewards ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies should be created based on your auth setup
-- Example policies (adjust based on your auth mechanism):

-- Players can read their own data
-- CREATE POLICY "Users can view own player data" ON players
--     FOR SELECT USING (wallet_address = current_user_wallet());

-- Players can read leaderboard (public)
-- CREATE POLICY "Leaderboard is public" ON players
--     FOR SELECT USING (true);
