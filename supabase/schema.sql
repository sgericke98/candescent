-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('viewer', 'dsm', 'admin', 'exec_sponsor');
CREATE TYPE account_status AS ENUM ('green', 'yellow', 'red');
CREATE TYPE activity_status AS ENUM ('Not Started', 'In Progress', 'Completed');
CREATE TYPE risk_type AS ENUM ('Competition', 'Price', 'Product', 'Delivery', 'Relationship', 'Changes');

-- Create users table (mirrors Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exec_sponsors table
CREATE TABLE IF NOT EXISTS exec_sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- Bank, Credit Union
  location TEXT NOT NULL,
  rssid TEXT,
  di_number TEXT,
  aum NUMERIC, -- Assets under management in millions
  arr_usd NUMERIC NOT NULL, -- Annual recurring revenue in USD thousands
  platform_fee_usd NUMERIC,
  dsm_id UUID REFERENCES users(id) ON DELETE SET NULL,
  exec_sponsor_id UUID REFERENCES exec_sponsors(id) ON DELETE SET NULL,
  health_score INTEGER NOT NULL DEFAULT 500, -- 0-1000
  status account_status NOT NULL DEFAULT 'yellow',
  path_to_green BOOLEAN DEFAULT false,
  last_qbr_date DATE,
  last_touchpoint DATE,
  subscription_end DATE,
  current_solutions TEXT,
  next_win_room DATE,
  open_activities_count INTEGER DEFAULT 0,
  dsm_risk_assessment BOOLEAN DEFAULT false,
  auto_renew BOOLEAN DEFAULT false,
  pricing_outlier BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create stakeholders table
CREATE TABLE IF NOT EXISTS stakeholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- Champion, Influencer, etc.
  description TEXT,
  status account_status,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create risks table
CREATE TABLE IF NOT EXISTS risks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  risk_type risk_type NOT NULL,
  key_risk TEXT NOT NULL,
  summary TEXT,
  supporting_evidence TEXT,
  levers_to_pull TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  activity TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status activity_status NOT NULL DEFAULT 'Not Started',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create win_rooms table
CREATE TABLE IF NOT EXISTS win_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  outcome_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_dsm_id ON accounts(dsm_id);
CREATE INDEX IF NOT EXISTS idx_accounts_exec_sponsor_id ON accounts(exec_sponsor_id);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
CREATE INDEX IF NOT EXISTS idx_accounts_health_score ON accounts(health_score);
CREATE INDEX IF NOT EXISTS idx_accounts_dsm_risk_assessment ON accounts(dsm_risk_assessment);
CREATE INDEX IF NOT EXISTS idx_accounts_auto_renew ON accounts(auto_renew);
CREATE INDEX IF NOT EXISTS idx_accounts_pricing_outlier ON accounts(pricing_outlier);
CREATE INDEX IF NOT EXISTS idx_accounts_subscription_end ON accounts(subscription_end);
CREATE INDEX IF NOT EXISTS idx_stakeholders_account_id ON stakeholders(account_id);
CREATE INDEX IF NOT EXISTS idx_risks_account_id ON risks(account_id);
CREATE INDEX IF NOT EXISTS idx_activities_account_id ON activities(account_id);
CREATE INDEX IF NOT EXISTS idx_activities_owner_id ON activities(owner_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_win_rooms_account_id ON win_rooms(account_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exec_sponsors_updated_at BEFORE UPDATE ON exec_sponsors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stakeholders_updated_at BEFORE UPDATE ON stakeholders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON risks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_win_rooms_updated_at BEFORE UPDATE ON win_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update open_activities_count
CREATE OR REPLACE FUNCTION update_open_activities_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE accounts 
    SET open_activities_count = (
      SELECT COUNT(*) 
      FROM activities 
      WHERE account_id = NEW.account_id 
      AND status != 'Completed'
    )
    WHERE id = NEW.account_id;
  END IF;
  
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    UPDATE accounts 
    SET open_activities_count = (
      SELECT COUNT(*) 
      FROM activities 
      WHERE account_id = OLD.account_id 
      AND status != 'Completed'
    )
    WHERE id = OLD.account_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for activities count
CREATE TRIGGER update_activities_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_open_activities_count();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exec_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE win_rooms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow authenticated users to read all data
CREATE POLICY "Authenticated users can read all data" ON users 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read all exec_sponsors" ON exec_sponsors 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read all accounts" ON accounts 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read all stakeholders" ON stakeholders 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read all risks" ON risks 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read all activities" ON activities 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read all win_rooms" ON win_rooms 
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert/update their own user record
CREATE POLICY "Users can insert own record" ON users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own record" ON users 
  FOR UPDATE USING (auth.uid() = id);

-- DSM can insert/update activities and risks for their accounts
CREATE POLICY "DSM can manage activities for their accounts" ON activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM accounts 
      WHERE accounts.id = activities.account_id 
      AND accounts.dsm_id = auth.uid()
    )
  );

CREATE POLICY "DSM can manage risks for their accounts" ON risks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM accounts 
      WHERE accounts.id = risks.account_id 
      AND accounts.dsm_id = auth.uid()
    )
  );

CREATE POLICY "DSM can manage stakeholders for their accounts" ON stakeholders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM accounts 
      WHERE accounts.id = stakeholders.account_id 
      AND accounts.dsm_id = auth.uid()
    )
  );

CREATE POLICY "DSM can update their accounts" ON accounts
  FOR UPDATE USING (dsm_id = auth.uid());

CREATE POLICY "DSM can manage win_rooms for their accounts" ON win_rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM accounts 
      WHERE accounts.id = win_rooms.account_id 
      AND accounts.dsm_id = auth.uid()
    )
  );
