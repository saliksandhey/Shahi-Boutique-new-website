'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isClosed = sessionStorage.getItem('shahi_announcement_closed')
    if (!isClosed) {
      setIsVisible(true)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    sessionStorage.setItem('shahi_announcement_closed', 'true')
  }

  // Prevent hydration mismatch
  if (!mounted) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#111111] text-white relative z-[60] border-b border-white/10 overflow-hidden"
        >
          <div className="py-2 px-3 sm:px-4 max-w-[1400px] mx-auto flex flex-row items-center justify-between gap-3 sm:gap-4 relative pr-10 sm:pr-12">
            
            {/* Center Content */}
            <div className="flex-1 flex flex-row items-center justify-center text-center gap-3 sm:gap-4">
              <p className="text-[10px] sm:text-xs md:text-sm font-medium tracking-wide uppercase flex items-center gap-2">
                <span className="text-[#FF7A00] font-black truncate">Experience Bespoke Luxury</span>
                <span className="hidden lg:inline opacity-70">|</span>
                <span className="hidden lg:inline opacity-90">Book a personal consultation with our master designers.</span>
              </p>
              <Link 
                href="/book-appointment" 
                className="shrink-0 flex items-center gap-1.5 text-[10px] sm:text-xs font-bold bg-[#FF7A00] text-[#111111] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full hover:bg-white transition-colors uppercase tracking-widest"
              >
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Book Now</span>
              </Link>
            </div>

            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute right-2 sm:right-4 p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
