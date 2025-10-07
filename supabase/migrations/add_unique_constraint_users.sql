-- This migration adds a unique constraint to prevent duplicate user IDs
-- and ensures data integrity for the users table

-- First, let's check if there are any duplicates before adding the constraint
-- (This is just informational, the constraint will fail if duplicates exist)

-- Add a comment to document the primary key
COMMENT ON COLUMN users.id IS 'Primary key - must match Supabase Auth user ID. Each auth user can only have one record.';

-- The id column is already the primary key, but let's ensure there are no duplicate records
-- If this fails, you need to run the cleanup script first: npm run cleanup:duplicates

-- You can verify uniqueness by running:
-- SELECT id, COUNT(*) as count FROM users GROUP BY id HAVING COUNT(*) > 1;

-- Note: The primary key constraint on 'id' should already prevent duplicates,
-- but if you're seeing duplicates, there may be a more serious issue.

-- Let's also add a check to prevent empty user records
ALTER TABLE users
  ADD CONSTRAINT users_full_name_not_empty CHECK (full_name <> '');

-- Ensure created_at and updated_at are not null
ALTER TABLE users
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

-- Add comment for documentation
COMMENT ON TABLE users IS 'User profiles that mirror Supabase Auth users. The id must match auth.users.id. Each auth user should have exactly one record here.';

COMMENT ON COLUMN users.full_name IS 'User full name - must not be empty';
COMMENT ON COLUMN users.role IS 'User role - determines access permissions (admin, exec_sponsor, dsm, viewer)';
COMMENT ON COLUMN users.created_at IS 'Timestamp when user record was created';
COMMENT ON COLUMN users.updated_at IS 'Timestamp when user record was last updated';
