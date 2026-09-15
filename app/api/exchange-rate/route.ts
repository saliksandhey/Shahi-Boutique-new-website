import { NextResponse } from 'next/server'

// Cached rates in memory — refreshed every hour
let cachedRates: Record<string, number> | null = null
let cacheTime = 0
const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour

const FALLBACK_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  GBP: 0.0094,
  CAD: 0.016,
  AUD: 0.018,
  NZD: 0.020,
}

export async function GET() {
  const now = Date.now()

  // Return cached rates if still fresh
  if (cachedRates && now - cacheTime < CACHE_DURATION_MS) {
    return NextResponse.json(
      { rates: cachedRates, rate: cachedRates.USD, source: 'cache' },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' } }
    )
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/INR', { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error('Exchange rate fetch failed')
    const data = await res.json()
    const apiRates = data?.rates

    if (!apiRates || typeof apiRates !== 'object') throw new Error('Invalid rate data')

    const rates: Record<string, number> = {
      INR: 1,
      USD: typeof apiRates.USD === 'number' ? apiRates.USD : FALLBACK_RATES.USD,
      GBP: typeof apiRates.GBP === 'number' ? apiRates.GBP : FALLBACK_RATES.GBP,
      CAD: typeof apiRates.CAD === 'number' ? apiRates.CAD : FALLBACK_RATES.CAD,
      AUD: typeof apiRates.AUD === 'number' ? apiRates.AUD : FALLBACK_RATES.AUD,
      NZD: typeof apiRates.NZD === 'number' ? apiRates.NZD : FALLBACK_RATES.NZD,
    }

    cachedRates = rates
    cacheTime = now

    return NextResponse.json(
      { rates, rate: rates.USD, source: 'live' },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' } }
    )
  } catch {
    const fallback = cachedRates ?? FALLBACK_RATES
    return NextResponse.json(
      { rates: fallback, rate: fallback.USD, source: 'fallback' },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
