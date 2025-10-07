import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AccountSearch } from '@/components/dashboard/account-search'

export default async function AccountsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get user role
  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentUser) {
    redirect('/auth/login')
  }

  // Only exec_sponsor and admin can access this page
  if (currentUser.role !== 'exec_sponsor' && currentUser.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Search</h1>
        <p className="text-muted-foreground mt-2">
          Search and filter accounts with comprehensive risk analysis
        </p>
      </div>
      <AccountSearch userRole={currentUser.role} />
    </div>
  )
}
