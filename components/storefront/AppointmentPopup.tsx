'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

export function AppointmentPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't show on the appointment page itself or admin pages
    if (pathname === '/book-appointment' || pathname?.startsWith('/admin')) {
      return
    }

    // Check session storage to see if we already showed it
    const hasSeenPopup = sessionStorage.getItem('shahi_appointment_popup_seen')
    
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 5000) // Show after 5 seconds
      
      return () => clearTimeout(timer)
    }
  }, [pathname])

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsVisible(false)
    sessionStorage.setItem('shahi_appointment_popup_seen', 'true')
  }

  const handleBook = () => {
    handleClose()
    router.push('/book-appointment')
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 w-[calc(100vw-3rem)] md:w-96 max-w-sm"
        >
          <div 
            onClick={handleBook}
            className="relative cursor-pointer bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden group"
          >
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF7A00] rounded-full mix-blend-screen filter blur-[50px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" />
            
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-20"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4 relative z-10">
              <div className="shrink-0 w-12 h-12 rounded-full bg-[#FF7A00]/10 flex items-center justify-center border border-[#FF7A00]/20 text-[#FF7A00]">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-black uppercase tracking-wider text-lg mb-1">
                  Book Consultation
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Experience bespoke luxury. Craft your perfect outfit with our master designers.
                </p>
                <span className="inline-flex items-center text-[#FF7A00] text-sm font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                  Book Now <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
