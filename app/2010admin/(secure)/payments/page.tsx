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
import { MessageSquare, ExternalLink, CheckCircle } from 'lucide-react'

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const statusFilter = typeof sp.status === 'string' ? sp.status : 'PENDING'

  const supabase = createAdminClient()
  let query = supabase
    .from('orders')
    .select('id, order_number, total_amount, payment_status, payment_method, created_at, customer_name, customer_phone')
    .eq('payment_method', 'COD')
    .order('created_at', { ascending: false })

  if (statusFilter !== 'ALL') {
    query = query.eq('payment_status', statusFilter)
  }

  // Fetch the items for each order to include in the message
  const { data: orders } = await query

  const ordersWithItems = await Promise.all((orders || []).map(async (order) => {
    const { data: items } = await supabase
      .from('order_items')
      .select('products(name)')
      .eq('order_id', order.id)
    
    const productNames = items?.map((item: any) => item.products?.name).join(', ') || 'Products'
    return { ...order, productNames }
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-5xl font-heading font-black tracking-widest text-gray-900 uppercase">Payments</h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest">Manage Concierge WhatsApp Payments.</p>
        </div>
      </div>

      <PaymentsClient currentFilter={statusFilter} />

      <div className="rounded-[2rem] border border-gray-100 bg-white shadow-sm overflow-hidden hidden md:block">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-gray-100 hover:bg-transparent">
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Order #</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Customer</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Phone</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Total</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Status</TableHead>
              <TableHead className="text-right text-gray-400 font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersWithItems?.map((order) => {
              const whatsappNumber = order.customer_phone?.replace(/\D/g, '') || ''
              
              let message = ''
              if (order.payment_status === 'PENDING') {
                message = `Hello ${order.customer_name}, thank you for your order #${order.order_number} (${order.productNames}). The total amount is ₹${order.total_amount}. Please pay via this UPI QR code/Link to confirm your order.`
              } else {
                message = `Hello ${order.customer_name}, we have received your payment of ₹${order.total_amount} for order #${order.order_number}. Thank you!`
              }
              const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

              return (
                <TableRow key={order.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                  <TableCell className="font-black text-gray-900">
                    <Link href={`/2010admin/orders/${order.id}`} className="hover:text-[#FF7A00] transition-colors">
                      {order.order_number}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-700 font-bold text-xs uppercase tracking-wider">
                    {order.customer_name}
                  </TableCell>
                  <TableCell className="text-gray-500 font-medium text-xs">
                    {order.customer_phone || 'N/A'}
                  </TableCell>
                  <TableCell className="font-black text-gray-900 text-sm">
                    ₹{order.total_amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.payment_status === 'PAID' ? 'default' : 'secondary'} className={`text-[9px] uppercase tracking-widest font-bold ${order.payment_status === 'PAID' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-orange-100 text-[#FF7A00] hover:bg-orange-100'}`}>
                      {order.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors w-8 h-8 rounded-full" title="Send WhatsApp Message">
                      <MessageSquare className="w-4 h-4" />
                    </a>
                    {order.payment_status === 'PENDING' && (
                      <MarkPaidButton orderId={order.id} />
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {(!ordersWithItems || ordersWithItems.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-gray-500 text-xs font-medium uppercase tracking-widest">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view would go here similarly */}
    </div>
  )
}
