'use client'

import { useState } from 'react'
import { updateEnquiryStatus } from '@/lib/actions/enquiries'
import { Phone, MessageCircle } from 'lucide-react'

export function EnquiryActions({ 
  enquiryId, 
  currentStatus, 
  phone 
}: { 
  enquiryId: string, 
  currentStatus: string, 
  phone: string 
}) {
  const [loading, setLoading] = useState(false)
  
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLoading(true)
    await updateEnquiryStatus(enquiryId, e.target.value)
    setLoading(false)
  }

  // Ensure phone number format for WhatsApp/Call (remove spaces, etc)
  const cleanPhone = phone.replace(/[^0-9+]/g, '')
  
  // For WhatsApp, usually it's best to ensure there's a country code. 
  // If the user inputs +91... it works perfectly.
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone.substring(1) : cleanPhone}`
  const telUrl = `tel:${cleanPhone}`

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <select 
        value={currentStatus}
        onChange={handleStatusChange}
        disabled={loading}
        className={`text-[9px] font-black uppercase tracking-widest rounded-full px-3 py-1.5 border-transparent focus:ring-0 cursor-pointer ${
          currentStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' :
          currentStatus === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
          currentStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}
      >
        <option value="PENDING">PENDING</option>
        <option value="ACCEPTED">ACCEPTED</option>
        <option value="REJECTED">REJECTED</option>
      </select>
      
      <div className="flex items-center gap-2">
        <a 
          href={telUrl}
          className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
          title="Call Customer"
        >
          <Phone className="w-3.5 h-3.5" />
        </a>
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-8 w-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors"
          title="WhatsApp Customer"
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}
