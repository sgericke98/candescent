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

async function cleanupDuplicates() {
  console.log('🧹 Cleaning up duplicate users...\n')
  
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
    
    // Get auth users
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers()
    const authUserIds = new Set(authUsers.map(u => u.id))
    
    // Find duplicate IDs
    const userGroups = new Map<string, any[]>()
    dbUsers?.forEach(user => {
      if (!userGroups.has(user.id)) {
        userGroups.set(user.id, [])
      }
      userGroups.get(user.id)!.push(user)
    })
    
    let deletedCount = 0
    
    // Handle duplicates - keep the oldest record
    for (const [userId, users] of userGroups.entries()) {
      if (users.length > 1) {
        console.log(`\n🔄 Processing duplicates for user ID: ${userId}`)
        console.log(`   Found ${users.length} duplicate records`)
        
        // Sort by created_at to keep the oldest
        users.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        
        const keepUser = users[0]
        const deleteUsers = users.slice(1)
        
        console.log(`   ✅ Keeping: "${keepUser.full_name}" (${keepUser.role}) - ${keepUser.created_at}`)
        
        for (const user of deleteUsers) {
          console.log(`   🗑️  Deleting: "${user.full_name}" (${user.role}) - ${user.created_at}`)
          
          // Since all duplicates have the same ID, we need to delete by created_at to be specific
          // But actually, if they have the same ID, we can't distinguish them easily
          // The issue is that having duplicate IDs violates primary key constraint
          // This should not be possible unless something went wrong
          
          console.log(`   ⚠️  WARNING: Cannot safely delete duplicates with same ID`)
          console.log(`   This indicates a serious database integrity issue`)
          console.log(`   You may need to manually fix this in the Supabase dashboard`)
        }
      }
    }
    
    // Delete orphaned users (users in DB but not in auth)
    const orphanedUsers = dbUsers?.filter(u => !authUserIds.has(u.id)) || []
    
    if (orphanedUsers.length > 0) {
      console.log(`\n🗑️  Deleting ${orphanedUsers.length} orphaned user(s)...\n`)
      
      for (const user of orphanedUsers) {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', user.id)
        
        if (error) {
          console.error(`❌ Error deleting "${user.full_name}":`, error)
        } else {
          console.log(`✅ Deleted orphaned user: ${user.full_name}`)
          deletedCount++
        }
      }
    }
    
    console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} record(s)`)
    
    if (userGroups.size < dbUsers?.length!) {
      console.log('\n⚠️  Note: If you still see duplicate IDs, you need to fix this manually')
      console.log('   This is a database integrity issue that requires direct SQL intervention')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

cleanupDuplicates().catch(console.error)
