import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OrderFilters } from '@/components/admin/OrderFilters'
import { OrderDetailsView } from '@/components/admin/OrderDetailsView'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q : ''
  const statusFilter = typeof sp.status === 'string' ? sp.status : 'ALL'

  const supabase = createAdminClient()
  let query = supabase
    .from('orders')
    .select('id, order_number, total_amount, order_status, payment_status, created_at, customer_name, customer_email')
    .order('created_at', { ascending: false })

  if (statusFilter !== 'ALL') {
    if (statusFilter === 'UNFULFILLED') {
      query = query.in('order_status', ['PENDING', 'CONFIRMED', 'PACKED'])
    } else if (statusFilter === 'PAID') {
      query = query.eq('payment_status', 'PAID')
    } else if (statusFilter === 'RETURNS') {
      query = query.in('order_status', ['RETURNED', 'REFUNDED'])
    } else {
      query = query.eq('order_status', statusFilter)
    }
  } else {
    // If ALL, exclude DELIVERED
    query = query.neq('order_status', 'DELIVERED')
  }

  if (q) {
    query = query.ilike('order_number', `%${q}%`)
  }

  const { data: orders } = await query

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-5xl font-heading font-black tracking-widest text-gray-900 uppercase">Orders</h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest">Manage customer orders and fulfillment.</p>
        </div>
        <div className="flex gap-2">
          {/* Export to CSV would go here */}
          <Button variant="outline" className="rounded-full shadow-sm font-bold uppercase tracking-widest text-[10px] hover:bg-[#1C1C1C] hover:text-white transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <OrderFilters />

      <div className="rounded-[2rem] border border-gray-100 bg-white shadow-sm overflow-hidden hidden md:block">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-gray-100 hover:bg-transparent">
              <TableHead className="w-12 text-center">
                <input type="checkbox" className="rounded border-gray-300" disabled />
              </TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Order #</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Date</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Customer</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Payment</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Status</TableHead>
              <TableHead className="text-right text-gray-400 font-black uppercase tracking-widest text-[10px]">Total</TableHead>
              <TableHead className="text-right text-gray-400 font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                <TableCell className="text-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                </TableCell>
                <TableCell className="font-black text-gray-900">
                  <Link href={`/2010admin/orders/${order.id}`} className="hover:text-[#FF7A00] transition-colors">
                    {order.order_number}
                  </Link>
                </TableCell>
                <TableCell className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="text-sm font-bold text-gray-900">{order.customer_name || 'Guest'}</div>
                  <div className="text-[10px] font-bold text-gray-400">{order.customer_email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[9px] uppercase font-bold tracking-wider shadow-sm ${
                    order.payment_status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    order.payment_status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' : 
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {order.payment_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[9px] uppercase font-bold tracking-wider shadow-sm ${
                    order.order_status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    order.order_status === 'CANCELLED' || order.order_status === 'RETURNED' ? 'bg-red-50 text-red-700 border-red-200' :
                    order.order_status === 'SHIPPED' || order.order_status === 'DISPATCHED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {order.order_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-black text-gray-900">₹{order.total_amount}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild className="hover:text-[#FF7A00] hover:bg-[#FF7A00]/10 rounded-full transition-colors h-8 w-8">
                    <Link href={`/2010admin/orders/${order.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!orders?.length && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {orders?.map((order) => (
          <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <Link href={`/2010admin/orders/${order.id}`} className="font-black text-gray-900 hover:text-[#FF7A00] transition-colors">
                {order.order_number}
              </Link>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {new Date(order.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <div>
              <div className="text-sm font-bold text-gray-900">{order.customer_name || 'Guest'}</div>
              <div className="text-[10px] font-bold text-gray-400">{order.customer_email}</div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-[9px] uppercase font-bold tracking-wider shadow-sm ${
                order.payment_status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                order.payment_status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' : 
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {order.payment_status}
              </Badge>
              <Badge variant="outline" className={`text-[9px] uppercase font-bold tracking-wider shadow-sm ${
                order.order_status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                order.order_status === 'CANCELLED' || order.order_status === 'RETURNED' ? 'bg-red-50 text-red-700 border-red-200' :
                order.order_status === 'SHIPPED' || order.order_status === 'DISPATCHED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-gray-50 text-gray-600 border-gray-200'
              }`}>
                {order.order_status}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-50">
              <span className="font-black text-lg text-gray-900">₹{order.total_amount}</span>
              <Button variant="outline" size="sm" asChild className="rounded-full shadow-sm text-[10px] uppercase tracking-widest font-bold">
                <Link href={`/2010admin/orders/${order.id}`}>View Order</Link>
              </Button>
            </div>
          </div>
        ))}
        {!orders?.length && (
          <div className="p-8 text-center text-[10px] uppercase tracking-widest font-bold text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
            No orders found.
          </div>
        )}
      </div>
    </div>
  )
}
