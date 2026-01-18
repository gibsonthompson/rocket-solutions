'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const AgencyAuthContext = createContext(null)

// Browser-safe supabase client (anon key for reads)
const getSupabase = () => {
  if (typeof window === 'undefined') return null
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export function AgencyAuthProvider({ children }) {
  const [agency, setAgency] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const agencyId = localStorage.getItem('agencyId')
        
        if (agencyId) {
          const supabase = getSupabase()
          if (!supabase) return
          
          // Fetch agency data
          const { data: agencyData, error } = await supabase
            .from('agencies')
            .select('*')
            .eq('id', agencyId)
            .eq('status', 'active')
            .single()
          
          if (agencyData && !error) {
            setAgency(agencyData)
          } else {
            // Invalid session, clear it
            localStorage.removeItem('agencyId')
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const signIn = async (agencyId) => {
    const supabase = getSupabase()
    if (!supabase) return { error: 'Supabase not available' }

    try {
      // Store in localStorage
      localStorage.setItem('agencyId', agencyId)
      
      // Fetch agency data
      const { data: agencyData, error } = await supabase
        .from('agencies')
        .select('*')
        .eq('id', agencyId)
        .single()
      
      if (error) throw error
      
      setAgency(agencyData)
      return { success: true }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: error.message }
    }
  }

  const signOut = () => {
    localStorage.removeItem('agencyId')
    setAgency(null)
  }

  const refreshAgency = async () => {
    const agencyId = localStorage.getItem('agencyId')
    if (!agencyId) return

    const supabase = getSupabase()
    if (!supabase) return

    const { data: agencyData } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', agencyId)
      .single()
    
    if (agencyData) {
      setAgency(agencyData)
    }
  }

  return (
    <AgencyAuthContext.Provider value={{ 
      agency, 
      isLoading, 
      signIn, 
      signOut,
      refreshAgency,
      isAuthenticated: !!agency
    }}>
      {children}
    </AgencyAuthContext.Provider>
  )
}

export function useAgencyAuth() {
  const context = useContext(AgencyAuthContext)
  if (!context) {
    throw new Error('useAgencyAuth must be used within AgencyAuthProvider')
  }
  return context
}