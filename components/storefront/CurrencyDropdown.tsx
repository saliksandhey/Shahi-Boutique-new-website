'use client'

import { useCurrency, Currency, SUPPORTED_CURRENCIES } from '@/lib/contexts/CurrencyContext'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// Note: This component is kept for legacy compatibility but is no longer rendered in the UI.
// Currency is now auto-detected via IP geolocation.
export function CurrencyDropdown({ upwards, alignLeft }: { upwards?: boolean; alignLeft?: boolean } = {}) {
  const { currency, currencyInfo } = useCurrency()
  return (
    <span className='text-sm font-bold text-gray-700'>
      {currencyInfo.flag} {currency}
    </span>
  )
}
