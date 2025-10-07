"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Github, Mail, Lock } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isMagicLink, setIsMagicLink] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    console.log('✅ Login page loaded')
  }, [])

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      console.log('🔐 Attempting login with:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Auth error:', error)
        setMessage(error.message)
        setLoading(false)
        return
      }

      if (data?.user) {
        console.log('✅ Auth successful, checking user record...')
        
        // Ensure user record exists in users table
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single()
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('❌ Error fetching user:', fetchError)
          setMessage('Error checking user record. Please try again.')
          setLoading(false)
          return
        }
        
        if (!existingUser) {
          console.log('📝 Creating user record...')
          
          // Create user record
          const userEmail = data.user.email || ''
          let role: 'admin' | 'exec_sponsor' | 'dsm' | 'viewer' = 'viewer'
          
          if (userEmail === 'daniel.ban@techtorch.io' || userEmail === 'santiago.gericke@techtorch.io') {
            role = 'admin'
          }
          
          const fullName = data.user.user_metadata?.full_name || 
                          data.user.user_metadata?.name ||
                          userEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              full_name: fullName,
              role: role
            })
          
          if (insertError) {
            console.error('❌ Error creating user record:', insertError)
            setMessage(`Error creating user record: ${insertError.message}`)
            setLoading(false)
            return
          }
          
          console.log('✅ User record created')
        } else {
          console.log('✅ User record exists')
        }
        
        console.log('🚀 Redirecting to dashboard...')
        // Use window.location for more reliable redirect
        window.location.href = '/dashboard'
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err)
      setMessage('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the login link!')
    }
    setLoading(false)
  }

  const handleGithubLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('❌ GitHub auth error:', error)
        setMessage(error.message)
        setLoading(false)
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err)
      setMessage('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Image 
                src="/logo.png" 
                alt="Candescent Logo" 
                width={240} 
                height={60}
                className="h-12 w-auto"
                priority
              />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <p className="text-muted-foreground">Sign in to access Win Room Dashboard</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle between email/password and magic link */}
          <div className="flex rounded-lg border p-1">
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                !isMagicLink 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setIsMagicLink(false)}
            >
              <Lock className="mr-2 h-4 w-4 inline" />
              Email & Password
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isMagicLink 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setIsMagicLink(true)}
            >
              <Mail className="mr-2 h-4 w-4 inline" />
              Magic Link
            </button>
          </div>

          {!isMagicLink ? (
            // Email & Password Form
            <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          ) : (
            // Magic Link Form
            <form onSubmit={handleMagicLinkLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email">Email</Label>
                <Input
                  id="magic-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Magic Link'}
              </Button>
            </form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGithubLogin}
            disabled={loading}
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>

          {message && (
            <div className={`text-sm text-center ${
              message.includes('Check your email') ? 'text-green-600' : 'text-red-600'
            }`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
