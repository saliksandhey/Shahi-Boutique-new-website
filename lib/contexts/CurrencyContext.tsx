'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Currency = 'INR' | 'USD'

export interface CurrencyInfo { code: Currency; symbol: string; label: string; flag: string }

export const SUPPORTED_CURRENCIES: Record<Currency, CurrencyInfo> = {
  INR: { code: 'INR', symbol: '₹', label: 'Indian Rupee', flag: '🇮🇳' },
  USD: { code: 'USD', symbol: '$', label: 'US Dollar',    flag: '🇺🇸' },
}

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

const FALLBACK_RATE_USD = 0.012 // used only if live rate fetch fails

export function CurrencyProvider({ children, initialCountry }: { children: React.ReactNode; initialCountry?: string }) {
  const [currency, setCurrency] = useState<Currency>('INR')
  const [usdRate, setUsdRate] = useState<number>(FALLBACK_RATE_USD)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function detectCurrencyAndRate() {
      try {
        // Fetch country + exchange rate in parallel
        const countryFetch = initialCountry
          ? Promise.resolve({ currency: initialCountry.toUpperCase() === 'IN' ? 'INR' : 'USD' })
          : fetch('/api/country').then(r => r.ok ? r.json() : null)

        const [countryRes, rateRes] = await Promise.allSettled([
          countryFetch,
          fetch('/api/exchange-rate').then(r => r.ok ? r.json() : null),
        ])

        if (countryRes.status === 'fulfilled' && countryRes.value) {
          const c = countryRes.value.currency
          if (c === 'USD' || c === 'INR') setCurrency(c)
        }

        if (rateRes.status === 'fulfilled' && rateRes.value?.rate) {
          setUsdRate(rateRes.value.rate)
        }
      } catch { /* stays INR + fallback rate */ } finally { setIsLoading(false) }
    }
    detectCurrencyAndRate()
  }, [initialCountry])

  const formatPrice = (amountInInr: number): string => {
    if (currency === 'INR') return formatAmount(amountInInr, 'INR')
    return formatAmount(amountInInr * usdRate, 'USD')
  }

  const getProductPrice = (product: any) => {
    if (!product) return { price: 0, salePrice: null, formatted: '₹0', formattedSale: null }
    
    if (currency === 'INR') {
      const price = product.price_inr ?? product.price ?? 0
      const salePrice = (product.sale_price_inr !== undefined && product.sale_price_inr !== null)
        ? product.sale_price_inr
        : product.sale_price
      return {
        price,
        salePrice: salePrice && salePrice > 0 ? salePrice : null,
        formatted: formatAmount(price, 'INR'),
        formattedSale: salePrice && salePrice > 0 ? formatAmount(salePrice, 'INR') : null
      }
    } else {
      // USD for outside India
      const explicitUsdPrice = product.price_usd
      const explicitUsdSale = product.sale_price_usd
      let price: number
      let salePrice: number | null

      if (explicitUsdPrice !== undefined && explicitUsdPrice !== null && Number(explicitUsdPrice) > 0) {
        price = Number(explicitUsdPrice)
        // If explicit USD sale price set, use it; otherwise convert INR sale price to USD
        if (explicitUsdSale !== undefined && explicitUsdSale !== null && Number(explicitUsdSale) > 0) {
          salePrice = Number(explicitUsdSale)
        } else {
          const baseSale = product.sale_price_inr ?? product.sale_price ?? null
          salePrice = (baseSale && Number(baseSale) > 0) ? Number(baseSale) * usdRate : null
        }
      } else {
        // No explicit USD price — convert INR price + INR sale price both to USD using live rate
        const base = product.price_inr ?? product.price ?? 0
        const baseSale = product.sale_price_inr ?? product.sale_price ?? null
        price = base * usdRate
        salePrice = (baseSale && Number(baseSale) > 0) ? Number(baseSale) * usdRate : null
      }
      return {
        price,
        salePrice,
        formatted: formatAmount(price, 'USD'),
        formattedSale: salePrice ? formatAmount(salePrice, 'USD') : null
      }
    }
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
