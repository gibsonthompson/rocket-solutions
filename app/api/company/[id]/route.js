import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function GET(request, { params }) {
  try {
    const companyId = params.id

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('junk_companies')
      .select('id, company_name, company_slug, email, plan, status, is_active, temp_password')
      .eq('id', companyId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}