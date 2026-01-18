'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AgencyContext = createContext(null)

// Default agency values (Rocket Solutions fallback)
const DEFAULT_AGENCY = {
  id: null,
  slug: 'rocket-solutions',
  name: 'Rocket Solutions',
  logo_url: '/logo.png',
  logo_background_color: null,
  primary_color: '#fa8820',
  secondary_color: '#020202',
  tertiary_color: '#efeeed',
  tagline: 'Professional Websites for Home Service Businesses',
  support_email: 'support@gorocketsolutions.com',
  support_phone: null,
  price_starter: 4900,
  price_pro: 9900,
  price_growth: 19900
}

// Client-side: Get agency from cookie
function getAgencyFromCookie() {
  if (typeof window === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  const agencyCookie = cookies.find(c => c.trim().startsWith('agency='))
  
  if (agencyCookie) {
    try {
      const value = agencyCookie.split('=')[1]
      return JSON.parse(decodeURIComponent(value))
    } catch {
      return null
    }
  }
  
  return null
}

export function AgencyProvider({ children, initialAgency = null }) {
  const [agency, setAgency] = useState(initialAgency || DEFAULT_AGENCY)
  const [isLoading, setIsLoading] = useState(!initialAgency)

  useEffect(() => {
    if (!initialAgency) {
      const cookieAgency = getAgencyFromCookie()
      if (cookieAgency) {
        setAgency(cookieAgency)
      }
      setIsLoading(false)
    }
  }, [initialAgency])

  return (
    <AgencyContext.Provider value={{ agency, isLoading, setAgency }}>
      {children}
    </AgencyContext.Provider>
  )
}

export function useAgency() {
  const context = useContext(AgencyContext)
  if (!context) {
    // Return default values if used outside provider
    return { agency: DEFAULT_AGENCY, isLoading: false }
  }
  return context
}

// Helper to format price from cents
export function formatPrice(cents) {
  if (!cents) return '$0'
  return `$${(cents / 100).toFixed(0)}`
}

// Helper to get CSS variables from agency
export function getAgencyStyles(agency) {
  return {
    '--primary-color': agency?.primary_color || '#fa8820',
    '--secondary-color': agency?.secondary_color || '#020202',
    '--tertiary-color': agency?.tertiary_color || '#efeeed',
  }
}