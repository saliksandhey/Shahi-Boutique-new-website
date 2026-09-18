'use client'

import { useState } from 'react'
import { MapPin, Truck, AlertCircle, CheckCircle2, Globe } from 'lucide-react'
import { useCurrency } from '@/lib/contexts/CurrencyContext'

export function DeliveryChecker() {
  const [tab, setTab] = useState<'india' | 'intl'>('india')
  const [pincode, setPincode] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string, detail?: string } | null>(null)
  const { formatPrice } = useCurrency()

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
          detail: 'Estimated delivery in 3-5 business days. Free Shipping on prepaid orders.'
        })
      } else {
        setResult({ type: 'error', message: 'Invalid Pincode or delivery location not serviceable.' })
      }
    } catch (err) {
      setResult({ type: 'error', message: 'Failed to verify pincode. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const checkInternational = async () => {
    if (!country) {
      setResult({ type: 'error', message: 'Please select a destination country.' })
      return
    }
    setLoading(true)
    setTimeout(() => {
      setResult({
        type: 'success',
        message: `Worldwide Express Delivery available to this destination.`,
        detail: `Estimated delivery in 5-8 business days. International Shipping: ${formatPrice(1600)}.`
      })
      setLoading(false)
    }, 400)
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-[#F8F9FA] p-3.5 sm:p-4 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2 text-gray-900">
          <Truck className="w-4 h-4 text-[#FF7A00] shrink-0" />
          <h3 className="font-black tracking-wider uppercase text-[11px] sm:text-xs">Estimated Delivery</h3>
        </div>
        
        {/* Toggle Pills */}
        <div className="flex bg-gray-200/70 p-0.5 sm:p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button 
            type="button"
            onClick={() => { setTab('india'); setResult(null) }}
            className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-lg transition-all ${
              tab === 'india' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            🇮🇳 India
          </button>
          <button 
            type="button"
            onClick={() => { setTab('intl'); setResult(null) }}
            className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-lg transition-all ${
              tab === 'intl' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            🌐 International
          </button>
        </div>
      </div>

      {tab === 'india' ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] transition-colors bg-white text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <button 
              type="button"
              onClick={checkPincode}
              disabled={loading || pincode.length !== 6}
              className="px-6 py-2.5 rounded-xl bg-[#1C1C1C] text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40 hover:bg-[#FF7A00] transition-colors shadow-sm"
            >
              {loading ? 'Checking...' : 'Verify'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <select 
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] bg-white transition-colors uppercase text-gray-900"
            >
              <option value="">Select Country</option>
              <option value="US">🇺🇸 United States</option>
              <option value="GB">🇬🇧 United Kingdom</option>
              <option value="CA">🇨🇦 Canada</option>
              <option value="AU">🇦🇺 Australia</option>
              <option value="NZ">🇳🇿 New Zealand</option>
              <option value="AE">🇦🇪 United Arab Emirates</option>
              <option value="SG">🇸🇬 Singapore</option>
            </select>
            <button 
              type="button"
              onClick={checkInternational}
              disabled={loading || !country}
              className="px-6 py-2.5 rounded-xl bg-[#1C1C1C] text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40 hover:bg-[#FF7A00] transition-colors shadow-sm"
            >
              {loading ? 'Checking...' : 'Verify'}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className={`mt-3 p-3.5 rounded-xl text-xs flex gap-2.5 items-start ${
          result.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' 
            : 'bg-red-50 text-red-900 border border-red-100'
        }`}>
          {result.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold">{result.message}</p>
            {result.detail && <p className="mt-0.5 text-[11px] opacity-80">{result.detail}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
