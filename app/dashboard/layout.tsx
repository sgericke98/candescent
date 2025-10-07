import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60 shadow-sm">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-2">
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #fbbf24 0%, #3b82f6 100%)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
              }}>
                <span style={{ fontSize: '20px' }}>💡</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">candescent</h1>
            </div>
            <span className="text-sm text-muted-foreground">Win Room Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-fg">
              Welcome, {user.user_metadata?.full_name || user.email}
            </span>
          </div>
        </div>
      </header>
      <main className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}
