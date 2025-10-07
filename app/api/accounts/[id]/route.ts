import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const supabase = await createClient()
    const { id } = await context.params
    const body = await request.json()
    
    // Extract fields that can be updated
    const {
      path_to_green,
      next_win_room,
      current_solutions,
      last_qbr_date,
      last_touchpoint,
      subscription_end
    } = body
    
    const updateData: Record<string, unknown> = {}
    
    if (path_to_green !== undefined) updateData.path_to_green = path_to_green
    if (next_win_room !== undefined) updateData.next_win_room = next_win_room
    if (current_solutions !== undefined) updateData.current_solutions = current_solutions
    if (last_qbr_date !== undefined) updateData.last_qbr_date = last_qbr_date
    if (last_touchpoint !== undefined) updateData.last_touchpoint = last_touchpoint
    if (subscription_end !== undefined) updateData.subscription_end = subscription_end
    
    const { data: account, error } = await supabase
      .from('accounts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ account })
  } catch (error) {
    console.error('Error updating account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const supabase = await createClient()
    const { id } = await context.params
    
    // Fetch account with all related data in a single query
    const { data: account, error } = await supabase
      .from('accounts')
      .select(`
        *,
        dsm:users!dsm_id(
          id,
          full_name,
          role,
          created_at,
          updated_at
        ),
        exec_sponsor:exec_sponsors!exec_sponsor_id(
          id,
          name,
          created_at,
          updated_at
        ),
        stakeholders(
          id,
          account_id,
          name,
          role,
          description,
          status,
          created_at,
          updated_at
        ),
        risks(
          id,
          account_id,
          risk_type,
          key_risk,
          summary,
          supporting_evidence,
          levers_to_pull,
          created_at,
          updated_at
        ),
        activities(
          id,
          account_id,
          activity,
          description,
          owner_id,
          status,
          due_date,
          created_at,
          updated_at,
          owner:users!owner_id(
            id,
            full_name,
            role,
            created_at,
            updated_at
          )
        ),
        win_rooms(
          id,
          account_id,
          date,
          outcome_notes,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Account not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    // Sort activities by due date (most recent first)
    if (account.activities) {
      account.activities.sort((a: { due_date: string | null }, b: { due_date: string | null }) => {
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
      })
    }
    
    // Sort win rooms by date (most recent first)
    if (account.win_rooms) {
      account.win_rooms.sort((a: { date: string }, b: { date: string }) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    }
    
    return NextResponse.json({ account })
  } catch (error) {
    console.error('Error fetching account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
