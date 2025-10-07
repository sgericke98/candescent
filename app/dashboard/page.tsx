import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get user role
  let { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // If user doesn't exist in users table, create a record
  if (!currentUser) {
    const userEmail = user.email || ''
    let role: 'admin' | 'exec_sponsor' | 'dsm' | 'viewer' = 'viewer'
    
    // Admin emails
    if (userEmail === 'daniel.ban@techtorch.io' || userEmail === 'santiago.gericke@techtorch.io') {
      role = 'admin'
    }
    
    const fullName = user.user_metadata?.full_name || 
                    user.user_metadata?.name ||
                    userEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    
    const { error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        full_name: fullName,
        role: role
      })
    
    if (error) {
      console.error('Error creating user record:', error)
      redirect('/auth/login')
    }
    
    // Fetch the newly created user
    const { data: newUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    currentUser = newUser
  }

  if (!currentUser) {
    redirect('/auth/login')
  }

  // Redirect based on role
  if (currentUser.role === 'dsm') {
    redirect('/dashboard/my-accounts')
  } else if (currentUser.role === 'exec_sponsor') {
    redirect('/dashboard/executive-summary')
  } else {
    // admin or viewer
    redirect('/dashboard/executive-summary')
  }
}
