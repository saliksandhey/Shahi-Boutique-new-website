import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer, Truck, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect'
import { OrderTrackingForm } from '@/components/admin/OrderTrackingForm'
import { OrderInternalNotes } from '@/components/admin/OrderInternalNotes'
import { OrderRefundModal } from '@/components/admin/OrderRefundModal'
import { OrderAddressEdit } from '@/components/admin/OrderAddressEdit'

export default async function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const id = p.id;
  const supabase = createAdminClient()
  
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      profiles(full_name, email, phone)
    `)
    .eq('id', id)
    .single()

  if (!order) notFound()

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
    <div className="max-w-6xl mx-auto space-y-6 pb-24 lg:pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/2010admin/orders" className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Order #{order.order_number}</h1>
            <p className="mt-0.5 text-xs sm:text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
            <Link href={`/2010admin/orders/${order.id}/invoice`} target="_blank">
              <Printer className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Print Invoice</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
            <Link href={`/2010admin/orders/${order.id}/packing-slip`} target="_blank">
              <FileText className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Packing Slip</span>
            </Link>
          </Button>
          <Button size="sm" className="bg-black hover:bg-gray-800 text-white flex-1 sm:flex-none" asChild>
            <Link href={`/2010admin/orders/${order.id}/label`} target="_blank">
              <Printer className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Print Label</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 md:p-12 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm mt-4 sm:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Left Column */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-10 lg:space-y-14">
            
            {/* Order Items Section */}
            <div className="space-y-6">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-gray-900 uppercase">Order Items</h2>
              <ul className="divide-y divide-gray-100">
                {items?.map((item: any) => (
                  <li key={item.id} className="py-4 sm:py-5 flex gap-4 sm:gap-5 group">
                    {item.products?.product_images?.[0] ? (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center transition-transform group-hover:scale-105">
                        <img 
                          src={item.products.product_images.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))[0]?.url} 
                          alt={item.products?.name} 
                          className="object-cover w-full h-full" 
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                        <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-gray-400 text-center px-1">No Img</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="font-black text-gray-900 uppercase tracking-widest text-xs sm:text-sm truncate">{item.products?.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-bold tracking-widest uppercase mt-0.5 sm:mt-1">Qty: {item.quantity}</p>
                      <div className="font-black text-gray-900 text-sm sm:text-lg mt-1 sm:mt-2">
                        ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                      </div>
                      {item.refunded_quantity > 0 && (
                        <div className="text-[9px] sm:text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-1">
                          {item.refunded_quantity} refunded
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="bg-gray-50 rounded-2xl p-6 mt-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Subtotal</span>
                  <span className="font-black text-gray-900 text-base">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Shipping</span>
                  <span className="font-black text-gray-900 text-base">₹{order.shipping_cost || '0.00'}</span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between items-center text-sm text-[#FF7A00]">
                    <span className="font-bold uppercase tracking-widest text-xs">Discount</span>
                    <span className="font-black text-base">-₹{order.discount_amount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-black text-2xl text-gray-900 pt-4 mt-2 border-t border-gray-200">
                  <span className="uppercase tracking-tight">Total</span>
                  <span className="text-[#FF7A00]">₹{order.total_amount}</span>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Order Timeline Section */}
            <div className="space-y-8">
              <h2 className="text-lg font-black tracking-tight text-gray-900 uppercase">Order Timeline</h2>
              <div className="space-y-10 pl-2">
                {timeline?.map((event: any, idx: number) => (
                  <div key={event.id} className="relative flex gap-6">
                    {idx !== timeline.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-[-40px] w-0.5 bg-gray-100"></div>
                    )}
                    <div className="relative z-10 w-8 h-8 rounded-full bg-white border-4 border-gray-100 flex items-center justify-center shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#1C1C1C]"></div>
                    </div>
                    <div className="pt-1.5 space-y-1">
                      <p className="font-black text-gray-900 text-sm uppercase tracking-wider">{event.event_type}</p>
                      <p className="text-sm text-gray-500 font-medium">{event.description}</p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 pt-1">{new Date(event.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {!timeline?.length && (
                  <p className="text-sm text-gray-500 italic font-medium">No timeline events recorded.</p>
                )}
              </div>
            </div>
            
            <div className="pt-4">
              <OrderRefundModal orderId={order.id} items={items || []} orderStatus={order.order_status} />
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-10 lg:border-l lg:border-gray-100 lg:pl-10 lg:ml-2">
            
            <OrderStatusSelect orderId={order.id} currentStatus={order.order_status} />
            
            <hr className="border-gray-100" />
            
            <OrderTrackingForm order={order} />

            <hr className="border-gray-100" />

            {/* Customer Details Section */}
            <div className="space-y-6">
              <h2 className="text-lg font-black tracking-tight text-gray-900 uppercase">Customer</h2>
              
              <div className="bg-gray-50 p-5 rounded-2xl space-y-6">
                <div>
                  <p className="font-black text-gray-900 text-base">{order.customer_name || order.profiles?.full_name || 'Guest User'}</p>
                  <p className="text-sm text-gray-500 font-medium mt-1">{order.customer_email || order.profiles?.email || 'N/A'}</p>
                  {(order.customer_phone || order.profiles?.phone) && <p className="text-sm text-gray-500 font-medium mt-1">{order.customer_phone || order.profiles?.phone}</p>}
                </div>
                
                <div className="pt-5 border-t border-gray-200">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Shipping Address</h4>
                  {order.shipping_address ? (
                    <div className="text-sm text-gray-700 space-y-1.5 font-medium leading-relaxed">
                      <p className="text-gray-900 font-bold">{order.customer_name || 'Customer'}</p>
                      <p>{order.shipping_address}</p>
                      <p>{order.city}, {order.state} {order.postal_code}</p>
                      <p>{order.country}</p>
                      {order.customer_phone && <p className="pt-1">{order.customer_phone}</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No address provided.</p>
                  )}
                  <div className="mt-5">
                    <OrderAddressEdit orderId={order.id} currentAddress={order} orderStatus={order.order_status} />
                  </div>
                </div>
                
                <div className="pt-5 border-t border-gray-200">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Payment Info</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-bold tracking-widest text-xs uppercase">Method</span>
                      <span className="font-black text-gray-900 uppercase tracking-widest text-[10px] bg-white px-3 py-1 rounded-full border border-gray-200">{order.payment_method}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-bold tracking-widest text-xs uppercase">Status</span>
                      <span className={`font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-full ${order.payment_status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{order.payment_status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <OrderInternalNotes orderId={order.id} initialNotes={order.staff_notes} initialTags={order.tags} />
          </div>
        </div>
      </div>
    </div>
  )
}
