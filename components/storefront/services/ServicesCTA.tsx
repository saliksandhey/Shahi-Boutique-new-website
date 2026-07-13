'use client'

import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export function ServicesCTA() {
  return (
    <section className="py-32 md:py-48 bg-[#111111] relative overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-[#FF7A00]/10 blur-[100px] -translate-y-1/2 translate-x-1/3" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-[#F0E6DD]/10 blur-[100px] translate-y-1/3 -translate-x-1/3" 
        />
      </div>
      
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-5xl md:text-7xl lg:text-[7rem] font-sans font-black text-white mb-8 tracking-tighter uppercase leading-[0.85]">
            Start Your <br/> 
            <span className="text-[#FF7A00] italic">Journey</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-2xl font-medium mb-12 max-w-2xl mx-auto">
            Book a consultation with our master tailors today and bring your dream design to life with unparalleled precision.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/contact"
              className="group relative w-full sm:w-auto flex items-center justify-center rounded-full bg-white px-10 py-5 text-lg font-black uppercase tracking-widest text-[#111111] overflow-hidden transition-all hover:scale-105 shadow-2xl hover:shadow-[#FF7A00]/20"
            >
              <span className="relative z-10 flex items-center">
                Book Appointment
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-[#FF7A00] transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-500 ease-out" />
            </Link>
            <Link
              href="https://wa.me/yourwhatsappnumber"
              target="_blank"
              className="w-full sm:w-auto flex items-center justify-center rounded-full border-2 border-[#FF7A00]/30 bg-transparent px-10 py-5 text-lg font-black uppercase tracking-widest text-white hover:bg-[#FF7A00]/10 hover:border-[#FF7A00] transition-all duration-300"
            >
              <MessageCircle className="mr-3 h-6 w-6 text-[#25D366]" />
              WhatsApp Us
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
