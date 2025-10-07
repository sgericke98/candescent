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
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function findDuplicateUsers() {
  console.log('🔍 Checking for duplicate users...\n')
  
  try {
    // Get all users from the database
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('id, full_name, role, created_at')
      .order('created_at', { ascending: true })
    
    if (dbError) {
      console.error('❌ Error fetching users:', dbError)
      return
    }
    
    console.log(`📊 Found ${dbUsers?.length || 0} total user records in database\n`)
    
    // Get all auth users to match emails
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }
    
    console.log(`📊 Found ${authUsers?.length || 0} users in auth system\n`)
    
    // Create a map of auth user ID to email
    const authUserMap = new Map(authUsers.map(u => [u.id, u.email]))
    
    // Check for duplicate IDs
    const idCounts = new Map<string, number>()
    dbUsers?.forEach(user => {
      idCounts.set(user.id, (idCounts.get(user.id) || 0) + 1)
    })
    
    const duplicateIds = Array.from(idCounts.entries()).filter(([_, count]) => count > 1)
    
    if (duplicateIds.length > 0) {
      console.log('⚠️  DUPLICATE USER IDs FOUND:\n')
      for (const [userId, count] of duplicateIds) {
        const email = authUserMap.get(userId) || 'Email not found'
        const dupes = dbUsers?.filter(u => u.id === userId)
        console.log(`  User ID: ${userId}`)
        console.log(`  Email: ${email}`)
        console.log(`  Appears ${count} times:`)
        dupes?.forEach((user, idx) => {
          console.log(`    ${idx + 1}. Name: "${user.full_name}", Role: ${user.role}, Created: ${user.created_at}`)
        })
        console.log('')
      }
    }
    
    // Check for orphaned users (users in DB but not in auth)
    const authUserIds = new Set(authUsers.map(u => u.id))
    const orphanedUsers = dbUsers?.filter(u => !authUserIds.has(u.id)) || []
    
    if (orphanedUsers.length > 0) {
      console.log(`⚠️  ORPHANED USERS (in database but not in auth):\n`)
      orphanedUsers.forEach(user => {
        console.log(`  - ${user.full_name} (${user.role})`)
        console.log(`    ID: ${user.id}`)
        console.log(`    Created: ${user.created_at}\n`)
      })
    }
    
    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 SUMMARY:')
    console.log(`  Total database records: ${dbUsers?.length || 0}`)
    console.log(`  Total auth users: ${authUsers?.length || 0}`)
    console.log(`  Duplicate user IDs: ${duplicateIds.length}`)
    console.log(`  Orphaned users: ${orphanedUsers.length}`)
    
    if (duplicateIds.length > 0 || orphanedUsers.length > 0) {
      console.log('\n🔧 To fix these issues, run:')
      console.log('  npm run cleanup:duplicates')
    } else {
      console.log('\n✅ No issues found!')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

findDuplicateUsers().catch(console.error)
