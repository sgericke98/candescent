import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DsmView } from '@/components/dashboard/dsm-view'

export default async function MyAccountsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get user role
  const { data: currentUser } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!currentUser) {
    redirect('/auth/login')
  }

  // Only DSM can access this page
  if (currentUser.role !== 'dsm') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Accounts</h1>
        <p className="text-muted-foreground mt-2">
          Manage your assigned accounts
        </p>
      </div>
      <DsmView dsmName={currentUser.full_name || 'Your'} />
    </div>
  )
}
