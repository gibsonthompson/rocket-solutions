'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaRocket, FaEnvelope, FaLock, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAgency } from '../../../lib/AgencyContext'

export default function AgencyLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  
  // Password change state
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agencyId, setAgencyId] = useState(null)
  
  const router = useRouter()
  
  // Get agency branding from middleware cookie
  const { agency, isLoading: agencyLoading } = useAgency()

  // Check if already logged in
  useEffect(() => {
    const existingAgencyId = localStorage.getItem('agencyId')
    if (existingAgencyId) {
      router.push('/agency/dashboard')
    } else {
      setIsCheckingSession(false)
    }
  }, [router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/agency/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        setIsLoading(false)
        return
      }

      if (data.requiresPasswordChange) {
        // First time login - need to set password
        setAgencyId(data.agencyId)
        setRequiresPasswordChange(true)
        setIsLoading(false)
        return
      }

      // Success - store session and redirect
      localStorage.setItem('agencyId', data.agencyId)
      router.push('/agency/dashboard')
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const handleSetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/agency/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password: newPassword, 
          agencyId 
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to set password')
        setIsLoading(false)
        return
      }

      // Success - store session and redirect
      localStorage.setItem('agencyId', agencyId)
      router.push('/agency/dashboard')
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  // Show loading while checking session or agency branding
  if (isCheckingSession || agencyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
        <FaSpinner className="animate-spin text-4xl text-white" />
      </div>
    )
  }

  const primaryColor = agency?.primary_color || '#fa8820'
  const agencyName = agency?.name || 'Agency Portal'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center space-y-3 text-white">
            {agency?.logo_url ? (
              <img 
                src={agency.logo_url} 
                alt={agencyName}
                className="h-16 w-auto object-contain"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <FaRocket className="text-3xl text-white" />
              </div>
            )}
            <span className="text-2xl font-bold">{agencyName}</span>
          </Link>
          <p className="text-gray-400 mt-2">
            {requiresPasswordChange 
              ? 'Set your new password'
              : 'Sign in to manage your agency'
            }
          </p>
        </div>

        {/* Login/Password Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {!requiresPasswordChange ? (
            // Login Form
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@agency.com"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  First time? Your default password is your agency slug.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                style={{ backgroundColor: primaryColor }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          ) : (
            // Set Password Form
            <form onSubmit={handleSetPassword} className="space-y-6">
              <div 
                className="px-4 py-3 rounded-lg text-sm"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                Welcome! Please set a secure password for your account.
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                style={{ backgroundColor: primaryColor }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Setting password...</span>
                  </>
                ) : (
                  <span>Set Password & Continue</span>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-sm text-gray-500 hover:underline"
              style={{ '--hover-color': primaryColor }}
            >
              ← Back to home
            </Link>
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-white/50 text-sm mt-6">
          Need an agency account? Contact us at {agency?.support_email || 'hello@gorocketsolutions.com'}
        </p>
      </div>
    </div>
  )
}