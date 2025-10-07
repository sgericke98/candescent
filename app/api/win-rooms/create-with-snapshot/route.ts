import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { account_id, date, outcome_notes } = body
    
    if (!account_id || !date) {
      return NextResponse.json({ error: 'account_id and date are required' }, { status: 400 })
    }
    
    // Fetch complete account state for snapshot
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select(`
        *,
        dsm:users(id, full_name, role, created_at, updated_at),
        exec_sponsor:exec_sponsors(id, name, created_at, updated_at)
      `)
      .eq('id', account_id)
      .single()
    
    if (accountError) {
      return NextResponse.json({ error: accountError.message }, { status: 500 })
    }
    
    // Fetch stakeholders
    const { data: stakeholders } = await supabase
      .from('stakeholders')
      .select('*')
      .eq('account_id', account_id)
    
    // Fetch risks
    const { data: risks } = await supabase
      .from('risks')
      .select('*')
      .eq('account_id', account_id)
    
    // Fetch activities
    const { data: activities } = await supabase
      .from('activities')
      .select(`
        *,
        owner:users(id, full_name, role)
      `)
      .eq('account_id', account_id)
    
    // Create win room with complete snapshot
    const { data: winRoom, error: winRoomError } = await supabase
      .from('win_rooms')
      .insert({
        account_id,
        date,
        outcome_notes,
        account_snapshot: account, // Complete account object with all fields
        stakeholders_snapshot: stakeholders || [],
        risks_snapshot: risks || [],
        activities_snapshot: activities || [],
        health_score_snapshot: account.health_score, // Backward compat
        status_snapshot: account.status, // Backward compat
        arr_snapshot: account.arr_usd, // Backward compat
        is_historical: true
      })
      .select()
      .single()
    
    if (winRoomError) {
      return NextResponse.json({ error: winRoomError.message }, { status: 500 })
    }
    
    return NextResponse.json({ winRoom })
  } catch (error) {
    console.error('Error creating win room:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
