import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

/**
 * Generate unique SEO content for each service area city
 * @param {string} businessName - The company name
 * @param {string} industry - The industry type
 * @param {string} centerCity - The main city the business is based in
 * @param {string} state - The state abbreviation
 * @param {Array} serviceAreas - Array of { county, cities: ['City1', 'City2'] }
 * @returns {Array} - Enhanced service areas with full content per city
 */
export async function generateServiceAreaContent(businessName, industry, centerCity, state, serviceAreas) {
  // Flatten cities for the prompt
  const allCities = serviceAreas.flatMap(area => 
    area.cities.map(city => ({ city, county: area.county }))
  )
  
  if (allCities.length === 0) {
    return serviceAreas
  }

  const cityList = allCities.map(c => `${c.city} (${c.county})`).join(', ')

  const prompt = `You are generating unique SEO content for service area pages for a ${industry} business.

Business: ${businessName}
Main Location: ${centerCity}, ${state}
Industry: ${industry}

Generate unique content for each of these service area cities:
${cityList}

For EACH city, provide a JSON object with:
- name: City name exactly as provided
- slug: URL-friendly lowercase version (e.g., "san-jose" for "San Jose")
- meta_title: Unique title tag, format: "${industry} in [City], ${state} | ${businessName}" (under 60 chars)
- meta_description: Unique meta description highlighting local service (under 155 chars)
- intro: 3-4 sentences about serving that specific city. Mention the city name 2-3 times naturally. Reference local neighborhoods or characteristics if you know them. Make it feel locally relevant.
- neighborhoods: Array of 3-5 real neighborhoods, districts, or nearby areas in that city (use actual neighborhood names you know, or nearby landmarks)
- zip_codes: Array of 2-4 real zip codes for that city

IMPORTANT:
- Each city MUST have completely unique content - no duplicate sentences across cities
- Make intros feel locally written, not templated
- Use natural language, not keyword stuffing
- If you don't know specific neighborhoods, use general area descriptors like "downtown", "east side", etc.

Respond with ONLY a valid JSON array, no markdown, no explanation. Example format:
[
  {
    "name": "Fremont",
    "slug": "fremont",
    "meta_title": "Junk Removal in Fremont, CA | Bay Area Haulers",
    "meta_description": "Professional junk removal in Fremont. Serving Warm Springs, Irvington & Niles. Fast same-day service available.",
    "intro": "Bay Area Haulers brings reliable junk removal services to Fremont residents and businesses...",
    "neighborhoods": ["Warm Springs", "Irvington", "Niles", "Centerville"],
    "zip_codes": ["94536", "94538", "94539"]
  }
]`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 8000,
      messages: [
        { role: 'user', content: prompt }
      ]
    })

    const content = response.content[0].text.trim()
    
    // Parse the JSON response
    let generatedCities
    try {
      generatedCities = JSON.parse(content)
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content)
      // Return fallback structure
      return createFallbackContent(businessName, industry, centerCity, state, serviceAreas)
    }

    // Rebuild service areas with enhanced city data
    const enhancedAreas = serviceAreas.map(area => {
      const enhancedCities = area.cities.map(cityName => {
        const generated = generatedCities.find(g => 
          g.name.toLowerCase() === cityName.toLowerCase()
        )
        
        if (generated) {
          return generated
        }
        
        // Fallback for any missed cities
        return createFallbackCity(cityName, businessName, industry, state)
      })
      
      return {
        county: area.county,
        cities: enhancedCities
      }
    })

    return enhancedAreas

  } catch (error) {
    console.error('Error generating service area content:', error)
    // Return fallback on API error
    return createFallbackContent(businessName, industry, centerCity, state, serviceAreas)
  }
}

/**
 * Create fallback content if API fails
 */
function createFallbackContent(businessName, industry, centerCity, state, serviceAreas) {
  return serviceAreas.map(area => ({
    county: area.county,
    cities: area.cities.map(cityName => 
      createFallbackCity(cityName, businessName, industry, state)
    )
  }))
}

/**
 * Create fallback city content
 */
function createFallbackCity(cityName, businessName, industry, state) {
  const slug = cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  
  return {
    name: cityName,
    slug,
    meta_title: `${industry} in ${cityName}, ${state} | ${businessName}`,
    meta_description: `Professional ${industry.toLowerCase()} services in ${cityName}, ${state}. ${businessName} offers fast, reliable service. Call today for a free estimate.`,
    intro: `${businessName} proudly serves ${cityName} and the surrounding ${state} area with professional ${industry.toLowerCase()} services. Our experienced team is dedicated to providing fast, reliable service to all ${cityName} residents and businesses. Contact us today to learn more about how we can help with your ${industry.toLowerCase()} needs.`,
    neighborhoods: [],
    zip_codes: []
  }
}