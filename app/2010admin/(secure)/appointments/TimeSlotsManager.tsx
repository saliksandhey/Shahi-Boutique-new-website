'use client'

import { useState } from 'react'
import { Plus, X, Clock, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { updateAppointmentTimeSlots } from '@/lib/actions/settings'

interface TimeSlotsManagerProps {
  initialSlots: string[]
}

export function TimeSlotsManager({ initialSlots }: TimeSlotsManagerProps) {
  const [slots, setSlots] = useState<string[]>(initialSlots)
  const [newSlot, setNewSlot] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleAdd = () => {
    if (!newSlot.trim()) return
    // Prevent duplicates
    if (slots.includes(newSlot.trim())) {
      setNewSlot('')
      return
    }
    setSlots([...slots, newSlot.trim()])
    setNewSlot('')
  }

  const handleRemove = (slotToRemove: string) => {
    setSlots(slots.filter(slot => slot !== slotToRemove))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateAppointmentTimeSlots(slots)
    setIsSaving(false)
    if (result.success) {
      setIsOpen(false)
    } else {
      alert(result.error || 'Failed to save time slots')
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center px-4 py-2 bg-white border border-gray-200 text-sm font-bold uppercase tracking-widest text-gray-700 hover:text-[#FF7A00] hover:border-[#FF7A00]/50 rounded-xl transition-colors shadow-sm"
      >
        <Clock className="w-4 h-4 mr-2" />
        Manage Times
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 overflow-hidden"
            >
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-black uppercase tracking-widest text-gray-900">Manage Time Slots</h2>
                <p className="text-gray-500 text-sm mt-2 font-medium">Add or remove time slots for the booking form.</p>
              </div>

        <div className="space-y-6">
          {/* Add New Slot */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 10:30 AM"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1 bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all"
            />
            <button
              onClick={handleAdd}
              disabled={!newSlot.trim()}
              className="bg-[#111111] text-white px-4 py-3 rounded-xl disabled:opacity-50 hover:bg-gray-900 transition-colors flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Current Slots */}
          <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 min-h-[120px] max-h-[250px] overflow-y-auto">
            {slots.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8 font-medium">
                No time slots available. Add some above!
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {slots.map((slot) => (
                    <motion.div
                      key={slot}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-white border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm"
                    >
                      <span className="text-sm font-bold tracking-widest text-gray-700">{slot}</span>
                      <button
                        onClick={() => handleRemove(slot)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setIsOpen(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center px-6 py-2.5 rounded-xl bg-[#FF7A00] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#E66E00] transition-colors disabled:opacity-70 shadow-lg shadow-[#FF7A00]/20"
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
