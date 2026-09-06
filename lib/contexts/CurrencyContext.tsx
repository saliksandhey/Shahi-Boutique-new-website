'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Currency = 'INR' | 'CAD' | 'AUD' | 'NZD' | 'USD'

export interface CurrencyInfo { code: Currency; symbol: string; label: string; flag: string }

export const SUPPORTED_CURRENCIES: Record<Currency, CurrencyInfo> = {
  INR: { code: 'INR', symbol: '₹',   label: 'Indian Rupee',       flag: '🇮🇳' },
  CAD: { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar',    flag: '🇨🇦' },
  AUD: { code: 'AUD', symbol: 'A$',  label: 'Australian Dollar',  flag: '🇦🇺' },
  NZD: { code: 'NZD', symbol: 'NZ$', label: 'New Zealand Dollar', flag: '🇳🇿' },
  USD: { code: 'USD', symbol: '$',   label: 'US Dollar',          flag: '🇺🇸' },
}

const COUNTRY_TO_CURRENCY: Record<string, Currency> = { IN: 'INR', CA: 'CAD', AU: 'AUD', NZ: 'NZD', US: 'USD' }

interface CurrencyContextType {
  currency: Currency
  currencyInfo: CurrencyInfo
  formatPrice: (amountInInr: number) => string
  getProductPrice: (product: any) => { price: number; salePrice: number | null; formatted: string; formattedSale: string | null }
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

function formatAmount(amount: number, currency: Currency): string {
  const info = SUPPORTED_CURRENCIES[currency]
  if (currency === 'INR') return info.symbol + Math.round(amount).toLocaleString('en-IN')
  return info.symbol + amount.toFixed(2)
}

const FALLBACK_RATES: Record<Currency, number> = { INR: 1, CAD: 0.016, AUD: 0.018, NZD: 0.020, USD: 0.012 }

export function CurrencyProvider({ children, initialCountry }: { children: React.ReactNode; initialCountry?: string }) {
  const [currency, setCurrency] = useState<Currency>('INR')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function detectCurrency() {
      try {
        if (initialCountry && COUNTRY_TO_CURRENCY[initialCountry]) {
          setCurrency(COUNTRY_TO_CURRENCY[initialCountry])
          setIsLoading(false)
          return
        }
        const res = await fetch('/api/country')
        if (res.ok) {
          const data = await res.json()
          if (data.currency && SUPPORTED_CURRENCIES[data.currency as Currency]) {
            setCurrency(data.currency as Currency)
          }
        }
      } catch { /* stays INR */ } finally { setIsLoading(false) }
    }
    detectCurrency()
  }, [initialCountry])

  const formatPrice = (amountInInr: number): string => {
    if (currency === 'INR') return formatAmount(amountInInr, 'INR')
    return formatAmount(amountInInr * FALLBACK_RATES[currency], currency)
  }

  const getProductPrice = (product: any) => {
    const key = currency.toLowerCase()
    const explicitPrice = product['price_' + key] ?? null
    const explicitSale = product['sale_price_' + key] ?? null
    let price; let salePrice
    if (explicitPrice !== null && explicitPrice > 0) {
      price = explicitPrice
      salePrice = (explicitSale && explicitSale > 0) ? explicitSale : null
    } else {
      const base = product.price_inr ?? product.price ?? 0
      const baseSale = product.sale_price_inr ?? product.sale_price ?? null
      price = base * FALLBACK_RATES[currency]
      salePrice = baseSale ? baseSale * FALLBACK_RATES[currency] : null
    }
    return { price, salePrice, formatted: formatAmount(price, currency), formattedSale: salePrice ? formatAmount(salePrice, currency) : null }
  }

  return (
    <CurrencyContext.Provider value={{ currency, currencyInfo: SUPPORTED_CURRENCIES[currency], formatPrice, getProductPrice, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
