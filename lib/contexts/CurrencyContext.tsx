'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Currency = 'INR' | 'USD' | 'GBP' | 'EUR' | 'AED' | 'CAD' | 'AUD'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (c: Currency) => void
  rates: Record<string, number>
  formatPrice: (amountInInr: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  GBP: '£',
  EUR: '€',
  AED: 'د.إ',
  CAD: 'C$',
  AUD: 'A$'
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('INR')
  const [rates, setRates] = useState<Record<string, number>>({})

  useEffect(() => {
    // Load from local storage
    const saved = localStorage.getItem('preferred_currency') as Currency
    if (saved && Object.keys(CURRENCY_SYMBOLS).includes(saved)) {
      setCurrency(saved)
    }

    // Fetch live rates from Frankfurter (free, no key needed)
    async function fetchRates() {
      try {
        let res = await fetch('https://open.er-api.com/v6/latest/INR').catch(() => null);
        let data = res ? await res.json() : null;
        
        if (!data || data.result !== 'success') {
           res = await fetch('https://api.frankfurter.app/latest?from=INR').catch(() => null);
           data = res ? await res.json() : null;
        }
        
        if (data && data.rates) {
           if (data.rates.USD && !data.rates.AED) {
             data.rates.AED = data.rates.USD * 3.6725;
           }
           setRates(data.rates);
        } else {
           setRates({
             USD: 0.012,
             GBP: 0.0094,
             EUR: 0.011,
             AED: 0.044,
             CAD: 0.016,
             AUD: 0.018
           });
        }
      } catch (err) {
        setRates({
          USD: 0.012,
          GBP: 0.0094,
          EUR: 0.011,
          AED: 0.044,
          CAD: 0.016,
          AUD: 0.018
        });
      }
    }
    fetchRates()
  }, [])

  const handleSetCurrency = (c: Currency) => {
    setCurrency(c)
    localStorage.setItem('preferred_currency', c)
  }

  const formatPrice = (amountInInr: number) => {
    if (currency === 'INR' || !rates[currency]) {
      return `${CURRENCY_SYMBOLS['INR']}${Math.round(amountInInr)}`
    }
    const converted = amountInInr * rates[currency]
    return `${CURRENCY_SYMBOLS[currency]}${converted.toFixed(2)}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, rates, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
