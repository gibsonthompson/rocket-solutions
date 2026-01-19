import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Tapstack subdomain pattern: {slug}.tapstack.dev
const TAPSTACK_SUBDOMAIN_REGEX = /^([^.]+)\.tapstack\.dev$/

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    console.error('Missing Supabase env vars in middleware')
    return null
  }
  
  return createClient(url, key)
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host')?.split(':')[0]
  
  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.next()
  }

  let agency = null

  try {
    // 1. Check for Tapstack subdomain pattern: {slug}.tapstack.dev
    const tapstackMatch = hostname?.match(TAPSTACK_SUBDOMAIN_REGEX)
    if (tapstackMatch && tapstackMatch[1] !== 'www') {
      const agencySlug = tapstackMatch[1]
      
      const { data, error } = await supabase
        .from('agencies')
        .select('id, slug, name, logo_url, logo_background_color, primary_color, secondary_color, tertiary_color, tagline, support_email, support_phone, price_starter, price_pro, price_growth, marketing_domain')
        .eq('slug', agencySlug)
        .eq('status', 'active')
        .single()
      
      if (!error && data) {
        agency = data
      }
    }

    // 2. If no agency yet, lookup by marketing_domain (custom domains)
    if (!agency && hostname) {
      const { data, error } = await supabase
        .from('agencies')
        .select('id, slug, name, logo_url, logo_background_color, primary_color, secondary_color, tertiary_color, tagline, support_email, support_phone, price_starter, price_pro, price_growth, marketing_domain')
        .eq('marketing_domain', hostname)
        .eq('status', 'active')
        .single()

      if (!error && data) {
        agency = data
      }
    }

    // 3. For local development and Vercel previews, default to rocket-solutions
    if (!agency) {
      const isLocalOrPreview = 
        hostname === 'localhost' || 
        hostname?.includes('vercel.app') ||
        hostname?.includes('127.0.0.1')
      
      if (isLocalOrPreview) {
        const { data: defaultAgency } = await supabase
          .from('agencies')
          .select('id, slug, name, logo_url, logo_background_color, primary_color, secondary_color, tertiary_color, tagline, support_email, support_phone, price_starter, price_pro, price_growth, marketing_domain')
          .eq('slug', 'rocket-solutions')
          .single()

        if (defaultAgency) {
          agency = defaultAgency
        }
      }
    }
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }

  // No agency found - continue without setting cookie
  if (!agency) {
    return NextResponse.next()
  }

  // Only store essential fields in cookie (keep it small!)
  const cookieData = {
    id: agency.id,
    slug: agency.slug,
    name: agency.name,
    logo_url: agency.logo_url,
    logo_background_color: agency.logo_background_color,
    primary_color: agency.primary_color,
    secondary_color: agency.secondary_color,
    tertiary_color: agency.tertiary_color,
    tagline: agency.tagline,
    support_email: agency.support_email,
    support_phone: agency.support_phone,
    price_starter: agency.price_starter,
    price_pro: agency.price_pro,
    price_growth: agency.price_growth,
    marketing_domain: agency.marketing_domain,
  }

  const response = NextResponse.next()
  response.cookies.set('agency', JSON.stringify(cookieData), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24
  })

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}