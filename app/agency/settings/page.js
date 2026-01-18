'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FaSave, FaSpinner, FaCamera, FaPalette, FaBuilding, 
  FaEnvelope, FaPhone, FaDollarSign, FaLock, FaEye, FaEyeSlash,
  FaTimes
} from 'react-icons/fa'
import { Toaster, toast } from 'react-hot-toast'
import { useAgencyAuth } from '../../../lib/AgencyAuthContext'
import { useAgency } from '../../../lib/AgencyContext'

export default function AgencySettingsPage() {
  const { agency, isLoading: authLoading, refreshAgency } = useAgencyAuth()
  const { agency: brandingAgency } = useAgency()
  const router = useRouter()
  const fileInputRef = useRef(null)
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form state
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [logoBackgroundColor, setLogoBackgroundColor] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#fa8820')
  const [secondaryColor, setSecondaryColor] = useState('#ff6b6b')
  const [brandPalette, setBrandPalette] = useState([])
  const [extractedColors, setExtractedColors] = useState([])
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [supportPhone, setSupportPhone] = useState('')
  const [priceStarter, setPriceStarter] = useState('')
  const [pricePro, setPricePro] = useState('')
  const [priceGrowth, setPriceGrowth] = useState('')
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Use branding agency for primary color styling
  const brandPrimaryColor = brandingAgency?.primary_color || '#fa8820'

  // Initialize form with agency data
  useEffect(() => {
    if (agency && !isInitialized) {
      setLogoPreview(agency.logo_url || null)
      setLogoBackgroundColor(agency.logo_background_color || '')
      setPrimaryColor(agency.primary_color || '#fa8820')
      setSecondaryColor(agency.secondary_color || '#ff6b6b')
      setBrandPalette(agency.brand_palette || [])
      setName(agency.name || '')
      setTagline(agency.tagline || '')
      setSupportEmail(agency.support_email || '')
      setSupportPhone(agency.support_phone || '')
      setPriceStarter(agency.price_starter ? (agency.price_starter / 100).toString() : '49')
      setPricePro(agency.price_pro ? (agency.price_pro / 100).toString() : '99')
      setPriceGrowth(agency.price_growth ? (agency.price_growth / 100).toString() : '199')
      setIsInitialized(true)
    }
  }, [agency, isInitialized])

  // Helper to convert RGB to valid hex
  const rgbToHex = (r, g, b) => {
    const toHex = (n) => {
      const clamped = Math.max(0, Math.min(255, n))
      return clamped.toString(16).padStart(2, '0')
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  // Color detection functions
  const detectLogoBackground = (img) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = img.naturalWidth || img.width
    canvas.height = img.naturalHeight || img.height
    ctx.drawImage(img, 0, 0)
    
    const edgePixels = []
    const step = 20
    
    // Top and bottom edges
    for (let x = 0; x < canvas.width; x += step) {
      edgePixels.push(ctx.getImageData(x, 0, 1, 1).data)
      edgePixels.push(ctx.getImageData(x, canvas.height - 1, 1, 1).data)
    }
    // Left and right edges
    for (let y = 0; y < canvas.height; y += step) {
      edgePixels.push(ctx.getImageData(0, y, 1, 1).data)
      edgePixels.push(ctx.getImageData(canvas.width - 1, y, 1, 1).data)
    }
    
    // Check for transparency
    const transparentCount = edgePixels.filter(p => p[3] < 128).length
    if (transparentCount > edgePixels.length * 0.5) {
      return { css: 'rgb(255, 255, 255)', r: 255, g: 255, b: 255 }
    }
    
    // Average the edge colors
    let r = 0, g = 0, b = 0, count = 0
    edgePixels.forEach(p => {
      if (p[3] >= 128) {
        r += p[0]
        g += p[1]
        b += p[2]
        count++
      }
    })
    
    if (count > 0) {
      r = Math.round(r / count)
      g = Math.round(g / count)
      b = Math.round(b / count)
    } else {
      r = g = b = 255
    }
    
    return { css: `rgb(${r}, ${g}, ${b})`, r, g, b }
  }

  const extractColorsFromImage = (img, bgColor) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const size = 100
    canvas.width = size
    canvas.height = size
    ctx.drawImage(img, 0, 0, size, size)
    
    const imageData = ctx.getImageData(0, 0, size, size).data
    const colorCounts = {}
    
    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i]
      const g = imageData[i + 1]
      const b = imageData[i + 2]
      const a = imageData[i + 3]
      
      if (a < 128) continue
      
      // Skip if too close to background
      if (bgColor) {
        const dist = Math.sqrt(
          Math.pow(r - bgColor.r, 2) + 
          Math.pow(g - bgColor.g, 2) + 
          Math.pow(b - bgColor.b, 2)
        )
        if (dist < 50) continue
      }
      
      // Quantize - use floor to avoid 256
      const qr = Math.min(240, Math.floor(r / 16) * 16)
      const qg = Math.min(240, Math.floor(g / 16) * 16)
      const qb = Math.min(240, Math.floor(b / 16) * 16)
      const key = `${qr},${qg},${qb}`
      colorCounts[key] = (colorCounts[key] || 0) + 1
    }
    
    // Convert to HSL and filter
    const colors = Object.entries(colorCounts)
      .map(([key, count]) => {
        const [r, g, b] = key.split(',').map(Number)
        const max = Math.max(r, g, b) / 255
        const min = Math.min(r, g, b) / 255
        const l = (max + min) / 2
        const s = max === min ? 0 : l > 0.5 
          ? (max - min) / (2 - max - min) 
          : (max - min) / (max + min)
        return { r, g, b, count, saturation: s, lightness: l }
      })
      .filter(c => c.saturation > 0.25 && c.lightness > 0.15 && c.lightness < 0.85 && c.count > 30)
      .sort((a, b) => (b.saturation * Math.log(b.count)) - (a.saturation * Math.log(a.count)))
      .slice(0, 6)
      .map(c => rgbToHex(c.r, c.g, c.b))
    
    return colors
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target.result
      setLogoPreview(dataUrl)
      setLogoFile(dataUrl)
      
      // Create image for color detection
      const img = new Image()
      img.onload = () => {
        const bgColor = detectLogoBackground(img)
        setLogoBackgroundColor(bgColor.css)
        
        const colors = extractColorsFromImage(img, bgColor)
        setExtractedColors(colors)
        
        // Merge with existing palette (dedupe)
        if (colors.length > 0) {
          const merged = [...new Set([...colors, ...brandPalette])]
          setBrandPalette(merged)
          // Auto-select first color as primary
          setPrimaryColor(colors[0])
          // Auto-select second color as secondary if available
          if (colors.length > 1) {
            setSecondaryColor(colors[1])
          }
        }
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const response = await fetch('/api/agency/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId: agency.id,
          logo_url: logoFile || logoPreview,
          logo_background_color: logoBackgroundColor,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          brand_palette: brandPalette,
          name,
          tagline,
          support_email: supportEmail,
          support_phone: supportPhone,
          price_starter: Math.round(parseFloat(priceStarter) * 100),
          price_pro: Math.round(parseFloat(pricePro) * 100),
          price_growth: Math.round(parseFloat(priceGrowth) * 100),
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save')
      }
      
      toast.success('Settings saved successfully!')
      refreshAgency()
      setLogoFile(null)
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    setIsChangingPassword(true)
    
    try {
      const response = await fetch('/api/agency/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId: agency.id,
          currentPassword,
          newPassword
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }
      
      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (authLoading || !isInitialized) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin text-3xl text-gray-400" />
      </div>
    )
  }

  // Display colors (saved palette)
  const displayColors = brandPalette.length > 0 ? brandPalette : extractedColors

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <Toaster position="top-right" toastOptions={{ style: { marginTop: '60px' } }} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-500 mt-1">Customize your agency branding and pricing</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: brandPrimaryColor }}
        >
          {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
          Save Changes
        </button>
      </div>

      <div className="space-y-6">
        {/* Agency Logo */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${brandPrimaryColor}15` }}
            >
              <FaCamera style={{ color: brandPrimaryColor }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Agency Logo</h2>
              <p className="text-sm text-gray-500">Upload your logo to auto-detect brand colors</p>
            </div>
          </div>
          
          <div className="flex items-start gap-6">
            {/* Logo Preview */}
            <div 
              className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
              style={logoPreview ? { borderStyle: 'solid', borderColor: '#e5e7eb' } : {}}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <FaCamera className="text-2xl text-gray-400" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            
            {/* Background Color Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Nav background color (auto-detected):</span>
              </div>
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded border border-gray-200"
                  style={{ backgroundColor: logoBackgroundColor || '#ffffff' }}
                />
                <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {logoBackgroundColor || 'rgb(255, 255, 255)'}
                </code>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                This color is used for the navigation background when scrolled.
              </p>
            </div>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${brandPrimaryColor}15` }}
            >
              <FaPalette style={{ color: brandPrimaryColor }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Brand Colors</h2>
              <p className="text-sm text-gray-500">Primary and secondary colors for buttons, links, and gradients</p>
            </div>
          </div>
          
          {/* Saved/Detected Colors Palette */}
          {displayColors.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">Choose from your brand palette:</p>
              
              {/* Primary Color Selection */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Primary Color</p>
                <div className="flex flex-wrap gap-3">
                  {displayColors.map((color, i) => (
                    <button
                      key={`primary-${i}`}
                      onClick={() => setPrimaryColor(color)}
                      className="w-12 h-12 rounded-lg transition-all hover:scale-110"
                      style={{ 
                        backgroundColor: color,
                        boxShadow: primaryColor === color ? `0 0 0 3px white, 0 0 0 5px ${color}` : '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      title={`Set as primary: ${color}`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Secondary Color Selection */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Secondary Color (for gradients)</p>
                <div className="flex flex-wrap gap-3">
                  {displayColors.map((color, i) => (
                    <button
                      key={`secondary-${i}`}
                      onClick={() => setSecondaryColor(color)}
                      className="w-12 h-12 rounded-lg transition-all hover:scale-110"
                      style={{ 
                        backgroundColor: color,
                        boxShadow: secondaryColor === color ? `0 0 0 3px white, 0 0 0 5px ${color}` : '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      title={`Set as secondary: ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Manual Color Pickers */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': brandPrimaryColor }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': brandPrimaryColor }}
                />
              </div>
            </div>
          </div>
          
          {/* Gradient Preview */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Gradient Preview</label>
            <div 
              className="h-12 rounded-lg"
              style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
            />
          </div>
        </div>

        {/* Agency Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${brandPrimaryColor}15` }}
            >
              <FaBuilding style={{ color: brandPrimaryColor }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Agency Information</h2>
              <p className="text-sm text-gray-500">Your agency name and tagline</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agency Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': brandPrimaryColor }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g., Helping home service pros get found online"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': brandPrimaryColor }}
              />
            </div>
          </div>
        </div>

        {/* Support Contact */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${brandPrimaryColor}15` }}
            >
              <FaEnvelope style={{ color: brandPrimaryColor }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Support Contact</h2>
              <p className="text-sm text-gray-500">How customers can reach you</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': brandPrimaryColor }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
              <input
                type="tel"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': brandPrimaryColor }}
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${brandPrimaryColor}15` }}
            >
              <FaDollarSign style={{ color: brandPrimaryColor }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Pricing</h2>
              <p className="text-sm text-gray-500">Set your plan prices (shown on marketing site)</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Starter ($/mo)</label>
              <input
                type="number"
                value={priceStarter}
                onChange={(e) => setPriceStarter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': brandPrimaryColor }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pro ($/mo)</label>
              <input
                type="number"
                value={pricePro}
                onChange={(e) => setPricePro(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': brandPrimaryColor }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Growth ($/mo)</label>
              <input
                type="number"
                value={priceGrowth}
                onChange={(e) => setPriceGrowth(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': brandPrimaryColor }}
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${brandPrimaryColor}15` }}
            >
              <FaLock style={{ color: brandPrimaryColor }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Password</h2>
              <p className="text-sm text-gray-500">Change your dashboard password</p>
            </div>
          </div>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 pr-12"
                  style={{ '--tw-ring-color': brandPrimaryColor }}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': brandPrimaryColor }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': brandPrimaryColor }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isChangingPassword || !currentPassword || !newPassword}
              className="px-5 py-2.5 rounded-lg text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: brandPrimaryColor }}
            >
              {isChangingPassword ? (
                <span className="flex items-center gap-2"><FaSpinner className="animate-spin" /> Changing...</span>
              ) : (
                'Change Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}