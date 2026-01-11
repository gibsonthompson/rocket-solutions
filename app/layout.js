import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Rocket Solutions | Professional Websites for Home Service Businesses',
  description: 'Get a professional website for your home service business in minutes. Junk removal, landscaping, plumbing, and more. Mobile-friendly, SEO-optimized, with booking system included.',
  keywords: 'home service website, small business website, junk removal website, contractor website, service business website builder',
  openGraph: {
    title: 'Rocket Solutions | Websites for Home Service Businesses',
    description: 'Professional websites built for home service businesses. Get online in minutes.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
