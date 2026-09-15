import { NextResponse } from 'next/server'

// Cached rate in memory — refreshed every hour
let cachedRate: number | null = null
let cacheTime = 0
const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour

export async function GET() {
  const now = Date.now()

  // Return cached rate if still fresh
  if (cachedRate && now - cacheTime < CACHE_DURATION_MS) {
    return NextResponse.json(
      { rate: cachedRate, source: 'cache' },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' } }
    )
  }

  try {
    // Free API — no key required, reliable uptime
    const res = await fetch('https://open.er-api.com/v6/latest/INR', { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error('Exchange rate fetch failed')
    const data = await res.json()
    const usdRate = data?.rates?.USD

    if (!usdRate || typeof usdRate !== 'number') throw new Error('Invalid rate data')

    cachedRate = usdRate
    cacheTime = now

    return NextResponse.json(
      { rate: usdRate, source: 'live' },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' } }
    )
  } catch {
    // Fallback to approximate rate if API is down
    const fallback = cachedRate ?? 0.012
    return NextResponse.json(
      { rate: fallback, source: 'fallback' },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
