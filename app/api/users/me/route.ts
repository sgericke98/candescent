import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Fetch user details from users table
    const { data: userDetails, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) {
      console.error('Error fetching user details:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      user: {
        ...userDetails,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Error in /api/users/me:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
