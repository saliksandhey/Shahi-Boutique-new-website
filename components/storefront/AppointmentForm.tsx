'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronDown, Calendar, Clock } from 'lucide-react'
import { createAppointment } from '@/lib/actions/appointments'

const services = [
  'Custom Suit Stitching',
  'Bridal Couture',
  'Premium Hand Embroidery',
  'Custom Design Consultation'
]

interface AppointmentFormProps {
  timeSlots: string[]
}

export function AppointmentForm({ timeSlots }: AppointmentFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [bookingId, setBookingId] = useState('')
  
  // Form State
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  
  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedService, setSelectedService] = useState('')
  
  const [date, setDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [requirements, setRequirements] = useState('')
  
  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Disable past dates
  const today = new Date().toISOString().split('T')[0]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!name) newErrors.name = 'Name is required'
    if (!phone) newErrors.phone = 'Mobile number is required'
    if (!city) newErrors.city = 'City is required'
    if (email && !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email address is invalid'
    if (!selectedService) newErrors.service = 'Please select a service'
    if (!date) newErrors.date = 'Please select a preferred date'
    if (!selectedTime) newErrors.time = 'Please select a preferred time'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setStatus('submitting')
    
    const result = await createAppointment({
      name,
      phone,
      email: email || undefined,
      city,
      service: selectedService,
      appointment_date: date,
      appointment_time: selectedTime,
      requirements: requirements || undefined
    })
    
    if (result.success && result.booking_id) {
      setBookingId(result.booking_id)
      setStatus('success')
    } else {
      setStatus('idle')
      alert("Failed to submit appointment. Please try again.")
    }
  }

  const resetForm = () => {
    setStatus('idle')
    setName('')
    setPhone('')
    setEmail('')
    setCity('')
    setSelectedService('')
    setDate('')
    setSelectedTime('')
    setRequirements('')
    setErrors({})
  }

  // Common input styling
  const inputBaseClasses = "w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3 px-4 md:py-4 md:px-6 text-sm md:text-base font-medium text-gray-900 transition-all duration-300 outline-none focus:bg-white focus:border-[#FF7A00] focus:ring-4 focus:ring-[#FF7A00]/10 placeholder:text-gray-400"
  
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Premium Card Container */}
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden relative">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF7A00]/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="p-5 sm:p-8 md:p-12 relative z-10">
          <div className="mb-8 md:mb-10 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 mb-2 md:mb-4">Book a Consultation</h2>
            <p className="text-gray-500 font-medium text-sm md:text-lg">Schedule your exclusive one-on-one session with our master designers.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 md:mb-2 ml-1 md:ml-2">Full Name *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => {setName(e.target.value); if(errors.name) setErrors({...errors, name: ''})}}
                  className={inputBaseClasses} 
                  placeholder="e.g. Ananya Sharma"
                />
                {errors.name && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs font-bold mt-2 ml-2">{errors.name}</motion.p>}
              </div>

              <div>
                <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 md:mb-2 ml-1 md:ml-2">Mobile Number *</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={e => {setPhone(e.target.value); if(errors.phone) setErrors({...errors, phone: ''})}}
                  className={inputBaseClasses} 
                  placeholder="+91 98765 43210"
                />
                {errors.phone && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs font-bold mt-2 ml-2">{errors.phone}</motion.p>}
              </div>

              <div>
                <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 md:mb-2 ml-1 md:ml-2">City *</label>
                <input 
                  type="text" 
                  value={city}
                  onChange={e => {setCity(e.target.value); if(errors.city) setErrors({...errors, city: ''})}}
                  className={inputBaseClasses} 
                  placeholder="e.g. Ludhiana"
                />
                {errors.city && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs font-bold mt-2 ml-2">{errors.city}</motion.p>}
              </div>

              <div>
                <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 md:mb-2 ml-1 md:ml-2">Email Address <span className="text-gray-400 normal-case tracking-normal font-normal">(Optional)</span></label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => {setEmail(e.target.value); if(errors.email) setErrors({...errors, email: ''})}}
                  className={inputBaseClasses} 
                  placeholder="your.email@example.com"
                />
                {errors.email && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs font-bold mt-2 ml-2">{errors.email}</motion.p>}
              </div>
            </div>

            {/* 2. Service Selection (Custom Dropdown) */}
            <div className="relative">
              <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 md:mb-2 ml-1 md:ml-2">Select Service</label>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`relative cursor-pointer flex items-center justify-between ${inputBaseClasses} ${isDropdownOpen ? 'bg-white border-[#FF7A00] ring-4 ring-[#FF7A00]/10' : ''}`}
              >
                <span className={selectedService ? 'text-gray-900' : 'text-gray-400'}>
                  {selectedService || 'Choose a service...'}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-[#FF7A00]' : ''}`} />
              </div>
              {errors.service && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs font-bold mt-2 ml-2">{errors.service}</motion.p>}
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden origin-top"
                  >
                    {services.map(service => (
                      <div 
                        key={service}
                        onClick={() => {
                          setSelectedService(service)
                          setIsDropdownOpen(false)
                          if(errors.service) setErrors({...errors, service: ''})
                        }}
                        className="px-6 py-4 hover:bg-[#FF7A00]/5 hover:text-[#FF7A00] cursor-pointer text-gray-700 font-medium transition-colors"
                      >
                        {service}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Date and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Date */}
              <div>
                <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 md:mb-2 ml-1 md:ml-2">Preferred Date</label>
                <div className="relative">
                  <input 
                    type="date"
                    min={today}
                    value={date}
                    onChange={e => {setDate(e.target.value); if(errors.date) setErrors({...errors, date: ''})}}
                    className={`${inputBaseClasses} appearance-none cursor-pointer`} 
                  />
                  {/* Custom icon overlaying default browser icon (for styling) */}
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                {errors.date && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs font-bold mt-2 ml-2">{errors.date}</motion.p>}
              </div>

              {/* Time Slots (Custom Grid) */}
              <div className="md:col-span-2">
                <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 md:mb-4 ml-1 md:ml-2 flex items-center">
                  <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" /> Preferred Time
                </label>
                <div className="flex flex-wrap gap-3">
                  {timeSlots.map(time => {
                    const isSelected = selectedTime === time
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {setSelectedTime(time); if(errors.time) setErrors({...errors, time: ''})}}
                        className={`
                          py-2 px-4 md:py-3 md:px-6 rounded-full text-xs md:text-sm font-bold tracking-widest transition-all duration-300
                          ${isSelected 
                            ? 'bg-[#FF7A00] text-white shadow-lg shadow-[#FF7A00]/30 scale-105' 
                            : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                          }
                        `}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
                {errors.time && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs font-bold mt-4 ml-2">{errors.time}</motion.p>}
              </div>
            </div>

            {/* 4. Special Requirements */}
            <div>
              <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 md:mb-2 ml-1 md:ml-2">
                Special Requirements <span className="text-gray-400 normal-case tracking-normal font-normal">(Optional)</span>
              </label>
              <textarea 
                rows={4}
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
                className={`${inputBaseClasses} resize-none`} 
                placeholder="Tell us about your outfit, preferred design, or any special requests..."
              />
            </div>

            <div className="pt-2 md:pt-6">
              <button 
                type="submit"
                disabled={status === 'submitting'}
                className="group relative w-full flex items-center justify-center rounded-full bg-[#111111] px-6 py-4 md:px-8 md:py-6 text-sm md:text-lg font-black uppercase tracking-widest text-white overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl disabled:opacity-70 disabled:hover:scale-100 sticky bottom-4 z-30"
              >
                {status === 'submitting' ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">Book Appointment</span>
                    <div className="absolute inset-0 bg-[#FF7A00] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================
            SUCCESS MODAL OVERLAY
            ======================================================== */}
        <AnimatePresence>
          {status === 'success' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15, delay: 0.1 }}
                className="w-24 h-24 bg-[#FF7A00]/10 rounded-full flex items-center justify-center mb-8"
              >
                <CheckCircle2 className="w-12 h-12 text-[#FF7A00]" />
              </motion.div>
              
              <motion.h3 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 mb-4"
              >
                Appointment Booked
              </motion.h3>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-500 font-medium text-lg max-w-md mx-auto mb-8"
              >
                Your consultation has been successfully scheduled. Our master designers are excited to meet you.
              </motion.p>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 border border-gray-200 rounded-2xl px-8 py-4 mb-10 flex flex-col items-center"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Booking ID</span>
                <span className="text-2xl font-black tracking-widest text-[#111111]">{bookingId}</span>
              </motion.div>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={resetForm}
                className="text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-[#FF7A00] transition-colors pb-1 border-b-2 border-transparent hover:border-[#FF7A00]"
              >
                Book Another Appointment
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
