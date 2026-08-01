'use client'

import { useState } from 'react'
import { Eye, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function EnquiryMessageModal({
  name,
  phone,
  message,
  date
}: {
  name: string
  phone: string
  message: string
  date: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  // Quick helper to safely display the message since it might contain email
  const displayMessage = message || 'No message provided.'

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[#111111] bg-gray-100 hover:bg-[#FF7A00] hover:text-white px-3 py-1.5 rounded-full transition-colors shrink-0"
      >
        <Eye className="w-3.5 h-3.5" />
        Read
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-[#111111] bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <h2 className="text-xl font-black uppercase tracking-widest text-gray-900 mb-1">Message Details</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">{date}</p>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold block mb-1">From</span>
                    <p className="text-sm font-semibold text-gray-900">{name}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Contact</span>
                    <p className="text-sm font-medium text-gray-600">{phone}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold block mb-2">Message</span>
                  <div className="bg-[#F8F9FA] p-5 rounded-2xl text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium border border-gray-100">
                    {displayMessage}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
