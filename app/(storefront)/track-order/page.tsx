import { Suspense } from 'react'
import { Metadata } from 'next'
import { TrackOrderClient } from '@/components/storefront/TrackOrderClient'
import { RefreshCw } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Track Your Order | Shahi Boutique',
  description: 'Live order tracking for your handcrafted bespoke garments and bridal couture from Shahi Boutique.',
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center py-24 space-y-4">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-[#5E1218] animate-spin" />
            <span className="text-xs uppercase font-bold tracking-widest text-gray-700">Loading Order Tracker...</span>
          </div>
        </div>
      }
    >
      <TrackOrderClient />
    </Suspense>
  )
}
