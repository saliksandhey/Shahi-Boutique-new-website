import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Package } from 'lucide-react'

export default async function OrdersPage() {
  const user = await requireAuth()
  const supabase = createAdminClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, created_at, total_amount, payment_status, order_status')
    .eq('customer_email', user.email)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-lg font-black uppercase tracking-widest text-gray-900">All Orders</h2>
      </div>

      <div className="space-y-4">
        {orders && orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="group border border-gray-100 hover:border-[#111111] rounded-2xl p-6 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                    {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <p className="text-sm font-black tracking-wide text-gray-900">Order #{order.order_number}</p>
                </div>

                <div className="flex flex-col sm:items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Total</span>
                  <div className="text-sm font-black text-[#111111]">₹{order.total_amount}</div>
                </div>

                <div className="flex flex-col sm:items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Status</span>
                  <span className="inline-flex items-center rounded-full bg-[#111111] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white">
                    {order.order_status}
                  </span>
                </div>

                <div className="mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100">
                  <Link href={`/account/orders/${order.id}`} className="inline-flex items-center justify-center rounded-full border-2 border-[#111111] px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-[#111111] hover:bg-[#111111] hover:text-white transition-colors w-full sm:w-auto">
                    View Details
                  </Link>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
            <Package className="mx-auto h-8 w-8 text-gray-300 mb-4" strokeWidth={1.5} />
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-2">No orders</h3>
            <p className="text-xs text-gray-500 font-medium mb-6">You haven't placed any orders yet.</p>
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
