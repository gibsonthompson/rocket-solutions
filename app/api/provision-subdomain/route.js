import { NextResponse } from 'next/server'

// This route automatically provisions a subdomain after payment:
// 1. Adds CNAME record to Cloudflare
// 2. Adds domain to Vercel project

export async function POST(request) {
  try {
    const { subdomain, companySlug } = await request.json()

    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain required' }, { status: 400 })
    }

    const domain = `${subdomain}.gorocketsolutions.com`
    
    // Step 1: Add CNAME to Cloudflare
    const cloudflareResult = await addCloudflareRecord(subdomain)
    if (!cloudflareResult.success) {
      return NextResponse.json({ 
        error: 'Cloudflare DNS failed', 
        details: cloudflareResult.error 
      }, { status: 500 })
    }

    // Step 2: Add domain to Vercel
    const vercelResult = await addVercelDomain(domain)
    if (!vercelResult.success) {
      // If Vercel fails, the DNS record is still there (not ideal but not breaking)
      return NextResponse.json({ 
        error: 'Vercel domain failed', 
        details: vercelResult.error,
        dns: 'created'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      domain,
      subdomain,
      message: `${domain} is now live`
    })

  } catch (error) {
    console.error('Provision subdomain error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function addCloudflareRecord(subdomain) {
  const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
  const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID

  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    return { success: false, error: 'Cloudflare credentials not configured' }
  }

  try {
    // Check if record already exists
    const listResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?name=${subdomain}.gorocketsolutions.com&type=CNAME`,
      {
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const listData = await listResponse.json()
    
    if (listData.result && listData.result.length > 0) {
      // Record already exists
      return { success: true, existing: true }
    }

    // Create new CNAME record pointing to Vercel
    const createResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'CNAME',
          name: subdomain,
          content: 'cname.vercel-dns.com',
          ttl: 1, // Auto
          proxied: false // Important: must be false for Vercel SSL to work
        })
      }
    )

    const createData = await createResponse.json()

    if (createData.success) {
      return { success: true, record: createData.result }
    } else {
      return { success: false, error: createData.errors }
    }

  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function addVercelDomain(domain) {
  const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN
  const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID

  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
    return { success: false, error: 'Vercel credentials not configured' }
  }

  try {
    const response = await fetch(
      `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains`,
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

    // Domain already exists is not an error
    if (data.error?.code === 'domain_already_in_use' || data.error?.code === 'domain_already_exists') {
      return { success: true, existing: true }
    }

    if (data.name === domain || data.domain === domain) {
      return { success: true, domain: data }
    }

    if (data.error) {
      return { success: false, error: data.error }
    }

    return { success: true, domain: data }

  } catch (error) {
    return { success: false, error: error.message }
  }
}
