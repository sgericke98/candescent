-- Expand win_rooms table to store COMPLETE account snapshots

-- Add comprehensive snapshot fields to win_rooms table
ALTER TABLE win_rooms ADD COLUMN IF NOT EXISTS account_snapshot JSONB;
ALTER TABLE win_rooms ADD COLUMN IF NOT EXISTS stakeholders_snapshot JSONB;
ALTER TABLE win_rooms ADD COLUMN IF NOT EXISTS risks_snapshot JSONB;
ALTER TABLE win_rooms ADD COLUMN IF NOT EXISTS activities_snapshot JSONB;
ALTER TABLE win_rooms ADD COLUMN IF NOT EXISTS is_historical BOOLEAN DEFAULT true;

-- Backward compatibility fields (can be removed if not needed)
ALTER TABLE win_rooms ADD COLUMN IF NOT EXISTS health_score_snapshot INTEGER;
ALTER TABLE win_rooms ADD COLUMN IF NOT EXISTS status_snapshot account_status;
ALTER TABLE win_rooms ADD COLUMN IF NOT EXISTS arr_snapshot NUMERIC;

-- Add index for querying
CREATE INDEX IF NOT EXISTS idx_win_rooms_date ON win_rooms(date DESC);
CREATE INDEX IF NOT EXISTS idx_win_rooms_is_historical ON win_rooms(is_historical);

-- Comment describing the structure
COMMENT ON COLUMN win_rooms.account_snapshot IS 'Complete JSON object with ALL account fields at time of win room';
COMMENT ON COLUMN win_rooms.stakeholders_snapshot IS 'JSON array of stakeholders at time of win room';
COMMENT ON COLUMN win_rooms.risks_snapshot IS 'JSON array of risks at time of win room';
COMMENT ON COLUMN win_rooms.activities_snapshot IS 'JSON array of activities with owner details at time of win room';
COMMENT ON COLUMN win_rooms.is_historical IS 'If true, this is a read-only historical snapshot';
