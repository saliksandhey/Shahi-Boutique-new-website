'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Globe } from 'lucide-react'

export function WorldwideDelivery() {
  const countries = [
    { name: 'United States', code: 'us' },
    { name: 'United Kingdom', code: 'gb' },
    { name: 'Canada', code: 'ca' },
    { name: 'Australia', code: 'au' },
    { name: 'UAE', code: 'ae' },
    { name: 'France', code: 'fr' },
    { name: 'Germany', code: 'de' },
    { name: 'Japan', code: 'jp' },
    { name: 'Saudi Arabia', code: 'sa' },
    { name: 'Italy', code: 'it' },
    { name: 'Switzerland', code: 'ch' },
    { name: 'Singapore', code: 'sg' },
  ]

  // Duplicate the array to create a seamless infinite scroll
  const marqueeItems = [...countries, ...countries]

  return (
    <section className="py-10 md:py-16 bg-white overflow-hidden relative border-t border-gray-100">
      
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-white to-white pointer-events-none"></div>
      
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-[#FF7A00]" />
            <span className="text-[10px] md:text-xs font-bold text-[#FF7A00] uppercase tracking-widest">
              Global Reach
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-sans font-black text-gray-900 tracking-tighter leading-none uppercase">
            WE'RE TRUSTED BY
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-gray-600 text-sm md:text-base leading-relaxed">
            From the heart of Punjab to the world. Our exclusive collections have reached patrons across these beautiful nations, delivering uncompromised quality and elegance globally.
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden flex items-center h-[180px] md:h-[220px] -mx-6 sm:-mx-8 lg:-mx-12 px-6 sm:px-8 lg:px-12">
          <motion.div
            className="flex gap-4 md:gap-6 whitespace-nowrap absolute left-0 pl-6 sm:pl-8 lg:pl-12"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              duration: 35,
              ease: 'linear',
              repeat: Infinity,
            }}
          >
            {marqueeItems.map((country, idx) => (
              <div 
                key={`${country.code}-${idx}`}
                className="group flex-shrink-0 w-36 h-36 md:w-48 md:h-44 bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center p-6 hover:border-gray-300 hover:bg-gray-50 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
              >
                {/* Subtle hover glow inside card */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-100 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative w-12 h-12 md:w-16 md:h-16 mb-4 rounded-full overflow-hidden shadow-sm border border-black/5 group-hover:scale-110 transition-transform duration-500">
                  <Image 
                    src={`https://flagcdn.com/${country.code}.svg`} 
                    alt={`${country.name} Flag`}
                    fill
                    sizes="(max-width: 768px) 48px, 64px"
                    className="object-cover"
                  />
                </div>
                <span className="text-xs md:text-sm font-bold text-gray-900 text-center whitespace-normal leading-tight tracking-widest uppercase transition-colors duration-300">
                  {country.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
        
        {/* Subtle gradient overlays for the edges of the marquee to fade smoothly */}
        <div className="absolute top-0 bottom-0 left-0 w-24 md:w-40 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 right-0 w-24 md:w-40 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none"></div>
        
      </div>
    </section>
  )
}
