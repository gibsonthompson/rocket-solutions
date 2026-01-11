'use client'
import { useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  const faqs = [
    {
      question: 'How fast can I get my website live?',
      answer: 'Most websites are live within 24 hours. Simply complete the onboarding wizard with your business info, upload your logo and photos, and we handle the rest. You\'ll receive an email when your site is ready.',
    },
    {
      question: 'Do I need any technical skills?',
      answer: 'Absolutely not! Our platform is designed for busy business owners, not developers. If you can use a smartphone, you can manage your website. Upload photos, update services, and view bookings - all from an easy dashboard.',
    },
    {
      question: 'Can I use my own domain name?',
      answer: 'Yes! You can connect your existing domain or we\'ll help you get a new one. Pro and Agency plans include a free custom domain. We handle all the technical setup for you.',
    },
    {
      question: 'What if I need help or have questions?',
      answer: 'We\'re here for you. All plans include email support with responses within 24 hours. Pro plans get priority support, and Agency plans include a dedicated account manager.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, there are no long-term contracts. Cancel anytime from your dashboard. We\'ll even help you export your data if you decide to leave (though we hope you won\'t!).',
    },
    {
      question: 'Is the booking system really included?',
      answer: 'Yes! Every plan includes our full booking system. Customers can request appointments directly from your website, and you\'ll receive instant email notifications. No extra fees, no third-party tools needed.',
    },
    {
      question: 'Will my website show up on Google?',
      answer: 'Absolutely. All our websites are built with SEO best practices. Pro plans include dedicated city landing pages that help you rank for local searches like "junk removal in [your city]".',
    },
    {
      question: 'What industries do you support?',
      answer: 'We specialize in home service businesses: junk removal, landscaping, pressure washing, plumbing, electrical, HVAC, cleaning services, and more. If you serve customers at their location, we\'ve got you covered.',
    },
  ]

  return (
    <section id="faq" className="section-padding bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-primary font-semibold mb-4 block"
          >
            FAQ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-6"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600"
          >
            Everything you need to know about getting started
          </motion.p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="mb-4"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className={`w-full text-left p-6 rounded-xl transition-all duration-300 ${
                  openIndex === index
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100 text-dark'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg pr-4">{faq.question}</span>
                  <FaChevronDown
                    className={`flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 bg-gray-50 rounded-b-xl -mt-2 pt-6 text-gray-600">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}