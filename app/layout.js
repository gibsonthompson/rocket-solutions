import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { AgencyProvider } from '../lib/AgencyContext'
import { getAgencyServer } from '../lib/getAgencyServer'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata() {
  const agency = await getAgencyServer()
  
  const name = agency?.name || 'Rocket Solutions'
  const tagline = agency?.tagline || 'Professional Websites for Home Service Businesses'
  
  return {
    title: `${name} | ${tagline}`,
    description: `Get a professional website for your home service business in minutes. Junk removal, landscaping, plumbing, and more. Mobile-friendly, SEO-optimized, with booking system included.`,
    keywords: 'home service website, small business website, junk removal website, contractor website, service business website builder',
    icons: {
      icon: agency?.logo_url || '/logo.png',
      apple: agency?.logo_url || '/logo.png',
    },
    openGraph: {
      title: `${name} | ${tagline}`,
      description: 'Professional websites built for home service businesses. Get online in minutes.',
      type: 'website',
    },
  }
}

export default async function RootLayout({ children }) {
  const agency = await getAgencyServer()
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <AgencyProvider initialAgency={agency}>
          {children}
        </AgencyProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  )
}