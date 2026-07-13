import { createAdminClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export async function RecentOrdersTable() {
  const supabase = createAdminClient()
  
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, total_amount, order_status, created_at, profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(5)

  if (!orders || orders.length === 0) {
    return <div className="text-center p-6 border border-gray-200 rounded-xl text-sm text-gray-500 bg-white shadow-sm">No recent orders.</div>
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-gray-200 hover:bg-transparent">
              <TableHead className="text-gray-500 font-semibold text-xs">Order</TableHead>
              <TableHead className="text-gray-500 font-semibold text-xs">Customer</TableHead>
              <TableHead className="text-gray-500 font-semibold text-xs">Status</TableHead>
              <TableHead className="text-right text-gray-500 font-semibold text-xs">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                <TableCell className="font-medium">
                  <Link href={`/admin/orders/${order.id}`} className="hover:text-[#FF7A00] text-[#09090B] font-semibold transition-colors">
                    #{order.order_number}
                  </Link>
                </TableCell>
                <TableCell className="text-gray-600 font-medium">{(order.profiles as any)?.full_name || 'Guest'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs font-medium px-2 py-0.5 ${order.order_status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                    {order.order_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-[#09090B]">₹{order.total_amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {orders.map((order) => (
          <Link href={`/admin/orders/${order.id}`} key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-3 active:scale-[0.98] transition-transform">
            <div className="flex justify-between items-start">
              <span className="font-semibold text-[#09090B]">#{order.order_number}</span>
              <span className="text-xs text-gray-500 font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">{(order.profiles as any)?.full_name || 'Guest User'}</div>
            </div>
            <div className="flex justify-between items-end pt-3 mt-1 border-t border-gray-100">
              <Badge variant="outline" className={`text-xs font-medium px-2 py-0.5 ${order.order_status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                {order.order_status}
              </Badge>
              <div className="font-semibold text-[#09090B]">₹{order.total_amount}</div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
