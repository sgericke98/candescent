import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { data: activity, error } = await supabase
      .from('activities')
      .insert(body)
      .select(`
        *,
        owner:users!owner_id(*)
      `)
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ activity })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, ...updateData } = body
    
    console.log('Updating activity:', id, updateData)
    
    const { data: activity, error } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        owner:users(id, full_name, role, created_at, updated_at)
      `)
      .single()
    
    if (error) {
      console.error('Supabase error updating activity:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('Activity updated successfully:', activity)
    return NextResponse.json({ activity })
  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Activity ID required' }, { status: 400 })
    }
    
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
