'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaEnvelope, FaGlobe, FaRocket } from 'react-icons/fa'
import Image from 'next/image'
import Link from 'next/link'
import Confetti from 'react-confetti'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Clear preview data from session storage
    sessionStorage.removeItem('previewData')
    
    // Set window size for confetti
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    
    // Simulate loading then show confetti
    const loadTimer = setTimeout(() => {
      setLoading(false)
      setShowConfetti(true)
    }, 1500)
    
    // Stop confetti after 5 seconds
    const confettiTimer = setTimeout(() => setShowConfetti(false), 6500)
    
    return () => {
      clearTimeout(loadTimer)
      clearTimeout(confettiTimer)
    }
  }, [])

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
            width={64}
            height={64}
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

        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
          <h2 className="font-bold text-gray-800 mb-4">What happens next?</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaEnvelope className="text-orange-500 text-sm" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Check your email</p>
                <p className="text-sm text-gray-500">
                  You'll receive a confirmation with your login details
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaGlobe className="text-orange-500 text-sm" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Domain setup</p>
                <p className="text-sm text-gray-500">
                  We'll reach out shortly to connect your domain
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaRocket className="text-orange-500 text-sm" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Access your dashboard</p>
                <p className="text-sm text-gray-500">
                  Manage bookings, update content, and track performance
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
          >
            Go to Dashboard
          </Link>
          
          <Link
            href="/"
            className="block w-full py-4 text-gray-600 font-medium hover:text-gray-800 transition-colors"
          >
            Return to Home
          </Link>
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