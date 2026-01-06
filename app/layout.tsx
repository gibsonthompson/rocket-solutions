import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Rocket Solutions - Custom Websites for Home Service Businesses',
  description: 'Get a professional, custom website for your home service business with easy self-editing tools. No coding required.',
  keywords: 'website builder, home services, custom websites, small business websites, contractor websites',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <nav className="container-custom py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <Image 
                  src="https://i.imgur.com/VFds4zN.png" 
                  alt="Rocket Solutions Logo" 
                  width={40} 
                  height={40}
                  className="w-10 h-10"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-rocket-red to-rocket-orange bg-clip-text text-transparent">
                  Rocket Solutions
                </span>
              </Link>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="#features" className="text-gray-700 hover:text-rocket-red transition-colors font-medium">
                  Features
                </Link>
                <Link href="#how-it-works" className="text-gray-700 hover:text-rocket-red transition-colors font-medium">
                  How It Works
                </Link>
                <Link href="#get-started" className="btn-primary">
                  Get Started
                </Link>
              </div>
            </div>
          </nav>
        </header>

        <main className="min-h-screen">
          {children}
        </main>

        <footer className="bg-gray-900 text-white py-12">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <Image 
                    src="https://i.imgur.com/VFds4zN.png" 
                    alt="Rocket Solutions Logo" 
                    width={32} 
                    height={32}
                    className="w-8 h-8"
                  />
                  <span className="text-xl font-bold">Rocket Solutions</span>
                </div>
                <p className="text-gray-400 mb-4">
                  Professional websites for home service businesses with easy self-editing tools.
                </p>
                <div className="text-sm text-gray-400">
                  <p>Rocket Solutions LLC</p>
                  <p>2855 Broome Rd.</p>
                  <p>Gainesville, GA</p>
                  <p>Hall County, GA</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Contact</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>Email: support@rocketsolutions.com</li>
                  <li>SMS: Text HELP for assistance</li>
                  <li>SMS: Text STOP to unsubscribe</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
              <p>© {new Date().getFullYear()} Rocket Solutions LLC. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}