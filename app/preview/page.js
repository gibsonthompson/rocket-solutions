'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FaClock, FaCheck, FaLock, FaEye, FaSpinner } from 'react-icons/fa'

export default function PreviewPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [previewData, setPreviewData] = useState(null)
  const [companySlug, setCompanySlug] = useState(null)
  
  // Timer and paywall state
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes initial
  const [showPaywall, setShowPaywall] = useState(false)
  const [secondLook, setSecondLook] = useState(false)
  const [finalPaywall, setFinalPaywall] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  // Junk-line URL
  const JUNKLINE_URL = 'https://service-business-platform.vercel.app'

  useEffect(() => {
    initializePreview()
  }, [])

  // Timer logic with second look support
  useEffect(() => {
    if (timeLeft <= 0) {
      if (!secondLook) {
        // First time timer expires → show paywall with "one more look" option
        setShowPaywall(true)
      } else {
        // Second look expired → show final paywall (no "one more look" option)
        setFinalPaywall(true)
        setShowPaywall(true)
      }
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, secondLook])

  const initializePreview = async () => {
    try {
      // Get data from sessionStorage (set by onboarding)
      const storedData = sessionStorage.getItem('previewData')
      if (!storedData) {
        setError('No preview data found. Please complete onboarding first.')
        setIsLoading(false)
        return
      }

      const data = JSON.parse(storedData)
      setPreviewData(data)

      // Always call API to sync latest data (logo, colors, etc may have changed)
      const response = await fetch('/api/sites/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to create preview')
      }

      const result = await response.json()
      setCompanySlug(result.companySlug)
      
      // Store slug and siteId
      sessionStorage.setItem('previewSlug', result.companySlug)
      sessionStorage.setItem('previewSiteId', result.siteId)

    } catch (err) {
      console.error('Preview init error:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle one more look
  const handleOneMoreLook = () => {
    setShowPaywall(false)
    setSecondLook(true)
    setTimeLeft(60) // 60 seconds for second look
  }

  const handleCheckout = async (plan = 'pro') => {
    setCheckoutLoading(true)
    try {
      const siteId = sessionStorage.getItem('previewSiteId')
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          siteData: {
            ...previewData,
            siteId,
            companySlug
          }
        })
      })

      const { url, error } = await response.json()
      if (error) throw new Error(error)
      
      window.location.href = url
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Checkout failed. Please try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Building your preview...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Preview Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/onboarding')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Start Onboarding
          </button>
        </div>
      </div>
    )
  }

  const primaryColor = previewData?.primaryColor || '#3B82F6'
  const businessName = previewData?.businessName || 'Your Business'
  const industry = previewData?.industry || 'Home Services'
  const city = previewData?.city || 'Your City'
  const state = previewData?.state || 'ST'
  const logoPreview = previewData?.logoPreview
  const logoBackgroundColor = previewData?.logoBackgroundColor

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Timer Banner */}
      <div 
        className="fixed top-0 left-0 right-0 z-40 py-2.5 px-4 text-center text-white text-sm font-medium shadow-lg"
        style={{ backgroundColor: timeLeft <= 30 ? '#dc2626' : primaryColor }}
      >
        <div className="flex items-center justify-center gap-3 max-w-4xl mx-auto">
          <FaClock className={timeLeft <= 30 ? 'animate-pulse' : ''} />
          <span className="hidden sm:inline">
            {timeLeft > 0 
              ? `Preview expires in ${formatTime(timeLeft)} — Your site is ready to launch!`
              : 'Preview expired!'
            }
          </span>
          <span className="sm:hidden">
            {timeLeft > 0 ? formatTime(timeLeft) : 'Expired'}
          </span>
          {timeLeft > 0 && (
            <button 
              onClick={() => handleCheckout('pro')}
              disabled={checkoutLoading}
              className="px-4 py-1.5 bg-white text-gray-800 rounded-lg font-semibold text-xs hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? <FaSpinner className="animate-spin" /> : 'Launch Now →'}
            </button>
          )}
        </div>
      </div>

      {/* Junk-line iframe */}
      <iframe
        src={`${JUNKLINE_URL}?slug=${companySlug}`}
        className="w-full h-full border-0 pt-12"
        title="Website Preview"
      />

      {/* Paywall Modal */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Dark backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            
            {/* Modal content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center max-h-[90vh] overflow-y-auto"
            >
              {/* Lock icon */}
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" 
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <FaLock className="text-2xl" style={{ color: primaryColor }} />
              </div>
              
              {/* Title - changes based on finalPaywall */}
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {finalPaywall ? 'Your Preview Has Expired' : 'Like What You See?'}
              </h2>
              
              {/* Subtitle - changes based on finalPaywall */}
              <p className="text-gray-600 mb-6">
                {finalPaywall 
                  ? 'Choose a plan to launch your website today!'
                  : 'Your professional website is ready. Launch now or take one more look.'
                }
              </p>

              {/* Site summary card */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                  {logoPreview ? (
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: logoBackgroundColor || 'transparent' }}
                    >
                      <img src={logoPreview} alt="Logo" className="w-10 h-10 object-contain" />
                    </div>
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" 
                      style={{ backgroundColor: primaryColor }}
                    >
                      {businessName?.[0]?.toUpperCase() || 'Y'}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-800">{businessName}</p>
                    <p className="text-sm text-gray-500">{industry} • {city}, {state}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCheck className="text-green-500" />
                    <span>6 pages ready to go live</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCheck className="text-green-500" />
                    <span>We set up your domain (or transfer yours)</span>
                  </div>
                </div>
              </div>

              {/* Plan selection */}
              <div className="space-y-3 mb-6">
                
                {/* GROWTH PLAN - Only shown on FIRST paywall */}
                {!finalPaywall && (
                  <button
                    onClick={() => handleCheckout('growth')}
                    disabled={checkoutLoading}
                    className="w-full p-4 rounded-xl border-2 text-left transition-all hover:bg-opacity-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      borderColor: '#10B981',
                      backgroundColor: '#10B98108'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">Growth</span>
                          <span className="text-xs px-2 py-0.5 rounded-full text-white bg-emerald-500">
                            Best Value
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">Everything + AI features + priority support</p>
                      </div>
                      <div className="text-right">
                        {checkoutLoading ? (
                          <FaSpinner className="animate-spin text-xl text-gray-400" />
                        ) : (
                          <>
                            <span className="text-2xl font-bold text-gray-800">$149</span>
                            <span className="text-gray-500 text-sm">/mo</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                )}

                {/* PRO PLAN - Always shown */}
                <button
                  onClick={() => handleCheckout('pro')}
                  disabled={checkoutLoading}
                  className="w-full p-4 rounded-xl border-2 text-left transition-all hover:bg-opacity-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    borderColor: primaryColor,
                    backgroundColor: `${primaryColor}08`
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">Pro</span>
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full text-white" 
                          style={{ backgroundColor: primaryColor }}
                        >
                          {finalPaywall ? 'Best Value' : 'Recommended'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Everything + SEO pages + SMS alerts</p>
                    </div>
                    <div className="text-right">
                      {checkoutLoading ? (
                        <FaSpinner className="animate-spin text-xl text-gray-400" />
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-gray-800">$99</span>
                          <span className="text-gray-500 text-sm">/mo</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>

                {/* STARTER PLAN - Always shown */}
                <button
                  onClick={() => handleCheckout('starter')}
                  disabled={checkoutLoading}
                  className="w-full p-4 rounded-xl border-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed border-gray-200 hover:border-gray-300"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">Starter</span>
                      </div>
                      <p className="text-sm text-gray-500">Website + booking system</p>
                    </div>
                    <div className="text-right">
                      {checkoutLoading ? (
                        <FaSpinner className="animate-spin text-xl text-gray-400" />
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-gray-800">$49</span>
                          <span className="text-gray-500 text-sm">/mo</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              </div>

              {/* ONE MORE LOOK - Only shown on FIRST paywall (not finalPaywall) */}
              {!finalPaywall && (
                <button
                  onClick={handleOneMoreLook}
                  className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 flex items-center justify-center gap-2"
                >
                  <FaEye /> Preview one more time (60 seconds)
                </button>
              )}

              {/* Trust badges */}
              <p className="text-xs text-gray-400 mt-4">
                ✓ Cancel anytime &nbsp; ✓ No setup fees &nbsp; ✓ Live in 24 hours
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}