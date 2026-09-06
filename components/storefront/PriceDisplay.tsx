'use client'

import { useCurrency } from '@/lib/contexts/CurrencyContext'

interface PriceDisplayProps {
  amount?: number
  product?: any
  className?: string
}

export function PriceDisplay({ amount, product, className }: PriceDisplayProps) {
  const { formatPrice, getProductPrice } = useCurrency()

  let formatted: string
  let formattedSale: string | null = null

  if (product) {
    const result = getProductPrice(product)
    formatted = result.formatted
    formattedSale = result.formattedSale
  } else {
    formatted = formatPrice(amount ?? 0)
  }

  if (formattedSale) {
    return (
      <span className={className} suppressHydrationWarning>
        <span className='text-[#FF7A00]'>{formattedSale}</span>{' '}
        <span className='line-through text-gray-400'>{formatted}</span>
      </span>
    )
  }

  return <span className={className} suppressHydrationWarning>{formatted}</span>
}
