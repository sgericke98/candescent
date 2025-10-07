import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all win rooms with account information
    const { data: winRooms, error: winRoomsError } = await supabase
      .from('win_rooms')
      .select(`
        *,
        account:accounts (
          id,
          name,
          arr_usd,
          status,
          health_score,
          dsm:users (
            id,
            full_name
          )
        )
      `)
      .order('date', { ascending: false })

    if (winRoomsError) {
      console.error('Error fetching win rooms:', winRoomsError)
      return NextResponse.json({ error: winRoomsError.message }, { status: 500 })
    }

    return NextResponse.json({ winRooms: winRooms || [] })
  } catch (error) {
    console.error('Win rooms API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}