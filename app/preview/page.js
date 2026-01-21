'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FaClock, FaCheck, FaLock, FaEye, FaSpinner, FaCheckCircle, FaMobile, FaCalendarCheck, FaSearch, FaRedo, FaLightbulb } from 'react-icons/fa'
import TourOverlay from '../components/TourOverlay'
import Image from 'next/image'
import { useAgency } from '../../lib/AgencyContext'

// Loading steps with timing
const LOADING_STEPS = [
  { id: 1, text: "Building your layout...", duration: 1200 },
  { id: 2, text: "Adding your logo...", duration: 1000 },
  { id: 3, text: "Setting up services...", duration: 1100 },
  { id: 4, text: "Configuring service areas...", duration: 1300 },
  { id: 5, text: "Optimizing for mobile...", duration: 900 },
  { id: 6, text: "Adding booking system...", duration: 1000 },
  { id: 7, text: "Finalizing your site...", duration: 1500 },
]

// Tips to show while loading
const LOADING_TIPS = [
  { icon: FaMobile, text: "Your site is automatically optimized for mobile devices" },
  { icon: FaCalendarCheck, text: "Customers can book appointments 24/7 through your site" },
  { icon: FaSearch, text: "We'll help you get found on Google with built-in SEO" },
  { icon: FaLightbulb, text: "You can customize everything from your dashboard after launch" },
  { icon: FaCheck, text: "Your site includes SSL security - the padlock customers trust" },
  { icon: FaMobile, text: "85% of customers search for local services on their phones" },
]

// Skeleton preview component
function SkeletonPreview({ primaryColor, businessName, logoPreview }) {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
      {/* Skeleton Nav */}
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          {logoPreview ? (
            <img src={logoPreview} alt="" className="w-8 h-8 object-contain rounded" />
          ) : (
            <motion.div 
              className="w-8 h-8 rounded"
              style={{ backgroundColor: primaryColor }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          <motion.div 
            className="h-3 w-24 bg-gray-300 rounded"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          />
        </div>
        <div className="flex gap-2">
          <motion.div 
            className="h-2 w-12 bg-gray-200 rounded"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div 
            className="h-2 w-12 bg-gray-200 rounded"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </div>
      </div>
      
      {/* Skeleton Hero */}
      <div className="p-6 space-y-4">
        <motion.div 
          className="h-6 w-3/4 bg-gray-200 rounded"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div 
          className="h-4 w-full bg-gray-100 rounded"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        />
        <motion.div 
          className="h-4 w-2/3 bg-gray-100 rounded"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        />
        <motion.div 
          className="h-10 w-32 rounded-lg mt-4"
          style={{ backgroundColor: primaryColor }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        />
      </div>
      
      {/* Skeleton Services */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              className="bg-gray-50 rounded-lg p-3 space-y-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 * i }}
            >
              <div 
                className="w-8 h-8 rounded-lg mx-auto"
                style={{ backgroundColor: `${primaryColor}20` }}
              />
              <div className="h-2 w-full bg-gray-200 rounded" />
              <div className="h-2 w-2/3 bg-gray-100 rounded mx-auto" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Loading screen component
function LoadingScreen({ 
  agency, 
  currentLoadingStep, 
  completedSteps, 
  primaryColor, 
  businessName, 
  logoPreview,
  loadingStartTime 
}) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  
  // Rotate tips every 4 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % LOADING_TIPS.length)
    }, 4000)
    return () => clearInterval(tipInterval)
  }, [])
  
  // Track elapsed time
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - loadingStartTime) / 1000))
    }, 1000)
    return () => clearInterval(timeInterval)
  }, [loadingStartTime])
  
  const currentTip = LOADING_TIPS[currentTipIndex]
  const TipIcon = currentTip.icon
  
  const showRefreshHint = elapsedSeconds >= 15
  const showRefreshButton = elapsedSeconds >= 25

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left side - Progress */}
          <div className="text-center lg:text-left">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              className="mb-6 flex justify-center lg:justify-start"
            >
              {agency?.logo_url ? (
                <img 
                  src={agency.logo_url} 
                  alt={agency?.name || 'Agency'} 
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <Image src="/logo.png" alt="Logo" width={64} height={64} />
              )}
            </motion.div>
            
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Building Your Website
            </h1>
            <p className="text-gray-400 mb-6">
              {businessName ? `Creating ${businessName}'s online presence...` : 'This will only take a moment...'}
            </p>
            
            {/* Progress steps */}
            <div className="space-y-2.5 mb-6">
              {LOADING_STEPS.map((step, index) => {
                const isComplete = completedSteps.includes(index)
                const isCurrent = currentLoadingStep === index && !isComplete
                const isPending = index > currentLoadingStep
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.3 }}
                    className={`flex items-center gap-3 ${isPending ? 'opacity-30' : ''}`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      {isComplete ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <FaCheckCircle className="text-green-500" />
                        </motion.div>
                      ) : isCurrent ? (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border-2 border-gray-600" />
                      )}
                    </div>
                    
                    <span className={`text-sm font-medium ${
                      isComplete ? 'text-green-400' : isCurrent ? 'text-white' : 'text-gray-500'
                    }`}>
                      {step.text}
                    </span>
                  </motion.div>
                )
              })}
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden mb-6">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                initial={{ width: "0%" }}
                animate={{ width: `${((completedSteps.length) / LOADING_STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            {/* Rotating tip */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTipIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <TipIcon className="text-lg" style={{ color: primaryColor }} />
                  </div>
                  <p className="text-gray-300 text-sm">{currentTip.text}</p>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Refresh hints */}
            <AnimatePresence>
              {showRefreshHint && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  {showRefreshButton ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                      <p className="text-yellow-400 text-sm mb-3">
                        Taking longer than expected? Try refreshing the page.
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-medium text-sm hover:bg-yellow-400 transition-colors"
                      >
                        <FaRedo className="text-xs" />
                        Refresh Page
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                      <FaSpinner className="animate-spin" />
                      Still working on your site...
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Right side - Skeleton preview */}
          <div className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <p className="text-gray-500 text-sm text-center mb-4">Preview loading...</p>
              <SkeletonPreview 
                primaryColor={primaryColor} 
                businessName={businessName}
                logoPreview={logoPreview}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PreviewPage() {
  const router = useRouter()
  const iframeRef = useRef(null)
  const { agency } = useAgency()
  
  const [isLoading, setIsLoading] = useState(true)
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [error, setError] = useState(null)
  const [previewData, setPreviewData] = useState(null)
  const [companySlug, setCompanySlug] = useState(null)
  const [loadingStartTime] = useState(Date.now())
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(180)
  const [timerActive, setTimerActive] = useState(false)
  
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
  const apiCallComplete = useRef(false)

  // Build preview URL - use agency domain if verified, otherwise fallback to Vercel URL
  const previewUrl = companySlug
    ? (agency?.marketing_domain && agency?.domain_verified
        ? `https://${companySlug}.${agency.marketing_domain}?slug=${companySlug}`
        : `https://service-business-platform.vercel.app?slug=${companySlug}`)
    : null

  // Dynamic pricing from agency (stored in cents, convert to dollars)
  const starterPrice = agency?.price_starter ? Math.round(agency.price_starter / 100) : 49
  const proPrice = agency?.price_pro ? Math.round(agency.price_pro / 100) : 99
  const growthPrice = agency?.price_growth ? Math.round(agency.price_growth / 100) : 199

  // Animated loading steps
  useEffect(() => {
    if (!isLoading) return
    
    let stepIndex = 0
    let timeoutId
    
    const advanceStep = () => {
      if (stepIndex < LOADING_STEPS.length) {
        setCurrentLoadingStep(stepIndex)
        
        if (stepIndex > 0) {
          setCompletedSteps(prev => [...prev, stepIndex - 1])
        }
        
        const currentDuration = LOADING_STEPS[stepIndex].duration
        stepIndex++
        
        if (stepIndex < LOADING_STEPS.length) {
          timeoutId = setTimeout(advanceStep, currentDuration)
        } else {
          timeoutId = setTimeout(() => {
            setCompletedSteps(prev => [...prev, LOADING_STEPS.length - 1])
          }, currentDuration)
        }
      }
    }
    
    advanceStep()
    
    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    if (initializingRef.current || initializedRef.current) return
    initializingRef.current = true
    initializePreview()
  }, [])

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
      
      const tourDone = sessionStorage.getItem('tour_completed') || sessionStorage.getItem('tour_skipped')
      if (tourDone) {
        setShowTour(false)
        setTimerActive(true)
      }

      const existingSlug = sessionStorage.getItem('previewSlug')
      const existingSiteId = sessionStorage.getItem('previewSiteId')
      
      if (existingSlug && existingSiteId) {
        setCompanySlug(existingSlug)
        initializedRef.current = true
        apiCallComplete.current = true
        return
      }

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
      apiCallComplete.current = true

    } catch (err) {
      console.error('Preview init error:', err)
      setError(err.message)
      setIsLoading(false)
    } finally {
      initializingRef.current = false
    }
  }

  useEffect(() => {
    if (apiCallComplete.current && completedSteps.length >= LOADING_STEPS.length) {
      setTimeout(() => {
        setIsLoading(false)
      }, 500)
    }
  }, [completedSteps])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
          agencyId: agency?.id,
          siteData: {
            ...previewData,
            siteId,
            companySlug: slug
          }
        })
      })

      const data = await response.json()
      if (data.error) {
        if (data.code === 'AGENCY_STRIPE_NOT_CONNECTED') {
          alert('This agency is not set up to accept payments yet. Please contact them directly to get started.')
          return
        }
        throw new Error(data.error)
      }
      
      window.location.href = data.url
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Checkout failed. Please try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleTourComplete = () => {
    setShowTour(false)
    setTimerActive(true)
    setShowPaywall(true)
  }

  const handleTourSkip = () => {
    setShowTour(false)
    setTimerActive(true)
  }

  const handleTourMinimize = () => {
    setTimerActive(true)
  }

  const handleLaunchNow = () => {
    setShowPaywall(true)
  }

  // Get preview data for loading screen
  const primaryColor = previewData?.primaryColor || agency?.primary_color || '#3B82F6'
  const businessName = previewData?.businessName || ''
  const logoPreview = previewData?.logoPreview

  if (isLoading) {
    return (
      <LoadingScreen
        agency={agency}
        currentLoadingStep={currentLoadingStep}
        completedSteps={completedSteps}
        primaryColor={primaryColor}
        businessName={businessName}
        logoPreview={logoPreview}
        loadingStartTime={loadingStartTime}
      />
    )
  }

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

  const industry = previewData?.industry || 'Home Services'
  const city = previewData?.city || 'Your City'
  const state = previewData?.state || 'ST'
  const logoBackgroundColor = previewData?.logoBackgroundColor

  return (
    <div className="relative w-full h-screen overflow-hidden">
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
              onClick={handleLaunchNow}
              disabled={checkoutLoading}
              className="px-4 py-1.5 bg-white text-gray-800 rounded-lg font-semibold text-xs hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? <FaSpinner className="animate-spin" /> : 'Launch Now →'}
            </button>
          )}
        </div>
      </div>

      <iframe
        ref={iframeRef}
        src={previewUrl}
        className="w-full h-full border-0 pt-12"
        title="Website Preview"
        style={{ position: 'relative', zIndex: 1 }}
      />

      {showTour && !isLoading && companySlug && (
        <TourOverlay 
          primaryColor={primaryColor}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
          onMinimize={handleTourMinimize}
          iframeRef={iframeRef}
        />
      )}

      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center max-h-[90vh] overflow-y-auto"
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" 
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <FaLock className="text-2xl" style={{ color: primaryColor }} />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {finalPaywall ? 'Your Preview Has Expired' : 'Like What You See?'}
              </h2>
              
              <p className="text-gray-600 mb-6">
                {finalPaywall 
                  ? 'Choose a plan to launch your website today!'
                  : 'Your professional website is ready. Launch now or take one more look.'
                }
              </p>

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

              <div className="space-y-3 mb-6">
                {!finalPaywall && (
                  <button
                    onClick={() => handleCheckout('growth')}
                    disabled={checkoutLoading}
                    className="w-full p-4 rounded-xl border-2 text-left transition-all hover:bg-opacity-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ borderColor: '#10B981', backgroundColor: '#10B98108' }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">Growth</span>
                          <span className="text-xs px-2 py-0.5 rounded-full text-white bg-emerald-500">Best Value</span>
                        </div>
                        <p className="text-sm text-gray-500">Everything + AI features + priority support</p>
                      </div>
                      <div className="text-right">
                        {checkoutLoading ? (
                          <FaSpinner className="animate-spin text-xl text-gray-400" />
                        ) : (
                          <>
                            <span className="text-2xl font-bold text-gray-800">${growthPrice}</span>
                            <span className="text-gray-500 text-sm">/mo</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => handleCheckout('pro')}
                  disabled={checkoutLoading}
                  className="w-full p-4 rounded-xl border-2 text-left transition-all hover:bg-opacity-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}08` }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">Pro</span>
                        <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: primaryColor }}>
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
                          <span className="text-2xl font-bold text-gray-800">${proPrice}</span>
                          <span className="text-gray-500 text-sm">/mo</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>

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
                          <span className="text-2xl font-bold text-gray-800">${starterPrice}</span>
                          <span className="text-gray-500 text-sm">/mo</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              </div>

              {!finalPaywall && (
                <button
                  onClick={handleOneMoreLook}
                  className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 flex items-center justify-center gap-2"
                >
                  <FaEye /> Preview one more time (60 seconds)
                </button>
              )}

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