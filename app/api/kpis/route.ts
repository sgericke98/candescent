import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const today = new Date()
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    // Get all accounts with their data
    const { data: allAccounts, error: allAccountsError } = await supabase
      .from('accounts')
      .select('id, arr_usd, status, health_score, subscription_end, updated_at')
    
    if (allAccountsError) {
      return NextResponse.json({ error: allAccountsError.message }, { status: 500 })
    }
    
    // Calculate Top-50 at risk (lowest health scores)
    const top50AtRisk = (allAccounts || [])
      .filter(acc => acc.status === 'yellow' || acc.status === 'red')
      .sort((a, b) => a.health_score - b.health_score)
      .slice(0, 50)
    
    const totalArrTop50 = top50AtRisk.reduce((sum, acc) => sum + (acc.arr_usd || 0), 0)
    
    // Get total ARR at risk (all yellow/red accounts)
    const atRiskAccounts = (allAccounts || []).filter(acc => 
      acc.status === 'yellow' || acc.status === 'red'
    )
    const totalArrAtRisk = atRiskAccounts.reduce((sum, acc) => sum + (acc.arr_usd || 0), 0)
    
    // Calculate WoW change (accounts that changed to at-risk in last 7 days)
    const recentlyAtRisk = atRiskAccounts.filter(acc => {
      const updatedDate = new Date(acc.updated_at)
      return updatedDate >= sevenDaysAgo
    })
    const wowChange = recentlyAtRisk.length
    const wowChangePercent = atRiskAccounts.length > 0 
      ? Math.round((wowChange / atRiskAccounts.length) * 100) 
      : 0
    
    // Get unique accounts through win room (last 30 days)
    const { data: winRoomData, error: winRoomError } = await supabase
      .from('win_rooms')
      .select('account_id, date')
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    
    if (winRoomError) {
      return NextResponse.json({ error: winRoomError.message }, { status: 500 })
    }
    
    const uniqueAccountsInWinRooms = new Set(winRoomData?.map(wr => wr.account_id) || []).size
    
    // Get outstanding follow-ups (activities not completed)
    const { count: outstandingFollowups, error: activitiesError } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'Completed')
    
    if (activitiesError) {
      return NextResponse.json({ error: activitiesError.message }, { status: 500 })
    }
    
    const kpis = {
      total_arr_at_risk: totalArrAtRisk * 1000, // Convert to actual dollars
      total_arr_top50: totalArrTop50 * 1000,
      accounts_at_risk: atRiskAccounts.length,
      accounts_top50_at_risk: top50AtRisk.length,
      wow_change_count: wowChange,
      wow_change_pct: wowChangePercent,
      accounts_through_win_room: uniqueAccountsInWinRooms,
      outstanding_followups: outstandingFollowups || 0
    }
    
    return NextResponse.json({ kpis })
  } catch (error) {
    console.error('KPIs API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
