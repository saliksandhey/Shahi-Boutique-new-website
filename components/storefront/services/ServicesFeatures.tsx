'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const features = [
  "Perfect Fitting",
  "Experienced Tailors",
  "Premium Handwork",
  "High Quality Finishing",
  "Timely Delivery",
  "Affordable Pricing",
  "Custom Designs",
  "Personalized Service"
]

export function ServicesFeatures() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  })

  return (
    <section ref={containerRef} className="py-32 bg-[#FDF4EB] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16 md:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl font-bold tracking-widest text-[#FF7A00] uppercase mb-4"
          >
            The Shahi Standard
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase max-w-3xl mx-auto leading-[0.9]"
          >
            We don't just stitch clothes, we craft masterpieces.
          </motion.p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 md:gap-y-8 max-w-5xl mx-auto">
          {features.map((feature, i) => {
            // Calculate a staggered highlight effect based on scroll position
            const start = i / features.length
            const end = start + (1 / features.length)
            
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const opacity = useTransform(scrollYProgress, [start - 0.2, start, end, end + 0.2], [0.2, 1, 1, 0.2])
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const color = useTransform(scrollYProgress, [start - 0.1, start, end, end + 0.1], ["#9CA3AF", "#111111", "#111111", "#9CA3AF"])
            
            return (
              <motion.span
                key={i}
                style={{ opacity, color }}
                className="text-4xl md:text-7xl lg:text-[5.5rem] font-black uppercase tracking-tighter transition-colors duration-200"
              >
                {feature}
                {i !== features.length - 1 && <span className="text-[#FF7A00] mx-4 md:mx-8">/</span>}
              </motion.span>
            )
          })}
        </div>

      </div>
    </section>
  )
}
