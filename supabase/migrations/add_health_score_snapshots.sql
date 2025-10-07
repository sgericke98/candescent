-- Create health_score_snapshots table for historical tracking
CREATE TABLE IF NOT EXISTS health_score_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  health_score INTEGER NOT NULL,
  status account_status NOT NULL,
  arr_usd NUMERIC NOT NULL,
  open_activities_count INTEGER DEFAULT 0,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, snapshot_date)
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_snapshots_account_id ON health_score_snapshots(account_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON health_score_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_account_date ON health_score_snapshots(account_id, snapshot_date DESC);

-- Enable RLS
ALTER TABLE health_score_snapshots ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Authenticated users can read snapshots" ON health_score_snapshots 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert snapshots" ON health_score_snapshots 
  FOR INSERT WITH CHECK (true);

-- Add fields to accounts table for health score management
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS health_score_last_calculated TIMESTAMPTZ;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS health_score_manual_override BOOLEAN DEFAULT false;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS health_score_override_reason TEXT;
