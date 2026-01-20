'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { FaHome, FaUsers, FaCog, FaSignOutAlt, FaBars, FaTimes, FaGlobe } from 'react-icons/fa'
import { AgencyAuthProvider, useAgencyAuth } from '../../lib/AgencyAuthContext'
import { useAgency } from '../../lib/AgencyContext'

// Helper to determine if a color is light or dark
function isLightColor(color) {
  if (!color) return false
  
  let r, g, b
  
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (rgbMatch) {
    r = Math.min(255, parseInt(rgbMatch[1]))
    g = Math.min(255, parseInt(rgbMatch[2]))
    b = Math.min(255, parseInt(rgbMatch[3]))
  } 
  else if (color.startsWith('#')) {
    const hex = color.replace('#', '')
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16)
      g = parseInt(hex[1] + hex[1], 16)
      b = parseInt(hex[2] + hex[2], 16)
    } else {
      r = parseInt(hex.substr(0, 2), 16)
      g = parseInt(hex.substr(2, 2), 16)
      b = parseInt(hex.substr(4, 2), 16)
    }
  } else {
    return false
  }
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

function DashboardLayoutInner({ children }) {
  const { agency, isLoading: authLoading, signOut, isAuthenticated } = useAgencyAuth()
  const { agency: brandingAgency } = useAgency()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Login page doesn't need auth or sidebar
  const isLoginPage = pathname === '/agency/login'

  useEffect(() => {
    if (!isLoginPage && !authLoading && !isAuthenticated) {
      router.push('/agency/login')
    }
  }, [isAuthenticated, authLoading, router, isLoginPage])

  // Login page renders without layout
  if (isLoginPage) {
    return children
  }

  const handleSignOut = () => {
    signOut()
    router.push('/agency/login')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated || !agency) {
    return null // Will redirect via useEffect
  }

  // Use auth agency for data, brandingAgency (from middleware cookie) for styling
  const c = agency
  const primaryColor = brandingAgency?.primary_color || c.primary_color || '#c1ff72'
  const logoBackgroundColor = brandingAgency?.logo_background_color || c.logo_background_color

  const getMarketingSiteUrl = () => {
    if (c.marketing_domain) {
      return `https://${c.marketing_domain}`
    }
    return '/'
  }

  const navItems = [
    { name: 'Dashboard', href: '/agency/dashboard', icon: FaHome },
    { name: 'Customers', href: '/agency/customers', icon: FaUsers },
    { name: 'Settings', href: '/agency/settings', icon: FaCog },
  ]

  // Sidebar styling based on logo background color (from branding context)
  const sidebarBg = logoBackgroundColor || '#171515'
  const isLight = isLightColor(sidebarBg)
  const textColor = isLight ? '#000000' : '#ffffff'
  const mutedTextColor = isLight ? '#1f2937' : '#9ca3af'
  const hoverBg = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
  const borderColor = isLight ? '#9ca3af' : '#374151'

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <header 
        className="lg:hidden fixed top-0 left-0 right-0 z-50"
        style={{ 
          paddingTop: 'env(safe-area-inset-top)',
          backgroundColor: sidebarBg,
          color: textColor
        }}
      >
        <div className="flex justify-between items-center px-5 py-4">
          <div className="flex items-center space-x-3">
            {c.logo_url ? (
              <img 
                src={c.logo_url}
                alt={c.name} 
                width={52} 
                height={52}
                className="rounded-lg object-contain"
              />
            ) : (
              <div 
                className="w-[52px] h-[52px] rounded-lg flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: primaryColor }}
              >
                {c.name?.charAt(0) || 'A'}
              </div>
            )}
            <div>
              <span className="font-bold text-lg">Dashboard</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 -mr-2">
            {sidebarOpen ? <FaTimes size={26} /> : <FaBars size={26} />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out flex flex-col
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ 
          paddingTop: 'env(safe-area-inset-top)',
          backgroundColor: sidebarBg,
          color: textColor
        }}
      >
        {/* Header */}
        <div className="p-4 pb-2">
          <div className="flex items-center space-x-3 mb-2">
            {c.logo_url ? (
              <img 
                src={c.logo_url}
                alt={c.name}
                width={44} 
                height={44}
                className="object-contain"
              />
            ) : (
              <div 
                className="w-[44px] h-[44px] rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {c.name?.charAt(0) || 'A'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-sm leading-tight truncate" style={{ color: textColor }}>
                {c.name || 'Agency'}
              </h1>
              <p className="text-xs" style={{ color: mutedTextColor }}>Agency Dashboard</p>
            </div>
          </div>

          {/* Status Badge */}
          <span 
            className="inline-block text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ 
              backgroundColor: primaryColor,
              color: '#ffffff'
            }}
          >
            {c.status?.toUpperCase() || 'ACTIVE'}
          </span>
        </div>

        {/* Nav - Scrollable area */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 flex flex-col">
          <div className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-between px-3 py-3 rounded-lg transition-colors text-base"
                  style={isActive 
                    ? { backgroundColor: primaryColor, color: '#ffffff' } 
                    : { color: mutedTextColor }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = hoverBg
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={18} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 pt-2" style={{ borderTop: `1px solid ${borderColor}` }}>
          {/* Owner email */}
          <p className="text-xs mb-3 px-1 truncate" style={{ color: mutedTextColor }}>
            {c.owner_email}
          </p>
          
          {/* View Marketing Site */}
          <a 
            href={getMarketingSiteUrl()} 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 mb-3 text-sm px-1"
            style={{ color: mutedTextColor }}
          >
            <FaGlobe size={14} />
            <span>View Marketing Site</span>
          </a>
          
          {/* Logout */}
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 w-full text-sm px-1"
            style={{ color: mutedTextColor }}
          >
            <FaSignOutAlt size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen" style={{ paddingTop: 'calc(84px + env(safe-area-inset-top))' }}>
        <div className="lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }) {
  return (
    <AgencyAuthProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </AgencyAuthProvider>
  )
}