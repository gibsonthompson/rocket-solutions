'use client'

import { useState, useRef, useEffect } from 'react'
import { FaUpload, FaTimes, FaSave, FaSpinner, FaPalette, FaBuilding, FaEnvelope, FaDollarSign, FaLock, FaImage, FaEye } from 'react-icons/fa'
import { useAgencyAuth } from '../../../lib/AgencyAuthContext'
import { useAgency } from '../../../lib/AgencyContext'
import { createClient } from '@supabase/supabase-js'
import toast, { Toaster } from 'react-hot-toast'

const getSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

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
    const a = pixels[i + 3]
    
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
    
    if (a < 128) continue
    
    if (bgColor) {
      if (
        Math.abs(r - bgColor.r) < 50 &&
        Math.abs(g - bgColor.g) < 50 &&
        Math.abs(b - bgColor.b) < 50
      ) continue
    }
    
    const br = Math.round(r / 25) * 25
    const bg = Math.round(g / 25) * 25
    const bb = Math.round(b / 25) * 25
    
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
  
  const colors = Object.values(colorData)
    .filter(c => {
      if (c.saturation < 0.25) return false
      if (c.lightness > 0.65) return false
      if (c.lightness < 0.15) return false
      if (c.count < 50) return false
      return true
    })
    .sort((a, b) => (b.saturation * Math.log(b.count)) - (a.saturation * Math.log(a.count)))
    .slice(0, 6)
    .map(c => {
      const hex = `#${c.r.toString(16).padStart(2, '0')}${c.g.toString(16).padStart(2, '0')}${c.b.toString(16).padStart(2, '0')}`
      return hex
    })
  
  return colors
}

export default function AgencySettingsPage() {
  const { agency, refreshAgency, isLoading: authLoading } = useAgencyAuth()
  const { agency: brandingAgency } = useAgency()
  const fileInputRef = useRef(null)
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    support_email: '',
    support_phone: '',
    primary_color: '#fa8820',
    logo_background_color: '',
    price_starter: 49,
    price_pro: 99,
    price_growth: 199,
  })
  
  const [logoPreview, setLogoPreview] = useState(null)
  const [extractedColors, setExtractedColors] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [hasExistingPassword, setHasExistingPassword] = useState(false)

  const primaryColor = formData.primary_color || brandingAgency?.primary_color || '#fa8820'

  // Initialize form data when agency loads
  useEffect(() => {
    if (agency && !isInitialized) {
      setFormData({
        name: agency.name || '',
        tagline: agency.tagline || '',
        support_email: agency.support_email || '',
        support_phone: agency.support_phone || '',
        primary_color: agency.primary_color || '#fa8820',
        logo_background_color: agency.logo_background_color || '',
        price_starter: agency.price_starter ? agency.price_starter / 100 : 49,
        price_pro: agency.price_pro ? agency.price_pro / 100 : 99,
        price_growth: agency.price_growth ? agency.price_growth / 100 : 199,
      })
      setLogoPreview(agency.logo_url || null)
      setHasExistingPassword(!!agency.dashboard_password_hash)
      setIsInitialized(true)
    }
  }, [agency, isInitialized])

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
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
      setLogoPreview(dataUrl)
      setHasChanges(true)
      
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const bgColor = detectLogoBackground(img)
        updateField('logo_background_color', bgColor.css)
        
        const colors = extractColorsFromImage(img, bgColor)
        if (colors.length > 0) {
          setExtractedColors(colors)
          updateField('primary_color', colors[0])
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
    setLogoPreview(null)
    setExtractedColors([])
    setHasChanges(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    if (!agency?.id) {
      toast.error('Agency not found')
      return
    }
    
    setIsSaving(true)
    const supabase = getSupabase()
    
    try {
      const { error: updateError } = await supabase
        .from('agencies')
        .update({
          name: formData.name,
          tagline: formData.tagline,
          support_email: formData.support_email,
          support_phone: formData.support_phone,
          primary_color: formData.primary_color,
          logo_background_color: formData.logo_background_color,
          logo_url: logoPreview,
          price_starter: Math.round(formData.price_starter * 100),
          price_pro: Math.round(formData.price_pro * 100),
          price_growth: Math.round(formData.price_growth * 100),
          updated_at: new Date().toISOString()
        })
        .eq('id', agency.id)

      if (updateError) throw updateError

      await refreshAgency()
      
      setHasChanges(false)
      toast.success('Settings saved!')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePassword = async () => {
    if (!agency?.id) {
      toast.error('Agency not found')
      return
    }
    
    if (hasExistingPassword && !passwordData.currentPassword) {
      toast.error('Please enter your current password')
      return
    }
    if (!passwordData.newPassword) {
      toast.error('Please enter a new password')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsSavingPassword(true)
    try {
      const response = await fetch('/api/agency/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: passwordData.newPassword,
          currentPassword: passwordData.currentPassword,
          agencyId: agency.id
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Password updated!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setHasExistingPassword(true)
      } else {
        toast.error(data.error || 'Failed to update password')
      }
    } catch (error) {
      console.error('Password update error:', error)
      toast.error('Failed to update password')
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (authLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-4xl" style={{ color: primaryColor }} />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <Toaster 
        position="top-center" 
        containerStyle={{
          top: 'calc(env(safe-area-inset-top, 0px) + 80px)'
        }}
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 text-sm">Customize your agency branding and pricing</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all w-full sm:w-auto ${
            hasChanges 
              ? 'text-white hover:opacity-90'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          style={hasChanges ? { backgroundColor: primaryColor } : {}}
        >
          {isSaving ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FaSave />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* Logo Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <FaImage className="text-2xl" style={{ color: primaryColor }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Agency Logo</h2>
              <p className="text-gray-600 text-sm">Upload your logo to auto-detect brand colors</p>
            </div>
          </div>

          <div className="space-y-4">
            {!logoPreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <FaUpload className="mx-auto text-3xl text-gray-400 mb-3" />
                <p className="text-gray-600 font-medium">Click to upload your logo</p>
                <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 5MB. Transparent PNGs work best.</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="relative">
                  <div 
                    className="rounded-lg p-4"
                    style={{ backgroundColor: formData.logo_background_color || '#f3f4f6' }}
                  >
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="h-24 w-auto object-contain"
                    />
                  </div>
                  <button
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  <p className="font-medium text-gray-700 mb-1">Nav background color (auto-detected):</p>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: formData.logo_background_color }}
                    />
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{formData.logo_background_color}</code>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">This color is used for the navigation background when scrolled.</p>
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
          </div>
        </div>

        {/* Brand Colors Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <FaPalette className="text-2xl" style={{ color: primaryColor }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Brand Colors</h2>
              <p className="text-gray-600 text-sm">Primary color for buttons, links, and accents</p>
            </div>
          </div>

          <div className="space-y-4">
            {extractedColors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Detected from your logo:</p>
                <div className="flex flex-wrap gap-2">
                  {extractedColors.map((color, i) => (
                    <button
                      key={`extracted-${i}`}
                      type="button"
                      onClick={() => updateField('primary_color', color)}
                      className={`w-12 h-12 rounded-lg transition-all ${
                        formData.primary_color === color
                          ? 'ring-4 ring-offset-2 ring-gray-300 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {extractedColors.length > 0 ? 'Or pick manually:' : 'Primary Color'}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => updateField('primary_color', e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => updateField('primary_color', e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': primaryColor }}
                  placeholder="#fa8820"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Agency Info Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaBuilding className="text-2xl text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Agency Information</h2>
              <p className="text-gray-600 text-sm">Your agency name and tagline</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agency Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': primaryColor }}
                placeholder="Your Agency Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': primaryColor }}
                placeholder="Professional websites for home service businesses"
              />
            </div>
          </div>
        </div>

        {/* Support Contact Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaEnvelope className="text-2xl text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Support Contact</h2>
              <p className="text-gray-600 text-sm">How customers can reach you for help</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
              <input
                type="email"
                value={formData.support_email}
                onChange={(e) => updateField('support_email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': primaryColor }}
                placeholder="support@youragency.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
              <input
                type="tel"
                value={formData.support_phone}
                onChange={(e) => updateField('support_phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': primaryColor }}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FaDollarSign className="text-2xl text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pricing</h2>
              <p className="text-gray-600 text-sm">Set monthly prices your customers will see</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Starter Plan</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.price_starter}
                  onChange={(e) => updateField('price_starter', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-16 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': primaryColor }}
                  min="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">/mo</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pro Plan</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.price_pro}
                  onChange={(e) => updateField('price_pro', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-16 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': primaryColor }}
                  min="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">/mo</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Growth Plan</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.price_growth}
                  onChange={(e) => updateField('price_growth', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-16 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': primaryColor }}
                  min="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <FaLock className="text-2xl text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {hasExistingPassword ? 'Change Password' : 'Set Password'}
              </h2>
              <p className="text-gray-600 text-sm">
                {hasExistingPassword 
                  ? 'Update your dashboard login password' 
                  : 'Create a password to secure your dashboard'}
              </p>
            </div>
          </div>

          {!hasExistingPassword && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800">
                <strong>First time setup:</strong> Create a password to replace the default login. Your current default password is your agency slug.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {hasExistingPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': primaryColor }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {hasExistingPassword ? 'New Password' : 'Password'}
                </label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': primaryColor }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': primaryColor }}
                />
              </div>
            </div>

            <button
              onClick={handleSavePassword}
              disabled={isSavingPassword}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg flex items-center gap-2"
            >
              {isSavingPassword ? <FaSpinner className="animate-spin" /> : <FaLock />}
              {isSavingPassword ? 'Saving...' : (hasExistingPassword ? 'Update Password' : 'Set Password')}
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <FaEye className="text-2xl" style={{ color: primaryColor }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Preview</h2>
              <p className="text-gray-600 text-sm">How your branding will look to customers</p>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              {logoPreview ? (
                <div 
                  className="w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: formData.logo_background_color || '#f3f4f6' }}
                >
                  <img src={logoPreview} alt="Logo" className="w-12 h-12 object-contain" />
                </div>
              ) : (
                <div 
                  className="w-14 h-14 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: formData.primary_color }}
                >
                  {formData.name ? formData.name[0].toUpperCase() : 'A'}
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg">{formData.name || 'Your Agency'}</h3>
                <p className="text-sm text-gray-500">{formData.tagline || 'Your tagline here'}</p>
              </div>
            </div>
            <button 
              className="px-6 py-2 rounded-lg text-white font-semibold text-sm"
              style={{ backgroundColor: formData.primary_color }}
            >
              Get My Website
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}