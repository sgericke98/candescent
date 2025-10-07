import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixRLSPolicy() {
  console.log('🔧 Fixing RLS policy to allow user creation...\n')
  
  try {
    // Apply the RLS policy fix
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing policy if it exists (in case we're rerunning)
        DROP POLICY IF EXISTS "Users can insert own record" ON users;
        
        -- Add policy to allow authenticated users to insert their own user record
        CREATE POLICY "Users can insert own record" ON users 
          FOR INSERT 
          WITH CHECK (auth.uid() = id);
      `
    })
    
    if (error) {
      console.error('❌ Error applying RLS policy via RPC:', error)
      console.log('\n📝 Please apply this SQL manually in Supabase Dashboard:\n')
      console.log('----------------------------------------')
      console.log(`CREATE POLICY IF NOT EXISTS "Users can insert own record" ON users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);`)
      console.log('----------------------------------------\n')
      console.log('Go to: https://supabase.com/dashboard > SQL Editor > Run the above query')
      return
    }
    
    console.log('✅ RLS policy applied successfully!')
    console.log('\n📝 What was fixed:')
    console.log('  - Users can now insert their own records in the users table')
    console.log('  - This allows automatic user creation on first login')
    console.log('  - Magic link authentication will now work properly')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    console.log('\n📝 Please apply this SQL manually in Supabase Dashboard:\n')
    console.log('----------------------------------------')
    console.log(`CREATE POLICY IF NOT EXISTS "Users can insert own record" ON users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);`)
    console.log('----------------------------------------\n')
    console.log('Go to: https://supabase.com/dashboard > SQL Editor > Run the above query')
  }
}

fixRLSPolicy().catch(console.error)
