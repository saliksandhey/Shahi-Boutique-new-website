'use client'

import { useCurrency } from '@/lib/contexts/CurrencyContext'

export function PriceDisplay({ amount, className }: { amount: number, className?: string }) {
  const { formatPrice, currency, rates } = useCurrency()
  const formatted = formatPrice(amount)
  
  // To avoid hydration mismatch (server renders ₹, client renders $), 
  // we could just render the formatted string, but if hydration complains we might need to suppress it.
  return (
    <span className={className} suppressHydrationWarning>
      {formatted}
    </span>
  )
}
