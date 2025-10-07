import { createAdminClient } from '../lib/supabase/admin'

const supabase = createAdminClient()

// Sample data
const users = [
  { id: 'user-1', full_name: 'Sarah Johnson', role: 'dsm' },
  { id: 'user-2', full_name: 'Mike Chen', role: 'dsm' },
  { id: 'user-3', full_name: 'Emily Rodriguez', role: 'dsm' },
  { id: 'user-4', full_name: 'David Kim', role: 'dsm' },
  { id: 'user-5', full_name: 'Lisa Wang', role: 'dsm' },
  { id: 'user-6', full_name: 'Admin User', role: 'admin' },
  { id: 'user-7', full_name: 'Viewer User', role: 'viewer' }
]

const execSponsors = [
  { id: 'sponsor-1', name: 'Jennifer Martinez' },
  { id: 'sponsor-2', name: 'Robert Thompson' },
  { id: 'sponsor-3', name: 'Amanda Davis' },
  { id: 'sponsor-4', name: 'Michael Brown' }
]

const accountTypes = ['Bank', 'Credit Union', 'Savings & Loan', 'Community Bank']
const locations = ['New York', 'California', 'Texas', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia']

const riskTypes = ['Relationship', 'Product', 'Competition', 'Price']
const stakeholderRoles = ['Champion', 'Influencer', 'Decision Maker', 'Budget Holder', 'Technical Lead']
const activityTypes = [
  'Schedule executive meeting',
  'Prepare renewal proposal',
  'Conduct risk assessment',
  'Develop mitigation plan',
  'Follow up on action items',
  'Schedule product demo',
  'Review contract terms',
  'Coordinate with legal team'
]

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString().split('T')[0]
}

function generateAccounts() {
  const accounts = []
  
  for (let i = 1; i <= 25; i++) {
    const healthScore = Math.floor(Math.random() * 500) + 441 // 441-940 range
    const arrUsd = Math.floor(Math.random() * 3000) + 565 // $565K to $3.6M
    const status = healthScore >= 700 ? 'green' : healthScore >= 500 ? 'yellow' : 'red'
    
    accounts.push({
      id: `account-${i}`,
      name: `${getRandomElement(['First', 'Community', 'Regional', 'Metro', 'State', 'National', 'City', 'United'])} ${getRandomElement(['Bank', 'Credit Union', 'Savings', 'Financial'])}`,
      type: getRandomElement(accountTypes),
      location: getRandomElement(locations),
      rssid: `RSS${Math.floor(Math.random() * 900000) + 100000}`,
      di_number: `DI${Math.floor(Math.random() * 900000) + 100000}`,
      aum: Math.floor(Math.random() * 5000) + 1000, // $1B to $6B
      arr_usd: arrUsd,
      platform_fee_usd: Math.floor(arrUsd * 0.1), // 10% of ARR
      dsm_id: getRandomElement(users.filter(u => u.role === 'dsm')).id,
      exec_sponsor_id: getRandomElement(execSponsors).id,
      health_score: healthScore,
      status: status,
      path_to_green: Math.random() > 0.5,
      last_qbr_date: getRandomDate(new Date('2023-06-01'), new Date('2024-01-01')),
      last_touchpoint: getRandomDate(new Date('2023-12-01'), new Date()),
      subscription_end: getRandomDate(new Date('2024-06-01'), new Date('2025-12-31')),
      current_solutions: getRandomElement(['Core Banking', 'Digital Platform', 'Mobile Banking', 'Payment Processing', 'Risk Management']),
      next_win_room: getRandomDate(new Date(), new Date('2024-03-31')),
      open_activities_count: Math.floor(Math.random() * 5) + 1
    })
  }
  
  return accounts
}

function generateStakeholders(accountId: string) {
  const count = Math.floor(Math.random() * 3) + 2 // 2-4 stakeholders
  const stakeholders = []
  
  for (let i = 0; i < count; i++) {
    stakeholders.push({
      id: `stakeholder-${accountId}-${i}`,
      account_id: accountId,
      name: `${getRandomElement(['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Jennifer'])} ${getRandomElement(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'])}`,
      role: getRandomElement(stakeholderRoles),
      description: getRandomElement([
        'Primary decision maker for technology investments',
        'Influences budget allocation for digital initiatives',
        'Technical lead responsible for system integration',
        'Champion for digital transformation initiatives',
        'Budget holder with final approval authority'
      ]),
      status: getRandomElement(['green', 'yellow', 'red', null])
    })
  }
  
  return stakeholders
}

function generateRisks(accountId: string) {
  const count = Math.floor(Math.random() * 3) + 2 // 2-4 risks
  const risks = []
  
  for (let i = 0; i < count; i++) {
    const riskType = getRandomElement(riskTypes)
    risks.push({
      id: `risk-${accountId}-${i}`,
      account_id: accountId,
      risk_type: riskType,
      key_risk: getRandomElement([
        'Key stakeholder departure',
        'Budget constraints affecting renewal',
        'Competitive pressure from alternative solutions',
        'Technical integration challenges',
        'Regulatory compliance concerns',
        'Performance issues with current solution',
        'Pricing sensitivity',
        'Change in strategic priorities'
      ]),
      summary: `Risk related to ${riskType.toLowerCase()} factors that could impact account retention`,
      supporting_evidence: getRandomElement([
        'Recent stakeholder feedback indicates concerns',
        'Market analysis shows increased competitive pressure',
        'Internal assessment reveals technical challenges',
        'Budget review shows potential constraints',
        'Stakeholder interviews highlight specific issues'
      ]),
      levers_to_pull: getRandomElement([
        'Schedule executive alignment meeting',
        'Develop customized value proposition',
        'Provide additional training and support',
        'Offer flexible pricing options',
        'Demonstrate ROI through case studies',
        'Engage with technical team for integration support'
      ])
    })
  }
  
  return risks
}

function generateActivities(accountId: string, dsmId: string) {
  const count = Math.floor(Math.random() * 4) + 2 // 2-5 activities
  const activities = []
  
  for (let i = 0; i < count; i++) {
    const dueDate = getRandomDate(new Date(), new Date('2024-03-31'))
    activities.push({
      id: `activity-${accountId}-${i}`,
      account_id: accountId,
      activity: getRandomElement(activityTypes),
      description: getRandomElement([
        'Schedule and conduct executive meeting to discuss renewal',
        'Prepare comprehensive renewal proposal with pricing',
        'Conduct detailed risk assessment and mitigation planning',
        'Follow up on previous action items and commitments',
        'Schedule product demonstration for key stakeholders',
        'Review and negotiate contract terms and conditions',
        'Coordinate with legal team for contract review'
      ]),
      owner_id: Math.random() > 0.3 ? dsmId : getRandomElement(users.filter(u => u.role === 'dsm')).id,
      status: getRandomElement(['Not Started', 'In Progress', 'Completed']),
      due_date: dueDate
    })
  }
  
  return activities
}

function generateWinRooms(accountId: string) {
  const count = Math.floor(Math.random() * 3) + 1 // 1-3 win rooms
  const winRooms = []
  
  for (let i = 0; i < count; i++) {
    const date = getRandomDate(new Date('2023-06-01'), new Date())
    winRooms.push({
      id: `winroom-${accountId}-${i}`,
      account_id: accountId,
      date: date,
      outcome_notes: getRandomElement([
        'Positive discussion about renewal with key stakeholders',
        'Identified key concerns that need to be addressed',
        'Agreed on next steps for contract negotiation',
        'Scheduled follow-up meeting to finalize terms',
        'Discussed expansion opportunities for next year'
      ])
    })
  }
  
  return winRooms
}

async function seedDatabase() {
  console.log('Starting database seed...')
  
  try {
    // Insert users
    console.log('Inserting users...')
    const { error: usersError } = await supabase
      .from('users')
      .upsert(users, { onConflict: 'id' })
    
    if (usersError) {
      console.error('Error inserting users:', usersError)
      return
    }
    
    // Insert exec sponsors
    console.log('Inserting exec sponsors...')
    const { error: sponsorsError } = await supabase
      .from('exec_sponsors')
      .upsert(execSponsors, { onConflict: 'id' })
    
    if (sponsorsError) {
      console.error('Error inserting exec sponsors:', sponsorsError)
      return
    }
    
    // Generate and insert accounts
    console.log('Generating accounts...')
    const accounts = generateAccounts()
    
    console.log('Inserting accounts...')
    const { error: accountsError } = await supabase
      .from('accounts')
      .upsert(accounts, { onConflict: 'id' })
    
    if (accountsError) {
      console.error('Error inserting accounts:', accountsError)
      return
    }
    
    // Generate and insert related data for each account
    for (const account of accounts) {
      console.log(`Processing account: ${account.name}`)
      
      // Insert stakeholders
      const stakeholders = generateStakeholders(account.id)
      if (stakeholders.length > 0) {
        const { error: stakeholdersError } = await supabase
          .from('stakeholders')
          .upsert(stakeholders, { onConflict: 'id' })
        
        if (stakeholdersError) {
          console.error(`Error inserting stakeholders for ${account.name}:`, stakeholdersError)
        }
      }
      
      // Insert risks
      const risks = generateRisks(account.id)
      if (risks.length > 0) {
        const { error: risksError } = await supabase
          .from('risks')
          .upsert(risks, { onConflict: 'id' })
        
        if (risksError) {
          console.error(`Error inserting risks for ${account.name}:`, risksError)
        }
      }
      
      // Insert activities
      const activities = generateActivities(account.id, account.dsm_id!)
      if (activities.length > 0) {
        const { error: activitiesError } = await supabase
          .from('activities')
          .upsert(activities, { onConflict: 'id' })
        
        if (activitiesError) {
          console.error(`Error inserting activities for ${account.name}:`, activitiesError)
        }
      }
      
      // Insert win rooms
      const winRooms = generateWinRooms(account.id)
      if (winRooms.length > 0) {
        const { error: winRoomsError } = await supabase
          .from('win_rooms')
          .upsert(winRooms, { onConflict: 'id' })
        
        if (winRoomsError) {
          console.error(`Error inserting win rooms for ${account.name}:`, winRoomsError)
        }
      }
    }
    
    console.log('Database seed completed successfully!')
    console.log(`Created ${users.length} users, ${execSponsors.length} exec sponsors, ${accounts.length} accounts`)
    
  } catch (error) {
    console.error('Error during seeding:', error)
  }
}

// Run the seed function
seedDatabase()
