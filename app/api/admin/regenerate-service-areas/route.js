import { createClient } from '@supabase/supabase-js'
import { getServiceAreasForCity } from '@/lib/geoUtils'
import { generateServiceAreaContent } from '@/lib/generateServiceAreaContent'
import citiesData from '@/lib/us-cities.json'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Simple auth check - in production, add proper admin authentication
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'your-admin-secret-here'

export async function POST(request) {
  try {
    const body = await request.json()
    const { companyId, companySlug, adminSecret } = body

    // Basic auth check
    if (adminSecret !== ADMIN_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch company data
    let query = supabase
      .from('junk_companies')
      .select('id, company_name, company_slug, industry, city, state, service_radius, service_areas')

    if (companyId) {
      query = query.eq('id', companyId)
    } else if (companySlug) {
      query = query.eq('company_slug', companySlug)
    } else {
      return Response.json({ error: 'companyId or companySlug required' }, { status: 400 })
    }

    const { data: company, error: fetchError } = await query.single()

    if (fetchError || !company) {
      return Response.json({ error: 'Company not found' }, { status: 404 })
    }

    const { id, company_name, industry, city, state, service_radius } = company
    const radiusMiles = parseInt(service_radius) || 25

    // Get cities within radius
    const geoResult = getServiceAreasForCity(city, state, radiusMiles, citiesData)

    if (!geoResult) {
      return Response.json({ 
        error: `City not found in database: ${city}, ${state}`,
        suggestion: 'Check city spelling or add to us-cities.json'
      }, { status: 400 })
    }

    console.log(`Regenerating service areas for ${company_name}...`)
    console.log(`Found ${geoResult.citiesFound} cities within ${radiusMiles} miles of ${city}, ${state}`)

    // Generate unique SEO content for each city
    const serviceAreas = await generateServiceAreaContent(
      company_name,
      industry,
      city,
      state,
      geoResult.serviceAreas
    )

    // Update the company record
    const { error: updateError } = await supabase
      .from('junk_companies')
      .update({
        service_areas: serviceAreas,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      throw updateError
    }

    // Count total cities
    const totalCities = serviceAreas.reduce((sum, area) => sum + area.cities.length, 0)

    return Response.json({
      success: true,
      company: company_name,
      companySlug: company.company_slug,
      citiesGenerated: totalCities,
      counties: serviceAreas.map(a => a.county),
      message: `Successfully regenerated ${totalCities} service area pages with unique content`
    })

  } catch (error) {
    console.error('Regenerate service areas error:', error)
    return Response.json(
      { error: error.message || 'Failed to regenerate service areas' },
      { status: 500 }
    )
  }
}

// GET endpoint to check a company's current service areas
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const companySlug = searchParams.get('slug')
  const adminSecret = searchParams.get('secret')

  if (adminSecret !== ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!companySlug) {
    return Response.json({ error: 'slug parameter required' }, { status: 400 })
  }

  const { data: company, error } = await supabase
    .from('junk_companies')
    .select('company_name, city, state, service_radius, service_areas')
    .eq('company_slug', companySlug)
    .single()

  if (error || !company) {
    return Response.json({ error: 'Company not found' }, { status: 404 })
  }

  // Check if service_areas has new format (objects) or old format (strings)
  let hasNewFormat = false
  let totalCities = 0

  if (company.service_areas && Array.isArray(company.service_areas)) {
    company.service_areas.forEach(area => {
      if (area.cities && Array.isArray(area.cities)) {
        totalCities += area.cities.length
        if (area.cities.length > 0 && typeof area.cities[0] === 'object') {
          hasNewFormat = true
        }
      }
    })
  }

  return Response.json({
    company: company.company_name,
    location: `${company.city}, ${company.state}`,
    radius: company.service_radius,
    totalCities,
    hasAIContent: hasNewFormat,
    needsRegeneration: !hasNewFormat,
    serviceAreas: company.service_areas
  })
}