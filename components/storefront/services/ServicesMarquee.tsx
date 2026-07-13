'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function ServicesMarquee() {
  const textItems = [
    "PREMIUM STITCHING", 
    "BRIDAL COUTURE", 
    "HAND EMBROIDERY", 
    "CUSTOM FITTING", 
    "LUXURY DETAILING"
  ]
  
  // Duplicate the array to ensure seamless infinite loop
  const duplicatedItems = [...textItems, ...textItems, ...textItems, ...textItems]

  return (
    <div className="relative w-full bg-[#111111] py-4 overflow-hidden flex items-center border-y border-white/10 z-20">
      <div className="absolute left-0 w-32 h-full bg-gradient-to-r from-[#111111] to-transparent z-10" />
      <div className="absolute right-0 w-32 h-full bg-gradient-to-l from-[#111111] to-transparent z-10" />
      
      <motion.div 
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ 
          repeat: Infinity, 
          ease: "linear", 
          duration: 20 
        }}
      >
        {duplicatedItems.map((item, index) => (
          <div key={index} className="flex items-center text-white px-8">
            <span className="text-xl md:text-3xl font-heading font-bold uppercase tracking-widest text-[#FF7A00]">
              {item}
            </span>
            <Sparkles className="w-5 h-5 md:w-8 md:h-8 mx-8 text-white/30" />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
