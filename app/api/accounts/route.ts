import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Get current user and their role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: currentUser } = await supabase
      .from('users')
      .select('role, id')
      .eq('id', user.id)
      .single()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const query = searchParams.get('query') || ''
    const dsm = searchParams.get('dsm') || ''
    const execSponsor = searchParams.get('exec_sponsor') || ''
    const filter = searchParams.get('filter') || 'all' // all, at_risk, top_50_risk, contract_expiring
    
    let supabaseQuery = supabase
      .from('accounts')
      .select(`
        *,
        dsm:users(id, full_name, role, created_at, updated_at),
        exec_sponsor:exec_sponsors(id, name, created_at, updated_at)
      `)
    
    // Role-based filtering: DSM users only see their own accounts
    if (currentUser.role === 'dsm') {
      supabaseQuery = supabaseQuery.eq('dsm_id', currentUser.id)
    }
    // exec_sponsor and admin see all accounts (no additional filter needed)
    
    // Apply search query
    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,location.ilike.%${query}%,type.ilike.%${query}%`)
    }
    
    // Apply DSM filter (for exec sponsors)
    if (dsm && currentUser.role !== 'dsm') {
      supabaseQuery = supabaseQuery.eq('dsm_id', dsm)
    }
    
    // Apply Exec Sponsor filter
    if (execSponsor) {
      supabaseQuery = supabaseQuery.eq('exec_sponsor_id', execSponsor)
    }
    
    const { data: accounts, error } = await supabaseQuery
    
    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Apply client-side filtering for complex risk logic
    let filteredAccounts = accounts || []
    
    if (filter === 'at_risk' || filter === 'top_50_risk') {
      // At risk definition: >400k ARR, contract close to ending (within 90 days), 
      // at least one risk factor (health score <600, DSM risk assessment, !path_to_green, !auto_renew, pricing_outlier)
      const today = new Date()
      const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
      
      filteredAccounts = filteredAccounts.filter(account => {
        // Must have >400k ARR
        const hasHighARR = account.arr_usd > 400
        
        // Contract close to ending (within 90 days)
        const contractExpiringSoon = account.subscription_end ? 
          new Date(account.subscription_end) <= ninetyDaysFromNow : false
        
        // At least one risk factor
        const hasRiskFactors = 
          account.health_score < 600 ||
          account.dsm_risk_assessment === true ||
          account.path_to_green === false ||
          account.auto_renew === false ||
          account.pricing_outlier === true
        
        return hasHighARR && contractExpiringSoon && hasRiskFactors
      })
      
      if (filter === 'top_50_risk') {
        // Sort by health score ascending (worst first) and take top 50
        filteredAccounts = filteredAccounts
          .sort((a, b) => a.health_score - b.health_score)
          .slice(0, 50)
      }
    } else if (filter === 'contract_expiring') {
      // Contracts expiring within 90 days
      const today = new Date()
      const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
      
      filteredAccounts = filteredAccounts.filter(account => {
        return account.subscription_end && new Date(account.subscription_end) <= ninetyDaysFromNow
      })
    }
    
    console.log(`✅ Fetched ${filteredAccounts.length} accounts for ${currentUser.role}`)
    return NextResponse.json({ accounts: filteredAccounts, userRole: currentUser.role })
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
