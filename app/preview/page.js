'use client'
import { useState, useEffect } from 'react'
import { FaLock, FaCheck, FaEye, FaSpinner } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import SiteTemplate from '../components/SiteTemplate'

export default function PreviewPage() {
  const [previewData, setPreviewData] = useState(null)
  const [timeLeft, setTimeLeft] = useState(180)
  const [showPaywall, setShowPaywall] = useState(false)
  const [secondLook, setSecondLook] = useState(false)
  const [finalPaywall, setFinalPaywall] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    const data = sessionStorage.getItem('previewData')
    if (data) setPreviewData(JSON.parse(data))
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!secondLook) setShowPaywall(true)
      else { setFinalPaywall(true); setShowPaywall(true) }
      return
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, secondLook])

  const handleOneMoreLook = () => { setShowPaywall(false); setSecondLook(true); setTimeLeft(60) }

  const handleCheckout = async (selectedPlan) => {
    const plan = selectedPlan || previewData?.plan || 'pro'
    setCheckoutLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, siteData: previewData }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout')
      window.location.href = data.url
    } catch (error) {
      toast.error(error.message || 'Something went wrong.')
      setCheckoutLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your preview...</p>
        </div>
      </div>
    )
  }

  if (!previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">No Preview Data</h1>
          <p className="text-gray-600 mb-4">Please complete the onboarding wizard first.</p>
          <a href="/onboarding" className="inline-block px-6 py-3 bg-red-500 text-white rounded-lg font-semibold">Start Onboarding</a>
        </div>
      </div>
    )
  }

  const { businessName, industry, primaryColor, logoPreview, logoBackgroundColor, city, state } = previewData

  return (
    <div className="relative">
      <AnimatePresence>
        {showPaywall && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center max-h-[90vh] overflow-y-auto">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${primaryColor}15` }}>
                <FaLock className="text-2xl" style={{ color: primaryColor }} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{finalPaywall ? 'Your Preview Has Expired' : 'Like What You See?'}</h2>
              <p className="text-gray-600 mb-6">{finalPaywall ? 'Choose a plan to launch your website today!' : 'Your professional website is ready. Launch now or take one more look.'}</p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                  {logoPreview ? (
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: logoBackgroundColor || 'transparent' }}>
                      <img src={logoPreview} alt="Logo" className="w-10 h-10 object-contain" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: primaryColor }}>{businessName?.[0]?.toUpperCase() || 'Y'}</div>
                  )}
                  <div>
                    <p className="font-bold text-gray-800">{businessName}</p>
                    <p className="text-sm text-gray-500">{industry} • {city}, {state}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-green-500" /><span>7 pages ready to go live</span></div>
                  <div className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-green-500" /><span>We set up your domain</span></div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { id: 'starter', name: 'Starter', desc: 'Website + booking system', price: 49 },
                  { id: 'pro', name: 'Pro', desc: 'Everything + SEO pages + SMS alerts', price: 99, recommended: true },
                  { id: 'growth', name: 'Growth', desc: 'Everything + AI features + priority support', price: 149 },
                ].map(plan => (
                  <button key={plan.id} onClick={() => handleCheckout(plan.id)} disabled={checkoutLoading}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all disabled:opacity-50 ${plan.recommended ? 'bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    style={plan.recommended ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` } : {}}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">{plan.name}</span>
                          {plan.recommended && <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: primaryColor }}>Recommended</span>}
                        </div>
                        <p className="text-sm text-gray-500">{plan.desc}</p>
                      </div>
                      <div className="text-right">
                        {checkoutLoading ? <FaSpinner className="animate-spin text-xl text-gray-400" /> : <><span className="text-2xl font-bold text-gray-800">${plan.price}</span><span className="text-gray-500 text-sm">/mo</span></>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {!finalPaywall && <button onClick={handleOneMoreLook} className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 flex items-center justify-center gap-2"><FaEye /> Preview one more time (60 seconds)</button>}
              <p className="text-xs text-gray-400 mt-4">✓ Cancel anytime &nbsp; ✓ No setup fees &nbsp; ✓ Live in 24 hours</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`${showPaywall ? 'blur-sm pointer-events-none' : ''} transition-all duration-300`}>
        <SiteTemplate siteData={previewData} isPreview={true} showTimer={true} timeLeft={timeLeft} onCheckout={handleCheckout} checkoutLoading={checkoutLoading} />
      </div>
    </div>
  )
}