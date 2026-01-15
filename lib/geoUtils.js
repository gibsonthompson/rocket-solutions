// Haversine formula to calculate distance between two coordinates in miles
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg) {
  return deg * (Math.PI / 180)
}

// Get coordinates for a city (returns null if not found)
export function getCityCoordinates(cityName, state, citiesData) {
  const normalized = cityName.toLowerCase().trim()
  const stateUpper = state.toUpperCase().trim()
  
  const city = citiesData.find(c => 
    c.city.toLowerCase() === normalized && 
    c.state === stateUpper
  )
  
  return city ? { lat: city.lat, lng: city.lng, county: city.county } : null
}

// Find all cities within radius of a point, same state only, capped at maxCities
export function findCitiesWithinRadius(lat, lng, radiusMiles, state, citiesData, maxCities = 30) {
  const stateUpper = state.toUpperCase().trim()
  
  const citiesWithDistance = citiesData
    .filter(c => c.state === stateUpper)
    .map(c => ({
      ...c,
      distance: haversineDistance(lat, lng, c.lat, c.lng)
    }))
    .filter(c => c.distance <= radiusMiles)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxCities)
  
  return citiesWithDistance
}

// Group cities by county for service_areas format
export function groupCitiesByCounty(cities) {
  const grouped = {}
  
  cities.forEach(city => {
    const county = city.county || 'Other'
    if (!grouped[county]) {
      grouped[county] = []
    }
    grouped[county].push(city.city)
  })
  
  // Convert to array format matching existing structure
  return Object.entries(grouped).map(([county, cityList]) => ({
    county,
    cities: cityList.sort()
  }))
}

// Main function: Get service areas for a city within radius
export function getServiceAreasForCity(cityName, state, radiusMiles, citiesData) {
  const coords = getCityCoordinates(cityName, state, citiesData)
  
  if (!coords) {
    console.log(`City not found in database: ${cityName}, ${state}`)
    return null
  }
  
  const nearbyCities = findCitiesWithinRadius(
    coords.lat, 
    coords.lng, 
    radiusMiles, 
    state, 
    citiesData,
    30 // Max 30 cities
  )
  
  const serviceAreas = groupCitiesByCounty(nearbyCities)
  
  return {
    serviceAreas,
    centerCity: cityName,
    centerCoords: coords,
    citiesFound: nearbyCities.length
  }
}