'use client'

import { useState, useEffect } from 'react'
import { MapPin, Clock, Phone, Navigation, X } from 'lucide-react'
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import { motion, AnimatePresence } from "framer-motion"

// Coordinates for Malerkotla, Punjab (Longitude, Latitude)
const MALERKOTLA_COORDS = [75.8872, 30.5262];

export function StoreLocationSection() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder with the same dimensions to avoid layout shift
    return <section className="relative w-full bg-[#111111] border-t border-white/10 flex flex-col items-center pt-10 md:pt-14 pb-8 h-[500px] md:h-[650px]"></section>
  }

  return (
    <section className="relative w-full bg-[#111111] border-t border-white/10 flex flex-col items-center pt-10 md:pt-14 pb-8 overflow-hidden">
      
      {/* Ambient Background Glow (Subtle Gold) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF7A00]/5 via-[#111111] to-[#111111] pointer-events-none"></div>
      
      {/* Header - Normal Document Flow */}
      <div className="relative z-10 text-center px-6 mb-6 md:mb-8">
        <h2 className="text-3xl md:text-5xl lg:text-5xl font-sans font-black tracking-tighter text-white uppercase leading-none">
          VISIT OUR BOUTIQUE
        </h2>
        <p className="mt-4 text-[#FF7A00] font-medium tracking-widest uppercase text-xs md:text-sm">
          Telian Bazar, Malerkotla, Punjab
        </p>
      </div>

      {/* Map Container */}
      <div className="relative w-full max-w-5xl h-[300px] md:h-[450px]">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 250,
            center: [75, 10] // Center near India
          }}
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          <Geographies geography="/world.topo.json">
            {({ geographies }) =>
              geographies.map((geo) => {
                const isIndia = geo.properties.name === "India";
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isIndia ? "#222222" : "#161616"}
                    stroke={isIndia ? "#FF7A00" : "#222222"}
                    strokeWidth={isIndia ? 1.5 : 0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", fill: isIndia ? "#2a2a2a" : "#1a1a1a" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Interactive Marker */}
          <Marker coordinates={MALERKOTLA_COORDS as [number, number]}>
            <g
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer"
            >
              {/* Pulsating Dots (Gold) */}
              <circle r={20} fill="#FF7A00" opacity={0.2} className="animate-ping" style={{ transformOrigin: 'center' }} />
              <circle r={10} fill="#FF7A00" opacity={0.5} />
              <circle r={5} fill="#ffffff" />
              
              {/* Info Card Popover using foreignObject */}
              <AnimatePresence>
                {isOpen && (
                  <foreignObject x="-140" y="25" width="280" height="210" style={{ overflow: 'visible' }}>
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="bg-[#1a1a1a] border border-[#FF7A00]/30 p-5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] w-full h-full flex flex-col justify-between cursor-default pointer-events-auto relative"
                    >
                      {/* Close Button */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black rounded-full text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-[#FF7A00]/10 flex items-center justify-center shrink-0 border border-[#FF7A00]/20">
                            <MapPin className="w-4 h-4 text-[#FF7A00]" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-sm tracking-widest uppercase">Shahi Boutique</h3>
                          </div>
                        </div>
                        <p className="text-gray-400 text-[11px] leading-relaxed mb-3">
                          Telian Bazar, Malerkotla<br />
                          Punjab, India
                        </p>
                        <div className="space-y-1.5 mb-4">
                          <div className="flex items-center gap-2 text-[11px] text-gray-300">
                            <Clock className="w-3 h-3 text-[#FF7A00]" />
                            <span>Mon - Sat: 10:30 AM - 8:00 PM</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-300">
                            <Phone className="w-3 h-3 text-[#FF7A00]" />
                            <span>+91 92178 90060</span>
                          </div>
                        </div>
                      </div>
                      <a 
                        href="https://share.google/PNjOPJk4KPgn2Acoz" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-[#FF7A00] hover:text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-3 h-3" />
                        Get Directions
                      </a>
                    </motion.div>
                  </foreignObject>
                )}
              </AnimatePresence>
            </g>
          </Marker>
        </ComposableMap>
      </div>

    </section>
  )
}
