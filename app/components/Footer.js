'use client'
import Link from 'next/link'
import { FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa'
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

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { agency } = useAgency()

  const primaryColor = agency?.primary_color || '#fa8820'
  
  // Create dark background based on primary color
  const rgb = hexToRgb(primaryColor)
  const darkBg = `rgb(${Math.floor(rgb.r * 0.08)}, ${Math.floor(rgb.g * 0.08)}, ${Math.floor(rgb.b * 0.12)})`

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'FAQ', href: '#faq' },
    ],
    industries: [
      { name: 'Junk Removal', href: '#' },
      { name: 'Landscaping', href: '#' },
      { name: 'Pressure Washing', href: '#' },
      { name: 'House Cleaning', href: '#' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  }

  // Default social links - agencies can customize these later
  const socialLinks = [
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: FaFacebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: FaYoutube, href: 'https://youtube.com', label: 'YouTube' },
  ]

  return (
    <footer 
      className="text-white"
      style={{ backgroundColor: darkBg }}
    >
      <div className="container-custom py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              {agency?.logo_url ? (
                <img 
                  src={agency.logo_url} 
                  alt={agency.name || 'Logo'} 
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {agency?.name?.[0]?.toUpperCase() || 'R'}
                </div>
              )}
              <span className="text-xl font-bold">{agency?.name || 'Rocket Solutions'}</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              {agency?.tagline || 'Professional websites for home service businesses. Get found on Google and start booking more jobs.'}
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center transition-colors"
                  style={{ '--hover-bg': primaryColor }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  aria-label={social.label}
                >
                  <social.icon className="text-lg" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries Links */}
          <div>
            <h4 className="font-semibold mb-4">Industries</h4>
            <ul className="space-y-3">
              {footerLinks.industries.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Support Contact */}
            {agency?.support_email && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Support</h4>
                <a 
                  href={`mailto:${agency.support_email}`}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {agency.support_email}
                </a>
              </div>
            )}
            {agency?.support_phone && (
              <div className="mt-2">
                <a 
                  href={`tel:${agency.support_phone.replace(/\D/g, '')}`}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {agency.support_phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} {agency?.name || 'Rocket Solutions'}. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm">
            Powered by{' '}
            <a 
              href="https://tapstack.dev"
              target="_blank"
              rel="noopener"
              className="text-white font-medium hover:underline"
            >
              Tapstack
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}