'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AgencyContext = createContext(null)

// Default agency values (Tapstack fallback)
const DEFAULT_AGENCY = {
  id: null,
  slug: 'tapstack',
  name: 'Tapstack',
  logo_url: null,
  logo_background_color: null,
  primary_color: '#c1ff72',
  secondary_color: '#171515',
  tertiary_color: '#fcfcfd',
  tagline: 'Your brand. Your clients. Your revenue.',
  support_email: 'support@tapstack.dev',
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
      // Use slice(1).join('=') to handle '=' characters in the JSON value
      const value = agencyCookie.trim().split('=').slice(1).join('=')
      return JSON.parse(decodeURIComponent(value))
    } catch (e) {
      console.error('Failed to parse agency cookie:', e)
      return null
    }
  }
  
  return null
}

// Client-side: Fetch agency by domain (fallback when cookie is missing)
async function fetchAgencyByDomain(hostname) {
  try {
    // Check for tapstack subdomain pattern
    const tapstackMatch = hostname.match(/^([^.]+)\.tapstack\.dev$/)
    const slug = tapstackMatch ? tapstackMatch[1] : null
    
    const res = await fetch(`/api/agency/by-domain?${slug ? `slug=${slug}` : `domain=${hostname}`}`)
    if (res.ok) {
      const data = await res.json()
      return data.agency || null
    }
  } catch (e) {
    console.error('Failed to fetch agency by domain:', e)
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
        setIsLoading(false)
      } else {
        // No cookie found - check if we're on a custom domain that needs a retry
        const hostname = window.location.hostname
        const isLocalOrPreview = 
          hostname === 'localhost' || 
          hostname.includes('vercel.app') ||
          hostname.includes('127.0.0.1')
        
        if (!isLocalOrPreview) {
          // On a real domain but no cookie - fetch agency from API
          fetchAgencyByDomain(hostname)
            .then(data => {
              if (data) {
                setAgency(data)
              }
            })
            .finally(() => setIsLoading(false))
        } else {
          setIsLoading(false)
        }
      }
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
    '--primary-color': agency?.primary_color || '#c1ff72',
    '--secondary-color': agency?.secondary_color || '#171515',
    '--tertiary_color': agency?.tertiary_color || '#fcfcfd',
  }
}