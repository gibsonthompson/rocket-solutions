import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import dns from 'dns'
import { promisify } from 'util'

const resolveCname = promisify(dns.resolveCname)

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// GET - Check domain verification status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const agencyId = searchParams.get('agency_id')
    
    if (!agencyId) {
      return NextResponse.json({ error: 'Agency ID required' }, { status: 400 })
    }
    
    const supabase = getSupabase()
    
    const { data: agency, error } = await supabase
      .from('agencies')
      .select('custom_domain, domain_verified')
      .eq('id', agencyId)
      .single()
    
    if (error || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }
    
    // If domain is set but not verified, check DNS
    if (agency.custom_domain && !agency.domain_verified) {
      const dnsValid = await checkDnsRecord(agency.custom_domain)
      
      return NextResponse.json({
        custom_domain: agency.custom_domain,
        domain_verified: false,
        dns_configured: dnsValid,
        instructions: `Add a CNAME record for * pointing to cname.vercel-dns.com`
      })
    }
    
    return NextResponse.json({
      custom_domain: agency.custom_domain,
      domain_verified: agency.domain_verified
    })
    
  } catch (error) {
    console.error('Domain status error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Save domain and verify
export async function POST(request) {
  try {
    const { agencyId, domain, action } = await request.json()
    
    if (!agencyId) {
      return NextResponse.json({ error: 'Agency ID required' }, { status: 400 })
    }
    
    const supabase = getSupabase()
    
    // Action: remove domain
    if (action === 'remove') {
      const { error } = await supabase
        .from('agencies')
        .update({ 
          custom_domain: null, 
          domain_verified: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', agencyId)
      
      if (error) throw error
      
      return NextResponse.json({ success: true, message: 'Domain removed' })
    }
    
    // Action: verify domain
    if (action === 'verify') {
      // Get current domain
      const { data: agency, error: fetchError } = await supabase
        .from('agencies')
        .select('custom_domain')
        .eq('id', agencyId)
        .single()
      
      if (fetchError || !agency?.custom_domain) {
        return NextResponse.json({ error: 'No domain configured' }, { status: 400 })
      }
      
      // Check DNS
      const dnsValid = await checkDnsRecord(agency.custom_domain)
      
      if (!dnsValid) {
        return NextResponse.json({ 
          error: 'DNS not configured correctly',
          dns_configured: false,
          instructions: `Add a CNAME record for * pointing to cname.vercel-dns.com`
        }, { status: 400 })
      }
      
      // Add wildcard domain to Vercel
      const vercelResult = await addWildcardToVercel(agency.custom_domain)
      
      if (!vercelResult.success) {
        return NextResponse.json({ 
          error: 'Failed to add domain to Vercel',
          details: vercelResult.error
        }, { status: 500 })
      }
      
      // Update database
      const { error: updateError } = await supabase
        .from('agencies')
        .update({ 
          domain_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', agencyId)
      
      if (updateError) throw updateError
      
      return NextResponse.json({ 
        success: true, 
        domain_verified: true,
        message: `*.${agency.custom_domain} is now active`
      })
    }
    
    // Action: save new domain
    if (!domain) {
      return NextResponse.json({ error: 'Domain required' }, { status: 400 })
    }
    
    // Clean domain (remove protocol, www, trailing slash)
    const cleanDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .trim()
    
    // Basic validation
    const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/
    if (!domainRegex.test(cleanDomain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 })
    }
    
    // Check if domain is already used by another agency
    const { data: existing } = await supabase
      .from('agencies')
      .select('id, name')
      .eq('custom_domain', cleanDomain)
      .neq('id', agencyId)
      .single()
    
    if (existing) {
      return NextResponse.json({ 
        error: 'Domain already in use by another agency' 
      }, { status: 400 })
    }
    
    // Save domain (not verified yet)
    const { error: updateError } = await supabase
      .from('agencies')
      .update({ 
        custom_domain: cleanDomain,
        domain_verified: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', agencyId)
    
    if (updateError) throw updateError
    
    // Check if DNS is already configured
    const dnsValid = await checkDnsRecord(cleanDomain)
    
    return NextResponse.json({ 
      success: true,
      custom_domain: cleanDomain,
      domain_verified: false,
      dns_configured: dnsValid,
      instructions: dnsValid 
        ? 'DNS is configured! Click Verify to complete setup.'
        : `Add a CNAME record for * pointing to cname.vercel-dns.com`
    })
    
  } catch (error) {
    console.error('Domain save error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Check if wildcard CNAME points to Vercel
async function checkDnsRecord(domain) {
  try {
    // Check wildcard subdomain DNS
    // We check a random subdomain since * isn't directly queryable
    const testSubdomain = `dns-check-${Date.now()}.${domain}`
    
    const records = await resolveCname(testSubdomain)
    
    // Check if it points to Vercel
    return records.some(r => 
      r.includes('vercel-dns.com') || 
      r.includes('vercel.com')
    )
  } catch (error) {
    // ENOTFOUND means no record exists
    // ENODATA means record exists but no CNAME
    console.log('DNS check result:', error.code || error.message)
    return false
  }
}

// Add wildcard domain to Vercel's junk-line project
async function addWildcardToVercel(domain) {
  const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN
  const VERCEL_JUNKLINE_PROJECT_ID = process.env.VERCEL_JUNKLINE_PROJECT_ID || process.env.VERCEL_PROJECT_ID
  
  if (!VERCEL_API_TOKEN) {
    return { success: false, error: 'Vercel API token not configured' }
  }
  
  if (!VERCEL_JUNKLINE_PROJECT_ID) {
    return { success: false, error: 'Vercel project ID not configured' }
  }
  
  try {
    const response = await fetch(
      `https://api.vercel.com/v10/projects/${VERCEL_JUNKLINE_PROJECT_ID}/domains`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: `*.${domain}` })
      }
    )
    
    const data = await response.json()
    
    // Domain already exists is okay
    if (data.error?.code === 'domain_already_in_use' || data.error?.code === 'domain_already_exists') {
      return { success: true, existing: true }
    }
    
    if (data.error) {
      return { success: false, error: data.error }
    }
    
    return { success: true, domain: data }
    
  } catch (error) {
    return { success: false, error: error.message }
  }
}