import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const domain = searchParams.get('domain')

  if (!slug && !domain) {
    return NextResponse.json({ error: 'Missing slug or domain' }, { status: 400 })
  }

  const supabase = getSupabase()

  try {
    let query = supabase
      .from('agencies')
      .select('id, slug, name, logo_url, logo_background_color, primary_color, secondary_color, tertiary_color, tagline, support_email, support_phone, price_starter, price_pro, price_growth, marketing_domain')
      .eq('status', 'active')

    if (slug) {
      query = query.eq('slug', slug)
    } else {
      query = query.eq('marketing_domain', domain)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      return NextResponse.json({ agency: null }, { status: 200 })
    }

    return NextResponse.json({ agency: data })
  } catch (err) {
    console.error('Error fetching agency:', err)
    return NextResponse.json({ agency: null }, { status: 200 })
  }
}