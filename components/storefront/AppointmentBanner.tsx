'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'

export function AppointmentBanner() {
  return (
    <section className="relative w-full py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 bg-[#111111] p-8 md:p-12 lg:p-16 rounded-[2rem] overflow-hidden shadow-2xl">
          
          {/* Decorative Elements inside card */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[200%] bg-white/[0.03] -rotate-12 blur-3xl rounded-full" />
            <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[150%] bg-[#FF7A00]/[0.08] rotate-45 blur-3xl rounded-full" />
          </div>

          <div className="flex-1 text-center md:text-left relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter mb-4">
                Experience <br className="hidden md:block" />
                <span className="text-[#FF7A00] italic font-serif tracking-normal">Bespoke</span> Luxury
              </h2>
              <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto md:mx-0 font-medium leading-relaxed">
                Book a personal consultation with our master designers to craft your perfect ensemble, tailored exclusively for you.
              </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="shrink-0 relative z-10"
          >
            <Link 
              href="/book-appointment"
              className="group relative inline-flex items-center justify-center bg-white text-[#111111] px-8 py-5 rounded-full font-black uppercase tracking-widest hover:bg-[#FF7A00] hover:text-white transition-all duration-500 overflow-hidden shadow-2xl shadow-[#FF7A00]/20"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <Calendar className="w-5 h-5 mr-3" />
              <span>Book Appointment</span>
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
