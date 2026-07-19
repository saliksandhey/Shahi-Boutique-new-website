'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles, Palette, Ruler, Scissors } from 'lucide-react'

const services = [
  {
    id: 1,
    title: "Custom Suit Stitching",
    shortTitle: "Stitching",
    icon: Scissors,
    desc: "Precision tailoring that transforms premium fabrics into flawless, perfectly fitted suits.",
    image: "/media/service_suit_stitching.png",
    bg: "bg-[#111111]",
    textColor: "text-white",
    accentColor: "text-white"
  },
  {
    id: 2,
    title: "Bridal Couture",
    shortTitle: "Bridal",
    icon: Sparkles,
    desc: "Breathtaking bridal ensembles crafted with exquisite detailing and masterful embroidery.",
    image: "/media/service_bridal_couture.png",
    bg: "bg-[#FF7A00]",
    textColor: "text-white",
    accentColor: "text-[#FF7A00]"
  },
  {
    id: 3,
    title: "Premium Hand Embroidery",
    shortTitle: "Embroidery",
    icon: Palette,
    desc: "Intricate, timeless handwork by master artisans preserving rich traditional threadwork.",
    image: "/media/service_hand_embroidery.png",
    bg: "bg-[#2A2A2A]",
    textColor: "text-white",
    accentColor: "text-[#FF7A00]"
  },
  {
    id: 4,
    title: "Design Consultation",
    shortTitle: "Consultation",
    icon: Ruler,
    desc: "Work one-on-one with our expert designers to create your ultimate personalized wardrobe.",
    image: "/media/service_design_consultation.png",
    bg: "bg-gray-100",
    textColor: "text-white",
    accentColor: "text-white"
  }
]

export function ServicesSection() {
  // Desktop hover state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0)
  
  // Mobile accordion state (all closed by default)
  const [mobileExpandedIndex, setMobileExpandedIndex] = useState<number | null>(null)

  return (
    <section className="py-16 md:py-32 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-sans font-black text-gray-900 tracking-tighter uppercase leading-[0.9]">
              Boutique <br/>
              <span className="text-[#FF7A00] italic">Services</span>
            </h2>
          </div>
          <Link 
            href="/services" 
            className="hidden md:inline-flex items-center justify-center rounded-full bg-[#111111] px-8 py-4 text-sm font-bold uppercase tracking-widest text-white hover:bg-[#FF7A00] transition-all duration-300 shadow-xl"
          >
            Explore All Services
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        {/* =========================================================================
            DESKTOP EXPERIENCE: HOVER-EXPAND ACCORDION (Hidden on Mobile) 
            ========================================================================= */}
        <div className="hidden lg:flex h-[600px] w-full gap-4">
          {services.map((service, index) => {
            const isHovered = hoveredIndex === index
            const Icon = service.icon

            return (
              <motion.div
                key={service.id}
                onHoverStart={() => setHoveredIndex(index)}
                animate={{
                  flex: isHovered ? 4 : 1, // Expands to take 4x space of others
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="relative h-full rounded-[2rem] overflow-hidden cursor-pointer group bg-black"
              >
                {/* Background Image */}
                <motion.img 
                  src={service.image}
                  alt={service.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                  animate={{ scale: isHovered ? 1.05 : 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
                
                {/* Decorative Overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Content Container */}
                <div className="absolute inset-0 p-4 xl:p-8 flex flex-col justify-between z-10">
                  
                  {/* Top: Icon */}
                  <div className={`flex w-full ${isHovered ? 'justify-start' : 'justify-center'} transition-all duration-500`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isHovered ? 'bg-white/20 backdrop-blur-md' : 'bg-transparent'} transition-all duration-500`}>
                      <Icon className={`w-6 h-6 ${service.textColor}`} />
                    </div>
                  </div>

                  {/* Bottom: Text & Details */}
                  <div className="flex flex-col justify-end h-full">
                    
                    {/* Vertical Title (Shows when NOT hovered) */}
                    <AnimatePresence>
                      {!isHovered && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                        >
                          <span 
                            className={`text-2xl xl:text-3xl font-black uppercase tracking-widest ${service.textColor} opacity-60`}
                            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                          >
                            {service.shortTitle}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Full Content (Shows when hovered) */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                          className="flex flex-col justify-end"
                        >
                          <h3 className={`text-4xl xl:text-5xl font-black uppercase tracking-tighter mb-4 ${service.textColor}`}>
                            {service.title}
                          </h3>
                          <p className={`text-lg mb-8 max-w-sm ${service.textColor} opacity-80`}>
                            {service.desc}
                          </p>
                          <Link 
                            href="/services"
                            className="inline-flex items-center w-fit text-sm font-bold uppercase tracking-widest text-white hover:text-[#FF7A00] transition-colors"
                          >
                            Discover More <ArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* =========================================================================
            MOBILE/TABLET EXPERIENCE: ELEGANT VERTICAL ACCORDION
            ========================================================================= */}
        <div className="lg:hidden flex flex-col gap-4 relative z-10">
          {services.map((service, index) => {
            const Icon = service.icon
            const isExpanded = mobileExpandedIndex === index

            return (
              <div 
                key={service.id}
                className="w-full rounded-[2rem] overflow-hidden transition-all duration-500 bg-black relative"
              >
                {/* Background Image for Mobile */}
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isExpanded ? 'opacity-40' : 'opacity-20'}`} 
                />
                <div className={`absolute inset-0 transition-opacity duration-500 ${isExpanded ? 'bg-gradient-to-t from-black/90 via-black/50 to-black/20' : 'bg-black/60'}`} />

                {/* Accordion Header (Always visible, click to expand) */}
                <button 
                  onClick={() => setMobileExpandedIndex(isExpanded ? null : index)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 md:p-8 text-left focus:outline-none relative z-10 gap-3"
                >
                  <div className="flex items-center gap-3 md:gap-4 flex-1">
                    <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors duration-300 bg-white/10 backdrop-blur-md">
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <h3 className="text-[1.1rem] leading-[1.1] sm:text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">
                      {service.title}
                    </h3>
                  </div>
                  
                  {/* Plus/Minus Icon */}
                  <div className={`shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${isExpanded ? 'border-transparent rotate-45' : 'border-white/30 rotate-0'}`}>
                    <span className="block w-2.5 h-[2px] absolute bg-white"></span>
                    <span className="block h-2.5 w-[2px] absolute bg-white"></span>
                  </div>
                </button>

                {/* Accordion Body (Expands) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-6 pb-8 sm:px-8 sm:pb-10 pt-2 relative z-10">
                        <p className="text-lg sm:text-xl mb-8 text-white opacity-90 leading-relaxed">
                          {service.desc}
                        </p>
                        <Link 
                          href="/services"
                          className="inline-flex items-center px-8 py-4 rounded-full bg-white text-sm font-bold uppercase tracking-widest text-[#111111] shadow-xl active:scale-95 transition-transform hover:bg-[#FF7A00] hover:text-white"
                        >
                          Discover More <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
        
        {/* Mobile View All Button */}
        <div className="mt-8 flex justify-center lg:hidden relative z-20">
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-full border-2 border-[#111111] bg-transparent px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#111111] active:bg-[#111111] active:text-white transition-colors w-full"
          >
            Explore All Services
          </Link>
        </div>

      </div>
    </section>
  )
}
