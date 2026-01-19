import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import dns from 'dns'
import { promisify } from 'util'

const resolveCname = promisify(dns.resolveCname)
const resolve4 = promisify(dns.resolve4)

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
      .select('marketing_domain, domain_verified')
      .eq('id', agencyId)
      .single()
    
    if (error || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }
    
    // If domain is set but not verified, check DNS
    if (agency.marketing_domain && !agency.domain_verified) {
      const dnsStatus = await checkDnsRecords(agency.marketing_domain)
      
      return NextResponse.json({
        custom_domain: agency.marketing_domain,
        domain_verified: false,
        dns_status: dnsStatus
      })
    }
    
    return NextResponse.json({
      custom_domain: agency.marketing_domain,
      domain_verified: agency.domain_verified || false
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
          marketing_domain: null, 
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
        .select('marketing_domain')
        .eq('id', agencyId)
        .single()
      
      if (fetchError || !agency?.marketing_domain) {
        return NextResponse.json({ error: 'No domain configured' }, { status: 400 })
      }
      
      // Check DNS records
      const dnsStatus = await checkDnsRecords(agency.marketing_domain)
      
      if (!dnsStatus.aRecordValid && !dnsStatus.cnameRootValid) {
        return NextResponse.json({ 
          error: 'Root domain DNS not configured. Add an A record pointing to 76.76.21.21',
          dns_status: dnsStatus
        }, { status: 400 })
      }
      
      if (!dnsStatus.wildcardValid) {
        return NextResponse.json({ 
          error: 'Wildcard CNAME not configured. Add a CNAME record for * pointing to cname.vercel-dns.com',
          dns_status: dnsStatus
        }, { status: 400 })
      }
      
      // Add root domain to rocket-solutions (marketing site)
      const rocketResult = await addDomainToVercel(
        agency.marketing_domain, 
        process.env.VERCEL_PROJECT_ID  // rocket-solutions project
      )
      
      if (!rocketResult.success) {
        return NextResponse.json({ 
          error: 'Failed to add domain to marketing site',
          details: rocketResult.error
        }, { status: 500 })
      }
      
      // Add wildcard domain to junk-line (customer sites)
      const junklineResult = await addDomainToVercel(
        `*.${agency.marketing_domain}`, 
        process.env.VERCEL_JUNKLINE_PROJECT_ID
      )
      
      if (!junklineResult.success) {
        return NextResponse.json({ 
          error: 'Failed to add wildcard domain for customer sites',
          details: junklineResult.error
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
        message: `${agency.marketing_domain} is now active for your marketing site and customer subdomains`
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
      .eq('marketing_domain', cleanDomain)
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
        marketing_domain: cleanDomain,
        domain_verified: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', agencyId)
    
    if (updateError) throw updateError
    
    // Check if DNS is already configured
    const dnsStatus = await checkDnsRecords(cleanDomain)
    
    return NextResponse.json({ 
      success: true,
      custom_domain: cleanDomain,
      domain_verified: false,
      dns_status: dnsStatus
    })
    
  } catch (error) {
    console.error('Domain save error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Check both A record (root) and CNAME (wildcard)
async function checkDnsRecords(domain) {
  const status = {
    aRecordValid: false,
    cnameRootValid: false,
    wildcardValid: false
  }
  
  // Check A record for root domain
  try {
    const aRecords = await resolve4(domain)
    status.aRecordValid = aRecords.includes('76.76.21.21')
  } catch (error) {
    // No A record found
  }
  
  // Check if root has CNAME (alternative to A record)
  try {
    const cnameRecords = await resolveCname(domain)
    status.cnameRootValid = cnameRecords.some(r => 
      r.includes('vercel-dns.com') || r.includes('vercel.com')
    )
  } catch (error) {
    // No CNAME for root (this is normal, most use A record)
  }
  
  // Check wildcard CNAME
  try {
    const testSubdomain = `dns-verify-${Date.now()}.${domain}`
    const wildcardRecords = await resolveCname(testSubdomain)
    status.wildcardValid = wildcardRecords.some(r => 
      r.includes('vercel-dns.com') || r.includes('vercel.com')
    )
  } catch (error) {
    // No wildcard CNAME found
  }
  
  return status
}

// Add domain to a Vercel project
async function addDomainToVercel(domain, projectId) {
  const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN
  
  if (!VERCEL_API_TOKEN) {
    return { success: false, error: 'Vercel API token not configured' }
  }
  
  if (!projectId) {
    return { success: false, error: 'Vercel project ID not configured' }
  }
  
  try {
    const response = await fetch(
      `https://api.vercel.com/v10/projects/${projectId}/domains`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: domain })
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