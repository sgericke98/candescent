import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'wow' // 'wow' or 'ytd'

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let startDate: Date
    let comparisonDate: Date

    if (period === 'wow') {
      // Week over Week: Compare this week to last week
      startDate = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000) // 2 weeks ago
      comparisonDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
    } else {
      // Year to Date: Compare current year to start of year
      startDate = new Date(today.getFullYear(), 0, 1) // Jan 1st of current year
      comparisonDate = new Date(today.getFullYear(), 0, 1) // Jan 1st for comparison
    }

    // Fetch snapshots for the period
    const { data: snapshots, error: snapshotsError } = await supabase
      .from('health_score_snapshots')
      .select('*')
      .gte('snapshot_date', startDate.toISOString().split('T')[0])
      .lte('snapshot_date', today.toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true })

    if (snapshotsError) {
      console.error('Error fetching snapshots:', snapshotsError)
      return NextResponse.json({ error: snapshotsError.message }, { status: 500 })
    }

    // Get current accounts data
    const { data: currentAccounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id, name, arr_usd, status, subscription_end')

    if (accountsError) {
      return NextResponse.json({ error: accountsError.message }, { status: 500 })
    }

    // Calculate waterfall metrics
    const waterfallData = calculateWaterfallMetrics(
      snapshots || [],
      currentAccounts || [],
      period,
      comparisonDate,
      today
    )

    return NextResponse.json({ data: waterfallData })
  } catch (error) {
    console.error('Waterfall API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

interface Snapshot {
  account_id: string
  snapshot_date: string
  status: string
  arr_usd: number
}

interface CurrentAccount {
  id: string
  status: string
  arr_usd: number
  subscription_end?: string
}

function calculateWaterfallMetrics(
  snapshots: Snapshot[],
  currentAccounts: CurrentAccount[],
  period: string,
  startDate: Date,
  endDate: Date
) {
  // Group snapshots by account and date
  const accountSnapshots: Record<string, Snapshot[]> = {}
  
  snapshots.forEach(snapshot => {
    if (!accountSnapshots[snapshot.account_id]) {
      accountSnapshots[snapshot.account_id] = []
    }
    accountSnapshots[snapshot.account_id].push(snapshot)
  })

  // Calculate starting at-risk accounts (beginning of period)
  const startingAtRisk = new Set<string>()
  const endingAtRisk = new Set<string>()
  const termNotices = new Set<string>()
  const renewals = new Set<string>()
  const escalations = new Set<string>()
  const deEscalations = new Set<string>()

  let startingARR = 0
  let endingARR = 0
  let termNoticesARR = 0
  let renewalsARR = 0
  let escalationsARR = 0
  let deEscalationsARR = 0

  // Determine period boundaries
  const periodStart = period === 'wow' 
    ? new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    : startDate
  const periodEnd = endDate

  Object.entries(accountSnapshots).forEach(([accountId, snaps]) => {
    const sortedSnaps = snaps.sort((a, b) => 
      new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime()
    )

    // Get snapshot at start of period
    const startSnapshot = sortedSnaps.find(s => 
      new Date(s.snapshot_date) <= periodStart
    ) || sortedSnaps[0]

    // Get snapshot at end of period (or current status)
    const currentAccount = currentAccounts.find(acc => acc.id === accountId)
    const endSnapshot = sortedSnaps[sortedSnaps.length - 1]

    const startStatus = startSnapshot?.status || 'green'
    const endStatus = currentAccount?.status || endSnapshot?.status || 'green'
    const startArr = startSnapshot?.arr_usd || 0
    const endArr = currentAccount?.arr_usd || endSnapshot?.arr_usd || 0

    const wasAtRisk = startStatus === 'yellow' || startStatus === 'red'
    const isAtRisk = endStatus === 'yellow' || endStatus === 'red'

    // Check for term notices (subscription ended or ending soon)
    const subscriptionEnd = currentAccount?.subscription_end
    const hasTermed = subscriptionEnd && new Date(subscriptionEnd) < periodEnd

    if (wasAtRisk) {
      startingAtRisk.add(accountId)
      startingARR += startArr * 1000
    }

    if (isAtRisk && !hasTermed) {
      endingAtRisk.add(accountId)
      endingARR += endArr * 1000
    }

    // Categorize changes
    if (wasAtRisk && hasTermed) {
      termNotices.add(accountId)
      termNoticesARR += startArr * 1000
    } else if (wasAtRisk && !isAtRisk && !hasTermed) {
      // Check if it's a renewal (subscription renewed) or de-escalation (health improved)
      if (subscriptionEnd && new Date(subscriptionEnd) > periodEnd) {
        renewals.add(accountId)
        renewalsARR += startArr * 1000
      } else {
        deEscalations.add(accountId)
        deEscalationsARR += startArr * 1000
      }
    } else if (!wasAtRisk && isAtRisk) {
      escalations.add(accountId)
      escalationsARR += endArr * 1000
    }
  })

  return [
    {
      category: 'Starting At-Risk',
      logoCount: startingAtRisk.size,
      acv: startingARR,
      displayValue: startingARR
    },
    {
      category: 'Term Notices',
      logoCount: termNotices.size,
      acv: -termNoticesARR,
      displayValue: termNoticesARR
    },
    {
      category: 'Renewals',
      logoCount: renewals.size,
      acv: -renewalsARR,
      displayValue: renewalsARR
    },
    {
      category: 'Risk De-escalations',
      logoCount: deEscalations.size,
      acv: -deEscalationsARR,
      displayValue: deEscalationsARR
    },
    {
      category: 'Risk Escalations',
      logoCount: escalations.size,
      acv: escalationsARR,
      displayValue: escalationsARR
    },
    {
      category: 'Ending At-Risk',
      logoCount: endingAtRisk.size,
      acv: endingARR,
      displayValue: endingARR
    }
  ]
}
