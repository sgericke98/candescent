-- Add 'exec_sponsor' to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'exec_sponsor';

-- Add risk indicator columns to accounts table
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS dsm_risk_assessment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pricing_outlier BOOLEAN DEFAULT false;

-- Create indexes for new columns for better query performance
CREATE INDEX IF NOT EXISTS idx_accounts_dsm_risk_assessment ON accounts(dsm_risk_assessment);
CREATE INDEX IF NOT EXISTS idx_accounts_auto_renew ON accounts(auto_renew);
CREATE INDEX IF NOT EXISTS idx_accounts_pricing_outlier ON accounts(pricing_outlier);
CREATE INDEX IF NOT EXISTS idx_accounts_subscription_end ON accounts(subscription_end);

-- Add comment to explain risk fields
COMMENT ON COLUMN accounts.dsm_risk_assessment IS 'DSM has flagged this account as at risk';
COMMENT ON COLUMN accounts.auto_renew IS 'Account has auto-renewal enabled';
COMMENT ON COLUMN accounts.pricing_outlier IS 'Account pricing is flagged as an outlier';
