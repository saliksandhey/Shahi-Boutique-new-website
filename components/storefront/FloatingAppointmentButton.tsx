'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, X, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function FloatingAppointmentButton() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasManuallyClosed, setHasManuallyClosed] = useState(true)
  const pathname = usePathname()

  // Run once on mount to check if we should auto-expand
  useEffect(() => {
    const hasSeen = sessionStorage.getItem('hasSeenAppointmentMessage')
    if (!hasSeen) {
      setIsExpanded(true)
      setHasManuallyClosed(false)
      sessionStorage.setItem('hasSeenAppointmentMessage', 'true')
    }
  }, [])

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
        // Reset state when back at top so it feels fresh next scroll
        if (!hasManuallyClosed) {
          setIsExpanded(true)
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasManuallyClosed])

  // Auto-collapse after 2 seconds to just show the button
  useEffect(() => {
    if (isScrolled && isExpanded && !hasManuallyClosed) {
      const timer = setTimeout(() => {
        setIsExpanded(false)
        setHasManuallyClosed(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isScrolled, isExpanded, hasManuallyClosed])

  if (pathname === '/book-appointment' || pathname?.startsWith('/2010admin')) {
    return null
  }

  const isShop = pathname === '/shop' || pathname?.startsWith('/product')
  const bottomClass = isShop ? 'bottom-40 lg:bottom-20' : 'bottom-20'

  return (
    <AnimatePresence>
      {isScrolled && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className={`fixed ${bottomClass} right-4 sm:right-6 z-[90] flex items-center justify-end`}
          onMouseEnter={() => !hasManuallyClosed && setIsExpanded(true)}
          onMouseLeave={() => !hasManuallyClosed && setIsExpanded(false)}
        >
          <motion.div 
            layout
            className={cn(
              "bg-[#111111]/95 backdrop-blur-xl text-white rounded-full flex flex-row-reverse items-center shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/10 overflow-hidden transition-all duration-300",
              isExpanded ? "p-1.5 sm:p-2" : "p-3 sm:p-4 hover:bg-[#FF7A00]"
            )}
            style={{ borderRadius: 9999 }}
          >
            {/* The Icon */}
            <Link 
              href="/book-appointment" 
              className={cn(
                "flex items-center justify-center rounded-full shrink-0 transition-colors duration-500",
                isExpanded 
                  ? "w-10 h-10 sm:w-12 sm:h-12 bg-[#FF7A00] text-[#111111]" 
                  : "w-6 h-6 sm:w-7 sm:h-7 text-white"
              )}
            >
              <Calendar className={cn(isExpanded ? "w-4 h-4 sm:w-5 sm:h-5" : "w-full h-full")} />
            </Link>

            {/* The Expanded Content */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="flex items-center overflow-hidden whitespace-nowrap"
                >
                  <Link href="/book-appointment" className="flex flex-col pr-3 pl-2 sm:pr-4 sm:pl-4 group">
                    <span className="text-[8px] sm:text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-0.5">
                      Bespoke Luxury
                    </span>
                    <span className="text-xs sm:text-sm font-medium flex items-center gap-1.5 group-hover:text-[#FF7A00] transition-colors">
                      Book a Consultation 
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </span>
                  </Link>

                  <div className="w-[1px] h-8 bg-white/20 mx-1"></div>

                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsExpanded(false)
                      setHasManuallyClosed(true)
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors ml-1 mr-1"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
