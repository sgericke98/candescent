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

async function setupTestUsers() {
  console.log('🚀 Setting up test users...\n')
  
  const testUsers = [
    {
      email: 'admin@candescent.test',
      password: 'Admin123!@#',
      full_name: 'Test Admin',
      role: 'admin'
    },
    {
      email: 'exec@candescent.test',
      password: 'Exec123!@#',
      full_name: 'Test Executive Sponsor',
      role: 'exec_sponsor'
    },
    {
      email: 'dsm@candescent.test',
      password: 'DSM123!@#',
      full_name: 'Test DSM',
      role: 'dsm'
    }
  ]

  console.log('📧 Creating auth users and database records...\n')

  for (const user of testUsers) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  User ${user.email} already exists in auth`)
          
          // Get the existing user
          const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
          if (listError) {
            console.error(`Error listing users:`, listError)
            continue
          }
          
          const existingUser = users.find(u => u.email === user.email)
          if (existingUser) {
            // Update or insert user record in database
            const { error: upsertError } = await supabase
              .from('users')
              .upsert({
                id: existingUser.id,
                full_name: user.full_name,
                role: user.role
              }, { onConflict: 'id' })
            
            if (upsertError) {
              console.error(`Error updating user record for ${user.email}:`, upsertError)
            } else {
              console.log(`✅ Updated database record for ${user.email}`)
            }
          }
        } else {
          console.error(`Error creating auth user ${user.email}:`, authError)
        }
        continue
      }

      if (authData.user) {
        // Create user record in database
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            full_name: user.full_name,
            role: user.role
          })

        if (dbError) {
          console.error(`Error creating database record for ${user.email}:`, dbError)
        } else {
          console.log(`✅ Created ${user.role}: ${user.email}`)
        }
      }
    } catch (error) {
      console.error(`Error setting up ${user.email}:`, error)
    }
  }

  console.log('\n📝 Test User Credentials:\n')
  console.log('┌─────────────────────────────┬────────────────────────────┬─────────────────┐')
  console.log('│ Role                        │ Email                      │ Password        │')
  console.log('├─────────────────────────────┼────────────────────────────┼─────────────────┤')
  console.log('│ Admin                       │ admin@candescent.test      │ Admin123!@#     │')
  console.log('│ Executive Sponsor           │ exec@candescent.test       │ Exec123!@#      │')
  console.log('│ DSM                         │ dsm@candescent.test        │ DSM123!@#       │')
  console.log('└─────────────────────────────┴────────────────────────────┴─────────────────┘')
  
  console.log('\n🔐 Admin Emails (auto-granted admin role on login):')
  console.log('  - daniel.ban@techtorch.io')
  console.log('  - santiago.gericke@techtorch.io')

  console.log('\n🎯 Updating existing accounts with risk indicators...\n')
  
  // Update accounts to include risk indicator fields
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('id, arr_usd, health_score, subscription_end')
  
  if (accountsError) {
    console.error('Error fetching accounts:', accountsError)
  } else if (accounts) {
    console.log(`Found ${accounts.length} accounts to update`)
    
    for (const account of accounts) {
      // Randomly set risk indicators based on health score and ARR
      const dsm_risk_assessment = account.health_score < 600 && Math.random() > 0.5
      const auto_renew = Math.random() > 0.3 // 70% have auto-renew
      const pricing_outlier = account.arr_usd > 2000 && Math.random() > 0.7 // High ARR accounts more likely to be outliers
      
      const { error: updateError } = await supabase
        .from('accounts')
        .update({
          dsm_risk_assessment,
          auto_renew,
          pricing_outlier
        })
        .eq('id', account.id)
      
      if (updateError) {
        console.error(`Error updating account ${account.id}:`, updateError)
      }
    }
    
    console.log(`✅ Updated ${accounts.length} accounts with risk indicators`)
  }

  // Assign some accounts to the test DSM
  const { data: dsmUser } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'dsm')
    .limit(1)
    .single()

  if (dsmUser) {
    const { data: testDsmUser } = await supabase
      .from('users')
      .select('id')
      .eq('full_name', 'Test DSM')
      .single()

    if (testDsmUser) {
      // Assign 5 random accounts to test DSM
      const { data: accountsToAssign } = await supabase
        .from('accounts')
        .select('id')
        .limit(5)

      if (accountsToAssign && accountsToAssign.length > 0) {
        for (const account of accountsToAssign) {
          await supabase
            .from('accounts')
            .update({ dsm_id: testDsmUser.id })
            .eq('id', account.id)
        }
        console.log(`\n✅ Assigned ${accountsToAssign.length} accounts to Test DSM`)
      }
    }
  }

  console.log('\n✅ Setup complete! You can now test the application.\n')
  console.log('🌐 To test:')
  console.log('1. Go to your login page')
  console.log('2. Use one of the test credentials above')
  console.log('3. Or use magic link with daniel.ban@techtorch.io or santiago.gericke@techtorch.io\n')
}

setupTestUsers().catch(console.error)
