import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { PaymentsClient } from '@/components/admin/PaymentsClient'
import { MarkPaidButton } from '@/components/admin/MarkPaidButton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  MessageSquare, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  CreditCard, 
  Globe, 
  DollarSign,
  ArrowUpRight
} from 'lucide-react'

const COUNTRY_FLAGS: Record<string, string> = {
  'IN': '🇮🇳 IN',
  'India': '🇮🇳 IN',
  'US': '🇺🇸 US',
  'United States': '🇺🇸 US',
  'GB': '🇬🇧 UK',
  'United Kingdom': '🇬🇧 UK',
  'CA': '🇨🇦 CA',
  'Canada': '🇨🇦 CA',
  'AU': '🇦🇺 AU',
  'Australia': '🇦🇺 AU',
  'NZ': '🇳🇿 NZ',
  'New Zealand': '🇳🇿 NZ',
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const statusFilter = typeof sp.status === 'string' ? sp.status : 'ALL'

  const supabase = createAdminClient()

  // 1. Fetch all orders for comprehensive stats calculation
  const { data: allOrders } = await supabase
    .from('orders')
    .select('id, total_amount, payment_status, payment_method, country, created_at')

  const totalCollected = (allOrders || [])
    .filter(o => o.payment_status === 'PAID')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)

  const todayDateStr = new Date().toISOString().split('T')[0]
  const todayRevenue = (allOrders || [])
    .filter(o => o.payment_status === 'PAID' && o.created_at?.startsWith(todayDateStr))
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)

  const paidCount = (allOrders || []).filter(o => o.payment_status === 'PAID').length
  const pendingCount = (allOrders || []).filter(o => o.payment_status === 'PENDING').length
  const internationalRevenue = (allOrders || [])
    .filter(o => o.payment_status === 'PAID' && o.country && o.country !== 'IN' && o.country !== 'India')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)

  // 2. Fetch filtered orders for the table
  let query = supabase
    .from('orders')
    .select('id, order_number, total_amount, subtotal, shipping_cost, discount_amount, payment_status, payment_method, created_at, customer_name, customer_email, customer_phone, country, cashfree_order_id, cashfree_payment_id, razorpay_order_id, razorpay_payment_id')
    .order('created_at', { ascending: false })

  if (statusFilter !== 'ALL') {
    query = query.eq('payment_status', statusFilter)
  }

  const { data: orders } = await query

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-5xl font-heading font-black tracking-widest text-gray-900 uppercase">
            Payments &amp; Revenue
          </h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest">
            Real-time online gateway transactions &amp; revenue tracking.
          </p>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected Revenue */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Total Collected</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              ₹{totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
              {paidCount} successful payments
            </p>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Today's Revenue</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              ₹{todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
              Settled today
            </p>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Pending Payments</span>
            <span className="p-2 rounded-xl bg-orange-50 text-orange-600">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              {pendingCount}
            </div>
            <p className="text-[10px] font-bold text-orange-600 mt-1 uppercase tracking-wider">
              Awaiting confirmation
            </p>
          </div>
        </div>

        {/* International Revenue */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">International Orders</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Globe className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              ₹{internationalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] font-bold text-purple-600 mt-1 uppercase tracking-wider">
              US, UK, CA, AU, NZ
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between pt-4">
        <PaymentsClient currentFilter={statusFilter} />
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:inline">
          Showing {orders?.length || 0} Records
        </span>
      </div>

      {/* Desktop Table View */}
      <div className="rounded-[2rem] border border-gray-100 bg-white shadow-sm overflow-hidden hidden md:block">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow className="border-gray-100 hover:bg-transparent">
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px] py-4">Order #</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Customer</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Region</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Gateway &amp; Ref ID</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Amount</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Payment Status</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Date</TableHead>
              <TableHead className="text-right text-gray-400 font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => {
              const flag = COUNTRY_FLAGS[order.country] || `🌐 ${order.country || 'IN'}`
              const transactionId = order.cashfree_payment_id || order.cashfree_order_id || order.razorpay_payment_id || order.razorpay_order_id || '—'
              const whatsappNumber = order.customer_phone?.replace(/\D/g, '') || ''
              const whatsappMsg = order.payment_status === 'PAID'
                ? `Hello ${order.customer_name}, we have received your payment of ₹${order.total_amount} for order #${order.order_number}. Thank you for shopping with Shahi Boutique!`
                : `Hello ${order.customer_name}, thank you for your order #${order.order_number}. Total amount is ₹${order.total_amount}. Please complete the payment to proceed with dispatch.`
              const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`

              return (
                <TableRow key={order.id} className="border-gray-100 hover:bg-gray-50/60 transition-colors">
                  <TableCell className="font-black text-gray-900 py-4">
                    <Link href={`/2010admin/orders/${order.id}`} className="hover:text-[#FF7A00] transition-colors inline-flex items-center gap-1 group">
                      <span>{order.order_number}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF7A00]" />
                    </Link>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-bold text-xs uppercase tracking-wider">{order.customer_name}</span>
                      <span className="text-gray-400 font-medium text-[10px]">{order.customer_email || order.customer_phone || '—'}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-800">
                      {flag}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                        {order.payment_method === 'CASHFREE' ? 'Cashfree PG' : order.payment_method === 'RAZORPAY' ? 'Razorpay' : order.payment_method}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 truncate max-w-[140px]" title={transactionId}>
                        {transactionId}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="font-black text-gray-900 text-sm">
                    ₹{Number(order.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={`text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-lg border-0 ${
                        order.payment_status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.payment_status === 'FAILED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.payment_status === 'PAID' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {order.payment_status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                      {order.payment_status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-gray-500 font-medium text-xs whitespace-nowrap">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '—'}
                  </TableCell>

                  <TableCell className="text-right space-x-2 whitespace-nowrap">
                    {order.customer_phone && (
                      <a 
                        href={whatsappLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center justify-center bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors w-8 h-8 rounded-full" 
                        title="Send WhatsApp Notification"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    )}
                    {order.payment_status === 'PENDING' && (
                      <MarkPaidButton orderId={order.id} />
                    )}
                  </TableCell>
                </TableRow>
              )
            })}

            {(!orders || orders.length === 0) && (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                  No payment transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {orders?.map((order) => {
          const flag = COUNTRY_FLAGS[order.country] || `🌐 ${order.country || 'IN'}`
          const transactionId = order.cashfree_payment_id || order.cashfree_order_id || order.razorpay_payment_id || order.razorpay_order_id || '—'
          const whatsappNumber = order.customer_phone?.replace(/\D/g, '') || ''
          const whatsappMsg = `Hello ${order.customer_name}, regarding order #${order.order_number} (Amount: ₹${order.total_amount}).`
          const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`

          return (
            <div key={order.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <Link href={`/2010admin/orders/${order.id}`} className="font-black text-gray-900 text-sm hover:text-[#FF7A00]">
                  {order.order_number}
                </Link>
                <Badge 
                  variant="outline"
                  className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-lg border-0 ${
                    order.payment_status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.payment_status === 'FAILED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {order.payment_status}
                </Badge>
              </div>

              <div className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-gray-900 uppercase">{order.customer_name}</p>
                  <p className="text-gray-400 text-[10px]">{order.customer_phone || order.customer_email || '—'}</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                  {flag}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block">Amount</span>
                  <span className="text-sm font-black text-gray-900">
                    ₹{Number(order.total_amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {order.customer_phone && (
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#25D366]/10 text-[#25D366] rounded-full">
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  )}
                  {order.payment_status === 'PENDING' && (
                    <MarkPaidButton orderId={order.id} />
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {(!orders || orders.length === 0) && (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest border border-gray-100">
            No transactions found
          </div>
        )}
      </div>
    </div>
  )
}
