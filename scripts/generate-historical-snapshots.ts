import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { createAdminClient } from '../lib/supabase/admin'

const supabase = createAdminClient()

async function generateHistoricalSnapshots() {
  console.log('📸 Generating historical snapshots...')
  
  try {
    // Get all accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id, health_score, status, arr_usd, open_activities_count')
    
    if (accountsError) {
      console.error('Error fetching accounts:', accountsError)
      return
    }
    
    console.log(`Found ${accounts?.length || 0} accounts`)
    
    // Generate snapshots for the last 6 months (180 days)
    const snapshots = []
    const today = new Date()
    
    for (let daysAgo = 180; daysAgo >= 0; daysAgo -= 7) { // Weekly snapshots
      const snapshotDate = new Date(today)
      snapshotDate.setDate(today.getDate() - daysAgo)
      const dateStr = snapshotDate.toISOString().split('T')[0]
      
      for (const account of (accounts || [])) {
        // Simulate historical variation (±10% health score)
        const variation = 1 + (Math.random() * 0.2 - 0.1)
        const historicalHealthScore = Math.round(account.health_score * variation)
        const historicalStatus = 
          historicalHealthScore >= 700 ? 'green' : 
          historicalHealthScore >= 500 ? 'yellow' : 'red'
        
        // Simulate historical ARR (slight variations)
        const arrVariation = 1 + (Math.random() * 0.15 - 0.075) // ±7.5%
        const historicalARR = Math.round(account.arr_usd * arrVariation)
        
        snapshots.push({
          account_id: account.id,
          health_score: Math.min(Math.max(historicalHealthScore, 0), 1000),
          status: historicalStatus,
          arr_usd: historicalARR,
          open_activities_count: account.open_activities_count + Math.floor(Math.random() * 3 - 1),
          snapshot_date: dateStr
        })
      }
    }
    
    console.log(`Generating ${snapshots.length} snapshot records...`)
    
    // Insert in batches to avoid timeout
    const batchSize = 100
    for (let i = 0; i < snapshots.length; i += batchSize) {
      const batch = snapshots.slice(i, i + batchSize)
      const { error } = await supabase
        .from('health_score_snapshots')
        .upsert(batch, { onConflict: 'account_id,snapshot_date' })
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
      } else {
        console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} records)`)
      }
    }
    
    console.log('✅ Historical snapshots generated successfully!')
    
  } catch (error) {
    console.error('Error generating snapshots:', error)
  }
}

generateHistoricalSnapshots()
