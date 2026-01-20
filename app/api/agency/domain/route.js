import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// Check if nameservers point to Vercel
async function checkNameservers(domain) {
  try {
    // Use DNS-over-HTTPS to check nameservers
    const response = await fetch(
      `https://dns.google/resolve?name=${domain}&type=NS`
    )
    const data = await response.json()
    
    if (data.Status !== 0 || !data.Answer) {
      return { valid: false, nameservers: [], error: 'Could not resolve nameservers' }
    }
    
    const nameservers = data.Answer
      .filter(record => record.type === 2) // NS records
      .map(record => record.data.toLowerCase().replace(/\.$/, ''))
    
    // Check if Vercel nameservers are present
    const vercelNs = ['ns1.vercel-dns.com', 'ns2.vercel-dns.com']
    const hasVercelNs = vercelNs.every(ns => 
      nameservers.some(found => found === ns)
    )
    
    return {
      valid: hasVercelNs,
      nameservers,
      expected: vercelNs
    }
  } catch (error) {
    console.error('Nameserver check failed:', error)
    return { valid: false, nameservers: [], error: error.message }
  }
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
    
    // If domain is set but not verified, check current nameserver status
    if (agency.marketing_domain && !agency.domain_verified) {
      const nsCheck = await checkNameservers(agency.marketing_domain)
      
      return NextResponse.json({
        custom_domain: agency.marketing_domain,
        domain_verified: false,
        nameserver_status: nsCheck.valid ? 'ready' : 'pending',
        current_nameservers: nsCheck.nameservers
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
      // Get current domain first
      const { data: agency } = await supabase
        .from('agencies')
        .select('marketing_domain')
        .eq('id', agencyId)
        .single()
      
      if (agency?.marketing_domain) {
        // Remove from Vercel (best effort - don't fail if this errors)
        await removeDomainFromVercel(agency.marketing_domain, process.env.VERCEL_PROJECT_ID)
        await removeDomainFromVercel(`*.${agency.marketing_domain}`, process.env.VERCEL_JUNKLINE_PROJECT_ID)
      }
      
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
      
      // Check nameservers first
      console.log(`[Domain Verify] Checking nameservers for ${agency.marketing_domain}`)
      const nsCheck = await checkNameservers(agency.marketing_domain)
      
      if (!nsCheck.valid) {
        console.log(`[Domain Verify] Nameserver check failed:`, nsCheck)
        return NextResponse.json({ 
          error: 'Nameservers not configured correctly',
          details: `Current nameservers: ${nsCheck.nameservers.join(', ') || 'none found'}. Expected: ns1.vercel-dns.com and ns2.vercel-dns.com`,
          hint: 'Please update your nameservers at your domain registrar and wait a few minutes for DNS to propagate.'
        }, { status: 400 })
      }
      
      console.log(`[Domain Verify] Nameservers valid, adding domains to Vercel`)
      
      // Validate environment variables
      if (!process.env.VERCEL_API_TOKEN) {
        return NextResponse.json({ error: 'Server configuration error: Vercel API token missing' }, { status: 500 })
      }
      if (!process.env.VERCEL_PROJECT_ID) {
        return NextResponse.json({ error: 'Server configuration error: Vercel project ID missing' }, { status: 500 })
      }
      if (!process.env.VERCEL_JUNKLINE_PROJECT_ID) {
        return NextResponse.json({ error: 'Server configuration error: Junk-line project ID missing' }, { status: 500 })
      }
      
      // Add root domain to rocket-solutions (marketing site)
      const rocketResult = await addDomainToVercel(
        agency.marketing_domain, 
        process.env.VERCEL_PROJECT_ID  // rocket-solutions project
      )
      
      console.log(`[Domain Verify] Added ${agency.marketing_domain} to rocket-solutions:`, rocketResult)
      
      if (!rocketResult.success && !rocketResult.existing) {
        return NextResponse.json({ 
          error: 'Failed to add domain to marketing site',
          details: typeof rocketResult.error === 'object' ? JSON.stringify(rocketResult.error) : rocketResult.error
        }, { status: 500 })
      }
      
      // Add wildcard domain to junk-line (customer sites)
      const junklineResult = await addDomainToVercel(
        `*.${agency.marketing_domain}`, 
        process.env.VERCEL_JUNKLINE_PROJECT_ID
      )
      
      console.log(`[Domain Verify] Added *.${agency.marketing_domain} to junk-line:`, junklineResult)
      
      if (!junklineResult.success && !junklineResult.existing) {
        return NextResponse.json({ 
          error: 'Failed to add wildcard domain for customer sites',
          details: typeof junklineResult.error === 'object' ? JSON.stringify(junklineResult.error) : junklineResult.error
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
      return NextResponse.json({ error: 'Invalid domain format. Please enter a domain like yourdomain.com' }, { status: 400 })
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
    
    return NextResponse.json({ 
      success: true,
      custom_domain: cleanDomain,
      domain_verified: false,
      message: 'Domain saved. Please update your nameservers to continue.'
    })
    
  } catch (error) {
    console.error('Domain save error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
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
    
    // Check for verification required
    if (data.error?.code === 'domain_verification_required') {
      return { 
        success: false, 
        error: 'Domain verification required. Please ensure nameservers are pointing to Vercel.',
        verification: data.error 
      }
    }
    
    if (data.error) {
      return { success: false, error: data.error }
    }
    
    return { success: true, domain: data }
    
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Remove domain from a Vercel project
async function removeDomainFromVercel(domain, projectId) {
  const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN
  
  if (!VERCEL_API_TOKEN || !projectId) {
    return { success: false }
  }
  
  try {
    const response = await fetch(
      `https://api.vercel.com/v10/projects/${projectId}/domains/${encodeURIComponent(domain)}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${VERCEL_API_TOKEN}`
        }
      }
    )
    
    return { success: response.ok }
  } catch (error) {
    console.error(`Failed to remove domain ${domain} from Vercel:`, error)
    return { success: false }
  }
}