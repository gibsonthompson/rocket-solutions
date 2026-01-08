'use client'

import { useState } from 'react'
import { FaRocket, FaMobileAlt, FaPaintBrush, FaChartLine, FaCheckCircle } from 'react-icons/fa'

export default function Home() {
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    email: '',
    industry: '',
    smsConsent: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      setSubmitStatus('success')
      setFormData({
        fullName: '',
        businessName: '',
        phone: '',
        email: '',
        industry: '',
        smsConsent: false,
      })
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative">
      {/* Hero Section with Background */}
      <section 
        className="relative py-20 md:py-32 overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(rgba(195, 28, 54, 0.9), rgba(246, 68, 40, 0.85)), url("https://i.imgur.com/f7T6wX3.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'multiply',
        }}
      >
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center justify-center p-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <FaRocket className="text-3xl" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Your Business Deserves a <span className="text-rocket-light">Professional Website</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/95">
              Custom websites built for home service businesses. Edit everything yourself with our easy-to-use app. No coding required.
            </p>
            <a 
              href="#get-started" 
              className="inline-block bg-white text-rocket-red px-8 py-4 rounded-lg font-bold text-lg hover:bg-rocket-light hover:text-rocket-orange transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Get Your Website Built Today
            </a>
          </div>
        </div>

        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-rocket-light">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Everything You Need to Succeed Online
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built specifically for home service businesses like yours
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaPaintBrush className="text-3xl text-rocket-red" />,
                title: 'Custom Design',
                description: 'Get a unique website designed specifically for your business and industry',
              },
              {
                icon: <FaMobileAlt className="text-3xl text-rocket-orange" />,
                title: 'Easy Self-Editing',
                description: 'Update your website anytime with our simple mobile app. No technical skills needed',
              },
              {
                icon: <FaChartLine className="text-3xl text-rocket-red" />,
                title: 'Customer Communication',
                description: 'Stay connected with your customers through built-in contact forms and communication tools',
              },
              {
                icon: <FaCheckCircle className="text-3xl text-rocket-orange" />,
                title: 'Fully Optimized',
                description: 'Fast loading, mobile-responsive, and search engine optimized out of the box',
              },
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border-t-4 border-rocket-red"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get online in three simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  title: 'Fill Out the Form',
                  description: 'Tell us about your business and what you need',
                },
                {
                  step: '2',
                  title: 'We Build Your Site',
                  description: 'Our team creates a custom website for your business',
                },
                {
                  step: '3',
                  title: 'Edit Anytime',
                  description: 'Use our app to update your website whenever you want',
                },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rocket-red to-rocket-orange text-white rounded-full text-2xl font-bold mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sign Up Form Section */}
      <section id="get-started" className="py-20 bg-gradient-to-br from-rocket-light to-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">
                Get Started Today
              </h2>
              <p className="text-xl text-gray-600">
                Fill out the form below and we'll get your website built
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
              {submitStatus === 'success' ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-6">
                    <FaCheckCircle className="text-4xl" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Thank You!</h3>
                  <p className="text-gray-600 mb-6">
                    We've received your information and will be in touch shortly to get started on your website.
                  </p>
                  <button
                    onClick={() => setSubmitStatus('idle')}
                    className="text-rocket-red hover:text-rocket-orange font-semibold"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="fullName" className="label-text">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      required
                      className="input-field"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label htmlFor="businessName" className="label-text">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      id="businessName"
                      required
                      className="input-field"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="Smith's Plumbing Services"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="label-text">
                      Phone Number (Optional - for SMS updates)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="input-field"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="label-text">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      className="input-field"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@smithplumbing.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="industry" className="label-text">
                      What type of business? *
                    </label>
                    <select
                      id="industry"
                      required
                      className="input-field"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    >
                      <option value="">Select your industry</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="hvac">HVAC</option>
                      <option value="electrical">Electrical</option>
                      <option value="landscaping">Landscaping</option>
                      <option value="roofing">Roofing</option>
                      <option value="painting">Painting</option>
                      <option value="cleaning">Cleaning Services</option>
                      <option value="pest-control">Pest Control</option>
                      <option value="handyman">Handyman Services</option>
                      <option value="other">Other Home Services</option>
                    </select>
                  </div>

                  {/* SMS Consent - Optional */}
                  <div className="bg-red-50 border-2 border-rocket-red rounded-lg p-6">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="smsConsent"
                        checked={formData.smsConsent}
                        onChange={(e) => setFormData({ ...formData, smsConsent: e.target.checked })}
                        className="mt-1 h-5 w-5 text-rocket-red focus:ring-rocket-orange border-gray-300 rounded"
                      />
                      <label htmlFor="smsConsent" className="ml-3 text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">SMS Updates (Optional)</span>
                        <p className="mt-2">
                          By checking this box and providing your phone number, you consent to receive automated text messages from Rocket Solutions LLC at the phone number provided. These messages may include account updates, transactional notifications, and important information about your website and services.
                        </p>
                        <p className="mt-2">
                          Message frequency varies. Message and data rates may apply. You can reply STOP at any time to opt-out of receiving messages. Reply HELP for assistance.
                        </p>
                        <p className="mt-2">
                          Your consent is not a condition of purchase. By providing your phone number and checking this box, you agree to our <a href="/terms" className="text-rocket-red hover:underline font-semibold" target="_blank">Terms of Service</a> and <a href="/privacy" className="text-rocket-red hover:underline font-semibold" target="_blank">Privacy Policy</a>.
                        </p>
                      </label>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Get My Website Built'}
                  </button>

                  <p className="text-sm text-gray-500 text-center">
                    By submitting this form, you agree to our <a href="/terms" className="text-rocket-red hover:underline font-semibold">Terms of Service</a> and <a href="/privacy" className="text-rocket-red hover:underline font-semibold">Privacy Policy</a>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}