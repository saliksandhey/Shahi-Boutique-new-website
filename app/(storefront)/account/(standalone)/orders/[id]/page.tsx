import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Package, Truck, CheckCircle, Globe, MessageCircle, Clock, ShieldCheck } from 'lucide-react'
import { PriceDisplay } from '@/components/storefront/PriceDisplay'

const COUNTRY_FLAGS: Record<string, string> = {
  IN: '🇮🇳', US: '🇺🇸', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺', AE: '🇦🇪', SA: '🇸🇦', SG: '🇸🇬', NZ: '🇳🇿', DE: '🇪🇺', QA: '🇶🇦', KW: '🇰🇼', MY: '🇲🇾'
}

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  const supabase = createAdminClient()

  const resolvedParams = await params
  const id = resolvedParams.id

  let order: any = null
  let isInternational = false

  const { data: domesticOrder } = await supabase
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

  if (domesticOrder) {
    order = domesticOrder
    isInternational = order.payment_method === 'INTERNATIONAL_CONCIERGE' || order.country !== 'IN' || (order.tags && order.tags.includes('INTERNATIONAL'))
  } else {
    const { data: intlOrder } = await supabase
      .from('international_orders')
      .select(`
        *,
        international_order_items (
          id, quantity, price, product_id, product_name, product_image,
          products (
            id, name, slug,
            product_images (url, is_primary)
          )
        )
      `)
      .eq('id', id)
      .eq('customer_email', user.email)
      .single()

    if (intlOrder) {
      order = {
        ...intlOrder,
        order_items: (intlOrder.international_order_items || []).map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          products: item.products || {
            id: item.product_id,
            name: item.product_name,
            slug: '',
            product_images: [{ url: item.product_image, is_primary: true }]
          }
        }))
      }
      isInternational = true
    }
  }

  if (!order) {
    notFound()
  }
  const flag = COUNTRY_FLAGS[order.country] || '🌐'

  const waText = `👑 *INQUIRY STATUS CHECK — #${order.order_number}*
Hello Shahi Concierge! I am checking the status of my international request #${order.order_number} for delivery to ${order.city}, ${order.country}.`

  const whatsappConciergeUrl = `https://wa.me/919041762820?text=${encodeURIComponent(waText)}`

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-8 pb-16 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/account/orders" className="rounded-full p-2 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                Order #{order.order_number}
              </h1>
              {isInternational && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#FF7A00] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                  <Globe className="w-3.5 h-3.5" />
                  {flag} International
                </span>
              )}
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Placed on {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {isInternational && (
          <a
            href={whatsappConciergeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors w-full sm:w-auto"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat with Concierge</span>
          </a>
        )}
      </div>

      {/* International Concierge Status Banner */}
      {isInternational && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-amber-950">
              <Globe className="w-4 h-4 text-[#FF7A00]" />
              <span>Worldwide Logistics &amp; Concierge Service</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-amber-200 text-amber-900 shadow-xs">
              Status: {order.order_status === 'PENDING' || order.order_status === 'PENDING_REVIEW' ? 'Awaiting Quote' : order.order_status === 'CONFIRMED' ? 'Confirmed & Paid' : order.order_status === 'PACKED' ? 'In Tailoring' : order.order_status === 'SHIPPED' ? 'Dispatched' : order.order_status}
            </span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed font-medium">
            {order.order_status === 'PENDING' || order.order_status === 'PENDING_REVIEW'
              ? 'Our senior logistics concierge is calculating the fastest DHL / FedEx Express shipping rates to your exact destination address. You will receive an official invoice on WhatsApp and Email.'
              : order.order_status === 'CONFIRMED'
              ? 'Payment received! Your order is being tailored and prepared for express international dispatch.'
              : order.order_status === 'PACKED'
              ? 'Your garments are tailored and packed for dispatch.'
              : order.order_status === 'SHIPPED'
              ? 'Your international shipment is in transit with live courier tracking.'
              : 'Your international inquiry is being processed.'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Visual Progress Bar */}
          {!['CANCELLED', 'RETURNED', 'REFUNDED'].includes(order.order_status) && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 sm:p-8 overflow-hidden">
               <div className="overflow-x-auto hide-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0 pb-2">
                 <div className="relative flex justify-between min-w-[320px] sm:min-w-0">
                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-100 -z-10 -translate-y-1/2"></div>
                    
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${['PENDING', 'PENDING_REVIEW', 'QUOTE_SENT', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DISPATCHED', 'DELIVERED'].includes(order.order_status) ? 'bg-[#FF7A00] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                        {isInternational ? <Clock className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                      </div>
                      <span className="text-[10px] sm:text-xs uppercase tracking-widest mt-4 font-bold text-gray-900 text-center">
                        {isInternational ? 'Inquiry' : 'Confirmed'}
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${['QUOTE_SENT', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DISPATCHED', 'DELIVERED'].includes(order.order_status) ? 'bg-[#FF7A00] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] sm:text-xs uppercase tracking-widest mt-4 font-bold text-gray-900 text-center">
                        {isInternational ? 'Quoted' : 'Processing'}
                      </span>
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

          {/* Items List */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">
                Items in this {isInternational ? 'Inquiry' : 'Order'} ({order.order_items?.length || 0})
              </h3>
            </div>
            <ul role="list" className="divide-y divide-gray-100">
              {order.order_items?.map((item: any) => {
                const product = item.products
                const primaryImage = product?.product_images?.find((img: any) => img.is_primary)?.url 
                  || product?.product_images?.[0]?.url 
                  || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200&auto=format&fit=crop'
                
                return (
                  <li key={item.id} className="flex p-4 sm:p-6">
                    <div className="h-20 w-16 sm:h-24 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200">
                      <img src={primaryImage} alt={product?.name} className="h-full w-full object-cover object-center" />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:justify-between text-sm font-bold text-gray-900">
                          <h3 className="line-clamp-2 pr-4">
                            <Link href={`/product/${product?.slug}`} className="hover:text-[#FF7A00] transition-colors">
                              {product?.name}
                            </Link>
                          </h3>
                          <p className="mt-1 sm:mt-0 font-black whitespace-nowrap"><PriceDisplay amount={item.price} /></p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                        <p>Quantity: {item.quantity}</p>
                        <p className="font-bold text-gray-900"><PriceDisplay amount={item.price * item.quantity} /></p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Customer Bespoke Fitting Notes (if any) */}
          {order.staff_notes && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-900">
                Bespoke Fitting &amp; Special Instructions
              </h3>
              <p className="text-xs text-amber-950 leading-relaxed font-medium whitespace-pre-wrap">
                {order.staff_notes}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Summary</h3>
            </div>
            <div className="p-6">
              <dl className="space-y-3.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <dt>Items Subtotal</dt>
                  <dd className="text-gray-900 font-bold"><PriceDisplay amount={order.subtotal} /></dd>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-[#FF7A00]">
                    <dt>Discount</dt>
                    <dd className="font-bold">-₹{order.discount_amount}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>{isInternational ? 'International Courier' : 'Shipping'}</dt>
                  <dd className="text-gray-900 font-bold">
                    {order.shipping_cost > 0 
                      ? `₹${order.shipping_cost}${order.courier_name ? ` (${order.courier_name})` : ''}` 
                      : (isInternational ? 'Awaiting Quote' : 'FREE')}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3.5 font-black text-gray-900 text-sm">
                  <dt>Total Payable</dt>
                  <dd className="text-[#FF7A00]"><PriceDisplay amount={order.total_amount || order.subtotal} /></dd>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3.5">
                  <dt>Payment Method</dt>
                  <dd className="text-gray-900 font-bold">
                    {order.payment_method === 'INTERNATIONAL_CONCIERGE' ? 'International Concierge' : order.payment_method}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Payment Status</dt>
                  <dd className={`font-black uppercase tracking-wider text-[10px] px-2 py-0.5 rounded ${
                    order.payment_status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                  }`}>
                    {order.payment_status === 'PENDING_QUOTE' ? 'Quote in Progress' : order.payment_status || 'PENDING'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Destination Address</h3>
            </div>
            <div className="p-6 text-xs text-gray-600 space-y-1">
              <p className="font-bold text-gray-900 text-sm">{order.customer_name}</p>
              <p>{order.shipping_address}</p>
              <p>{order.city}, {order.state} {order.postal_code}</p>
              <p className="font-bold text-gray-900">{flag} {order.country}</p>
              <p className="pt-2 text-gray-500 font-medium">Contact: {order.customer_phone}</p>
            </div>
          </div>

          {/* Tracking Info (if dispatched) */}
          {(order.tracking_number || order.courier_name) && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Tracking Info</h3>
              </div>
              <div className="p-6 text-xs text-gray-600 space-y-2">
                {order.courier_name && (
                  <div>
                    <span className="block text-gray-400 font-bold uppercase tracking-wider text-[10px]">Courier</span>
                    <span className="font-bold text-gray-900">{order.courier_name}</span>
                  </div>
                )}
                {order.tracking_number && (
                  <div>
                    <span className="block text-gray-400 font-bold uppercase tracking-wider text-[10px]">Tracking Number</span>
                    <span className="font-mono font-bold text-gray-900">{order.tracking_number}</span>
                  </div>
                )}
                {order.tracking_url && (
                  <div className="pt-2">
                    <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold text-xs">
                      <span>Track Package Live &rarr;</span>
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
