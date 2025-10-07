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
        dsm:users!dsm_id(full_name),
        exec_sponsor:exec_sponsors!exec_sponsor_id(name)
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ accounts })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
