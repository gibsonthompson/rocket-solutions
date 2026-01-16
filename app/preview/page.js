'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FaClock, FaCheck, FaLock, FaEye, FaSpinner } from 'react-icons/fa'
import TourOverlay from '../components/TourOverlay'
import Image from 'next/image'

// Loading messages that cycle through
const LOADING_MESSAGES = [
  "Building your layout...",
  "Adding your logo...",
  "Setting up services...",
  "Configuring service areas...",
  "Optimizing for mobile...",
  "Adding booking system...",
  "Finalizing your site..."
]

export default function PreviewPage() {
  const router = useRouter()
  const iframeRef = useRef(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [error, setError] = useState(null)
  const [previewData, setPreviewData] = useState(null)
  const [companySlug, setCompanySlug] = useState(null)
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes
  const [timerActive, setTimerActive] = useState(false) // Timer starts PAUSED
  
  // Paywall state
  const [showPaywall, setShowPaywall] = useState(false)
  const [secondLook, setSecondLook] = useState(false)
  const [finalPaywall, setFinalPaywall] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  
  // Tour state
  const [showTour, setShowTour] = useState(true)

  // Prevent double initialization
  const initializingRef = useRef(false)
  const initializedRef = useRef(false)

  // Junk-line URL
  const JUNKLINE_URL = 'https://service-business-platform.vercel.app'

  // Cycle through loading messages
  useEffect(() => {
    if (!isLoading) return
    
    const interval = setInterval(() => {
      setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length)
    }, 1500) // Change message every 1.5 seconds
    
    return () => clearInterval(interval)
  }, [isLoading])

  useEffect(() => {
    if (initializingRef.current || initializedRef.current) return
    initializingRef.current = true
    initializePreview()
  }, [])

  // Timer logic - only runs when timerActive is true
  useEffect(() => {
    if (!timerActive) return
    
    if (timeLeft <= 0) {
      if (!secondLook) {
        setShowPaywall(true)
      } else {
        setFinalPaywall(true)
        setShowPaywall(true)
      }
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, timerActive, secondLook])

  const initializePreview = async () => {
    try {
      const storedData = sessionStorage.getItem('previewData')
      if (!storedData) {
        setError('No preview data found. Please complete onboarding first.')
        setIsLoading(false)
        return
      }

      const data = JSON.parse(storedData)
      setPreviewData(data)
      
      // Check if tour was already completed/skipped
      const tourDone = sessionStorage.getItem('tour_completed') || sessionStorage.getItem('tour_skipped')
      if (tourDone) {
        setShowTour(false)
        setTimerActive(true) // Start timer if tour already done
      }

      // Check if we already have a slug from a previous visit
      const existingSlug = sessionStorage.getItem('previewSlug')
      const existingSiteId = sessionStorage.getItem('previewSiteId')
      
      if (existingSlug && existingSiteId) {
        setCompanySlug(existingSlug)
        initializedRef.current = true
        setIsLoading(false)
        return
      }

      // Call API to create/update preview
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
      
      sessionStorage.setItem('previewSlug', result.companySlug)
      sessionStorage.setItem('previewSiteId', result.siteId)
      
      initializedRef.current = true

    } catch (err) {
      console.error('Preview init error:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
      initializingRef.current = false
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
    setTimeLeft(60)
    setTimerActive(true)
  }

  const handleCheckout = async (plan = 'pro') => {
    setCheckoutLoading(true)
    try {
      const siteId = sessionStorage.getItem('previewSiteId')
      const slug = sessionStorage.getItem('previewSlug') || companySlug
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          siteData: {
            ...previewData,
            siteId,
            companySlug: slug
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

  // Tour handlers
  const handleTourComplete = () => {
    // "See Plans" was clicked - show paywall immediately, start timer
    setShowTour(false)
    setTimerActive(true)
    setShowPaywall(true) // Show paywall right away
  }

  const handleTourSkip = () => {
    setShowTour(false)
    setTimerActive(true) // Start timer
  }

  const handleTourMinimize = () => {
    // User wants to explore on their own - start timer
    setTimerActive(true)
  }

  // Loading state with bouncing logo and cycling messages
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-8"
          >
            <Image 
              src="/logo.png" 
              alt="Rocket Solutions" 
              width={100} 
              height={100}
              className="mx-auto"
            />
          </motion.div>
          
          {/* Cycling loading message */}
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingMessageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-white text-xl font-medium tracking-wide"
            >
              {LOADING_MESSAGES[loadingMessageIndex]}
            </motion.p>
          </AnimatePresence>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {LOADING_MESSAGES.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === loadingMessageIndex 
                    ? 'bg-blue-500 scale-125' 
                    : index < loadingMessageIndex 
                      ? 'bg-blue-400' 
                      : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
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
        className="fixed top-0 left-0 right-0 z-50 py-2.5 px-4 text-center text-white text-sm font-medium shadow-lg"
        style={{ backgroundColor: timerActive && timeLeft <= 30 ? '#dc2626' : primaryColor }}
      >
        <div className="flex items-center justify-center gap-3 max-w-4xl mx-auto">
          <FaClock className={timerActive && timeLeft <= 30 ? 'animate-pulse' : ''} />
          <span className="hidden sm:inline">
            {!timerActive 
              ? `Welcome! Let's take a quick tour of your new website`
              : timeLeft > 0 
                ? `Preview expires in ${formatTime(timeLeft)} — Your site is ready to launch!`
                : 'Preview expired!'
            }
          </span>
          <span className="sm:hidden">
            {!timerActive ? 'Taking the tour...' : (timeLeft > 0 ? formatTime(timeLeft) : 'Expired')}
          </span>
          {timerActive && timeLeft > 0 && (
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
        ref={iframeRef}
        src={`${JUNKLINE_URL}?slug=${companySlug}`}
        className="w-full h-full border-0 pt-12"
        title="Website Preview"
        style={{ position: 'relative', zIndex: 1 }}
      />

      {/* Tour Overlay */}
      {showTour && !isLoading && companySlug && (
        <TourOverlay 
          primaryColor={primaryColor}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
          onMinimize={handleTourMinimize}
          iframeRef={iframeRef}
        />
      )}

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
              
              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {finalPaywall ? 'Your Preview Has Expired' : 'Like What You See?'}
              </h2>
              
              {/* Subtitle */}
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
                    <span>Up to 20 pages ready to go live</span>
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

                {/* PRO PLAN */}
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

                {/* STARTER PLAN */}
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

              {/* ONE MORE LOOK - Only shown on FIRST paywall */}
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