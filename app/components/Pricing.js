'use client'
import Link from 'next/link'
import { FaCheck, FaStar } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useAgency } from '../../lib/AgencyContext'

export default function Pricing() {
  const { agency } = useAgency()

  const primaryColor = agency?.primary_color || '#fa8820'

  // Convert cents to dollars for display
  const starterPrice = agency?.price_starter ? Math.round(agency.price_starter / 100) : 49
  const proPrice = agency?.price_pro ? Math.round(agency.price_pro / 100) : 97
  const growthPrice = agency?.price_growth ? Math.round(agency.price_growth / 100) : 199

  const plans = [
    {
      name: 'Starter',
      price: starterPrice,
      description: 'Everything you need to get online',
      features: [
        'Professional website',
        'Mobile-optimized design',
        'Online booking system',
        'Photo gallery',
        'Contact form',
        'Email notifications',
        'Basic SEO setup',
      ],
      notIncluded: [
        'SMS notifications',
        'City landing pages',
        'Blog for SEO',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: proPrice,
      description: 'Grow your business faster',
      features: [
        'Everything in Starter',
        'SMS text notifications',
        'City SEO pages (up to 10)',
        'Blog for content marketing',
        'Google review badge',
        'Appointment reminders',
        'Priority support',
      ],
      notIncluded: [],
      cta: 'Get Started',
      popular: true,
    },
    {
      name: 'Growth',
      price: growthPrice,
      description: 'Maximum visibility & automation',
      features: [
        'Everything in Pro',
        'Unlimited city pages',
        'AI receptionist (coming soon)',
        'Review request automation',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated support',
      ],
      notIncluded: [],
      cta: 'Get Started',
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="section-padding bg-gray-50">
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
            PRICING
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-6"
          >
            Pick Your Plan, Start Today
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600"
          >
            Start with what you need. Upgrade anytime as you grow.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-dark text-white shadow-2xl scale-105'
                  : 'bg-white shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span 
                    className="text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <FaStar className="text-yellow-300" /> Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-dark'}`}>
                  {plan.name}
                </h3>
                <p className={plan.popular ? 'text-gray-300' : 'text-gray-500'}>
                  {plan.description}
                </p>
                <div className="mt-4">
                  <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-dark'}`}>
                    ${plan.price}
                  </span>
                  <span className={plan.popular ? 'text-gray-300' : 'text-gray-500'}>/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <FaCheck className={`mt-1 flex-shrink-0 ${plan.popular ? 'text-green-400' : 'text-green-500'}`} />
                    <span className={plan.popular ? 'text-gray-200' : 'text-gray-600'}>{feature}</span>
                  </li>
                ))}
                {plan.notIncluded.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 opacity-50">
                    <span className="mt-1 flex-shrink-0">—</span>
                    <span className={plan.popular ? 'text-gray-400' : 'text-gray-400'}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/onboarding"
                className={`block text-center py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-white text-dark hover:bg-gray-100'
                    : 'text-white hover:opacity-90'
                }`}
                style={!plan.popular ? { backgroundColor: primaryColor } : {}}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Guarantee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-500">
            ✓ No setup fees &nbsp;&nbsp; ✓ No contracts &nbsp;&nbsp; ✓ Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  )
}