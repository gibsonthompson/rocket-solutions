'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaArrowRight, FaArrowLeft, FaImages, FaStar, FaPhone, FaWrench, FaHome, FaRocket, FaEdit } from 'react-icons/fa'

const TOUR_STEPS = [
  {
    id: 'hero',
    sectionId: 'hero',
    title: 'Make a Great First Impression',
    description: "This hero section grabs attention instantly. Your business name, a powerful headline, and a clear call-to-action get customers to reach out.",
    tip: "You can customize your tagline and button text anytime.",
    editLocation: 'Settings',
    icon: FaHome,
  },
  {
    id: 'services',
    sectionId: 'services',
    title: 'Showcase What You Do',
    description: "List all your services with descriptions and pricing. Customers love knowing exactly what you offer before they call.",
    tip: "Add unlimited services — we recommend starting with your top 3.",
    editLocation: 'Services',
    icon: FaWrench,
  },
  {
    id: 'gallery',
    sectionId: 'gallery',
    title: 'Show Off Your Best Work',
    description: "Before & after photos, completed projects, your team in action — visuals build trust faster than words ever could.",
    tip: "Upload photos directly from your phone using the app!",
    editLocation: 'Gallery',
    icon: FaImages,
  },
  {
    id: 'testimonials',
    sectionId: 'testimonials',
    title: 'Let Customers Sell For You',
    description: "5-star reviews are your best salespeople. Display testimonials from happy customers to build instant credibility.",
    tip: "Ask your best customers for a quick review — most are happy to help!",
    editLocation: 'Testimonials',
    icon: FaStar,
  },
  {
    id: 'contact',
    sectionId: 'contact',
    title: 'Turn Visitors Into Leads',
    description: "Every quote request goes straight to your dashboard. You'll get notified instantly so you never miss an opportunity.",
    tip: "Respond within 5 minutes to win 80% more jobs!",
    editLocation: 'Bookings',
    icon: FaPhone,
  },
  {
    id: 'complete',
    sectionId: null,
    title: "You're Ready to Launch! 🚀",
    description: "Your professional website is built and waiting. Pick a plan, and we'll have you live within 24 hours.",
    tip: null,
    editLocation: null,
    icon: FaRocket,
    isFinal: true
  }
]

export default function TourOverlay({ primaryColor, onComplete, onSkip, onMinimize, iframeRef }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)

  const step = TOUR_STEPS[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === TOUR_STEPS.length - 1

  // Send scroll command to iframe
  const scrollToSection = (sectionId) => {
    if (!sectionId) return
    
    // Try to get iframe from ref or find it in DOM
    const iframe = iframeRef?.current || document.querySelector('iframe')
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        { type: 'SCROLL_TO_SECTION', sectionId },
        '*'
      )
    }
  }

  const handleNext = () => {
    if (isLastStep) {
      // "See Plans" clicked - complete tour and show paywall
      setIsVisible(false)
      sessionStorage.setItem('tour_completed', 'true')
      onComplete?.()
    } else {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      // Scroll to the next section
      scrollToSection(TOUR_STEPS[nextStep].sectionId)
    }
  }

  const handleBack = () => {
    if (!isFirstStep) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      // Scroll to the previous section
      scrollToSection(TOUR_STEPS[prevStep].sectionId)
    }
  }

  const handleSkip = () => {
    setIsVisible(false)
    sessionStorage.setItem('tour_skipped', 'true')
    onSkip?.() // This will start the timer
  }

  const handleMinimize = () => {
    setIsMinimized(true)
    onMinimize?.() // This will start the timer
  }

  const handleRestore = () => {
    setIsMinimized(false)
  }

  // Check if tour was already completed/skipped
  useEffect(() => {
    const skipped = sessionStorage.getItem('tour_skipped')
    const completed = sessionStorage.getItem('tour_completed')
    if (skipped || completed) {
      setIsVisible(false)
    }
  }, [])

  // Scroll to hero on mount
  useEffect(() => {
    if (isVisible && !isMinimized) {
      // Small delay to ensure iframe is loaded
      const timer = setTimeout(() => {
        scrollToSection('hero')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!isVisible) return null

  const StepIcon = step.icon

  // Minimized state - just show a small "Resume Tour" button
  if (isMinimized) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={handleRestore}
        className="fixed bottom-4 right-4 z-40 px-4 py-3 rounded-full shadow-lg text-white font-medium flex items-center gap-2"
        style={{ backgroundColor: primaryColor }}
      >
        <FaRocket /> Resume Tour ({currentStep + 1}/{TOUR_STEPS.length})
      </motion.button>
    )
  }

  return (
    <AnimatePresence>
      {/* Semi-transparent overlay - allows clicking through to scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-30 pointer-events-none"
        style={{ top: '48px' }}
      >
        {/* Gradient overlay - darker at edges, lighter in middle for focus */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)'
          }}
        />
      </motion.div>

      {/* Tour Card - Fixed position, doesn't block scrolling */}
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: 20, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed z-40 pointer-events-auto"
        style={{
          bottom: '24px',
          left: '50%',
          width: 'calc(100% - 32px)',
          maxWidth: '420px',
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header - FIXED: Removed truncate, adjusted layout */}
          <div 
            className="px-4 py-3 sm:px-5 sm:py-4"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <StepIcon className="text-white text-base sm:text-lg" />
              </div>
              <div className="flex-1 min-w-0 pr-16">
                {/* FIXED: Removed truncate class, allow text to wrap */}
                <h3 className="text-white font-bold text-base sm:text-lg leading-tight">{step.title}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  {TOUR_STEPS.map((_, index) => (
                    <div
                      key={index}
                      className="h-1 rounded-full transition-all duration-300"
                      style={{
                        width: index === currentStep ? '16px' : '6px',
                        backgroundColor: index <= currentStep ? 'white' : 'rgba(255,255,255,0.3)'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Controls positioned absolutely in top-right */}
            <div className="absolute top-3 right-3 flex items-center gap-1">
              <button 
                onClick={handleMinimize}
                className="text-white/60 hover:text-white p-2 text-xs"
                title="Minimize tour"
              >
                —
              </button>
              <button 
                onClick={handleSkip}
                className="text-white/60 hover:text-white p-2"
                title="Skip tour"
              >
                <FaTimes size={14} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5">
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{step.description}</p>
            
            {step.tip && (
              <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">💡</span>
                <span className="text-sm text-amber-800">{step.tip}</span>
              </div>
            )}
            
            {step.editLocation && (
              <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2 flex items-center gap-2">
                <FaEdit className="text-gray-400 text-sm" />
                <span className="text-sm text-gray-600">
                  Edit in your dashboard under{' '}
                  <span className="font-semibold" style={{ color: primaryColor }}>
                    {step.editLocation}
                  </span>
                </span>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={handleBack}
                disabled={isFirstStep}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                  isFirstStep 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FaArrowLeft size={12} /> Back
              </button>

              <span className="text-xs text-gray-400 hidden sm:block">
                {currentStep + 1} of {TOUR_STEPS.length}
              </span>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: primaryColor }}
              >
                {isLastStep ? (
                  <>See Plans</>
                ) : (
                  <>Next <FaArrowRight size={12} /></>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Scroll hint - only on first step */}
        {isFirstStep && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-white/80 text-xs mt-3 drop-shadow"
          >
            ↕ Scroll to explore your site while taking the tour
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  )
}