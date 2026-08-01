'use client'

import { useState } from 'react'
import { submitContactForm } from '@/lib/actions/contact'

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('submitting')
    const form = e.currentTarget
    const formData = new FormData(form)
    
    const result = await submitContactForm(formData)
    if (result.success) {
      setStatus('success')
      form.reset()
    } else {
      setStatus('error')
    }
  }

  const inputClasses = "w-full bg-white border border-gray-200 focus:border-[#FF7A00] focus:ring-0 rounded-[2rem] py-5 px-8 text-sm font-bold text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 placeholder:font-medium"

  if (status === 'success') {
    return (
      <div className="bg-[#F8F9FA] p-12 text-center rounded-[3rem] border border-gray-100">
        <h3 className="font-sans font-black tracking-tighter text-3xl md:text-4xl text-gray-900 uppercase mb-4">Message Sent</h3>
        <p className="text-gray-500 font-medium leading-relaxed max-w-md mx-auto">Your inquiry has been received. One of our dedicated client advisors will be in touch with you shortly.</p>
        <button onClick={() => setStatus('idle')} className="mt-10 inline-block bg-[#1C1C1C] text-white rounded-full px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#FF7A00] transition-colors duration-300 shadow-md">
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <input 
          type="text" 
          name="name" 
          id="name" 
          required 
          placeholder="Full Name" 
          className={inputClasses} 
        />
      </div>
      
      <div>
        <input 
          type="email" 
          name="email" 
          id="email" 
          required 
          placeholder="Email Address" 
          className={inputClasses} 
        />
      </div>
      
      <div>
        <input 
          type="tel" 
          name="phone" 
          id="phone" 
          placeholder="Phone Number (Optional)" 
          className={inputClasses} 
        />
      </div>
      
      <div>
        <textarea 
          name="message" 
          id="message" 
          rows={5} 
          required 
          placeholder="Your Message" 
          className={`${inputClasses} rounded-[2rem] resize-none pt-6`} 
        />
      </div>
      
      {status === 'error' && (
        <p className="text-xs text-red-500 font-bold uppercase tracking-widest bg-red-50 p-4 rounded-xl text-center">There was an error sending your message. Please try again.</p>
      )}
      
      <button 
        type="submit" 
        disabled={status === 'submitting'}
        className="w-full bg-[#1C1C1C] text-white rounded-full py-6 text-sm font-black uppercase tracking-widest hover:bg-[#FF7A00] transition-colors duration-300 disabled:bg-gray-200 disabled:text-gray-400 shadow-xl mt-4"
      >
        {status === 'submitting' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
