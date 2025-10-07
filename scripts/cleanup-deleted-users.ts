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

async function cleanupDeletedUsers() {
  console.log('🧹 Cleaning up deleted users...\n')
  
  try {
    // Get all users from the users table
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('id, full_name, role')
    
    if (dbError) {
      console.error('❌ Error fetching users from database:', dbError)
      return
    }
    
    console.log(`Found ${dbUsers?.length || 0} users in database`)
    
    // Get all users from Supabase Auth
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }
    
    console.log(`Found ${authUsers?.length || 0} users in auth system\n`)
    
    // Find users in database that don't exist in auth
    const authUserIds = new Set(authUsers.map(u => u.id))
    const orphanedUsers = dbUsers?.filter(u => !authUserIds.has(u.id)) || []
    
    if (orphanedUsers.length === 0) {
      console.log('✅ No orphaned users found!')
      return
    }
    
    console.log(`Found ${orphanedUsers.length} orphaned users:\n`)
    orphanedUsers.forEach(user => {
      console.log(`  - ${user.full_name} (${user.role}) - ID: ${user.id}`)
    })
    
    console.log('\n🔍 Checking references...\n')
    
    // Check which accounts reference these users
    for (const user of orphanedUsers) {
      const { data: accounts } = await supabase
        .from('accounts')
        .select('id, name')
        .eq('dsm_id', user.id)
      
      if (accounts && accounts.length > 0) {
        console.log(`  ⚠️  User "${user.full_name}" is assigned as DSM to ${accounts.length} account(s):`)
        accounts.forEach(acc => console.log(`     - ${acc.name}`))
      }
      
      const { data: activities } = await supabase
        .from('activities')
        .select('id, activity')
        .eq('owner_id', user.id)
      
      if (activities && activities.length > 0) {
        console.log(`  ⚠️  User "${user.full_name}" owns ${activities.length} activit(ies)`)
      }
    }
    
    console.log('\n📝 Options:\n')
    console.log('1. Delete orphaned user records (removes from users table)')
    console.log('   - This will set dsm_id to NULL for their accounts')
    console.log('   - This will set owner_id to NULL for their activities')
    console.log('')
    console.log('To proceed, run:')
    console.log('  npm run cleanup:users -- --delete')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

async function deleteOrphanedUsers() {
  console.log('🗑️  Deleting orphaned users...\n')
  
  try {
    // Get all users from database
    const { data: dbUsers } = await supabase
      .from('users')
      .select('id, full_name')
    
    // Get all auth users
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers()
    const authUserIds = new Set(authUsers.map(u => u.id))
    
    // Find orphaned users
    const orphanedUsers = dbUsers?.filter(u => !authUserIds.has(u.id)) || []
    
    if (orphanedUsers.length === 0) {
      console.log('✅ No orphaned users to delete')
      return
    }
    
    console.log(`Deleting ${orphanedUsers.length} orphaned user(s)...\n`)
    
    for (const user of orphanedUsers) {
      // Delete the user record (foreign keys will handle nullifying references)
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)
      
      if (error) {
        console.error(`❌ Error deleting user "${user.full_name}":`, error)
      } else {
        console.log(`✅ Deleted user: ${user.full_name}`)
      }
    }
    
    console.log('\n✅ Cleanup complete!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Check command line arguments
const shouldDelete = process.argv.includes('--delete')

if (shouldDelete) {
  deleteOrphanedUsers().catch(console.error)
} else {
  cleanupDeletedUsers().catch(console.error)
}
