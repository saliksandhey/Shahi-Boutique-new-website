import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Printer, Truck, FileText, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect'
import { OrderTrackingForm } from '@/components/admin/OrderTrackingForm'
import { OrderInternalNotes } from '@/components/admin/OrderInternalNotes'
import { OrderRefundModal } from '@/components/admin/OrderRefundModal'
import { OrderAddressEdit } from '@/components/admin/OrderAddressEdit'

export async function OrderDetailsView({ id, onCloseHref }: { id: string, onCloseHref: string }) {
  const supabase = createAdminClient()
  
  const { data: order } = await supabase
    .from('orders')
    .select(`*`)
    .eq('id', id)
    .single()

  if (!order) return <div className="p-8 text-center text-red-500 font-bold">Order Not Found</div>

  const { data: items } = await supabase
    .from('order_items')
    .select(`
      id, quantity, price, refunded_quantity,
      products(name, slug, product_images(url, position))
    `)
    .eq('order_id', id)

  const { data: timeline } = await supabase
    .from('order_timeline')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={onCloseHref} className="p-2 hover:bg-gray-200 bg-gray-100 rounded-full transition-colors" scroll={false}>
            <X className="h-5 w-5 text-gray-900" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Order #{order.order_number}</h1>
            <p className="mt-1 text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/2010admin/orders/${order.id}/invoice`} target="_blank">
              <Printer className="h-4 w-4 mr-2" /> Print Invoice
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/2010admin/orders/${order.id}/packing-slip`} target="_blank">
              <FileText className="h-4 w-4 mr-2" /> Packing Slip
            </Link>
          </Button>
          <Button className="bg-black hover:bg-gray-800 text-white" asChild>
            <Link href={`/2010admin/orders/${order.id}/label`} target="_blank">
              <Printer className="h-4 w-4 mr-2" /> Print Label
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-gray-200">
                {items?.map((item: any) => (
                  <li key={item.id} className="py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      {item.products?.product_images?.[0] ? (
                        <div className="w-16 h-16 rounded-xl border border-gray-100 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
                          <img 
                            src={item.products.product_images.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))[0]?.url} 
                            alt={item.products?.name} 
                            className="object-cover w-full h-full" 
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                          <span className="text-xs text-gray-400">No Image</span>
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 uppercase tracking-widest text-sm">{item.products?.name}</p>
                        <p className="text-sm text-gray-500 font-medium mt-1">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="font-medium text-gray-900 text-right">
                      ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                      {item.refunded_quantity > 0 && (
                        <div className="text-xs text-orange-500 font-normal mt-1">
                          {item.refunded_quantity} refunded
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span>
                  <span>₹{order.shipping_cost || '0.00'}</span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount_amount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-gray-900 mt-4 pt-4 border-t">
                  <span>Total</span>
                  <span>₹{order.total_amount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {timeline?.map((event: any, idx: number) => (
                  <div key={event.id} className="relative flex gap-4">
                    {idx !== timeline.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-gray-200"></div>
                    )}
                    <div className="relative z-10 w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-500 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
                    </div>
                    <div className="pt-1">
                      <p className="font-medium text-gray-900 text-sm">{event.event_type}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{event.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(event.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {!timeline?.length && (
                  <p className="text-sm text-gray-500 italic">No timeline events recorded.</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <OrderRefundModal orderId={order.id} items={items || []} orderStatus={order.order_status} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          <OrderStatusSelect orderId={order.id} currentStatus={order.order_status} />
          
          <OrderTrackingForm order={order} />

          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-gray-900">{order.customer_name || 'Guest User'}</p>
                <p className="text-sm text-gray-500">{order.customer_email || 'N/A'}</p>
                {order.customer_phone && <p className="text-sm text-gray-500">{order.customer_phone}</p>}
              </div>
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2 text-gray-900">Shipping Address</h4>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>{order.customer_name}</p>
                  <p>{order.shipping_address}</p>
                  <p>{order.city}, {order.state} {order.postal_code}</p>
                  <p>{order.country}</p>
                  {order.customer_phone && <p>{order.customer_phone}</p>}
                </div>
                
                {/* Note: OrderAddressEdit needs to be updated too or removed if not needed */}
              </div>
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2 text-gray-900">Payment</h4>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Method: <span className="uppercase">{order.payment_method}</span></p>
                  <p>Status: <span className={`uppercase font-medium ${order.payment_status === 'PAID' ? 'text-green-600' : 'text-orange-500'}`}>{order.payment_status}</span></p>
                </div>
              </div>
            </CardContent>
          </Card>

          <OrderInternalNotes orderId={order.id} initialNotes={order.staff_notes} initialTags={order.tags} />
        </div>
      </div>
    </div>
  )
}
