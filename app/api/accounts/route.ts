import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('query') || ''
    const dsm = searchParams.get('dsm') || ''
    const execSponsor = searchParams.get('exec_sponsor') || ''
    const atRisk = searchParams.get('atRisk') === 'true'
    
    let supabaseQuery = supabase
      .from('accounts')
      .select(`
        *,
        dsm:users(id, full_name, role, created_at, updated_at),
        exec_sponsor:exec_sponsors(id, name, created_at, updated_at)
      `)
    
    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,location.ilike.%${query}%,type.ilike.%${query}%`)
    }
    
    if (dsm) {
      supabaseQuery = supabaseQuery.eq('dsm_id', dsm)
    }
    
    if (execSponsor) {
      supabaseQuery = supabaseQuery.eq('exec_sponsor_id', execSponsor)
    }
    
    if (atRisk) {
      supabaseQuery = supabaseQuery.in('status', ['yellow', 'red'])
    }
    
    const { data: accounts, error } = await supabaseQuery
    
    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log(`✅ Fetched ${accounts?.length || 0} accounts`)
    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
