import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkExecRoles() {
  console.log('🔍 Checking user roles in database...\n')
  
  // Get all users from the database
  const { data: users, error } = await supabase
    .from('users')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching users:', error)
    return
  }
  
  if (!users || users.length === 0) {
    console.log('⚠️  No users found in the database')
    return
  }
  
  console.log('📊 Current Users:\n')
  console.log('┌────────────────────────────────────┬───────────────────────────┬───────────────┐')
  console.log('│ Full Name                          │ Email                     │ Role          │')
  console.log('├────────────────────────────────────┼───────────────────────────┼───────────────┤')
  
  for (const user of users) {
    // Get email from auth
    const { data: authData } = await supabase.auth.admin.getUserById(user.id)
    const email = authData?.user?.email || 'N/A'
    
    const nameFormatted = (user.full_name || '').padEnd(34)
    const emailFormatted = email.padEnd(25)
    const roleFormatted = (user.role || '').padEnd(13)
    
    console.log(`│ ${nameFormatted} │ ${emailFormatted} │ ${roleFormatted} │`)
  }
  
  console.log('└────────────────────────────────────┴───────────────────────────┴───────────────┘')
  
  // Count by role
  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  console.log('\n📈 Role Distribution:')
  Object.entries(roleCounts).forEach(([role, count]) => {
    console.log(`  - ${role}: ${count}`)
  })
  
  // Check for executive sponsors specifically
  const execSponsors = users.filter(u => u.role === 'exec_sponsor')
  
  if (execSponsors.length === 0) {
    console.log('\n⚠️  WARNING: No users with exec_sponsor role found!')
    console.log('   Executive sponsors should have both "Executive Summary" and "Account Search" tabs.')
    console.log('   To fix this, update the role for the appropriate users.')
  } else {
    console.log(`\n✅ Found ${execSponsors.length} executive sponsor(s):`)
    for (const exec of execSponsors) {
      const { data: authData } = await supabase.auth.admin.getUserById(exec.id)
      const email = authData?.user?.email || 'N/A'
      console.log(`   - ${exec.full_name} (${email})`)
    }
    console.log('\n   These users should see both "Executive Summary" and "Account Search" tabs.')
  }
  
  console.log('\n💡 To update a user role to exec_sponsor, run:')
  console.log('   UPDATE users SET role = \'exec_sponsor\' WHERE id = \'user-id-here\';')
}

checkExecRoles().catch(console.error)
