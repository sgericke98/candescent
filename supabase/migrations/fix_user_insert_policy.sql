-- Add policy to allow authenticated users to insert their own user record
-- This is needed for the auth callback to create user records automatically

CREATE POLICY "Users can insert own record" ON users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Also add a policy to allow service role to insert users (for admin operations)
-- This helps with the setup script and any admin user creation
CREATE POLICY "Service role can manage all users" ON users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
