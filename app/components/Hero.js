'use client'
import Link from 'next/link'
import Image from 'next/image'
import { FaCheck, FaPlay, FaArrowRight, FaPhone, FaStar, FaCalendarCheck, FaGoogle } from 'react-icons/fa'
import { motion } from 'framer-motion'

export default function Hero() {
  const benefits = [
    'Get more calls from Google',
    'Let customers book 24/7',
    'Look professional online',
    'Manage everything from your phone',
  ]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Gradient - Dark to Blue */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="container-custom relative z-10 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              <span className="text-white/90 text-sm">Helping home service pros get found online</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Stop Losing Jobs to{' '}
              <span className="gradient-text">Competitors With Better Websites</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-lg">
              Your customers are searching Google right now. If they can't find you, they're calling someone else. Get a website that actually brings in jobs — set up in one day, not one month.
            </p>

            {/* Benefit List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="flex items-center text-white/90"
                >
                  <FaCheck className="text-green-400 mr-2 flex-shrink-0" />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/onboarding" className="btn-primary text-lg flex items-center justify-center gap-2">
                Get My Website
                <FaArrowRight />
              </Link>
              <a 
                href="#demo" 
                className="btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center justify-center gap-2"
              >
                <FaPlay className="text-sm" />
                See an Example
              </a>
            </div>

            {/* Social Proof */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full gradient-bg border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-white/80">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <p className="text-sm">"Finally a website that gets me calls"</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Website Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Browser Frame */}
              <div className="bg-gray-800 rounded-t-xl p-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 bg-gray-700 rounded-lg px-4 py-1 text-gray-400 text-sm flex items-center gap-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                  yourbusiness.com
                </div>
              </div>
              
              {/* Website Preview - More Detailed */}
              <div className="bg-white rounded-b-xl overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100">
                  {/* Mock website content */}
                  <div className="h-full flex flex-col">
                    {/* Nav */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg" />
                        <div className="w-20 h-3 bg-gray-800 rounded" />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-2 bg-gray-300 rounded" />
                        <div className="w-12 h-2 bg-gray-300 rounded" />
                        <div className="w-12 h-2 bg-gray-300 rounded" />
                        <div className="w-20 h-7 bg-primary rounded-lg" />
                      </div>
                    </div>
                    
                    {/* Hero section mock */}
                    <div className="flex-1 flex items-center px-6 py-4">
                      <div className="w-1/2 space-y-3">
                        <div className="w-3/4 h-5 bg-gray-800 rounded" />
                        <div className="w-full h-3 bg-gray-300 rounded" />
                        <div className="w-2/3 h-3 bg-gray-300 rounded" />
                        <div className="flex gap-2 mt-4">
                          <div className="w-24 h-8 bg-primary rounded-lg" />
                          <div className="w-20 h-8 bg-gray-200 rounded-lg" />
                        </div>
                        {/* Trust badges */}
                        <div className="flex gap-3 mt-4">
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                            <div className="w-8 h-2 bg-gray-300 rounded" />
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-green-400 rounded-full" />
                            <div className="w-10 h-2 bg-gray-300 rounded" />
                          </div>
                        </div>
                      </div>
                      <div className="w-1/2 pl-4">
                        <div className="w-full h-28 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                          <div className="w-16 h-16 bg-primary/30 rounded-lg" />
                        </div>
                      </div>
                    </div>

                    {/* Services section mock */}
                    <div className="px-6 py-3 border-t border-gray-100">
                      <div className="flex gap-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex-1 bg-gray-50 rounded-lg p-3">
                            <div className="w-6 h-6 bg-primary/20 rounded mb-2" />
                            <div className="w-full h-2 bg-gray-200 rounded mb-1" />
                            <div className="w-2/3 h-2 bg-gray-200 rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Widget - New Booking */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -right-4 top-16 bg-white rounded-xl shadow-xl p-4 animate-float"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FaCalendarCheck className="text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">New Booking!</p>
                    <p className="text-xs text-gray-500">Junk removal • $350</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Widget - Calls */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -left-4 top-1/3 bg-white rounded-xl shadow-xl p-4 animate-float"
                style={{ animationDelay: '0.5s' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaPhone className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">+12</p>
                    <p className="text-xs text-gray-500">Calls this week</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Widget - Google Reviews */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute -right-2 bottom-20 bg-white rounded-xl shadow-xl p-4 animate-float"
                style={{ animationDelay: '1s' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                    <FaGoogle className="text-red-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <FaStar key={i} className="text-yellow-400 text-xs" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">47 Google Reviews</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Widget - Page Views */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="absolute -left-2 bottom-24 bg-white rounded-xl shadow-xl p-3 animate-float"
                style={{ animationDelay: '1.5s' }}
              >
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">2.4k</p>
                  <p className="text-xs text-gray-500">Monthly visitors</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}