import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && sessionData?.user) {
      // Check if user exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', sessionData.user.id)
        .single()
      
      // If user doesn't exist, create a record
      if (!existingUser) {
        const userEmail = sessionData.user.email || ''
        
        // Determine role based on email
        let role: 'admin' | 'exec_sponsor' | 'dsm' | 'viewer' = 'viewer'
        
        // Admin emails
        if (userEmail === 'daniel.ban@techtorch.io' || userEmail === 'santiago.gericke@techtorch.io') {
          role = 'admin'
        }
        
        // Extract name from email or metadata
        const fullName = sessionData.user.user_metadata?.full_name || 
                        sessionData.user.user_metadata?.name ||
                        userEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        
        await supabase
          .from('users')
          .insert({
            id: sessionData.user.id,
            full_name: fullName,
            role: role
          })
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
