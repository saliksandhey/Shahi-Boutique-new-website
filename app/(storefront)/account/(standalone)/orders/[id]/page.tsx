import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Package, Truck, CheckCircle } from 'lucide-react'
import { PriceDisplay } from '@/components/storefront/PriceDisplay';

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  const supabase = createAdminClient()

  // First we need to await params in Next.js 15 before using properties
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id, quantity, price,
        products (
          id, name, slug,
          product_images (url, is_primary)
        )
      )
    `)
    .eq('id', id)
    .eq('customer_email', user.email)
    .single()

  if (error) {
    console.error("Supabase Error fetching order details:", error)
  }

  if (!order) {
    notFound()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-8 pb-16 px-4">
      <div className="flex items-center gap-4">
        <Link href="/account/orders" className="rounded-full p-2 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Order #{order.order_number}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Visual Progress Bar */}
          {!['CANCELLED', 'RETURNED', 'REFUNDED'].includes(order.order_status) && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8 overflow-hidden">
               <div className="overflow-x-auto hide-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0 pb-2">
                 <div className="relative flex justify-between min-w-[320px] sm:min-w-0">
                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-100 -z-10 -translate-y-1/2"></div>
                    
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DISPATCHED', 'DELIVERED'].includes(order.order_status) ? 'bg-[#FF7A00] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] sm:text-xs uppercase tracking-widest mt-4 font-bold text-gray-900 text-center">Confirmed</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${['PACKED', 'SHIPPED', 'DISPATCHED', 'DELIVERED'].includes(order.order_status) ? 'bg-[#FF7A00] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] sm:text-xs uppercase tracking-widest mt-4 font-bold text-gray-900 text-center">Processing</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${['SHIPPED', 'DISPATCHED', 'DELIVERED'].includes(order.order_status) ? 'bg-[#FF7A00] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] sm:text-xs uppercase tracking-widest mt-4 font-bold text-gray-900 text-center">Shipped</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${order.order_status === 'DELIVERED' ? 'bg-[#FF7A00] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] sm:text-xs uppercase tracking-widest mt-4 font-bold text-gray-900 text-center">Delivered</span>
                    </div>
                 </div>
               </div>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Items</h3>
            </div>
            <ul role="list" className="divide-y divide-gray-200">
              {order.order_items.map((item: any) => {
                const product = item.products
                const primaryImage = product?.product_images?.find((img: any) => img.is_primary)?.url 
                  || product?.product_images?.[0]?.url 
                  || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200&auto=format&fit=crop'
                
                return (
                  <li key={item.id} className="flex p-4 sm:p-6">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img src={primaryImage} alt={product?.name} className="h-full w-full object-cover object-center" />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:justify-between text-base font-medium text-gray-900">
                          <h3 className="line-clamp-2 sm:line-clamp-none pr-4">
                            <Link href={`/product/${product?.slug}`}>{product?.name}</Link>
                          </h3>
                          <p className="mt-1 sm:mt-0 whitespace-nowrap text-sm sm:text-base"><PriceDisplay amount={item.price} /></p>
                        </div>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <p className="text-gray-500">Qty {item.quantity}</p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Order Summary</h3>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <dl className="space-y-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="text-gray-900"><PriceDisplay amount={order.subtotal} /></dd>
                </div>
                <div className="flex justify-between">
                  <dt>Discount</dt>
                  <dd className="text-gray-900">-₹{order.discount_amount || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd className="text-gray-900">₹{order.shipping_cost || 0}</dd>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-4 font-semibold text-gray-900 text-base">
                  <dt>Total</dt>
                  <dd><PriceDisplay amount={order.total_amount} /></dd>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-4">
                  <dt>Payment Method</dt>
                  <dd className="text-gray-900 font-medium">{order.payment_method === 'COD' ? 'Concierge WhatsApp' : order.payment_method}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Payment Status</dt>
                  <dd className={`font-bold ${order.payment_status === 'PAID' ? 'text-green-600' : 'text-[#FF7A00]'}`}>
                    {order.payment_status || 'PENDING'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Shipping Details</h3>
            </div>
            <div className="px-4 py-4 sm:px-6 text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.customer_name}</p>
              <p>{order.shipping_address}</p>
              <p>{order.city}, {order.state} {order.postal_code}</p>
              <p>{order.country}</p>
              <p className="pt-2 text-gray-500">Phone: {order.customer_phone}</p>
            </div>
          </div>

          {(order.tracking_number || order.courier_name) && (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Tracking Info</h3>
              </div>
              <div className="px-4 py-4 sm:px-6 text-sm text-gray-600 space-y-2">
                {order.courier_name && (
                  <div>
                    <span className="block text-gray-500">Courier</span>
                    <span className="font-medium text-gray-900">{order.courier_name}</span>
                  </div>
                )}
                {order.tracking_number && (
                  <div>
                    <span className="block text-gray-500">Tracking Number</span>
                    <span className="font-medium text-gray-900">{order.tracking_number}</span>
                  </div>
                )}
                {order.tracking_url && (
                  <div className="pt-2">
                    <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Track Package &rarr;
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
