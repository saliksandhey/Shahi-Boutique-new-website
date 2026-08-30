'use client'

import { useState } from 'react'
import { MapPin, Truck, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useCurrency } from '@/lib/contexts/CurrencyContext'

export function DeliveryChecker() {
  const [tab, setTab] = useState<'india' | 'intl'>('india')
  const [pincode, setPincode] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string, detail?: string } | null>(null)
  const { rates, formatPrice } = useCurrency()

  const checkPincode = async () => {
    if (!pincode || pincode.length !== 6) {
      setResult({ type: 'error', message: 'Please enter a valid 6-digit Pincode.' })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      const data = await res.json()
      if (data && data[0] && data[0].Status === 'Success') {
        const postOffice = data[0].PostOffice[0]
        setResult({
          type: 'success',
          message: `Delivery available to ${postOffice.District}, ${postOffice.State}.`,
          detail: 'Expected delivery in 3-5 business days. Free Shipping.'
        })
      } else {
        setResult({ type: 'error', message: 'Invalid Pincode or service not available.' })
      }
    } catch (err) {
      setResult({ type: 'error', message: 'Failed to verify pincode. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const checkInternational = async () => {
    if (!country) {
      setResult({ type: 'error', message: 'Please select a country.' })
      return
    }
    // Hardcoded zones as requested to avoid DB migration block
    const zones: Record<string, { fee: number, days: string }> = {
      'US': { fee: 3000, days: '7-10 days' },
      'GB': { fee: 2500, days: '6-8 days' },
      'CA': { fee: 3200, days: '8-12 days' },
      'AE': { fee: 1500, days: '4-6 days' },
      'AU': { fee: 3500, days: '10-14 days' },
    }
    
    setLoading(true)
    setTimeout(() => {
      if (zones[country]) {
        setResult({
          type: 'success',
          message: `Delivery available to ${country}.`,
          detail: `Expected delivery in ${zones[country].days}. Shipping: ${formatPrice(zones[country].fee)}`
        })
      } else {
        setResult({
          type: 'success',
          message: `Delivery available to ${country}.`,
          detail: `Expected delivery in 10-15 days. Shipping: ${formatPrice(4000)} (Standard Intl)`
        })
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="mt-8 border border-gray-200 p-4 bg-gray-50/50">
      <div className="flex items-center gap-2 mb-4 text-[#111111]">
        <Truck className="w-5 h-5" />
        <h3 className="font-bold tracking-widest uppercase text-xs">Delivery Options</h3>
      </div>
      
      <div className="flex gap-4 mb-4 border-b border-gray-200 pb-2">
        <button 
          onClick={() => { setTab('india'); setResult(null) }}
          className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${tab === 'india' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
        >
          India
        </button>
        <button 
          onClick={() => { setTab('intl'); setResult(null) }}
          className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${tab === 'intl' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
        >
          International
        </button>
      </div>

      {tab === 'india' ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#111111] transition-colors bg-white"
              />
            </div>
            <button 
              onClick={checkPincode}
              disabled={loading || pincode.length !== 6}
              className="px-6 py-2 bg-[#111111] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-gray-800 transition-colors"
            >
              {loading ? '...' : 'Check'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <select 
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#111111] bg-white transition-colors uppercase"
            >
              <option value="">Select Country</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AE">UAE</option>
              <option value="AU">Australia</option>
              <option value="OTHER">Other Country</option>
            </select>
            <button 
              onClick={checkInternational}
              disabled={loading || !country}
              className="px-6 py-2 bg-[#111111] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-gray-800 transition-colors"
            >
              {loading ? '...' : 'Check'}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className={`mt-4 p-3 text-sm flex gap-3 ${result.type === 'success' ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
          {result.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          <div>
            <p className="font-semibold">{result.message}</p>
            {result.detail && <p className="mt-1 opacity-90">{result.detail}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
