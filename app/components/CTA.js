'use client'
import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useAgency } from '../../lib/AgencyContext'

// Convert hex to RGB values
function hexToRgb(hex) {
  if (!hex) return { r: 250, g: 136, b: 32 }
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 250, g: 136, b: 32 }
}

// Check if color is too dark (luminance < threshold)
function isColorTooDark(hex, threshold = 50) {
  const rgb = hexToRgb(hex)
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b)
  return luminance < threshold
}

// Create a lighter shade of a color for gradient
function lightenColor(hex, percent = 40) {
  const rgb = hexToRgb(hex)
  const r = Math.min(255, rgb.r + Math.floor((255 - rgb.r) * percent / 100))
  const g = Math.min(255, rgb.g + Math.floor((255 - rgb.g) * percent / 100))
  const b = Math.min(255, rgb.b + Math.floor((255 - rgb.b) * percent / 100))
  return `rgb(${r}, ${g}, ${b})`
}

export default function CTA() {
  const { agency } = useAgency()

  const primaryColor = agency?.primary_color || '#fa8820'
  const rawSecondary = agency?.secondary_color
  const secondaryColor = (!rawSecondary || isColorTooDark(rawSecondary)) 
    ? lightenColor(primaryColor, 40) 
    : rawSecondary

  // Create dark background based on primary color
  const rgb = hexToRgb(primaryColor)
  const darkBg = `rgb(${Math.floor(rgb.r * 0.08)}, ${Math.floor(rgb.g * 0.08)}, ${Math.floor(rgb.b * 0.12)})`

  return (
    <section 
      className="section-padding relative overflow-hidden"
      style={{ backgroundColor: darkBg }}
    >
      {/* Background elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${primaryColor}20` }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${secondaryColor}15` }}
        />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          {agency?.logo_url ? (
            <img
              src={agency.logo_url}
              alt={agency.name || 'Logo'}
              className="h-20 w-auto mx-auto mb-8 object-contain"
            />
          ) : (
            <div 
              className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-8"
              style={{ backgroundColor: primaryColor }}
            >
              {agency?.name?.[0]?.toUpperCase() || 'R'}
            </div>
          )}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Your Next Customer is{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{ 
                backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
              }}
            >
              Searching Google Right Now
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Every day without a website is money left on the table. Get online today and start turning searches into booked jobs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/onboarding" 
              className="px-8 py-4 rounded-lg font-semibold text-lg text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Get My Website
              <FaArrowRight />
            </Link>
            <a 
              href="#pricing" 
              className="px-8 py-4 rounded-lg font-semibold text-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              View Pricing
            </a>
          </div>

          <p className="text-gray-400 mt-6 text-sm">
            Takes 5 minutes to setup • Live within 24 hours • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  )
}