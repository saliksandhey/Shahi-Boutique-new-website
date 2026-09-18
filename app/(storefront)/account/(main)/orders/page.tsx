import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { Package, Globe } from 'lucide-react'
import Link from 'next/link'
import { MobileBackNav } from '@/components/account/MobileBackNav'
import { PriceDisplay } from '@/components/storefront/PriceDisplay'

const COUNTRY_FLAGS: Record<string, string> = {
  IN: '🇮🇳', US: '🇺🇸', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺', AE: '🇦🇪', SA: '🇸🇦', SG: '🇸🇬', NZ: '🇳🇿', DE: '🇪🇺', QA: '🇶🇦', KW: '🇰🇼', MY: '🇲🇾'
}

export default async function OrdersPage() {
  const user = await requireAuth()
  const supabase = createAdminClient()

  const [domesticRes, intlRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, created_at, total_amount, payment_status, order_status, payment_method, country, tags')
      .eq('customer_email', user.email)
      .order('created_at', { ascending: false }),
    supabase
      .from('international_orders')
      .select('id, order_number, created_at, total_amount, payment_status, order_status, country, currency')
      .eq('customer_email', user.email)
      .order('created_at', { ascending: false })
  ])

  const domesticOrders = (domesticRes.data || []).map(o => ({ ...o, isInternational: false }))
  const internationalOrders = (intlRes.data || []).map(o => ({ ...o, isInternational: true }))

  const allOrders = [...internationalOrders, ...domesticOrders].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="space-y-6">
      <MobileBackNav />
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-lg font-black uppercase tracking-widest text-gray-900">All Orders &amp; Inquiries</h2>
      </div>

      <div className="space-y-4">
        {allOrders.length > 0 ? (
          allOrders.map((order) => {
            const isInternational = order.isInternational || order.country !== 'IN'
            const flag = COUNTRY_FLAGS[order.country] || '🌐'

            return (
              <div key={order.id} className="group border border-gray-100 hover:border-[#111111] rounded-2xl p-6 transition-all duration-300 bg-white">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        {isInternational && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[#FF7A00] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200/60">
                            <Globe className="w-3 h-3" />
                            <span>{flag} International</span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-black tracking-wide text-gray-900">Order #{order.order_number}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">Total</span>
                      <div className="text-sm font-black text-[#111111]"><PriceDisplay amount={order.total_amount} /></div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-[#111111] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white">
                      {order.order_status === 'PENDING_REVIEW' || (order.order_status === 'PENDING' && isInternational) 
                        ? 'Awaiting Concierge Quote' 
                        : order.order_status === 'QUOTE_SENT' 
                        ? 'Quote Ready · Review & Pay' 
                        : order.order_status === 'CONFIRMED' 
                        ? 'Confirmed & Paid' 
                        : order.order_status === 'PROCESSING' || order.order_status === 'PACKED'
                        ? 'In Tailoring' 
                        : order.order_status === 'SHIPPED' 
                        ? 'Dispatched' 
                        : order.order_status}
                    </span>
                    {isInternational && (order.order_status === 'PENDING_REVIEW' || order.order_status === 'PENDING') && (
                      <span className="text-[10px] text-amber-600 font-bold">
                        • Logistics concierge calculating DHL/FedEx rate
                      </span>
                    )}
                  </div>

                  <div className="mt-2 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
                    <Link href={`/account/orders/${order.id}`} className="flex items-center justify-center rounded-full border-2 border-[#111111] px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[#111111] hover:bg-[#111111] hover:text-white transition-colors w-full sm:w-auto">
                      View Details &amp; Timeline
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
            <Package className="mx-auto h-8 w-8 text-gray-300 mb-4" strokeWidth={1.5} />
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-2">No orders or inquiries</h3>
            <p className="text-xs text-gray-500 font-medium mb-6">You haven&apos;t placed any orders yet.</p>
            <div className="mt-6">
              <Link href="/shop" className="inline-flex items-center rounded-full bg-[#111111] px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-gray-800 transition-colors">
                Start shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
