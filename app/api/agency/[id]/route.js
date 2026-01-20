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
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Agency ID required' }, { status: 400 })
    }

    const supabase = getSupabase()

    const { data: agency, error } = await supabase
      .from('agencies')
      .select('id, name, slug, logo_url, primary_color, secondary_color, marketing_domain, domain_verified, support_email')
      .eq('id', id)
      .single()

    if (error || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    return NextResponse.json(agency)
  } catch (error) {
    console.error('Error fetching agency:', error)
    return NextResponse.json({ error: 'Failed to fetch agency' }, { status: 500 })
  }
}