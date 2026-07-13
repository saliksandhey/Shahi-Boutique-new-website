'use client'

import { useState } from 'react'
import { submitProductEnquiry } from '@/lib/actions/enquiries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function EnquiryForm({ 
  productId, 
  productName, 
  userId, 
  defaultName = '', 
  defaultPhone = '' 
}: { 
  productId: string, 
  productName: string,
  userId?: string,
  defaultName?: string,
  defaultPhone?: string
}) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const data = {
      product_id: productId,
      user_id: userId,
      full_name: formData.get('full_name') as string,
      country: formData.get('country') as string,
      state: formData.get('state') as string,
      phone_number: formData.get('phone_number') as string,
      message: formData.get('message') as string,
    }

    const res = await submitProductEnquiry(data)
    
    if (res.error) {
      setError(res.error)
    } else {
      setSuccess(true)
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-[#FF7A00]/10 p-8 md:p-12 text-center rounded-[2rem] border border-[#FF7A00]/20 shadow-sm max-w-2xl mx-auto">
        <h3 className="text-2xl font-black uppercase tracking-widest text-gray-900 mb-4">Enquiry Submitted</h3>
        <p className="text-sm font-medium text-gray-600 mb-8">Thank you for your interest in {productName}. Our luxury consultants will be in touch with you shortly.</p>
        <Button asChild className="rounded-full bg-[#1C1C1C] text-white h-12 px-8 text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-[#FF7A00] hover:text-[#1C1C1C] transition-colors duration-300">
          <a href="/shop">Continue Exploring</a>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-transparent sm:bg-white p-0 sm:p-6 md:p-10 rounded-none sm:rounded-[2rem] shadow-none sm:shadow-sm border-0 sm:border sm:border-gray-100">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 border border-red-100 rounded-xl text-[10px] font-bold tracking-widest uppercase text-center">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="sm:col-span-2">
          <Label htmlFor="full_name" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Full Name</Label>
          <Input id="full_name" name="full_name" defaultValue={defaultName} required className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gray-50 border-gray-200 focus-visible:ring-[#FF7A00]" placeholder="e.g. Ayesha Khan" />
        </div>
        
        <div>
          <Label htmlFor="country" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Country</Label>
          <Input id="country" name="country" required className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gray-50 border-gray-200 focus-visible:ring-[#FF7A00]" placeholder="e.g. India" />
        </div>
        
        <div>
          <Label htmlFor="state" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">State / Region</Label>
          <Input id="state" name="state" required className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gray-50 border-gray-200 focus-visible:ring-[#FF7A00]" placeholder="e.g. Maharashtra" />
        </div>
        
        <div className="sm:col-span-2">
          <Label htmlFor="phone_number" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Phone Number</Label>
          <Input id="phone_number" name="phone_number" defaultValue={defaultPhone} required type="tel" className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gray-50 border-gray-200 focus-visible:ring-[#FF7A00]" placeholder="+91 XXXXX XXXXX" />
        </div>
        
        <div className="sm:col-span-2">
          <Label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Additional Requirements (Optional)</Label>
          <textarea id="message" name="message" rows={4} className="flex w-full rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Any specific customization requests..." />
        </div>
      </div>
      
      <Button disabled={loading} type="submit" className="w-full rounded-full bg-[#1C1C1C] text-white h-14 sm:h-16 text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-[#FF7A00] hover:text-[#1C1C1C] transition-colors duration-300 shadow-xl mt-4 sm:mt-8">
        {loading ? 'Submitting...' : 'Request Details'}
      </Button>
    </form>
  )
}
