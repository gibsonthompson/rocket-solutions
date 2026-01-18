import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client for middleware
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

  // Lookup agency by marketing_domain
  const { data: agency, error } = await supabase
    .from('agencies')
    .select('id, slug, name, logo_url, logo_background_color, primary_color, secondary_color, tertiary_color, brand_palette, tagline, support_email, support_phone, price_starter, price_pro, price_growth')
    .eq('marketing_domain', hostname)
    .eq('status', 'active')
    .single()

  // If no agency found for this domain, check if it's localhost or a preview URL
  if (error || !agency) {
    // For local development and Vercel previews, default to rocket-solutions
    const isLocalOrPreview = 
      hostname === 'localhost' || 
      hostname?.includes('vercel.app') ||
      hostname?.includes('127.0.0.1')
    
    if (isLocalOrPreview) {
      const { data: defaultAgency } = await supabase
        .from('agencies')
        .select('id, slug, name, logo_url, logo_background_color, primary_color, secondary_color, tertiary_color, brand_palette, tagline, support_email, support_phone, price_starter, price_pro, price_growth')
        .eq('slug', 'rocket-solutions')
        .single()

      if (defaultAgency) {
        const response = NextResponse.next()
        response.cookies.set('agency', JSON.stringify(defaultAgency), {
          httpOnly: false, // Allow client-side access
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 // 24 hours
        })
        return response
      }
    }
    
    // No agency found - could show a 404 or redirect
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