'use client'
import Link from 'next/link'
import Image from 'next/image'
import { FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa'

export default function Footer() {
  const currentYear = new Date().getFullYear()

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

  const socialLinks = [
    { icon: FaInstagram, href: 'https://instagram.com/rocketsolutionsio', label: 'Instagram' },
    { icon: FaFacebook, href: 'https://facebook.com/rocketsolutionsio', label: 'Facebook' },
    { icon: FaYoutube, href: 'https://youtube.com/@rocketsolutionsio', label: 'YouTube' },
  ]

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container-custom py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image 
                src="/logo.png" 
                alt="Rocket Solutions" 
                width={40} 
                height={40}
                className="object-contain"
              />
              <span className="text-xl font-bold">Rocket Solutions</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Professional websites for home service businesses. Get found on Google and start booking more jobs.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors"
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
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} Rocket Solutions. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm">
            Built for home service pros 🚀
          </p>
        </div>
      </div>
    </footer>
  )
}