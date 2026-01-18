import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

// Create server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Server-side: Get agency from cookie (set by middleware)
export async function getAgencyServer() {
  const cookieStore = await cookies()
  const agencyCookie = cookieStore.get('agency')
  
  if (agencyCookie?.value) {
    try {
      return JSON.parse(agencyCookie.value)
    } catch {
      return null
    }
  }
  
  // Fallback: fetch default agency
  const { data } = await supabase
    .from('agencies')
    .select('id, slug, name, logo_url, logo_background_color, primary_color, secondary_color, tertiary_color, tagline, support_email, support_phone, price_starter, price_pro, price_growth')
    .eq('slug', 'rocket-solutions')
    .single()
  
  return data
}

// Fetch agency by slug (for direct lookups)
export async function getAgencyBySlug(slug) {
  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()
  
  if (error) return null
  return data
}

// Fetch agency by domain (for direct lookups)
export async function getAgencyByDomain(domain) {
  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('marketing_domain', domain)
    .eq('status', 'active')
    .single()
  
  if (error) return null
  return data
}