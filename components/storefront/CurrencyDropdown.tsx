'use client'

import { useCurrency, Currency } from '@/lib/contexts/CurrencyContext'
import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

const currencies: Currency[] = ['INR', 'USD', 'GBP', 'EUR', 'AED', 'CAD', 'AUD']

const flags: Record<Currency, string> = {
  'INR': '🇮🇳',
  'USD': '🇺🇸',
  'GBP': '🇬🇧',
  'EUR': '🇪🇺',
  'AED': '🇦🇪',
  'CAD': '🇨🇦',
  'AUD': '🇦🇺'
}


export function CurrencyDropdown({ upwards = false, alignLeft = false }: { upwards?: boolean, alignLeft?: boolean } = {}) {
  const { currency, setCurrency } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-[10px] xl:text-[11px] font-semibold text-gray-500 hover:text-[#111111] transition-colors p-1"
      >
        <span className="text-[12px] md:text-[14px] leading-none">{flags[currency]}</span> {currency}
        <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      <div className={cn(
        "absolute bg-white border border-gray-100 shadow-xl min-w-[120px] py-2 transition-all duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] z-[110]",
        upwards ? "bottom-full mb-2" : "top-full mt-4",
        alignLeft ? "left-0" : "right-0",
        isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
      )}>
        {currencies.map(c => (
          <button
            key={c}
            onClick={() => {
              setCurrency(c)
              setIsOpen(false)
            }}
            className={cn(
              "w-full text-left px-6 py-2 text-[10px] xl:text-[11px] font-semibold transition-colors duration-200",
              currency === c ? "text-[#FF7A00] bg-orange-50/50" : "text-gray-500 hover:text-[#111111] hover:bg-gray-50"
            )}
          >
            <span className="text-[12px] md:text-[14px] leading-none">{flags[c]}</span> {c}
          </button>
        ))}
      </div>
    </div>
  )
}
