import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get user role and details
  const { data: currentUser } = await supabase
    .from('users')
    .select('role, full_name')
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
    
    await supabase
      .from('users')
      .insert({
        id: user.id,
        full_name: fullName,
        role: role
      })
    
    // Redirect to refresh the page with the new user data
    redirect('/dashboard')
  }

  // Define navigation based on role
  const navigation = []
  
  if (currentUser.role === 'dsm') {
    navigation.push(
      { name: 'My Accounts', href: '/dashboard/my-accounts' }
    )
  } else if (currentUser.role === 'exec_sponsor') {
    navigation.push(
      { name: 'Executive Summary', href: '/dashboard/executive-summary' },
      { name: 'Account Search', href: '/dashboard/accounts' }
    )
  } else if (currentUser.role === 'admin') {
    navigation.push(
      { name: 'Executive Summary', href: '/dashboard/executive-summary' },
      { name: 'Account Search', href: '/dashboard/accounts' },
      { name: 'Admin', href: '/dashboard/admin' },
      { name: 'Import', href: '/dashboard/import' }
    )
  } else {
    // viewer
    navigation.push(
      { name: 'Executive Summary', href: '/dashboard/executive-summary' }
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60 shadow-sm">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Image 
                    src="/logo.png" 
                    alt="Candescent Logo" 
                    width={180} 
                    height={40}
                    className="h-8 w-auto"
                    priority
                  />
                </Link>
                <span className="text-sm text-muted-foreground hidden sm:inline">Win Room Dashboard</span>
              </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-fg">
                Welcome, {currentUser.full_name || user.email}
              </span>
              <form action="/auth/logout" method="post">
                <Button type="submit" variant="outline" size="sm">
                  Log Out
                </Button>
              </form>
            </div>
          </div>
          
          {/* Navigation */}
          {navigation.length > 0 && (
            <nav className="flex space-x-1 border-t border-border py-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
      <main className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}
