'use client'
import Link from 'next/link'
import Image from 'next/image'
import { FaArrowRight } from 'react-icons/fa'
import { motion } from 'framer-motion'

export default function CTA() {
  return (
    <section className="section-padding bg-dark relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          <Image
            src="/logo.png"
            alt="Rocket Solutions"
            width={80}
            height={80}
            className="mx-auto mb-8"
          />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Your Next Customer is{' '}
            <span className="gradient-text">Searching Google Right Now</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Every day without a website is money left on the table. Get online today and start turning searches into booked jobs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding" className="btn-primary text-lg flex items-center justify-center gap-2">
              Get My Website
              <FaArrowRight />
            </Link>
            <a 
              href="#pricing" 
              className="btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              View Pricing
            </a>
          </div>

          <p className="text-gray-400 mt-6 text-sm">
            Takes 5 minutes to setup • Live within 24 hours • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  )
}