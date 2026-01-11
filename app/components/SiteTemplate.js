'use client'
import { useState } from 'react'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaStar, FaClock, FaShieldAlt, FaCamera, FaQuoteLeft, FaArrowRight, FaTruck, FaHome, FaBolt, FaThumbsUp, FaBars, FaTimes, FaChevronRight, FaChevronLeft, FaLeaf, FaWrench, FaSprayCan, FaBroom, FaSnowflake, FaTools, FaPaintRoller, FaBug, FaSwimmingPool, FaNewspaper, FaCheckCircle, FaRecycle, FaDollarSign, FaUserFriends, FaGoogle, FaExternalLinkAlt, FaFacebook, FaInstagram, FaYelp, FaSpinner, FaCalendarAlt } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

// ============================================
// INDUSTRY CONFIGURATIONS
// ============================================

const industryIcons = {
  'Junk Removal': FaTruck,
  'Landscaping': FaLeaf,
  'Pressure Washing': FaSprayCan,
  'House Cleaning': FaBroom,
  'Plumbing': FaWrench,
  'Electrical': FaBolt,
  'HVAC': FaSnowflake,
  'Roofing': FaHome,
  'Painting': FaPaintRoller,
  'Handyman': FaTools,
  'Pool Service': FaSwimmingPool,
  'Pest Control': FaBug,
}

const industryServices = {
  'Junk Removal': [
    { title: 'Full Junk Removal', desc: 'We handle all the heavy lifting. From single items to full property cleanouts, we take it all.', features: ['No sorting required', 'Any volume', 'Same-day available'] },
    { title: 'Residential Cleanouts', desc: 'Full-service cleanouts for homes, garages, basements, and attics.', features: ['Furniture removal', 'Appliances', 'Yard waste'] },
    { title: 'Commercial Cleanouts', desc: 'Office furniture, equipment, and debris removal. Flexible scheduling.', features: ['Regular pickups', 'Demolition debris', 'Flexible scheduling'] },
    { title: 'Appliance Removal', desc: 'Safe disposal of refrigerators, washers, dryers, and other large appliances.', features: ['All appliances', 'Eco-friendly disposal', 'Same-day pickup'] },
    { title: 'Furniture Removal', desc: 'Couches, mattresses, desks, and more. Quick and responsible hauling.', features: ['Any size items', 'Donation coordination', 'Clean removal'] },
    { title: 'Yard Waste Removal', desc: 'Tree branches, leaves, soil, concrete, and landscaping debris.', features: ['Organic waste', 'Heavy materials', 'Green disposal'] },
  ],
  'Landscaping': [
    { title: 'Lawn Maintenance', desc: 'Regular mowing, edging, and trimming to keep your lawn pristine.', features: ['Weekly service', 'Edge trimming', 'Debris cleanup'] },
    { title: 'Garden Design', desc: 'Custom landscape design that enhances your property\'s beauty.', features: ['Custom designs', '3D renderings', 'Plant selection'] },
    { title: 'Tree & Shrub Care', desc: 'Pruning, trimming, and health maintenance for all trees and shrubs.', features: ['Expert pruning', 'Disease treatment', 'Shaping'] },
    { title: 'Irrigation Systems', desc: 'Installation and repair of sprinkler systems for efficient watering.', features: ['Smart systems', 'Repairs', 'Winterization'] },
    { title: 'Hardscaping', desc: 'Patios, walkways, retaining walls, and outdoor living spaces.', features: ['Custom design', 'Quality materials', 'Expert installation'] },
    { title: 'Seasonal Cleanup', desc: 'Spring and fall cleanup services to prepare your yard.', features: ['Leaf removal', 'Bed prep', 'Mulching'] },
  ],
  'Pressure Washing': [
    { title: 'House Washing', desc: 'Restore your home\'s exterior to like-new condition.', features: ['Soft wash safe', 'All siding types', 'Streak-free'] },
    { title: 'Driveway & Sidewalk', desc: 'Remove oil stains, dirt, and grime from concrete and pavers.', features: ['Oil stain removal', 'Concrete & pavers', 'Sealing available'] },
    { title: 'Deck & Patio Cleaning', desc: 'Bring your outdoor living space back to life.', features: ['Wood & composite', 'Mold removal', 'Staining available'] },
    { title: 'Roof Cleaning', desc: 'Safely remove moss, algae, and stains without damage.', features: ['Soft wash method', 'Extends roof life', 'All roof types'] },
    { title: 'Fence Cleaning', desc: 'Clean and restore wood, vinyl, and metal fences.', features: ['All materials', 'Stain prep', 'Like-new results'] },
    { title: 'Commercial Washing', desc: 'Keep your business looking professional.', features: ['Storefronts', 'Parking lots', 'Fleet washing'] },
  ],
  'Plumbing': [
    { title: 'Emergency Repairs', desc: '24/7 emergency plumbing service for leaks, clogs, and burst pipes.', features: ['24/7 available', 'Fast response', 'Licensed plumbers'] },
    { title: 'Drain Cleaning', desc: 'Professional drain cleaning to restore proper flow.', features: ['Video inspection', 'Hydro jetting', 'Root removal'] },
    { title: 'Water Heater Service', desc: 'Installation, repair, and maintenance for all water heaters.', features: ['Tank & tankless', 'Same-day install', 'Energy efficient'] },
    { title: 'Fixture Installation', desc: 'Professional installation of faucets, toilets, sinks.', features: ['All fixtures', 'Code compliant', 'Clean installation'] },
    { title: 'Pipe Repair', desc: 'Fix leaky pipes, repiping, and sewer line repairs.', features: ['Leak detection', 'Trenchless options', 'Warranty included'] },
    { title: 'Sewer Services', desc: 'Sewer line inspection, cleaning, and repair.', features: ['Camera inspection', 'Line clearing', 'Full replacement'] },
  ],
  'House Cleaning': [
    { title: 'Regular Cleaning', desc: 'Weekly, bi-weekly, or monthly cleaning to keep your home spotless.', features: ['Flexible scheduling', 'Same team', 'Custom checklist'] },
    { title: 'Deep Cleaning', desc: 'Thorough top-to-bottom cleaning for a fresh start.', features: ['Every corner', 'Appliances included', 'Move-in ready'] },
    { title: 'Move In/Out Cleaning', desc: 'Get your security deposit back or start fresh.', features: ['Deposit guarantee', 'Full property', 'Same-day available'] },
    { title: 'Office Cleaning', desc: 'Professional cleaning for offices and commercial spaces.', features: ['After hours', 'Daily/weekly', 'Sanitization'] },
    { title: 'Post-Construction', desc: 'Remove dust, debris, and construction mess.', features: ['Dust removal', 'Window cleaning', 'Final touches'] },
    { title: 'Special Events', desc: 'Pre and post-event cleaning for parties and gatherings.', features: ['Before & after', 'Quick turnaround', 'Full service'] },
  ],
  'default': [
    { title: 'Residential Services', desc: 'Complete solutions for homeowners. Quality workmanship guaranteed.', features: ['Licensed pros', 'Quality guaranteed', 'Fair pricing'] },
    { title: 'Commercial Services', desc: 'Professional service for businesses of all sizes.', features: ['Flexible hours', 'Regular contracts', 'Dedicated team'] },
    { title: 'Emergency Service', desc: 'Available for urgent situations. Fast response times.', features: ['24/7 available', 'Fast response', 'Priority scheduling'] },
    { title: 'Maintenance Plans', desc: 'Regular maintenance to prevent problems.', features: ['Scheduled visits', 'Priority service', 'Discounted rates'] },
    { title: 'Free Estimates', desc: 'No-obligation quotes for all projects.', features: ['Same-day quotes', 'Written estimates', 'No surprises'] },
    { title: 'Satisfaction Guaranteed', desc: 'We stand behind our work.', features: ['100% guarantee', 'Follow-up service', 'Quality assured'] },
  ],
}

const industryHeroText = {
  'Junk Removal': { headline: 'Fast & Reliable Junk Removal', subtext: 'Professional junk removal and dumpster rentals. Same-day service available.' },
  'Landscaping': { headline: 'Professional Landscaping', subtext: 'Transform your outdoor space with expert landscaping and lawn care.' },
  'Pressure Washing': { headline: 'Professional Pressure Washing', subtext: 'Restore your property\'s beauty with expert pressure washing.' },
  'Plumbing': { headline: 'Expert Plumbing Services', subtext: '24/7 plumbing repairs, installations, and maintenance.' },
  'House Cleaning': { headline: 'Professional House Cleaning', subtext: 'Reliable, thorough cleaning services for homes and offices.' },
  'default': { headline: 'Professional Services', subtext: 'Quality workmanship, fair prices, satisfaction guaranteed.' },
}

const industryWhyChoose = [
  { icon: FaClock, title: 'Fast & Flexible', desc: 'Same-day service available. We work around your schedule.' },
  { icon: FaDollarSign, title: 'Affordable Pricing', desc: 'Transparent pricing with no hidden fees.' },
  { icon: FaShieldAlt, title: 'Licensed & Insured', desc: 'Fully licensed and insured for your protection.' },
  { icon: FaRecycle, title: 'Eco-Friendly', desc: 'We recycle and donate whenever possible.' },
  { icon: FaUserFriends, title: 'Professional Team', desc: 'Courteous team members who respect your property.' },
  { icon: FaStar, title: 'Highly Rated', desc: '5-star service backed by hundreds of satisfied customers.' },
]

const sampleBlogPosts = [
  { slug: 'how-to-prepare', title: 'How to Prepare for Your Service Appointment', excerpt: 'A few simple steps to ensure your appointment goes smoothly.', date: 'January 5, 2025', readTime: '4 min read' },
  { slug: 'top-5-tips', title: 'Top 5 Tips for Maintaining Your Property', excerpt: 'Expert advice to keep your home in top condition year-round.', date: 'December 28, 2024', readTime: '6 min read' },
  { slug: 'why-hire-professional', title: 'Why Hire a Professional Instead of DIY?', excerpt: 'The real costs of doing it yourself vs. hiring an expert.', date: 'December 15, 2024', readTime: '5 min read' },
]

const sampleReviews = [
  { name: 'Michael T.', text: 'Absolutely fantastic service! They arrived on time, worked efficiently, and left the place spotless. Will definitely use again!', date: '2 weeks ago', rating: 5 },
  { name: 'Sarah M.', text: 'Professional from start to finish. Fair pricing, great communication, and quality work. Highly recommend!', date: '1 month ago', rating: 5 },
  { name: 'David K.', text: 'These guys are the real deal. They went above and beyond my expectations. Five stars!', date: '1 month ago', rating: 5 },
  { name: 'Jennifer L.', text: 'Quick response, fair quote, and excellent work. Already recommended them to my neighbors.', date: '2 months ago', rating: 5 },
  { name: 'Robert H.', text: 'Very impressed with the professionalism. They treated my home with respect. Thank you!', date: '2 months ago', rating: 5 },
]

// GOLD STAR COLOR - used everywhere for reviews
const STAR_COLOR = '#FBBF24' // Tailwind yellow-400

// ============================================
// BOOKING MODAL COMPONENT
// ============================================

function BookingModal({ onClose, businessName, phone, primaryColor, services, city }) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', city: city || '',
    serviceType: '', date: new Date(), time: '', details: ''
  })

  const timeSlots = [
    '8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step !== 3) return
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert('Estimate request sent! We\'ll contact you shortly.')
    onClose()
  }

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.phone || !formData.serviceType)) {
      alert('Please fill in all required fields')
      return
    }
    setStep(step + 1)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl z-10">
          <FaTimes />
        </button>

        {/* Header - white text on brand color */}
        <div className="p-6 rounded-t-2xl" style={{ backgroundColor: primaryColor }}>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Get Your Free Estimate</h2>
          <p className="mt-2 text-white/90">Step {step} of 3</p>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 flex-1 rounded ${s <= step ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Phone *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Service Type *</label>
                <select name="serviceType" value={formData.serviceType} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg" required>
                  <option value="">Select a service</option>
                  {services.map((s, i) => <option key={i} value={s.title}>{s.title}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Service Address *</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg" placeholder="123 Main St" required />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Preferred Date</label>
                <div className="flex justify-center">
                  <Calendar
                    onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                    value={formData.date}
                    minDate={new Date()}
                    className="border-0 shadow-lg rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Preferred Time</label>
                <select name="time" value={formData.time} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg">
                  <option value="">Select a time (optional)</option>
                  {timeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </div>
              <p className="text-sm text-gray-500">* We'll confirm availability and may suggest alternatives.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Additional Details</label>
                <textarea name="details" value={formData.details} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none" rows="4" placeholder="Tell us more about your needs..." />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-800">Review Your Information:</h4>
                <div className="text-sm space-y-1 text-gray-600">
                  <p><span className="font-medium">Name:</span> {formData.name}</p>
                  <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                  <p><span className="font-medium">Service:</span> {formData.serviceType}</p>
                  <p><span className="font-medium">Address:</span> {formData.address}</p>
                  <p><span className="font-medium">Date:</span> {formData.date.toLocaleDateString()}</p>
                  <p><span className="font-medium">Time:</span> {formData.time || 'Flexible'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 text-gray-700">
                Back
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={nextStep} className="flex-1 px-6 py-3 text-white rounded-lg font-semibold" style={{ backgroundColor: primaryColor }}>
                Next
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-3 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-70" style={{ backgroundColor: primaryColor }}>
                {isSubmitting ? <><FaSpinner className="animate-spin" /> Submitting...</> : 'Submit Request'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SiteTemplate({ 
  siteData,
  isPreview = false,
  showTimer = false,
  timeLeft = 0,
  onCheckout = null,
  checkoutLoading = false
}) {
  const [currentPage, setCurrentPage] = useState('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Extract data - support both field naming conventions
  const {
    businessName = 'Your Business',
    industry = 'Home Services',
    email = '',
    phone = '',
    city = 'Your City',
    state = 'ST',
    tagline = '',
    primaryColor = '#3B82F6',
    // Support both logoPreview (from preview) and logoUrl (from DB)
    logoPreview = null,
    logoUrl = null,
    logo_url = null,
    logoBackgroundColor = null,
    logo_background_color = null,
    serviceRadius = '25',
    service_radius = '25',
    heroImage = null,
    hero_image_url = null,
    galleryImages = [],
    gallery_images = [],
    googleRating = 5.0,
    google_rating = 5.0,
    googleReviewCount = 47,
    google_review_count = 47,
    googleBusinessUrl = null,
    google_business_url = null,
    facebookUrl = null,
    facebook_url = null,
    instagramUrl = null,
    instagram_url = null,
    yelpUrl = null,
    yelp_url = null,
  } = siteData || {}

  // Resolve field values (prefer camelCase, fallback to snake_case)
  const logo = logoPreview || logoUrl || logo_url
  const logoBgColor = logoBackgroundColor || logo_background_color
  const radius = serviceRadius || service_radius
  const heroImg = heroImage || hero_image_url
  const gallery = galleryImages?.length > 0 ? galleryImages : (gallery_images || [])
  const gRating = googleRating || google_rating || 5.0
  const gReviewCount = googleReviewCount || google_review_count || 47
  const gBusinessUrl = googleBusinessUrl || google_business_url
  const fbUrl = facebookUrl || facebook_url
  const igUrl = instagramUrl || instagram_url
  const ypUrl = yelpUrl || yelp_url

  const isDarkBackground = (color) => {
    if (!color) return true // Default to dark
    try {
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      return (r * 299 + g * 587 + b * 114) / 1000 < 128
    } catch { return true }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const phoneClean = phone?.replace(/\D/g, '') || ''
  const navBgColor = logoBgColor || '#1f2937'
  const isDarkNav = isDarkBackground(navBgColor)
  const navTextColor = isDarkNav ? '#ffffff' : '#1f2937'
  const navLinkColor = isDarkNav ? 'rgba(255,255,255,0.85)' : '#4b5563'
  
  const IndustryIcon = industryIcons[industry] || FaThumbsUp
  const services = industryServices[industry] || industryServices['default']
  const heroText = industryHeroText[industry] || industryHeroText['default']

  const navigateTo = (page) => {
    setCurrentPage(page)
    setMobileMenuOpen(false)
    window.scrollTo(0, 0)
  }

  // ============================================
  // NAVIGATION
  // ============================================
  const Navigation = () => (
    <nav className={`fixed ${isPreview && showTimer ? 'top-10' : 'top-0'} left-0 right-0 z-30 shadow-lg`} style={{ backgroundColor: navBgColor }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex justify-between items-center py-4 md:py-5">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt="Logo" className="h-16 md:h-[70px] w-auto object-contain" />
            ) : (
              <div className="w-16 h-16 md:w-[70px] md:h-[70px] rounded-lg flex items-center justify-center text-white font-bold text-2xl" style={{ backgroundColor: primaryColor }}>
                {businessName?.[0]?.toUpperCase() || 'B'}
              </div>
            )}
            <span className="text-xl md:text-2xl font-bold hidden sm:block" style={{ color: navTextColor }}>
              {businessName}
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-6">
            {['home', 'services', 'gallery', 'about', 'reviews', 'blog', 'contact'].map(id => (
              <button key={id} onClick={() => navigateTo(id)} className="text-lg font-medium capitalize transition-colors hover:opacity-80" style={{ color: currentPage === id ? primaryColor : navLinkColor }}>
                {id}
              </button>
            ))}
            <button onClick={() => setShowBookingModal(true)} className="px-6 py-3 text-white rounded-lg font-semibold text-lg" style={{ backgroundColor: primaryColor }}>
              Free Quote
            </button>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-3 -mr-2" style={{ color: navTextColor }}>
            {mobileMenuOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden pb-6">
              {['home', 'services', 'gallery', 'about', 'reviews', 'blog', 'contact'].map(id => (
                <button key={id} onClick={() => navigateTo(id)} className="block w-full text-left py-3 text-lg font-medium border-b border-gray-700 capitalize" style={{ color: navLinkColor }}>
                  {id}
                </button>
              ))}
              <button onClick={() => { setMobileMenuOpen(false); setShowBookingModal(true); }} className="flex items-center justify-center gap-2 w-full mt-6 px-6 py-4 text-white rounded-lg font-semibold text-lg" style={{ backgroundColor: primaryColor }}>
                <FaCalendarAlt /> Get Free Estimate
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )

  // ============================================
  // FOOTER
  // ============================================
  const Footer = () => (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            {logo ? (
              <img src={logo} alt="Logo" className="h-16 w-auto object-contain mb-4" />
            ) : (
              <div className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4" style={{ backgroundColor: primaryColor }}>
                {businessName?.[0]?.toUpperCase() || 'B'}
              </div>
            )}
            <h3 className="text-xl font-bold mb-2">{businessName}</h3>
            <p className="text-gray-400 text-sm">Professional {industry?.toLowerCase()} serving {city} and surrounding areas.</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {['Home', 'Services', 'Gallery', 'About', 'Reviews', 'Contact'].map(link => (
                <li key={link}><button onClick={() => navigateTo(link.toLowerCase())} className="text-gray-400 hover:text-white">{link}</button></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Service Areas</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>{city}, {state}</li>
              <li>& Surrounding Areas</li>
              <li>{radius} Mile Radius</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li><a href={`tel:${phoneClean}`} className="flex items-center gap-2 text-gray-400 hover:text-white"><FaPhone style={{ color: primaryColor }} /> {phone}</a></li>
              <li><a href={`mailto:${email}`} className="flex items-center gap-2 text-gray-400 hover:text-white"><FaEnvelope style={{ color: primaryColor }} /> {email}</a></li>
              <li className="flex items-center gap-2 text-gray-400"><FaMapMarkerAlt style={{ color: primaryColor }} /> {city}, {state}</li>
            </ul>
            <div className="flex gap-4 mt-4">
              {fbUrl && <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-xl"><FaFacebook /></a>}
              {igUrl && <a href={igUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-xl"><FaInstagram /></a>}
              {ypUrl && <a href={ypUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-xl"><FaYelp /></a>}
              {!fbUrl && !igUrl && !ypUrl && (
                <><span className="text-gray-600 text-xl"><FaFacebook /></span><span className="text-gray-600 text-xl"><FaInstagram /></span><span className="text-gray-600 text-xl"><FaYelp /></span></>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
          <p className="text-gray-500 text-sm">Powered by <span className="text-white font-medium">Rocket Solutions</span></p>
        </div>
      </div>
    </footer>
  )

  // ============================================
  // STAR COMPONENT - Always gold
  // ============================================
  const Stars = ({ count = 5, size = 'text-base' }) => (
    <div className={`flex ${size}`}>
      {[...Array(count)].map((_, i) => (
        <FaStar key={i} style={{ color: STAR_COLOR }} />
      ))}
    </div>
  )

  // ============================================
  // HOME PAGE
  // ============================================
  const HomePage = () => (
    <>
      {/* Hero */}
      <section className={`relative text-white overflow-hidden min-h-[580px] md:min-h-[650px] ${isPreview && showTimer ? 'pt-24' : 'pt-20'}`}>
        {heroImg ? (
          <><div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImg})` }} /><div className="absolute inset-0 bg-black/60" /></>
        ) : (
          <><div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" /><div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle, ${primaryColor} 1px, transparent 1px)`, backgroundSize: '50px 50px' }} /></>
        )}

        <div className="relative z-10 px-5 md:px-8 py-14 md:py-24 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-5 leading-tight">
                {heroText.headline} in <span style={{ color: primaryColor }}>{city}</span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-6">{tagline || heroText.subtext}</p>

              <div className="space-y-3 mb-6">
                {['Licensed & Insured Professionals', 'Same-Day Service Available', '100% Satisfaction Guaranteed'].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <FaCheckCircle className="text-xl flex-shrink-0" style={{ color: primaryColor }} />
                    <span className="text-base md:text-lg">{f}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => setShowBookingModal(true)} className="px-8 py-4 text-white rounded-lg font-semibold text-lg md:text-xl" style={{ backgroundColor: primaryColor }}>
                  Get Free Estimate
                </button>
                <a href={`tel:${phoneClean}`} className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold text-lg flex items-center justify-center gap-2">
                  <FaPhone /> Call {phone}
                </a>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 text-center text-gray-800">
                  <FaTruck className="text-5xl lg:text-6xl mx-auto mb-4" style={{ color: primaryColor }} />
                  <h3 className="text-lg lg:text-xl font-bold mb-2">Fast Service</h3>
                  <p className="text-gray-600 text-sm">Same-day available</p>
                </div>
                <div className="bg-white rounded-xl p-6 text-center text-gray-800">
                  <FaRecycle className="text-5xl lg:text-6xl mx-auto mb-4" style={{ color: primaryColor }} />
                  <h3 className="text-lg lg:text-xl font-bold mb-2">Eco-Friendly</h3>
                  <p className="text-gray-600 text-sm">Responsible practices</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none"><path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H0Z" fill="white"/></svg>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 md:py-20 px-5 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">From single items to complete property cleanouts, we handle it all.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service, i) => (
              <div key={i} className="bg-white rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-2">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${primaryColor}15` }}>
                  <IndustryIcon className="text-2xl" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.desc}</p>
                {service.features && (
                  <ul className="space-y-1">
                    {service.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                        <span style={{ color: primaryColor }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button onClick={() => navigateTo('services')} className="inline-flex items-center gap-2 font-semibold text-lg" style={{ color: primaryColor }}>
              View All Services <FaArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-20 px-5 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">Why Choose {businessName}?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">We're not just another {industry?.toLowerCase()} company.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industryWhyChoose.map((reason, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
                <reason.icon className="text-4xl mb-4" style={{ color: primaryColor }} />
                <h3 className="text-xl font-bold mb-3 text-gray-800">{reason.title}</h3>
                <p className="text-gray-600">{reason.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[{ value: '500+', label: 'Jobs Completed' }, { value: '5★', label: 'Average Rating' }, { value: '24hr', label: 'Response Time' }, { value: '100%', label: 'Satisfaction' }].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl font-bold mb-2" style={{ color: primaryColor }}>{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview - Only show help notes in preview */}
      {(gallery.length > 0 || isPreview) && (
        <section className="py-16 md:py-20 px-5 md:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">Our Work</h2>
              <p className="text-xl text-gray-600">See the transformations we've made</p>
            </div>
            {gallery.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.slice(0, 8).map((img, i) => (
                  <div key={i} onClick={() => { setLightboxImage(img); setLightboxIndex(i); }} className="relative aspect-square cursor-pointer group overflow-hidden rounded-xl">
                    <img src={typeof img === 'string' ? img : img.url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 font-semibold">View</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : isPreview && (
              /* Help note - ONLY in preview mode */
              <div className="text-center p-8 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                <FaCamera className="text-4xl mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-600 mb-2">Gallery Photos</h3>
                <p className="text-gray-500 text-sm">Upload photos from your dashboard after launch</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Service Areas */}
      <section className="py-16 md:py-20 px-5 md:px-8 text-white" style={{ backgroundColor: '#1f2937' }}>
        <div className="max-w-7xl mx-auto text-center">
          <FaMapMarkerAlt className="text-5xl md:text-6xl mx-auto mb-6" style={{ color: primaryColor }} />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Serving {city} & Beyond</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Proudly providing {industry?.toLowerCase()} services throughout {city}, {state} and within a {radius} mile radius.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setShowBookingModal(true)} className="px-8 py-4 rounded-lg font-semibold text-lg text-white" style={{ backgroundColor: primaryColor }}>
              Get a Quote
            </button>
            <a href={`tel:${phoneClean}`} className="px-8 py-4 border-2 border-white rounded-lg font-semibold text-lg flex items-center justify-center gap-2 text-white hover:bg-white/10">
              <FaPhone /> Call Now
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials - GOLD STARS */}
      <section className="py-16 md:py-20 px-5 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">Don't just take our word for it.</p>
            
            {/* Google Badge - GOLD STARS */}
            {gBusinessUrl ? (
              <a href={gBusinessUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-6 py-3 hover:shadow-lg transition-shadow">
                <FaGoogle className="text-xl text-blue-600" />
                <Stars count={5} />
                <span className="font-bold text-gray-800">{gRating}</span>
                <span className="text-gray-600">({gReviewCount}+ reviews)</span>
                <FaExternalLinkAlt className="text-gray-400 text-sm" />
              </a>
            ) : (
              <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-6 py-3">
                <FaGoogle className="text-xl text-blue-600" />
                <Stars count={5} />
                <span className="font-bold text-gray-800">{gRating}</span>
                <span className="text-gray-600">({gReviewCount}+ reviews)</span>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {sampleReviews.slice(0, 3).map((review, i) => (
              <div key={i} className="bg-white rounded-xl p-6 relative">
                <FaQuoteLeft className="text-4xl absolute top-4 left-4 opacity-10" style={{ color: primaryColor }} />
                <div className="mb-4"><Stars count={5} /></div>
                <p className="text-gray-700 mb-4 italic relative z-10">"{review.text}"</p>
                <div className="border-t pt-4">
                  <p className="font-bold text-gray-800">{review.name}</p>
                  <p className="text-sm text-gray-500">{city}, {state}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Help note - ONLY in preview mode */}
          {isPreview && (
            <div className="text-center mt-8 p-6 bg-white rounded-2xl border-2 border-dashed border-gray-300">
              <FaStar className="text-3xl mx-auto mb-3" style={{ color: STAR_COLOR }} />
              <h3 className="text-lg font-bold text-gray-600 mb-1">Reviews Sync from Google</h3>
              <p className="text-gray-500 text-sm">Connect your Google Business Profile to display real reviews</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA - WHITE TEXT on brand color */}
      <section className="py-16 md:py-20 px-5 md:px-8" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-white/90">Get a free estimate today. No obligation, no hassle.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setShowBookingModal(true)} className="px-8 py-4 bg-white rounded-lg font-semibold text-lg hover:bg-gray-100" style={{ color: primaryColor }}>
              Get Free Estimate
            </button>
            <a href={`tel:${phoneClean}`} className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold text-lg flex items-center justify-center gap-2">
              <FaPhone /> {phone}
            </a>
          </div>
          <p className="mt-8 text-lg text-white/90">Available 7 days a week • Same-day service • Licensed & Insured</p>
        </div>
      </section>
    </>
  )

  // ============================================
  // SERVICES PAGE
  // ============================================
  const ServicesPage = () => (
    <>
      <section className={`${isPreview && showTimer ? 'pt-32' : 'pt-28'} pb-12 px-5 md:px-8 bg-gradient-to-b from-gray-50 to-white`}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Professional {industry?.toLowerCase()} services in {city}, {state}</p>
        </div>
      </section>

      <section className="py-16 px-5 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 md:p-8 hover:shadow-xl transition-all border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                    <IndustryIcon className="text-2xl" style={{ color: primaryColor }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.desc}</p>
                    {service.features && (
                      <ul className="space-y-1 mb-4">
                        {service.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-gray-600"><span style={{ color: primaryColor }}>✓</span> {f}</li>
                        ))}
                      </ul>
                    )}
                    <button onClick={() => setShowBookingModal(true)} className="font-semibold flex items-center gap-2" style={{ color: primaryColor }}>
                      Get a Quote <FaChevronRight className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - WHITE TEXT */}
      <section className="py-16 px-5 md:px-8" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Need a Custom Solution?</h2>
          <p className="text-lg mb-6 text-white/90">Contact us to discuss your specific needs.</p>
          <button onClick={() => setShowBookingModal(true)} className="px-8 py-4 bg-white rounded-lg font-semibold text-lg hover:bg-gray-100" style={{ color: primaryColor }}>
            Contact Us
          </button>
        </div>
      </section>
    </>
  )

  // ============================================
  // GALLERY PAGE
  // ============================================
  const GalleryPage = () => (
    <>
      <section className={`${isPreview && showTimer ? 'pt-32' : 'pt-28'} pb-12 px-5 md:px-8 bg-gradient-to-b from-gray-50 to-white`}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Our Work</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Browse our recent projects</p>
        </div>
      </section>

      <section className="py-16 px-5 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {gallery.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {gallery.map((img, i) => (
                <div key={i} onClick={() => { setLightboxImage(img); setLightboxIndex(i); }} className="relative aspect-square cursor-pointer group overflow-hidden rounded-xl">
                  <img src={typeof img === 'string' ? img : img.url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 font-semibold">View</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Placeholder grid - always show */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-xl flex flex-col items-center justify-center">
                    <FaCamera className="text-4xl text-gray-300 mb-3" />
                  </div>
                ))}
              </div>
              {/* Help note - ONLY in preview */}
              {isPreview && (
                <div className="text-center mt-12 p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                  <FaCamera className="text-4xl mx-auto mb-4" style={{ color: primaryColor }} />
                  <h3 className="text-xl font-bold text-gray-600 mb-2">Upload Your Work</h3>
                  <p className="text-gray-500 max-w-md mx-auto">Upload before & after photos from your dashboard to showcase your best work</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )

  // ============================================
  // ABOUT PAGE
  // ============================================
  const AboutPage = () => (
    <>
      <section className={`${isPreview && showTimer ? 'pt-32' : 'pt-28'} pb-12 px-5 md:px-8 bg-gradient-to-b from-gray-50 to-white`}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">About {businessName}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Our story, mission, and commitment to excellence</p>
        </div>
      </section>

      <section className="py-16 px-5 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Story</h2>
            <p className="text-gray-600 mb-4">
              {businessName} was founded with a simple mission: to provide exceptional {industry?.toLowerCase()} services to the {city} community.
            </p>
            <p className="text-gray-600">
              We believe in honest work, fair prices, and treating every customer's home like our own.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-600">To deliver professional, reliable {industry?.toLowerCase()} services that exceed expectations.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Our Values</h3>
              <ul className="space-y-2 text-gray-600">
                {['Integrity in every job', 'Customer-first approach', 'Quality workmanship', 'Community commitment'].map((v, i) => (
                  <li key={i} className="flex items-center gap-2"><FaCheckCircle style={{ color: primaryColor }} /> {v}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center">
            <button onClick={() => setShowBookingModal(true)} className="px-8 py-4 text-white rounded-lg font-semibold text-lg" style={{ backgroundColor: primaryColor }}>
              Get in Touch
            </button>
          </div>
        </div>
      </section>
    </>
  )

  // ============================================
  // REVIEWS PAGE - GOLD STARS
  // ============================================
  const ReviewsPage = () => (
    <>
      <section className={`${isPreview && showTimer ? 'pt-32' : 'pt-28'} pb-12 px-5 md:px-8 bg-gradient-to-b from-gray-50 to-white`}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Customer Reviews</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">See what our customers say</p>
          <div className="flex items-center justify-center gap-2">
            <Stars count={5} size="text-2xl" />
            <span className="text-xl font-bold text-gray-800 ml-2">{gRating}</span>
            <span className="text-gray-500">Based on {gReviewCount} reviews</span>
          </div>
        </div>
      </section>

      <section className="py-16 px-5 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {sampleReviews.map((review, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 md:p-8">
                <div className="mb-4"><Stars count={5} /></div>
                <FaQuoteLeft className="text-2xl text-gray-200 mb-3" />
                <p className="text-gray-700 text-lg mb-4">"{review.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800">{review.name}</p>
                    <p className="text-sm text-gray-500">{city}, {state}</p>
                  </div>
                  <span className="text-sm text-gray-400">{review.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Help note - ONLY in preview */}
          {isPreview && (
            <div className="text-center mt-12 p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
              <FaStar className="text-4xl mx-auto mb-4" style={{ color: STAR_COLOR }} />
              <h3 className="text-xl font-bold text-gray-600 mb-2">Reviews Sync from Google</h3>
              <p className="text-gray-500 max-w-md mx-auto">Connect your Google Business Profile to display real reviews</p>
            </div>
          )}
        </div>
      </section>
    </>
  )

  // ============================================
  // BLOG PAGE
  // ============================================
  const BlogPage = () => (
    <>
      <section className={`${isPreview && showTimer ? 'pt-32' : 'pt-28'} pb-12 px-5 md:px-8 bg-gradient-to-b from-gray-50 to-white`}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Tips and insights from our {industry?.toLowerCase()} experts</p>
        </div>
      </section>

      <section className="py-16 px-5 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {sampleBlogPosts.map((post, i) => (
              <article key={i} className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-gray-200 flex items-center justify-center p-8">
                    <FaNewspaper className="text-5xl text-gray-300" />
                  </div>
                  <div className="md:w-2/3 p-6 md:p-8">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>{post.date}</span><span>•</span><span>{post.readTime}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h2>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <button className="font-semibold flex items-center gap-2" style={{ color: primaryColor }}>Read More <FaArrowRight className="text-sm" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Help note - ONLY in preview */}
          {isPreview && (
            <div className="text-center mt-12 p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
              <FaNewspaper className="text-4xl mx-auto mb-4" style={{ color: primaryColor }} />
              <h3 className="text-xl font-bold text-gray-600 mb-2">Create Blog Posts</h3>
              <p className="text-gray-500 max-w-md mx-auto">Write blog posts from your dashboard to boost SEO</p>
            </div>
          )}
        </div>
      </section>
    </>
  )

  // ============================================
  // CONTACT PAGE
  // ============================================
  const ContactPage = () => (
    <>
      <section className={`${isPreview && showTimer ? 'pt-32' : 'pt-28'} pb-12 px-5 md:px-8 bg-gradient-to-b from-gray-50 to-white`}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get in touch for a free quote</p>
        </div>
      </section>

      <section className="py-16 px-5 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white" />
                  <input type="text" placeholder="Last Name" className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white" />
                </div>
                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white" />
                <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white" />
                <select className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-600">
                  <option>Select a Service</option>
                  {services.slice(0, 6).map((s, i) => <option key={i}>{s.title}</option>)}
                </select>
                <textarea placeholder="Tell us about your project..." rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white resize-none" />
                <button className="w-full py-4 text-white rounded-lg font-semibold text-lg" style={{ backgroundColor: primaryColor }}>Send Message</button>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Get In Touch</h2>
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${primaryColor}15` }}><FaPhone style={{ color: primaryColor }} /></div>
                  <div><h3 className="font-bold text-gray-800">Phone</h3><a href={`tel:${phoneClean}`} className="text-gray-600 hover:underline">{phone}</a></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${primaryColor}15` }}><FaEnvelope style={{ color: primaryColor }} /></div>
                  <div><h3 className="font-bold text-gray-800">Email</h3><a href={`mailto:${email}`} className="text-gray-600 hover:underline">{email}</a></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${primaryColor}15` }}><FaMapMarkerAlt style={{ color: primaryColor }} /></div>
                  <div><h3 className="font-bold text-gray-800">Service Area</h3><p className="text-gray-600">{city}, {state} & surrounding areas ({radius} mi)</p></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-800 mb-4">Business Hours</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between"><span>Monday - Friday</span><span className="font-medium">8:00 AM - 6:00 PM</span></div>
                  <div className="flex justify-between"><span>Saturday</span><span className="font-medium">9:00 AM - 4:00 PM</span></div>
                  <div className="flex justify-between"><span>Sunday</span><span className="font-medium">Closed</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )

  // ============================================
  // LIGHTBOX
  // ============================================
  const Lightbox = () => {
    if (!lightboxImage) return null
    const images = gallery
    const currentImg = typeof lightboxImage === 'string' ? lightboxImage : lightboxImage.url

    const nextImage = () => { const i = (lightboxIndex + 1) % images.length; setLightboxIndex(i); setLightboxImage(images[i]) }
    const prevImage = () => { const i = (lightboxIndex - 1 + images.length) % images.length; setLightboxIndex(i); setLightboxImage(images[i]) }

    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
        <button onClick={(e) => { e.stopPropagation(); setLightboxImage(null) }} className="absolute top-4 right-4 text-white hover:text-gray-300"><FaTimes size={32} /></button>
        <button onClick={(e) => { e.stopPropagation(); prevImage() }} className="absolute left-4 text-white hover:text-gray-300"><FaChevronLeft size={32} /></button>
        <img src={currentImg} alt="Gallery" className="max-w-full max-h-[80vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        <button onClick={(e) => { e.stopPropagation(); nextImage() }} className="absolute right-4 text-white hover:text-gray-300"><FaChevronRight size={32} /></button>
        <div className="absolute bottom-4 text-white text-center"><p>{lightboxIndex + 1} / {images.length}</p></div>
      </div>
    )
  }

  // ============================================
  // RENDER
  // ============================================
  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />
      case 'services': return <ServicesPage />
      case 'gallery': return <GalleryPage />
      case 'about': return <AboutPage />
      case 'reviews': return <ReviewsPage />
      case 'blog': return <BlogPage />
      case 'contact': return <ContactPage />
      default: return <HomePage />
    }
  }

  return (
    <div className="relative bg-white">
      {/* Timer Banner - WHITE TEXT */}
      {isPreview && showTimer && (
        <div className="fixed top-0 left-0 right-0 z-40 py-2.5 px-4 text-center text-sm font-medium shadow-lg" style={{ backgroundColor: timeLeft <= 30 ? '#dc2626' : primaryColor }}>
          <div className="flex items-center justify-center gap-3 max-w-4xl mx-auto text-white">
            <FaClock className={timeLeft <= 30 ? 'animate-pulse' : ''} />
            <span className="hidden sm:inline">{timeLeft > 0 ? `Preview expires in ${formatTime(timeLeft)} — Your site is ready to launch!` : 'Preview expired!'}</span>
            <span className="sm:hidden">{timeLeft > 0 ? formatTime(timeLeft) : 'Expired'}</span>
            {timeLeft > 0 && onCheckout && (
              <button onClick={() => onCheckout()} disabled={checkoutLoading} className="px-4 py-1.5 bg-white rounded-lg font-semibold text-xs hover:bg-gray-100 disabled:opacity-50" style={{ color: primaryColor }}>
                {checkoutLoading ? 'Loading...' : 'Launch Now →'}
              </button>
            )}
          </div>
        </div>
      )}

      <Navigation />
      {renderPage()}
      <Footer />
      <Lightbox />

      {showBookingModal && (
        <BookingModal 
          onClose={() => setShowBookingModal(false)} 
          businessName={businessName} 
          phone={phone} 
          primaryColor={primaryColor} 
          services={services}
          city={city}
        />
      )}
    </div>
  )
}