import { createAdminClient } from '@/lib/supabase/server'
import { RecentOrdersTable } from '@/components/admin/RecentOrdersTable'
import {
  IndianRupee, Users, Package, ShoppingCart,
  TrendingUp, Clock, CheckCircle, AlertCircle,
  Star, Calendar, MessageSquare, BarChart3
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = createAdminClient()

  const [
    { count: customersCount },
    { count: productsCount },
    { count: ordersCount },
    { count: pendingCount },
    { count: confirmedCount },
    { count: deliveredCount },
    { data: revenueData },
    { data: topProductsData },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'CUSTOMER'),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'PENDING'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).in('order_status', ['CONFIRMED', 'PROCESSING']),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'DELIVERED'),
    supabase.from('orders').select('total_amount').in('payment_status', ['paid', 'PAID', 'Paid']),
    supabase.rpc('get_top_products', { limit_num: 5 }),
    supabase.from('orders').select('id, order_number, total_amount, order_status, payment_status, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  // Revenue always in INR (stored as INR in DB)
  const totalRevenue = revenueData?.reduce((s, o) => s + Number(o.total_amount), 0) || 0
  const formatINR = (n: number) => '\u20b9' + Math.round(n).toLocaleString('en-IN')

  const statusColor: Record<string, string> = {
    PENDING:    'bg-yellow-50 text-yellow-700 border border-yellow-200',
    CONFIRMED:  'bg-blue-50 text-blue-700 border border-blue-200',
    PROCESSING: 'bg-purple-50 text-purple-700 border border-purple-200',
    SHIPPED:    'bg-indigo-50 text-indigo-700 border border-indigo-200',
    DELIVERED:  'bg-green-50 text-green-700 border border-green-200',
    CANCELLED:  'bg-red-50 text-red-700 border border-red-200',
  }

  return (
    <div className='min-h-screen bg-[#FAFAFA]'>
      {/* Page header */}
      <div className='mb-8'>
        <div className='flex items-center gap-3 mb-1'>
          <div className='w-1 h-8 bg-[#FF7A00] rounded-full' />
          <h1 className='text-2xl font-black tracking-tight text-[#09090B]'>Dashboard</h1>
        </div>
        <p className='text-sm text-gray-400 ml-4 font-medium tracking-wide'>
          Welcome back — here's what's happening today.
        </p>
      </div>

      {/* Revenue Hero Card */}
      <div className='mb-6 rounded-3xl bg-[#111111] text-white p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl overflow-hidden relative'>
        <div className='absolute inset-0 opacity-10' style={{backgroundImage: 'radial-gradient(circle at 70% 50%, #FF7A00 0%, transparent 60%)'}} />
        <div className='relative z-10'>
          <p className='text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2'>Total Revenue (INR)</p>
          <div className='text-5xl font-black text-white tracking-tight'>
            {formatINR(totalRevenue)}
          </div>
          <p className='text-xs text-gray-500 mt-2 font-medium'>All paid orders · Always displayed in Indian Rupees</p>
        </div>
        <div className='relative z-10 flex flex-col items-start md:items-end gap-3'>
          <div className='flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-3 border border-white/10'>
            <TrendingUp className='w-4 h-4 text-[#FF7A00]' />
            <span className='text-sm font-bold text-white'>{ordersCount || 0} Total Orders</span>
          </div>
          <div className='flex items-center gap-2 bg-yellow-500/10 rounded-2xl px-4 py-3 border border-yellow-500/20'>
            <Clock className='w-4 h-4 text-yellow-400' />
            <span className='text-sm font-bold text-yellow-300'>{pendingCount || 0} Pending</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        {[
          { label: 'Total Orders',    value: ordersCount    || 0, icon: ShoppingCart, color: 'text-blue-500',   bg: 'bg-blue-50',   href: '/2010admin/orders' },
          { label: 'Customers',       value: customersCount || 0, icon: Users,        color: 'text-violet-500', bg: 'bg-violet-50', href: '/2010admin/customers' },
          { label: 'Products',        value: productsCount  || 0, icon: Package,      color: 'text-emerald-500',bg: 'bg-emerald-50',href: '/2010admin/products' },
          { label: 'Delivered',       value: deliveredCount || 0, icon: CheckCircle,  color: 'text-green-500',  bg: 'bg-green-50',  href: '/2010admin/orders' },
        ].map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className='group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300'>
            <div className='flex items-center justify-between mb-4'>
              <p className='text-xs font-bold uppercase tracking-widest text-gray-400'>{label}</p>
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className='text-3xl font-black text-[#09090B]'>{value.toLocaleString()}</p>
          </Link>
        ))}
      </div>

      {/* Order Status Row */}
      <div className='grid grid-cols-3 gap-4 mb-8'>
        <div className='bg-white rounded-2xl border border-yellow-100 p-5 shadow-sm'>
          <div className='flex items-center gap-2 mb-1'>
            <Clock className='w-4 h-4 text-yellow-500' />
            <p className='text-xs font-bold uppercase tracking-widest text-gray-400'>Pending</p>
          </div>
          <p className='text-2xl font-black text-yellow-600'>{pendingCount || 0}</p>
        </div>
        <div className='bg-white rounded-2xl border border-blue-100 p-5 shadow-sm'>
          <div className='flex items-center gap-2 mb-1'>
            <BarChart3 className='w-4 h-4 text-blue-500' />
            <p className='text-xs font-bold uppercase tracking-widest text-gray-400'>Confirmed</p>
          </div>
          <p className='text-2xl font-black text-blue-600'>{confirmedCount || 0}</p>
        </div>
        <div className='bg-white rounded-2xl border border-green-100 p-5 shadow-sm'>
          <div className='flex items-center gap-2 mb-1'>
            <CheckCircle className='w-4 h-4 text-green-500' />
            <p className='text-xs font-bold uppercase tracking-widest text-gray-400'>Delivered</p>
          </div>
          <p className='text-2xl font-black text-green-600'>{deliveredCount || 0}</p>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12'>
        {/* Recent Orders */}
        <div>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-base font-black uppercase tracking-widest text-[#09090B]'>Recent Orders</h2>
            <Link href='/2010admin/orders' className='text-xs font-bold text-[#FF7A00] hover:text-orange-600 uppercase tracking-widest'>View All</Link>
          </div>
          <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
            {recentOrders && recentOrders.length > 0 ? (
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-gray-50'>
                    <th className='text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400'>Order</th>
                    <th className='text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400'>Status</th>
                    <th className='text-right p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400'>Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-50'>
                  {recentOrders.map((o: any) => (
                    <tr key={o.id} className='hover:bg-gray-50/50 transition-colors'>
                      <td className='p-4'>
                        <Link href={`/2010admin/orders/${o.id}`} className='font-bold text-[#09090B] hover:text-[#FF7A00] transition-colors text-xs'>
                          {o.order_number || o.id.slice(0,8).toUpperCase()}
                        </Link>
                      </td>
                      <td className='p-4'>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColor[o.order_status] || 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                          {o.order_status}
                        </span>
                      </td>
                      <td className='p-4 text-right font-black text-[#09090B] text-sm'>
                        {formatINR(Number(o.total_amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className='p-8 text-center text-sm text-gray-400 font-medium'>No orders yet.</div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-base font-black uppercase tracking-widest text-[#09090B]'>Top Products</h2>
            <Link href='/2010admin/products' className='text-xs font-bold text-[#FF7A00] hover:text-orange-600 uppercase tracking-widest'>View All</Link>
          </div>
          <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
            {topProductsData && topProductsData.length > 0 ? (
              <ul className='divide-y divide-gray-50'>
                {topProductsData.map((prod: any, i: number) => (
                  <li key={i} className='flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors'>
                    <div className='w-8 h-8 rounded-xl bg-[#111111] flex items-center justify-center font-black text-xs text-white shrink-0'>
                      {i + 1}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='font-bold text-[#09090B] text-sm truncate'>{prod.product_name}</p>
                    </div>
                    <span className='text-[10px] font-black px-3 py-1.5 rounded-full bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/20 shrink-0'>
                      {prod.total_sold} sold
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className='p-8 text-center'>
                <Package className='w-8 h-8 text-gray-200 mx-auto mb-2' />
                <p className='text-sm text-gray-400 font-medium'>Not enough data available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
