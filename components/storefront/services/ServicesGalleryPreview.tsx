'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const categories = [
  { name: 'Punjabi Suits', bg: 'bg-[#F0E6DD]' },
  { name: 'Bridal Collection', bg: 'bg-[#FF7A00]/10' },
  { name: 'Neck Designs', bg: 'bg-stone-100' },
  { name: 'Sleeve Designs', bg: 'bg-gray-100' },
  { name: 'Party Wear', bg: 'bg-[#FDF4EB]' },
  { name: 'Daily Wear', bg: 'bg-gray-50' },
]

export function ServicesGalleryPreview() {
  const containerRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  // Different parallax speeds for Awwwards-style staggered scrolling
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"])
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"])
  const y3 = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"])

  const getParallaxValue = (index: number) => {
    if (index % 3 === 0) return y1
    if (index % 3 === 1) return y2
    return y3
  }

  return (
    <section ref={containerRef} className="py-24 md:py-32 bg-white overflow-hidden relative">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-3xl">
            <motion.h2 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-sans font-black text-gray-900 mb-6 tracking-tighter uppercase leading-[0.9]"
            >
              Design <br/>
              <span className="text-[#FF7A00] italic">Inspiration</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-gray-500 text-lg md:text-xl font-medium max-w-lg"
            >
              Explore our curated gallery of exquisite designs, patterns, and premium handwork.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/gallery"
              className="group hidden md:inline-flex items-center justify-center w-32 h-32 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#FF7A00] hover:scale-110 transition-all duration-500 shadow-xl"
            >
              <div className="flex flex-col items-center">
                Explore
                <ArrowRight className="mt-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Asymmetrical Parallax Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
          {categories.map((category, i) => (
            <motion.div 
              key={category.name}
              style={{ y: getParallaxValue(i) }}
              className={`relative rounded-[2rem] overflow-hidden group cursor-pointer ${category.bg} ${
                i === 1 ? 'md:mt-24 lg:mt-32' : i === 2 ? 'lg:mt-16' : ''
              } ${
                i === 0 || i === 3 ? 'aspect-[4/5]' : i === 4 ? 'aspect-square' : 'aspect-[3/4]'
              }`}
            >
              {/* Premium Inner Shadow */}
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[2rem] z-20 pointer-events-none" />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 z-10" />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center z-20">
                <div className="overflow-hidden">
                  <span className="block text-[#111111] font-black uppercase tracking-tighter text-3xl md:text-4xl group-hover:text-white transition-colors duration-500 transform translate-y-full group-hover:translate-y-0 ease-[cubic-bezier(0.21,0.47,0.32,0.98)] duration-700">
                    {category.name}
                  </span>
                </div>
              </div>
              
              {/* Default state text (hides on hover) */}
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center z-10 group-hover:opacity-0 transition-opacity duration-300">
                <span className="text-[#111111]/30 font-black uppercase tracking-tighter text-xl">
                  {category.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Button */}
        <div className="mt-16 text-center md:hidden flex justify-center">
          <Link
            href="/gallery"
            className="inline-flex items-center justify-center rounded-full bg-[#111111] px-8 py-4 text-sm font-bold uppercase tracking-widest text-white hover:bg-[#FF7A00] transition-colors shadow-xl w-full"
          >
            Explore Design Gallery
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
