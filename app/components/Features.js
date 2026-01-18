'use client'
import { FaMobile, FaCalendarAlt, FaSearch, FaImages, FaChartLine, FaClock } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useAgency } from '../../lib/AgencyContext'

export default function Features() {
  const { agency } = useAgency()
  
  const primaryColor = agency?.primary_color || '#fa8820'

  const features = [
    {
      icon: FaSearch,
      title: 'Get Found on Google',
      description: 'Show up when customers search "junk removal near me" or any service you offer. SEO built-in from day one.',
      color: 'bg-blue-500',
    },
    {
      icon: FaCalendarAlt,
      title: 'Bookings While You Sleep',
      description: 'Customers book appointments 24/7 directly from your site. Wake up to new jobs waiting in your inbox.',
      color: 'bg-green-500',
    },
    {
      icon: FaMobile,
      title: 'Run It From Your Phone',
      description: 'Check bookings, update your gallery, respond to leads — all from the job site. No laptop needed.',
      color: 'bg-purple-500',
    },
    {
      icon: FaImages,
      title: 'Show Off Your Work',
      description: 'Upload before/after photos that sell your next job for you. Your best work is your best marketing.',
      color: 'bg-orange-500',
    },
    {
      icon: FaChartLine,
      title: 'Know What\'s Working',
      description: 'See which pages get traffic, where leads come from, and which services are most requested.',
      color: 'bg-pink-500',
    },
    {
      icon: FaClock,
      title: 'Live in 24 Hours',
      description: 'No waiting weeks for a developer. Answer a few questions and your site is ready by tomorrow.',
      color: 'bg-cyan-500',
    },
  ]

  return (
    <section id="features" className="section-padding bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-semibold mb-4 block"
            style={{ color: primaryColor }}
          >
            WHAT YOU GET
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-6"
          >
            Everything You Need to{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{ 
                backgroundImage: `linear-gradient(to right, ${primaryColor}, ${primaryColor})`
              }}
            >
              Get More Jobs
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600"
          >
            Not just a website — a complete system to get found, get booked, and get paid.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
            >
              <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}