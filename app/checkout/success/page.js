'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaGlobe, FaRocket, FaSpinner, FaCopy, FaCheck, FaCog } from 'react-icons/fa'
import Image from 'next/image'
import Confetti from 'react-confetti'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const companyId = searchParams.get('company_id')
  
  const [loading, setLoading] = useState(true)
  const [companyData, setCompanyData] = useState(null)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [showConfetti, setShowConfetti] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Clear preview data from session storage
    sessionStorage.removeItem('previewData')
    
    // Set window size for confetti
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    
    // Fetch company data to get subdomain
    if (companyId) {
      fetchCompanyData()
    } else {
      // No company ID - just show generic success
      setTimeout(() => {
        setLoading(false)
        setShowConfetti(true)
      }, 1500)
    }
    
    // Stop confetti after 5 seconds
    const confettiTimer = setTimeout(() => setShowConfetti(false), 6500)
    
    return () => {
      clearTimeout(confettiTimer)
    }
  }, [companyId])

  const fetchCompanyData = async () => {
    try {
      const response = await fetch(`/api/company/${companyId}`)
      if (response.ok) {
        const data = await response.json()
        setCompanyData(data)
      }
    } catch (error) {
      console.error('Error fetching company:', error)
    } finally {
      setLoading(false)
      setShowConfetti(true)
    }
  }

  const handleCopyPassword = () => {
    if (companyData?.temp_password) {
      navigator.clipboard.writeText(companyData.temp_password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Build URLs based on company data
  const subdomain = companyData?.company_slug
  const tempPassword = companyData?.temp_password
  const dashboardUrl = subdomain 
    ? `https://${subdomain}.gorocketsolutions.com/dashboard`
    : null
  const siteUrl = subdomain
    ? `https://${subdomain}.gorocketsolutions.com`
    : null

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <motion.div
          animate={{ 
            y: [0, -15, 0],
          }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
        >
          <Image
            src="/logo.png"
            alt="Rocket Solutions"
            width={80}
            height={80}
          />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <FaCheckCircle className="text-4xl text-green-500" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome Aboard! 🚀
        </h1>
        
        <p className="text-gray-600 mb-8">
          Your payment was successful. Your website is ready!
        </p>

        {/* Site URL display */}
        {siteUrl && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-600 mb-1">Your website is live at:</p>
            <a 
              href={siteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-700 font-semibold hover:underline break-all"
            >
              {siteUrl.replace('https://', '')}
            </a>
            <p className="text-xs text-blue-500 mt-2">
              ⏱️ New sites may take 2-5 minutes to fully activate. If it doesn't load, wait a moment and refresh.
            </p>
          </div>
        )}

        {/* Temporary Password - Clean, copyable design */}
        {tempPassword && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-2xl">🔐</span>
              <p className="text-amber-800 font-semibold">Your Temporary Password</p>
            </div>
            
            <div 
              onClick={handleCopyPassword}
              className="bg-white rounded-lg p-4 border-2 border-dashed border-amber-300 cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all group"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-3xl font-bold text-gray-800 tracking-widest">
                  {tempPassword}
                </span>
                <button className="p-2 rounded-lg bg-amber-100 group-hover:bg-amber-200 transition-colors">
                  {copied ? (
                    <FaCheck className="text-green-600" />
                  ) : (
                    <FaCopy className="text-amber-600" />
                  )}
                </button>
              </div>
              <p className="text-xs text-amber-600 mt-2">
                {copied ? '✓ Copied!' : 'Click to copy'}
              </p>
            </div>
            
            <p className="text-xs text-amber-700 mt-3">
              ⚠️ Save this password! You can change it in your dashboard settings.
            </p>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
          <h2 className="font-bold text-gray-800 mb-4">What happens next?</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaRocket className="text-orange-500 text-sm" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Your site is live!</p>
                <p className="text-sm text-gray-500">
                  Use the password above to log into your dashboard
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaCog className="text-orange-500 text-sm" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Customize everything</p>
                <p className="text-sm text-gray-500">
                  Add services, upload photos, and manage bookings from your dashboard
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaGlobe className="text-orange-500 text-sm" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Custom domain (optional)</p>
                <p className="text-sm text-gray-500">
                  Connect your own domain in Dashboard → Settings → Domain
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {dashboardUrl ? (
            <a
              href={dashboardUrl}
              className="block w-full py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors text-center"
            >
              Go to Dashboard
            </a>
          ) : (
            <button
              disabled
              className="block w-full py-4 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaSpinner className="animate-spin" />
              Setting up dashboard...
            </button>
          )}
          
          {siteUrl ? (
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 text-gray-600 font-medium hover:text-gray-800 transition-colors text-center"
            >
              View Your Website →
            </a>
          ) : (
            <a
              href="/"
              className="block w-full py-4 text-gray-600 font-medium hover:text-gray-800 transition-colors text-center"
            >
              Return to Home
            </a>
          )}
        </div>

        {sessionId && (
          <p className="text-xs text-gray-400 mt-6">
            Order reference: {sessionId.slice(0, 20)}...
          </p>
        )}
      </motion.div>
    </div>
  )
}