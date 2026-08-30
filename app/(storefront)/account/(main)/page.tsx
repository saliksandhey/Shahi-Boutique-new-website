import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { Package, Heart, Clock, ChevronRight, User, MapPin, Calendar, LogOut } from 'lucide-react'
import Link from 'next/link'
import { signout } from '@/lib/actions/auth-email'
import { PriceDisplay } from '@/components/storefront/PriceDisplay';

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
    <div className="space-y-8 md:space-y-12">
      
      {/* Mobile Navigation Hub (App-like experience) */}
      <div className="lg:hidden -mx-4 sm:-mx-8 px-4 sm:px-8 bg-gray-50/50 border-y border-gray-100 py-6 mb-8">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 px-2">Quick Links</h2>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
          <Link href="/account/orders" className="flex items-center justify-between p-5 hover:bg-gray-50 active:bg-gray-100 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#111111]/5 flex items-center justify-center text-[#111111]">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-gray-900">My Orders</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/account/wishlist" className="flex items-center justify-between p-5 hover:bg-gray-50 active:bg-gray-100 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#111111]/5 flex items-center justify-center text-[#111111]">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-gray-900">Wishlist</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/account/addresses" className="flex items-center justify-between p-5 hover:bg-gray-50 active:bg-gray-100 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#111111]/5 flex items-center justify-center text-[#111111]">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-gray-900">Saved Addresses</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/account/appointments" className="flex items-center justify-between p-5 hover:bg-gray-50 active:bg-gray-100 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#111111]/5 flex items-center justify-center text-[#111111]">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-gray-900">Appointments</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/account/profile" className="flex items-center justify-between p-5 hover:bg-gray-50 active:bg-gray-100 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#111111]/5 flex items-center justify-center text-[#111111]">
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-gray-900">Profile Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <form action={signout}>
            <button type="submit" className="w-full flex items-center justify-between p-5 hover:bg-red-50 active:bg-red-100 transition-colors group text-red-600">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-widest">Sign Out</span>
              </div>
            </button>
          </form>
        </div>
      </div>

      {/* Stat Blocks */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-white border border-gray-200 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between hover:border-[#111111] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Package className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between mb-12 relative z-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-900 transition-colors">Total Orders</h3>
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#111111] group-hover:text-white transition-colors duration-500">
              <Package className="h-4 w-4" strokeWidth={2} />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-5xl md:text-6xl font-sans font-black tracking-tighter text-[#111111]">{ordersCount || 0}</div>
          </div>
        </div>
        
        <div className="bg-[#111111] border border-[#111111] text-white rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Heart className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between mb-12 relative z-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">Wishlist Items</h3>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-[#111111] transition-colors duration-500">
              <Heart className="h-4 w-4" strokeWidth={2} />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-5xl md:text-6xl font-sans font-black tracking-tighter text-white">{wishlistCount || 0}</div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div>
        <div className="flex items-end justify-between border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-sm md:text-base font-black uppercase tracking-widest text-gray-900">Recent Orders</h2>
          <Link href="/account/orders" className="text-[10px] font-bold uppercase tracking-widest text-[#FF7A00] hover:text-[#111111] transition-colors flex items-center group">
            View all <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link href={`/account/orders/${order.id}`} key={order.id} className="block group bg-white border border-gray-100 hover:border-[#111111] rounded-3xl p-5 sm:p-6 lg:p-8 transition-all duration-300 hover:shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                          {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${
                          order.order_status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                          order.order_status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-[#111111] text-white'
                        }`}>
                          {order.order_status}
                        </span>
                      </div>
                      <p className="text-lg font-black tracking-tighter text-gray-900 group-hover:text-[#FF7A00] transition-colors">
                        Order #{order.order_number}
                      </p>
                    </div>
                    <div className="sm:text-right flex items-center justify-between sm:block border-t border-gray-100 pt-4 sm:border-0 sm:pt-0 mt-2 sm:mt-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 sm:mb-1 block">Total Amount</span>
                      <div className="text-xl font-black text-[#111111]"><PriceDisplay amount={order.total_amount} /></div>
                    </div>
                  </div>
                </Link>
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

