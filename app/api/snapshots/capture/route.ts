import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]
    
    // Get all accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id, health_score, status, arr_usd, open_activities_count')
    
    if (accountsError) {
      return NextResponse.json({ error: accountsError.message }, { status: 500 })
    }
    
    // Create snapshots for all accounts
    const snapshots = (accounts || []).map(account => ({
      account_id: account.id,
      health_score: account.health_score,
      status: account.status,
      arr_usd: account.arr_usd,
      open_activities_count: account.open_activities_count,
      snapshot_date: today
    }))
    
    const { error } = await supabase
      .from('health_score_snapshots')
      .upsert(snapshots, { onConflict: 'account_id,snapshot_date' })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      message: 'Snapshots captured successfully',
      count: snapshots.length 
    })
  } catch (error) {
    console.error('Error capturing snapshots:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to retrieve snapshots for chart data
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')
    const days = parseInt(searchParams.get('days') || '180')
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    let query = supabase
      .from('health_score_snapshots')
      .select('*')
      .gte('snapshot_date', startDate.toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true })
    
    if (accountId) {
      query = query.eq('account_id', accountId)
    }
    
    const { data: snapshots, error } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ snapshots })
  } catch (error) {
    console.error('Error fetching snapshots:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
