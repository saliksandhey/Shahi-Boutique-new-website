'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCurrency, Currency, SUPPORTED_CURRENCIES } from '@/lib/contexts/CurrencyContext'
import { Globe, ChevronUp, Check } from 'lucide-react'

export function FloatingCurrencySelector() {
  const { currency, setCurrency } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  if (pathname?.startsWith('/2010admin') || pathname?.startsWith('/product') || pathname?.startsWith('/login') || pathname?.startsWith('/forgot-password') || pathname?.startsWith('/checkout')) {
    return null
  }

  const isProduct = pathname?.startsWith('/product')
  const currentInfo = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR
  const currencyList = Object.values(SUPPORTED_CURRENCIES)

  return (
    <div 
      ref={containerRef} 
      className={`fixed ${isProduct ? 'bottom-20 sm:bottom-6 left-4 sm:left-6 hidden sm:block' : 'bottom-6 left-4 sm:left-6'} z-30`}
    >
      {/* Dropdown Menu Popup (Upwards) */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-3 w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Select Region & Currency
            </p>
          </div>
          <div className="py-1 space-y-1 max-h-64 overflow-y-auto">
            {currencyList.map((item) => {
              const isSelected = item.code === currency
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setCurrency(item.code)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#1C1C1C] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-orange-50 hover:text-[#FF7A00]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{item.flag}</span>
                    <span className="truncate">{item.countryName} — {item.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#FF7A00]" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Floating Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/90 hover:bg-white text-gray-900 px-3.5 py-2 rounded-full border border-gray-200/80 shadow-lg hover:shadow-xl backdrop-blur-md transition-all duration-300 group hover:border-[#FF7A00]"
        title="Change Currency & Region"
      >
        <span className="text-sm leading-none">{currentInfo.flag}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-800 group-hover:text-[#FF7A00] transition-colors">
          {currentInfo.code} ({currentInfo.symbol})
        </span>
        <ChevronUp
          className={`w-3.5 h-3.5 text-gray-400 group-hover:text-[#FF7A00] transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-[#FF7A00]' : ''
          }`}
        />
      </button>
    </div>
  )
}
