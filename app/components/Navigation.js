'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaBars, FaTimes } from 'react-icons/fa'
import { useAgency } from '../../lib/AgencyContext'

// Helper to determine if a color is light or dark
function isLightColor(color) {
  if (!color) return false
  
  let r, g, b
  
  // Handle rgb format
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (rgbMatch) {
    r = parseInt(rgbMatch[1])
    g = parseInt(rgbMatch[2])
    b = parseInt(rgbMatch[3])
  } 
  // Handle hex format
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

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { agency } = useAgency()

  const primaryColor = agency?.primary_color || '#fa8820'
  const logoBackgroundColor = agency?.logo_background_color || '#ffffff'
  
  // Determine text colors based on background
  const scrolledBgIsLight = isLightColor(logoBackgroundColor)
  const scrolledTextColor = scrolledBgIsLight ? '#1f2937' : '#ffffff'
  const scrolledTextMuted = scrolledBgIsLight ? '#4b5563' : 'rgba(255,255,255,0.8)'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ]

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-lg' : 'bg-transparent'
      }`}
      style={scrolled ? { backgroundColor: logoBackgroundColor } : {}}
    >
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {agency?.logo_url ? (
              // Use img tag for base64 data URLs, works better than Next Image
              <img 
                src={agency.logo_url} 
                alt={agency.name || 'Logo'} 
                className="h-11 w-auto object-contain"
              />
            ) : (
              <div 
                className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {agency?.name?.[0]?.toUpperCase() || 'R'}
              </div>
            )}
            <span 
              className="text-xl font-bold transition-colors"
              style={{ color: scrolled ? scrolledTextColor : '#ffffff' }}
            >
              {agency?.name || 'Rocket Solutions'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-medium transition-colors"
                style={{ 
                  color: scrolled ? scrolledTextMuted : 'rgba(255,255,255,0.9)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = scrolled ? primaryColor : '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = scrolled ? scrolledTextMuted : 'rgba(255,255,255,0.9)'
                }}
              >
                {link.name}
              </a>
            ))}
            <Link 
              href="/onboarding" 
              className="px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Get My Website
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 transition-colors"
            style={{ color: scrolled ? scrolledTextColor : '#ffffff' }}
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white rounded-2xl shadow-xl mt-2 p-4 absolute left-4 right-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block py-3 text-gray-600 hover:text-gray-900 font-medium border-b border-gray-100"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <Link 
              href="/onboarding" 
              className="block w-full text-center mt-4 px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
              onClick={() => setIsOpen(false)}
            >
              Get My Website
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}