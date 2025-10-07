import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ImportRow {
  [key: string]: string | number | boolean | null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { data: rows, fieldMapping } = body
    
    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }
    
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      
      try {
        // Map CSV fields to database fields
        const accountData: any = {}
        
        for (const [dbField, csvField] of Object.entries(fieldMapping)) {
          if (csvField && row[csvField as string] !== undefined && row[csvField as string] !== null && row[csvField as string] !== '') {
            let value = row[csvField as string]
            
            // Type conversions
            if (dbField === 'aum' || dbField === 'arr_usd' || dbField === 'platform_fee_usd') {
              value = parseFloat(value as string) || 0
            } else if (dbField === 'health_score' || dbField === 'open_activities_count') {
              value = parseInt(value as string) || 0
            } else if (dbField === 'path_to_green') {
              value = value === 'true' || value === 'yes' || value === '1' || value === true
            }
            
            accountData[dbField] = value
          }
        }
        
        // Ensure required fields exist
        if (!accountData.name) {
          results.errors.push(`Row ${i + 1}: Missing required field 'name'`)
          results.failed++
          continue
        }
        
        // Set defaults for required fields
        if (!accountData.type) accountData.type = 'Bank'
        if (!accountData.location) accountData.location = 'Unknown'
        if (!accountData.arr_usd) accountData.arr_usd = 0
        if (accountData.health_score === undefined) accountData.health_score = 500
        if (!accountData.status) {
          accountData.status = accountData.health_score >= 700 ? 'green' : 
                               accountData.health_score >= 500 ? 'yellow' : 'red'
        }
        
        // Insert or update account
        const { error } = await supabase
          .from('accounts')
          .upsert(accountData, { onConflict: 'name' })
        
        if (error) {
          results.errors.push(`Row ${i + 1}: ${error.message}`)
          results.failed++
        } else {
          results.success++
        }
      } catch (error) {
        results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        results.failed++
      }
    }
    
    return NextResponse.json({ results })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
