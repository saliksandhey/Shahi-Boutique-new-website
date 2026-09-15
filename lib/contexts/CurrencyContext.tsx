'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type Currency = 'INR' | 'USD' | 'GBP' | 'CAD' | 'AUD' | 'NZD'

export interface CurrencyInfo {
  code: Currency
  countryCode: string
  symbol: string
  label: string
  countryName: string
  flag: string
  displayLabel: string
}

export const SUPPORTED_CURRENCIES: Record<Currency, CurrencyInfo> = {
  INR: {
    code: 'INR',
    countryCode: 'IN',
    symbol: '₹',
    label: 'INR ₹',
    countryName: 'India',
    flag: '🇮🇳',
    displayLabel: '🇮🇳 India — INR ₹'
  },
  USD: {
    code: 'USD',
    countryCode: 'US',
    symbol: '$',
    label: 'USD $',
    countryName: 'United States',
    flag: '🇺🇸',
    displayLabel: '🇺🇸 United States — USD $'
  },
  GBP: {
    code: 'GBP',
    countryCode: 'GB',
    symbol: '£',
    label: 'GBP £',
    countryName: 'United Kingdom',
    flag: '🇬🇧',
    displayLabel: '🇬🇧 United Kingdom — GBP £'
  },
  CAD: {
    code: 'CAD',
    countryCode: 'CA',
    symbol: 'C$',
    label: 'CAD C$',
    countryName: 'Canada',
    flag: '🇨🇦',
    displayLabel: '🇨🇦 Canada — CAD C$'
  },
  AUD: {
    code: 'AUD',
    countryCode: 'AU',
    symbol: 'A$',
    label: 'AUD A$',
    countryName: 'Australia',
    flag: '🇦🇺',
    displayLabel: '🇦🇺 Australia — AUD A$'
  },
  NZD: {
    code: 'NZD',
    countryCode: 'NZ',
    symbol: 'NZ$',
    label: 'NZD NZ$',
    countryName: 'New Zealand',
    flag: '🇳🇿',
    displayLabel: '🇳🇿 New Zealand — NZD NZ$'
  }
}

export const COUNTRY_CODE_TO_CURRENCY: Record<string, Currency> = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
}

export const CURRENCY_TO_COUNTRY_CODE: Record<Currency, string> = {
  INR: 'IN',
  USD: 'US',
  GBP: 'GB',
  CAD: 'CA',
  AUD: 'AU',
  NZD: 'NZ',
}

interface CurrencyContextType {
  currency: Currency
  currencyInfo: CurrencyInfo
  rates: Record<Currency, number>
  setCurrency: (c: Currency) => void
  formatPrice: (amountInInr: number) => string
  getProductPrice: (product: any) => { price: number; salePrice: number | null; formatted: string; formattedSale: string | null }
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const DEFAULT_RATES: Record<Currency, number> = {
  INR: 1,
  USD: 0.012,
  GBP: 0.0094,
  CAD: 0.016,
  AUD: 0.018,
  NZD: 0.020,
}

function formatAmount(amount: number, cur: Currency): string {
  const info = SUPPORTED_CURRENCIES[cur] || SUPPORTED_CURRENCIES.INR
  if (cur === 'INR') {
    return info.symbol + Math.round(amount).toLocaleString('en-IN')
  }
  return info.symbol + amount.toFixed(2)
}

export function CurrencyProvider({ children, initialCountry }: { children: React.ReactNode; initialCountry?: string }) {
  const [currency, setCurrencyState] = useState<Currency>('INR')
  const [rates, setRates] = useState<Record<Currency, number>>(DEFAULT_RATES)
  const [isLoading, setIsLoading] = useState(true)

  const setCurrency = useCallback((newCur: Currency) => {
    if (SUPPORTED_CURRENCIES[newCur]) {
      setCurrencyState(newCur)
      try {
        localStorage.setItem('shahi_currency', newCur)
      } catch {
        // ignore
      }
    }
  }, [])

  useEffect(() => {
    async function initCurrencyAndRates() {
      try {
        // 1. Check if user already manually selected a currency in localStorage
        let savedCurrency: Currency | null = null
        try {
          savedCurrency = (localStorage.getItem('shahi_currency') as Currency) || null
        } catch {
          savedCurrency = null
        }

        // 2. Fetch live rates
        const ratePromise = fetch('/api/exchange-rate').then(r => r.ok ? r.json() : null)
        
        // 3. Fetch country if no saved currency
        const countryPromise = savedCurrency
          ? Promise.resolve(null)
          : (initialCountry 
              ? Promise.resolve({ country: initialCountry }) 
              : fetch('/api/country').then(r => r.ok ? r.json() : null))

        const [rateRes, countryRes] = await Promise.allSettled([ratePromise, countryPromise])

        if (rateRes.status === 'fulfilled' && rateRes.value?.rates) {
          setRates(prev => ({ ...prev, ...rateRes.value.rates }))
        }

        if (savedCurrency && SUPPORTED_CURRENCIES[savedCurrency]) {
          setCurrencyState(savedCurrency)
        } else if (countryRes.status === 'fulfilled' && countryRes.value) {
          const detectedCountry = countryRes.value.country?.toUpperCase() || ''
          const mapped = COUNTRY_CODE_TO_CURRENCY[detectedCountry] || 'USD'
          setCurrencyState(mapped)
        }
      } catch {
        // stays fallback
      } finally {
        setIsLoading(false)
      }
    }

    initCurrencyAndRates()
  }, [initialCountry])

  const formatPrice = useCallback((amountInInr: number): string => {
    if (amountInInr == null || isNaN(amountInInr)) return '₹0'
    const rate = rates[currency] || DEFAULT_RATES[currency] || 1
    const converted = currency === 'INR' ? amountInInr : amountInInr * rate
    return formatAmount(converted, currency)
  }, [currency, rates])

  const getProductPrice = useCallback((product: any) => {
    if (!product) return { price: 0, salePrice: null, formatted: '₹0', formattedSale: null }

    const basePrice = Number(product.price_inr ?? product.price ?? 0)
    const baseSale = (product.sale_price_inr !== undefined && product.sale_price_inr !== null && Number(product.sale_price_inr) > 0)
      ? Number(product.sale_price_inr)
      : (product.sale_price !== undefined && product.sale_price !== null && Number(product.sale_price) > 0)
        ? Number(product.sale_price)
        : null

    const rate = rates[currency] || DEFAULT_RATES[currency] || 1
    const currentPrice = currency === 'INR' ? basePrice : basePrice * rate
    const currentSale = baseSale ? (currency === 'INR' ? baseSale : baseSale * rate) : null

    return {
      price: currentPrice,
      salePrice: currentSale,
      formatted: formatAmount(currentPrice, currency),
      formattedSale: currentSale ? formatAmount(currentSale, currency) : null
    }
  }, [currency, rates])

  const currencyInfo = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR

  return (
    <CurrencyContext.Provider value={{
      currency,
      currencyInfo,
      rates,
      setCurrency,
      formatPrice,
      getProductPrice,
      isLoading
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
