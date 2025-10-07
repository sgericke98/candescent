import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get total ARR at risk
    const { data: arrData, error: arrError } = await supabase
      .from('accounts')
      .select('arr_usd')
      .in('status', ['yellow', 'red'])
    
    if (arrError) {
      return NextResponse.json({ error: arrError.message }, { status: 500 })
    }
    
    const totalArrAtRisk = arrData?.reduce((sum, account) => sum + (account.arr_usd || 0), 0) || 0
    
    // Get accounts at risk count
    const { count: accountsAtRisk, error: countError } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .in('status', ['yellow', 'red'])
    
    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }
    
    // Get accounts through win room (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { count: accountsThroughWinRoom, error: winRoomError } = await supabase
      .from('win_rooms')
      .select('*', { count: 'exact', head: true })
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    
    if (winRoomError) {
      return NextResponse.json({ error: winRoomError.message }, { status: 500 })
    }
    
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
      accounts_at_risk: accountsAtRisk || 0,
      wow_change_pct: -8, // Mock data for now
      accounts_through_win_room: accountsThroughWinRoom || 0,
      outstanding_followups: outstandingFollowups || 0
    }
    
    return NextResponse.json({ kpis })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
