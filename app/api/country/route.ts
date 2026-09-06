import { NextRequest, NextResponse } from 'next/server'

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  IN: 'INR', CA: 'CAD', AU: 'AUD', NZ: 'NZD', US: 'USD'
}

export async function GET(req: NextRequest) {
  const country = req.headers.get('x-vercel-ip-country') || 'IN'
  const currency = COUNTRY_TO_CURRENCY[country] || 'INR'
  return NextResponse.json({ country, currency }, { headers: { 'Cache-Control': 'no-store' } })
}
