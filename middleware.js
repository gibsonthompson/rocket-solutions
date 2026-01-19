import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client for middleware
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Tapstack subdomain pattern: {slug}.tapstack.dev
const TAPSTACK_SUBDOMAIN_REGEX = /^([^.]+)\.tapstack\.dev$/

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host')?.split(':')[0] // Remove port if present
  
  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Static files like .ico, .png, etc.
  ) {
    return NextResponse.next()
  }

  let agency = null

  // 1. Check for Tapstack subdomain pattern: {slug}.tapstack.dev
  const tapstackMatch = hostname?.match(TAPSTACK_SUBDOMAIN_REGEX)
  if (tapstackMatch && tapstackMatch[1] !== 'www') {
    const agencySlug = tapstackMatch[1]
    
    const { data, error } = await supabase
      .from('agencies')
      .select('id, slug, name, logo_url, logo_background_color, primary_color, secondary_color, tertiary_color, brand_palette, tagline, support_email, support_phone, price_starter, price_pro, price_growth, marketing_domain')
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
      .select('id, slug, name, logo_url, logo_background_color, primary_color, secondary_color, tertiary_color, brand_palette, tagline, support_email, support_phone, price_starter, price_pro, price_growth, marketing_domain')
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
        .select('id, slug, name, logo_url, logo_background_color, primary_color, secondary_color, tertiary_color, brand_palette, tagline, support_email, support_phone, price_starter, price_pro, price_growth, marketing_domain')
        .eq('slug', 'rocket-solutions')
        .single()

      if (defaultAgency) {
        agency = defaultAgency
      }
    }
  }

  // No agency found - continue without setting cookie
  if (!agency) {
    return NextResponse.next()
  }

  // Set agency data in cookie for client-side access
  const response = NextResponse.next()
  response.cookies.set('agency', JSON.stringify(agency), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 hours
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}