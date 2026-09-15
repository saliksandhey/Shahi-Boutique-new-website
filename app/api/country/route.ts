import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const country = (req.headers.get('x-vercel-ip-country') || 'IN').toUpperCase()
  // India -> INR, Outside India -> USD
  const currency = country === 'IN' ? 'INR' : 'USD'
  return NextResponse.json({ country, currency }, { headers: { 'Cache-Control': 'no-store' } })
}
