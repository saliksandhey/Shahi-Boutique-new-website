import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { Package, Heart, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function AccountDashboard() {
  const user = await requireAuth()
  const supabase = createAdminClient()

  const { data: customerProfile } = await supabase
    .from('customer_profiles')
    .select('name')
    .eq('email', user.email)
    .single()

  // Fetch counts
  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('customer_email', user.email)

  const { count: wishlistCount } = await supabase
    .from('wishlist')
    .select('*', { count: 'exact', head: true })
    .eq('user_email', user.email)

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, order_number, created_at, total_amount, order_status')
    .eq('customer_email', user.email)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="space-y-12">
      
      {/* Stat Blocks */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-[#F8F9FA] border border-gray-100 rounded-2xl p-6 lg:p-8 flex flex-col justify-between hover:border-[#111111] transition-colors duration-500">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Total Orders</h3>
            <Package className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
          </div>
          <div className="text-4xl md:text-5xl font-sans font-black tracking-tighter text-[#111111]">{ordersCount || 0}</div>
        </div>
        
        <div className="bg-[#F8F9FA] border border-gray-100 rounded-2xl p-6 lg:p-8 flex flex-col justify-between hover:border-[#111111] transition-colors duration-500">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Wishlist Items</h3>
            <Heart className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
          </div>
          <div className="text-4xl md:text-5xl font-sans font-black tracking-tighter text-[#111111]">{wishlistCount || 0}</div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div>
        <div className="flex items-end justify-between border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-lg font-black uppercase tracking-widest text-gray-900">Recent Orders</h2>
          <Link href="/account/orders" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#111111] transition-colors flex items-center group">
            View all <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
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
                        Details
                      </Link>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
              <Clock className="mx-auto h-8 w-8 text-gray-300 mb-4" strokeWidth={1.5} />
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-2">No orders yet</h3>
              <p className="text-xs text-gray-500 font-medium mb-6">When you place orders, they will appear here.</p>
              <Link href="/shop" className="inline-flex items-center rounded-full bg-[#111111] px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-gray-800 transition-colors">
                Start shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
