'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRocket, FaArrowRight, FaArrowLeft, FaCheck, FaBuilding, FaPhone, FaMapMarkerAlt, FaImage, FaEye, FaUpload, FaTimes, FaDownload } from 'react-icons/fa'
import toast, { Toaster } from 'react-hot-toast'
import { useAgency } from '../../lib/AgencyContext'

const STEPS = [
  { id: 1, name: 'Business Info', icon: FaBuilding },
  { id: 2, name: 'Contact', icon: FaPhone },
  { id: 3, name: 'Service Area', icon: FaMapMarkerAlt },
  { id: 4, name: 'Brand', icon: FaImage },
  { id: 5, name: 'Preview', icon: FaEye },
]

const INDUSTRIES = [
  'Junk Removal',
  'Landscaping',
  'Pressure Washing',
  'House Cleaning',
  'Plumbing',
  'Electrical',
  'HVAC',
  'Roofing',
  'Painting',
  'Handyman',
  'Pool Service',
  'Pest Control',
  'Other',
]

// Detect logo background color from edges
function detectLogoBackground(imageElement) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  const width = imageElement.naturalWidth || imageElement.width
  const height = imageElement.naturalHeight || imageElement.height
  
  canvas.width = width
  canvas.height = height
  ctx.drawImage(imageElement, 0, 0)
  
  const imageData = ctx.getImageData(0, 0, width, height)
  const pixels = imageData.data
  
  // Sample edge pixels
  const edgeSamples = []
  const step = Math.max(1, Math.floor(Math.min(width, height) / 20))
  
  for (let x = 0; x < width; x += step) {
    edgeSamples.push([x, 0])
    edgeSamples.push([x, height - 1])
  }
  for (let y = 0; y < height; y += step) {
    edgeSamples.push([0, y])
    edgeSamples.push([width - 1, y])
  }
  
  // Count edge colors, tracking transparency
  const colorCounts = {}
  let transparentCount = 0

  edgeSamples.forEach(([x, y]) => {
    const i = (y * width + x) * 4
    const a = pixels[i + 3] // alpha channel
    
    // If mostly transparent, count it
    if (a < 128) {
      transparentCount++
      return
    }
    
    const r = Math.round(pixels[i] / 10) * 10
    const g = Math.round(pixels[i + 1] / 10) * 10
    const b = Math.round(pixels[i + 2] / 10) * 10
    const key = `${r},${g},${b}`
    colorCounts[key] = (colorCounts[key] || 0) + 1
  })

  // If more than half the edges are transparent, use white background
  if (transparentCount > edgeSamples.length / 2) {
    return { css: 'rgb(255, 255, 255)', r: 255, g: 255, b: 255 }
  }
  
  const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])
  if (sorted.length > 0) {
    const [r, g, b] = sorted[0][0].split(',').map(Number)
    return { css: `rgb(${r}, ${g}, ${b})`, r, g, b }
  }
  return { css: 'rgb(255, 255, 255)', r: 255, g: 255, b: 255 }
}

// Extract brand colors - prioritize most vibrant/saturated colors
function extractColorsFromImage(imageElement, bgColor = null) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  const width = imageElement.naturalWidth || imageElement.width
  const height = imageElement.naturalHeight || imageElement.height
  
  canvas.width = width
  canvas.height = height
  ctx.drawImage(imageElement, 0, 0)
  
  const imageData = ctx.getImageData(0, 0, width, height)
  const pixels = imageData.data
  
  const colorData = {}
  
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const a = pixels[i + 3]
    
    // Skip transparent
    if (a < 128) continue
    
    // Skip if too close to background
    if (bgColor) {
      if (
        Math.abs(r - bgColor.r) < 50 &&
        Math.abs(g - bgColor.g) < 50 &&
        Math.abs(b - bgColor.b) < 50
      ) continue
    }
    
    // Bucket colors
    const br = Math.round(r / 25) * 25
    const bg = Math.round(g / 25) * 25
    const bb = Math.round(b / 25) * 25
    
    // Calculate HSL-like values
    const max = Math.max(br, bg, bb)
    const min = Math.min(br, bg, bb)
    const lightness = (max + min) / 2 / 255
    const saturation = max === min ? 0 : 
      lightness > 0.5 
        ? (max - min) / (510 - max - min)
        : (max - min) / (max + min)
    
    const key = `${br},${bg},${bb}`
    
    if (!colorData[key]) {
      colorData[key] = { count: 0, saturation, lightness, r: br, g: bg, b: bb }
    }
    colorData[key].count++
  }
  
  // Convert to array and filter
  const colors = Object.values(colorData)
    .filter(c => {
      // Must have decent saturation (vibrant)
      if (c.saturation < 0.25) return false
      // Not too light (no whites, creams, pastels)
      if (c.lightness > 0.65) return false
      // Not too dark (no blacks, very dark colors)
      if (c.lightness < 0.15) return false
      // Must appear enough times to be significant
      if (c.count < 50) return false
      return true
    })
    // Sort by saturation * count (most vibrant AND common)
    .sort((a, b) => (b.saturation * Math.log(b.count)) - (a.saturation * Math.log(a.count)))
    .slice(0, 6)
    .map(c => {
      const hex = `#${c.r.toString(16).padStart(2, '0')}${c.g.toString(16).padStart(2, '0')}${c.b.toString(16).padStart(2, '0')}`
      return hex
    })
  
  return colors
}

export default function OnboardingPage() {
  const { agency } = useAgency()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1 - Business Info
    businessName: '',
    industry: '',
    otherIndustry: '',
    
    // Step 2 - Contact
    ownerName: '',
    email: '',
    phone: '',
    
    // Step 3 - Service Area
    city: '',
    state: '',
    serviceRadius: '25',
    additionalCities: '',
    
    // Step 4 - Brand
    logo: null,
    logoPreview: null,
    logoBackgroundColor: null,
    primaryColor: '#ee352b',
    extractedColors: [],
    tagline: '',
    
    // Step 5 - Plan
    plan: 'pro',
  })
  
  const [showPWAPrompt, setShowPWAPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const fileInputRef = useRef(null)

  // Convert agency prices from cents to dollars
  const starterPrice = agency.price_starter ? Math.round(agency.price_starter / 100) : 49
  const proPrice = agency.price_pro ? Math.round(agency.price_pro / 100) : 99
  const growthPrice = agency.price_growth ? Math.round(agency.price_growth / 100) : 149

  // Restore form data from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('onboardingData')
    if (saved) {
      try {
        const { formData: savedForm, step: savedStep } = JSON.parse(saved)
        setFormData(prev => ({ ...prev, ...savedForm }))
        setStep(savedStep)
      } catch (e) {
        console.error('Failed to restore onboarding data:', e)
      }
    }
  }, [])

  // Persist form data to sessionStorage
  useEffect(() => {
    if (formData.businessName) { // Only save if they've started
      sessionStorage.setItem('onboardingData', JSON.stringify({ formData, step }))
    }
  }, [formData, step])

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show PWA prompt on mobile after a short delay
      if (window.innerWidth < 768) {
        setTimeout(() => setShowPWAPrompt(true), 3000)
      }
    }
    
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const installPWA = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      toast.success('App installed!')
    }
    setDeferredPrompt(null)
    setShowPWAPrompt(false)
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target.result
      updateField('logo', file)
      updateField('logoPreview', dataUrl)
      
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        // Detect background color from logo edges
        const bgColor = detectLogoBackground(img)
        updateField('logoBackgroundColor', bgColor.css)
        
        // Extract brand colors, excluding the background
        const colors = extractColorsFromImage(img, bgColor)
        if (colors.length > 0) {
          updateField('extractedColors', colors)
          updateField('primaryColor', colors[0])
          toast.success('Brand colors detected!')
        } else {
          toast.success('Logo uploaded!')
        }
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    updateField('logo', null)
    updateField('logoPreview', null)
    updateField('logoBackgroundColor', null)
    updateField('extractedColors', [])
    updateField('primaryColor', '#ee352b')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.businessName.trim()) {
          toast.error('Please enter your business name')
          return false
        }
        if (!formData.industry) {
          toast.error('Please select your industry')
          return false
        }
        return true
      case 2:
        if (!formData.ownerName.trim()) {
          toast.error('Please enter your name')
          return false
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
          toast.error('Please enter a valid email')
          return false
        }
        if (!formData.phone.trim()) {
          toast.error('Please enter your phone number')
          return false
        }
        return true
      case 3:
        if (!formData.city.trim()) {
          toast.error('Please enter your city')
          return false
        }
        if (!formData.state.trim()) {
          toast.error('Please enter your state')
          return false
        }
        return true
      default:
        return true
    }
  }

  const openPreview = () => {
    // Store form data in sessionStorage for preview page
    sessionStorage.setItem('previewData', JSON.stringify(formData))
    window.open('/preview', '_blank')
  }

  const handleSubmit = async () => {
    toast.loading('Opening checkout...', { id: 'checkout' })
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: formData.plan,
          agencyId: agency.id, // Pass agency ID for proper linking
          siteData: {
            businessName: formData.businessName,
            industry: formData.industry === 'Other' ? formData.otherIndustry : formData.industry,
            ownerName: formData.ownerName,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            state: formData.state,
            serviceRadius: formData.serviceRadius,
            tagline: formData.tagline,
            primaryColor: formData.primaryColor,
            logoBackgroundColor: formData.logoBackgroundColor,
          }
        })
      })
      
      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error, { id: 'checkout' })
        return
      }
      
      if (data.url) {
        toast.success('Redirecting to checkout...', { id: 'checkout' })
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to start checkout', { id: 'checkout' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4">
      <Toaster position="top-center" />
      
      {/* PWA Install Prompt */}
      <AnimatePresence>
        {showPWAPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 bg-white rounded-2xl shadow-2xl p-4 z-50 md:hidden"
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: agency.primary_color }}
              >
                <FaDownload className="text-white text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">Install App</h3>
                <p className="text-sm text-gray-600">Add to home screen for the best experience</p>
              </div>
              <button onClick={() => setShowPWAPrompt(false)} className="text-gray-400">
                <FaTimes />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => setShowPWAPrompt(false)}
                className="flex-1 py-2 text-gray-600 font-medium"
              >
                Not now
              </button>
              <button 
                onClick={installPWA}
                className="flex-1 py-2 text-white rounded-lg font-medium"
                style={{ backgroundColor: agency.primary_color }}
              >
                Install
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-white">
            {agency.logo_url ? (
              <Image 
                src={agency.logo_url} 
                alt={agency.name} 
                width={44} 
                height={44}
                className="object-contain"
              />
            ) : (
              <Image 
                src="/logo.png" 
                alt={agency.name} 
                width={44} 
                height={44}
                className="object-contain"
              />
            )}
            <span className="text-xl font-bold">{agency.name}</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 px-4">
          {STEPS.map((s, index) => (
            <div key={s.id} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  step > s.id 
                    ? 'bg-green-500 text-white'
                    : step === s.id
                      ? 'text-white scale-110'
                      : 'bg-white/20 text-white/50'
                }`}
                style={step === s.id ? { backgroundColor: agency.primary_color } : {}}
              >
                {step > s.id ? <FaCheck /> : <s.icon />}
              </div>
              <span className={`text-xs mt-2 hidden sm:block ${
                step >= s.id ? 'text-white' : 'text-white/50'
              }`}>
                {s.name}
              </span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Business Info */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Tell us about your business</h2>
                  <p className="text-gray-500 mb-6">We'll use this to customize your website</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => updateField('businessName', e.target.value)}
                        placeholder="e.g., Smith's Junk Removal"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Industry *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {INDUSTRIES.map((industry) => (
                          <button
                            key={industry}
                            type="button"
                            onClick={() => updateField('industry', industry)}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                              formData.industry === industry
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-gray-200 hover:border-primary/50'
                            }`}
                            style={formData.industry === industry ? { 
                              borderColor: agency.primary_color,
                              backgroundColor: `${agency.primary_color}15`,
                              color: agency.primary_color
                            } : {}}
                          >
                            {industry}
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.industry === 'Other' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Specify Industry
                        </label>
                        <input
                          type="text"
                          value={formData.otherIndustry}
                          onChange={(e) => updateField('otherIndustry', e.target.value)}
                          placeholder="Enter your industry"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Contact */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Contact Information</h2>
                  <p className="text-gray-500 mb-6">How customers will reach you</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={formData.ownerName}
                        onChange={(e) => updateField('ownerName', e.target.value)}
                        placeholder="John Smith"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Service Area */}
              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Service Area</h2>
                  <p className="text-gray-500 mb-6">Where do you provide services?</p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          placeholder="Los Angeles"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => updateField('state', e.target.value.toUpperCase())}
                          placeholder="CA"
                          maxLength={2}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Service Radius (miles)
                      </label>
                      <select
                        value={formData.serviceRadius}
                        onChange={(e) => updateField('serviceRadius', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="10">10 miles</option>
                        <option value="25">25 miles</option>
                        <option value="50">50 miles</option>
                        <option value="100">100 miles</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Additional Cities (optional)
                      </label>
                      <textarea
                        value={formData.additionalCities}
                        onChange={(e) => updateField('additionalCities', e.target.value)}
                        placeholder="List other cities you serve, separated by commas"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Brand (Logo + Colors) */}
              {step === 4 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Brand</h2>
                  <p className="text-gray-500 mb-6">Upload your logo and we'll match your colors</p>
                  
                  <div className="space-y-6">
                    {/* Logo Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Business Logo
                      </label>
                      
                      {!formData.logoPreview ? (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                          style={{ '--hover-border': agency.primary_color }}
                        >
                          <FaUpload className="mx-auto text-3xl text-gray-400 mb-3" />
                          <p className="text-gray-600 font-medium">Click to upload your logo</p>
                          <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      ) : (
                        <div>
                          <div className="relative inline-block">
                            <div 
                              className="rounded-lg p-2"
                              style={{ backgroundColor: formData.logoBackgroundColor || '#f3f4f6' }}
                            >
                              <img 
                                src={formData.logoPreview} 
                                alt="Logo preview" 
                                className="h-20 w-auto object-contain"
                              />
                            </div>
                            <button
                              onClick={removeLogo}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      
                      <p className="text-sm text-gray-400 mt-2">
                        Don't have a logo? No problem — we'll use your business name instead.
                      </p>
                    </div>

                    {/* Colors */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Brand Color
                      </label>
                      
                      {/* Extracted colors from logo */}
                      {formData.extractedColors.length > 0 ? (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Detected from your logo:</p>
                          <div className="flex flex-wrap gap-2">
                            {formData.extractedColors.map((color, i) => (
                              <button
                                key={`extracted-${i}`}
                                type="button"
                                onClick={() => updateField('primaryColor', color)}
                                className={`w-12 h-12 rounded-lg transition-all ${
                                  formData.primaryColor === color
                                    ? 'ring-4 ring-offset-2 ring-gray-300 scale-110'
                                    : 'hover:scale-105'
                                }`}
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-2">Used for buttons, icons, links & accents</p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <p className="text-gray-500 text-sm">
                            Upload your logo above to automatically detect your brand colors
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Tagline */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tagline (optional)
                      </label>
                      <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) => updateField('tagline', e.target.value)}
                        placeholder="e.g., Fast, Reliable, Affordable"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    {/* Preview */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Preview
                      </label>
                      <div className="bg-gray-100 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          {formData.logoPreview ? (
                            <div 
                              className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center"
                              style={{ backgroundColor: formData.logoBackgroundColor || 'transparent' }}
                            >
                              <img src={formData.logoPreview} alt="Logo" className="w-10 h-10 object-contain" />
                            </div>
                          ) : (
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                              style={{ backgroundColor: formData.primaryColor }}
                            >
                              {formData.businessName ? formData.businessName[0].toUpperCase() : 'Y'}
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-lg">{formData.businessName || 'Your Business'}</h3>
                            <p className="text-sm text-gray-500">{formData.tagline || 'Your tagline here'}</p>
                          </div>
                        </div>
                        <button 
                          className="px-6 py-2 rounded-lg text-white font-semibold text-sm"
                          style={{ backgroundColor: formData.primaryColor }}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Preview & Launch */}
              {step === 5 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Preview Your Website</h2>
                  <p className="text-gray-500 mb-6">Take a look before going live</p>
                  
                  <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="bg-gray-50 rounded-xl p-5">
                      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                        {formData.logoPreview ? (
                          <div 
                            className="w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center"
                            style={{ backgroundColor: formData.logoBackgroundColor || 'transparent' }}
                          >
                            <img src={formData.logoPreview} alt="Logo" className="w-12 h-12 object-contain" />
                          </div>
                        ) : (
                          <div 
                            className="w-14 h-14 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
                            style={{ backgroundColor: formData.primaryColor }}
                          >
                            {formData.businessName ? formData.businessName[0].toUpperCase() : 'Y'}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-lg">{formData.businessName}</h3>
                          <p className="text-sm text-gray-500">{formData.industry}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Owner</span>
                          <span className="font-medium">{formData.ownerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Email</span>
                          <span className="font-medium">{formData.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Phone</span>
                          <span className="font-medium">{formData.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Location</span>
                          <span className="font-medium">{formData.city}, {formData.state}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Service Radius</span>
                          <span className="font-medium">{formData.serviceRadius} miles</span>
                        </div>
                      </div>
                    </div>

                    {/* Preview Button */}
                    <button
                      onClick={openPreview}
                      className="w-full py-4 bg-gray-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
                    >
                      <FaEye />
                      Preview My Website
                    </button>

                    {/* Plan Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Select Your Plan
                      </label>
                      <div className="space-y-3">
                        {[
                          { id: 'starter', name: 'Starter', price: starterPrice, desc: 'Website + booking system' },
                          { id: 'pro', name: 'Pro', price: proPrice, desc: 'Everything + SEO pages + SMS', popular: true },
                          { id: 'growth', name: 'Growth', price: growthPrice, desc: 'Everything + AI features' },
                        ].map((plan) => (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => updateField('plan', plan.id)}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                              formData.plan === plan.id
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-primary/50'
                            }`}
                            style={formData.plan === plan.id ? {
                              borderColor: agency.primary_color,
                              backgroundColor: `${agency.primary_color}10`
                            } : {}}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold">{plan.name}</span>
                                  {plan.popular && (
                                    <span 
                                      className="text-white text-xs px-2 py-0.5 rounded-full"
                                      style={{ backgroundColor: agency.primary_color }}
                                    >
                                      Popular
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">{plan.desc}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-xl font-bold">${plan.price}</span>
                                <span className="text-gray-500 text-sm">/mo</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium"
              >
                <FaArrowLeft /> Back
              </button>
            ) : (
              <div />
            )}
            
            {step < STEPS.length ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-lg"
                style={{ backgroundColor: agency.primary_color }}
              >
                Continue <FaArrowRight />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-lg"
                style={{ backgroundColor: agency.primary_color }}
              >
                Launch My Website <FaRocket />
              </button>
            )}
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-white/50 text-sm mt-6">
          Questions? Email us at {agency.support_email || 'support@example.com'}
        </p>
      </div>
    </div>
  )
}