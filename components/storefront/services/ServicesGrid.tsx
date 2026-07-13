'use client'

import { 
  Scissors, Sparkles, Gem, Ruler, MonitorSmartphone, Settings2,
  Shirt, Palette, Wand2, Brush, Crosshair, Stars, Flower2, Droplets
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const services = [
  { title: "Bridal Suit Stitching", icon: Sparkles, desc: "Exquisite craftsmanship for your big day.", colSpan: "lg:col-span-2", bg: "bg-[#FDF4EB]" },
  { title: "Ladies Suit Stitching", icon: Scissors, desc: "Perfectly tailored everyday suits.", colSpan: "lg:col-span-1", bg: "bg-white" },
  { title: "Hand Embroidery", icon: Palette, desc: "Intricate hand-crafted thread work.", colSpan: "lg:col-span-1", bg: "bg-white" },
  { title: "Lehenga Stitching", icon: Sparkles, desc: "Voluminous and beautifully finished lehengas.", colSpan: "lg:col-span-2", bg: "bg-[#FDF4EB]" },
  { title: "Punjabi Suit Stitching", icon: Shirt, desc: "Traditional and authentic Punjabi fits.", colSpan: "lg:col-span-1", bg: "bg-white" },
  { title: "Gota Patti Work", icon: Flower2, desc: "Traditional Rajasthani festive detailing.", colSpan: "lg:col-span-1", bg: "bg-white" },
  { title: "Blouse Stitching", icon: Shirt, desc: "Designer blouses with perfect fitting.", colSpan: "lg:col-span-1", bg: "bg-white" },
  { title: "Custom Measurements", icon: Ruler, desc: "Bespoke tailoring to your exact body shape.", colSpan: "lg:col-span-1", bg: "bg-[#FDF4EB]" },
  { title: "Alteration Services", icon: Settings2, desc: "Expert resizing for your favorite outfits.", colSpan: "lg:col-span-2", bg: "bg-white" },
]

export function ServicesGrid() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <section className="py-24 bg-gray-50/30 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#FF7A00]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#FF7A00]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-sans font-black text-gray-900 tracking-tighter uppercase leading-[0.9]">
              Our <span className="text-[#FF7A00] italic">Expertise</span>
            </h2>
          </div>
          <p className="text-gray-500 text-base md:text-lg font-medium max-w-md">
            Discover our comprehensive range of boutique services, from basic alterations to exquisite bridal handwork.
          </p>
        </div>

        {/* Mobile: Horizontal Scroll Snap, Desktop: Bento Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="flex overflow-x-auto pb-8 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:pb-0 lg:mx-0 lg:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div 
                variants={item}
                key={index} 
                className={`group flex-none w-[85vw] sm:w-[350px] lg:w-auto ${service.bg} ${service.colSpan} rounded-[2rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-[#FF7A00]/10 border border-gray-100 transition-all duration-500 relative overflow-hidden mr-4 snap-center lg:mr-0 flex flex-col justify-between min-h-[280px]`}
              >
                {/* Decorative background element on hover */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-[#FF7A00]/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-150" />
                
                <div>
                  <div className="h-16 w-16 bg-[#111111] group-hover:bg-[#FF7A00] rounded-2xl flex items-center justify-center mb-8 transition-colors duration-500 shadow-xl shadow-black/5 group-hover:shadow-[#FF7A00]/30 transform group-hover:-rotate-6">
                    <Icon className="h-8 w-8 text-white transition-colors duration-500" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 uppercase tracking-tight group-hover:text-[#FF7A00] transition-colors pr-8">
                    {service.title}
                  </h3>
                  
                  <p className="text-base font-medium text-gray-500 line-clamp-2 max-w-sm">
                    {service.desc}
                  </p>
                </div>
                
                <Link 
                  href="/contact" 
                  className="mt-8 inline-flex items-center text-sm font-black uppercase tracking-widest text-[#111111] group-hover:text-[#FF7A00] transition-colors relative w-fit"
                >
                  <span className="relative z-10">Learn More</span>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FF7A00]/20 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  <span className="ml-2 transform group-hover:translate-x-2 transition-transform duration-300">
                    →
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
        
        {/* Mobile swipe indicator */}
        <div className="flex justify-center mt-4 space-x-2 lg:hidden">
          <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-[#FF7A00] rounded-full animate-[swipe_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    </section>
  )
}
