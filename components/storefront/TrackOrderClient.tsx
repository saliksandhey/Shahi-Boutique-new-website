'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  MessageCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  RefreshCw,
  Scissors,
  ShieldCheck,
  RotateCcw
} from 'lucide-react'
import { trackOrderAction, TrackedOrderData } from '@/lib/actions/tracking'
import { PriceDisplay } from '@/components/storefront/PriceDisplay'

export function TrackOrderClient() {
  const searchParams = useSearchParams()
  
  const initialOrderId = searchParams.get('orderId') || searchParams.get('id') || searchParams.get('order_number') || ''
  
  const [orderQuery, setOrderQuery] = useState(initialOrderId)
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<TrackedOrderData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedOrderId, setCopiedOrderId] = useState(false)
  const [copiedTracking, setCopiedTracking] = useState(false)

  const handleTrack = useCallback(async (queryToSearch: string) => {
    if (!queryToSearch || !queryToSearch.trim()) {
      setError('Please enter your Order ID or Order Number.')
      return
    }

    setLoading(true)
    setError(null)

    const res = await trackOrderAction(queryToSearch.trim())
    if (res.success && res.order) {
      setOrder(res.order)
      setError(null)
      const url = new URL(window.location.href)
      url.searchParams.set('orderId', res.order.orderNumber)
      window.history.replaceState({}, '', url.toString())
    } else {
      setOrder(null)
      setError(res.error || 'No order found with the provided details.')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (initialOrderId) {
      handleTrack(initialOrderId)
    }
  }, [initialOrderId, handleTrack])

  const copyToClipboard = (text: string, type: 'order' | 'tracking') => {
    navigator.clipboard.writeText(text)
    if (type === 'order') {
      setCopiedOrderId(true)
      setTimeout(() => setCopiedOrderId(false), 2000)
    } else {
      setCopiedTracking(true)
      setTimeout(() => setCopiedTracking(false), 2000)
    }
  }

  const getStepProgress = (status: string, isIntl = false) => {
    const s = status.toUpperCase()
    if (s === 'DELIVERED') return 4
    if (s === 'SHIPPED' || s === 'DISPATCHED' || s === 'IN_TRANSIT') return 3
    if (s === 'PROCESSING' || s === 'PACKED' || s === 'TAILORING') return 2
    if (s === 'CONFIRMED' || s === 'PAID') return 2
    if (s === 'PENDING' || s === 'PENDING_REVIEW' || s === 'QUOTE_SENT') return 1
    return 1
  }

  const currentStep = order ? getStepProgress(order.orderStatus, order.isInternational) : 1
  const isCancelledOrRefunded = order && ['CANCELLED', 'REFUNDED', 'RETURNED'].includes(order.orderStatus)

  const steps = order?.isInternational ? [
    { label: 'Inquiry Received', desc: 'Request logged & reviewing quote', icon: Clock },
    { label: 'Tailoring & Prep', desc: 'Crafting & premium packaging', icon: Scissors },
    { label: 'Worldwide Dispatch', desc: 'Dispatched with express courier', icon: Truck },
    { label: 'Delivered', desc: 'Delivered to your international address', icon: CheckCircle2 }
  ] : [
    { label: 'Order Confirmed', desc: 'Order verified & in atelier', icon: Sparkles },
    { label: 'Tailoring & Quality', desc: 'Crafting & premium packaging', icon: Scissors },
    { label: 'Dispatched & Shipped', desc: 'Handed to courier partner', icon: Truck },
    { label: 'Delivered', desc: 'Delivered to your doorstep', icon: CheckCircle2 }
  ]

  return (
    <div className="min-h-screen bg-white text-[#111111] pb-32 pt-20 sm:pt-24">
      {/* Top Header Banner matching website style */}
      <div className="mx-4 sm:mx-6 lg:mx-8 mb-12 sm:mb-16">
        <div className="bg-[#F8F9FA] py-16 sm:py-20 md:py-24 px-6 sm:px-8 lg:px-12 text-center rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm max-w-6xl mx-auto">
          <span className="text-xs font-bold text-[#FF7A00] uppercase tracking-[0.2em] mb-3 block">
            ✦ Shahi Atelier Logistics ✦
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-black tracking-tighter text-gray-900 uppercase mb-4 leading-none">
            TRACK YOUR ORDER
          </h1>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto font-medium text-sm sm:text-base leading-relaxed">
            Live order and bespoke international inquiry tracking — from our master artisans to your doorstep anywhere in the world.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Search Box Card */}
        <div className="bg-[#F8F9FA] rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 p-6 sm:p-8 shadow-sm">
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              handleTrack(orderQuery)
            }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="Enter Order # (e.g. SHAHI-2026-482910 or INT-2026-12345)"
                  className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:border-[#FF7A00] focus:outline-none focus:ring-4 focus:ring-[#FF7A00]/10 transition-all uppercase tracking-wider"
                  autoCapitalize="characters"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-12 sm:h-14 px-8 rounded-full bg-[#1C1C1C] hover:bg-[#FF7A00] text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 shrink-0 disabled:opacity-70 active:scale-98 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    Track Order
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center sm:text-left flex items-center gap-1.5 justify-center sm:justify-start font-medium">
              <Clock className="w-3.5 h-3.5 text-[#FF7A00]" />
              Tip: Your Order ID is in your order confirmation email and invoice.
            </p>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-medium flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Order Not Found</p>
                <p className="text-xs text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Loaded Order View */}
        {order && (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            
            {/* Top Order Status Banner */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                      {order.isInternational ? 'Inquiry ID' : 'Order ID'}
                    </span>
                    <span className="text-lg sm:text-xl font-black text-gray-900 tracking-wider">
                      #{order.orderNumber}
                    </span>
                    {order.isInternational && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#FF7A00] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                        🌍 International
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => copyToClipboard(order.orderNumber, 'order')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold transition-colors cursor-pointer"
                      title="Copy ID"
                    >
                      {copiedOrderId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    order.orderStatus === 'DELIVERED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : isCancelledOrRefunded
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-orange-50 text-[#FF7A00] border border-orange-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      order.orderStatus === 'DELIVERED' 
                        ? 'bg-emerald-500' 
                        : isCancelledOrRefunded 
                        ? 'bg-red-500' 
                        : 'bg-[#FF7A00] animate-pulse'
                    }`}></span>
                    {order.orderStatus === 'PENDING_REVIEW' ? 'Awaiting Concierge Quote' : order.orderStatus === 'QUOTE_SENT' ? 'Quote Ready · Pay Online' : order.orderStatus === 'CONFIRMED' ? 'Confirmed & Tailoring' : order.orderStatus}
                  </span>

                  {/* Payment Badge */}
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.paymentStatus === 'PAID'
                      ? 'bg-gray-100 text-gray-800 border border-gray-200'
                      : 'bg-orange-50 text-[#FF7A00] border border-orange-200'
                  }`}>
                    {order.paymentStatus === 'PAID' ? '✓ Paid' : order.paymentStatus === 'PENDING_QUOTE' ? 'Quote in Progress' : `Payment: ${order.paymentStatus}`}
                  </span>
                </div>
              </div>

              {/* Visual Stepper */}
              {!isCancelledOrRefunded ? (
                <div className="py-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
                    Live Journey Progress
                  </h3>

                  {/* Desktop / Tablet Stepper */}
                  <div className="hidden sm:grid sm:grid-cols-4 relative gap-4">
                    {/* Background track line */}
                    <div className="absolute top-6 left-12 right-12 h-1 bg-gray-100 -z-0">
                      <div 
                        className="h-full bg-[#FF7A00] transition-all duration-700 ease-out rounded-full"
                        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                      ></div>
                    </div>

                    {steps.map((step, idx) => {
                      const stepNum = idx + 1
                      const isDone = stepNum <= currentStep
                      const isCurrent = stepNum === currentStep
                      const StepIcon = step.icon

                      return (
                        <div key={idx} className="flex flex-col items-center text-center relative z-10 space-y-2.5">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isCurrent
                              ? 'bg-[#FF7A00] text-white shadow-md ring-4 ring-[#FF7A00]/20 scale-110'
                              : isDone
                              ? 'bg-[#1C1C1C] text-white shadow-xs'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            <StepIcon className="w-5 h-5" />
                          </div>

                          <div>
                            <p className={`text-xs font-bold uppercase tracking-wider ${
                              isDone ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {step.label}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5 max-w-[130px] mx-auto leading-tight font-medium">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Mobile Stepper (Vertical) */}
                  <div className="sm:hidden space-y-4 relative pl-4 border-l-2 border-gray-100 ml-3">
                    {steps.map((step, idx) => {
                      const stepNum = idx + 1
                      const isDone = stepNum <= currentStep
                      const isCurrent = stepNum === currentStep
                      const StepIcon = step.icon

                      return (
                        <div key={idx} className="relative flex items-start gap-3.5 pb-2">
                          <div className={`-ml-[25px] w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            isCurrent
                              ? 'bg-[#FF7A00] text-white ring-4 ring-[#FF7A00]/20'
                              : isDone
                              ? 'bg-[#1C1C1C] text-white'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            <StepIcon className="w-4 h-4" />
                          </div>

                          <div>
                            <p className={`text-xs font-bold uppercase tracking-wider ${
                              isDone ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {step.label} {isCurrent && <span className="text-[10px] font-black text-[#FF7A00] ml-1.5">(Current)</span>}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-medium flex items-center gap-3">
                  <RotateCcw className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <p className="font-bold">Order Status: {order.orderStatus}</p>
                    <p className="text-xs text-red-700 mt-0.5">
                      This order has been updated to {order.orderStatus.toLowerCase()}. Please connect with our concierge team below for refund or assistance.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Courier & Tracking Details Card (If available) */}
            {order.trackingNumber && (
              <div className="bg-[#FFF9F2] rounded-2xl md:rounded-[2rem] border border-orange-200 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-200/60 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-orange-100 text-[#FF7A00] rounded-xl">
                      <Truck className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00]">
                        Courier Shipment Details
                      </h4>
                      <p className="text-sm font-bold text-gray-900">
                        {order.courierName || 'Expedited Boutique Logistics'}
                      </p>
                    </div>
                  </div>

                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1C1C1C] hover:bg-[#FF7A00] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs self-start sm:self-auto"
                    >
                      Track on Courier Site
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-1">
                  <div className="bg-white rounded-xl p-3.5 border border-orange-100">
                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-1">
                      AWB / Tracking Number
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-gray-900 tracking-wider">
                        {order.trackingNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(order.trackingNumber!, 'tracking')}
                        className="text-xs font-bold text-[#FF7A00] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedTracking ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {order.shipmentNotes && (
                    <div className="bg-white rounded-xl p-3.5 border border-orange-100">
                      <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-1">
                        Dispatch Notes / Remarks
                      </span>
                      <p className="text-xs font-medium text-gray-700">
                        {order.shipmentNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Two-Column Grid: Items & Order Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Items (2 Cols) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Items Card */}
                <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-xs border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA]">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">
                      Ordered Items ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
                    </h3>
                    <span className="text-[11px] text-gray-400 font-medium">
                      Boutique Garments
                    </span>
                  </div>

                  <ul className="divide-y divide-gray-100">
                    {order.items.map((item) => (
                      <li key={item.id} className="p-4 sm:p-6 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover object-center"
                            sizes="96px"
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          {item.slug ? (
                            <Link 
                              href={`/product/${item.slug}`} 
                              className="text-sm sm:text-base font-bold text-gray-900 hover:text-[#FF7A00] transition-colors line-clamp-2"
                            >
                              {item.name}
                            </Link>
                          ) : (
                            <h4 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2">
                              {item.name}
                            </h4>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                            <span>Qty: <strong className="text-gray-900 font-bold">{item.quantity}</strong></span>
                            <span>•</span>
                            <span>Unit: <PriceDisplay amount={item.price} /></span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm sm:text-base font-black text-gray-900">
                            <PriceDisplay amount={item.price * item.quantity} />
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Timeline History Card */}
                {order.timeline && order.timeline.length > 0 && (
                  <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-xs border border-gray-100 p-6 sm:p-8 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-3">
                      Detailed Activity Timeline
                    </h3>
                    
                    <div className="space-y-4 relative pl-4 border-l-2 border-gray-100 ml-2">
                      {order.timeline.map((event, idx) => (
                        <div key={event.id || idx} className="relative flex items-start gap-3">
                          <div className="-ml-[21px] w-3 h-3 rounded-full bg-[#1C1C1C] ring-4 ring-white shrink-0 mt-1"></div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                              {event.eventType}
                            </p>
                            <p className="text-xs text-gray-600">
                              {event.description}
                            </p>
                            <span className="text-[10px] text-gray-400 font-medium block">
                              {new Date(event.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Financial Breakdown & Shipping Details (1 Col) */}
              <div className="space-y-6">
                
                {/* Order Summary & Pricing Card */}
                <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-xs border border-gray-100 p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-3">
                    {order.isInternational ? 'Inquiry Summary' : 'Order Summary'}
                  </h3>

                  <div className="space-y-2.5 text-xs text-gray-600">
                    <div className="flex justify-between items-center">
                      <span>Subtotal</span>
                      <span className="font-bold text-gray-900"><PriceDisplay amount={order.subtotal} /></span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>{order.isInternational ? 'Express Courier' : 'Shipping'}</span>
                      <span className="font-bold text-gray-900">
                        {order.shippingCost > 0 ? (
                          <PriceDisplay amount={order.shippingCost} />
                        ) : order.isInternational ? (
                          <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px] uppercase">Awaiting Quote</span>
                        ) : (
                          <span className="text-emerald-700 font-bold">Free</span>
                        )}
                      </span>
                    </div>

                    {order.discountAmount > 0 && (
                      <div className="flex justify-between items-center text-emerald-700">
                        <span>Coupon / Savings</span>
                        <span className="font-bold">-<PriceDisplay amount={order.discountAmount} /></span>
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm font-black text-gray-900">
                      <span>Total Payable</span>
                      <span className="text-base text-gray-900"><PriceDisplay amount={order.totalAmount} /></span>
                    </div>
                  </div>

                  {/* Payment Button if quote has payment link and payment is pending */}
                  {order.paymentLink && order.paymentStatus !== 'PAID' && (
                    <div className="pt-2">
                      <a
                        href={order.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Pay Invoice Online Now</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Customer Bespoke Fitting Notes Card */}
                {order.customNotes && (
                  <div className="bg-amber-50/70 rounded-2xl md:rounded-[2rem] border border-amber-200/80 p-6 space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-900 flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-amber-700" />
                      <span>Bespoke Fitting Notes</span>
                    </h4>
                    <p className="text-xs text-amber-950 font-medium whitespace-pre-wrap leading-relaxed">
                      {order.customNotes}
                    </p>
                  </div>
                )}

                {/* Delivery Address Card */}
                <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-xs border border-gray-100 p-6 space-y-3">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <MapPin className="w-4 h-4 text-[#FF7A00]" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">
                      Delivery Destination
                    </h3>
                  </div>

                  <div className="text-xs text-gray-700 space-y-1 font-medium">
                    <p className="font-bold text-gray-900 text-sm">{order.customerName}</p>
                    <p>{order.shippingAddress}</p>
                    <p>{order.city}, {order.state} - {order.postalCode}</p>
                    <p className="uppercase tracking-wider text-[11px] text-gray-400">{order.country}</p>
                    {order.customerPhone && (
                      <p className="pt-1 text-[11px] text-gray-500 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-gray-400" /> {order.customerPhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* WhatsApp & Concierge Help Card */}
                <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-xs border border-gray-100 p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <ShieldCheck className="w-4 h-4 text-[#FF7A00]" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">
                      Need Assistance?
                    </h3>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    Have questions about your order, tailoring size, or delivery schedule? Our bespoke concierge is ready to assist.
                  </p>

                  <div className="space-y-2 pt-1">
                    <a
                      href={`https://wa.me/919041762820?text=${encodeURIComponent(`Hi Shahi Boutique, I would like to inquire about my Order #${order.orderNumber}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat on WhatsApp
                    </a>

                    <a
                      href="tel:+919041762820"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-gray-600" />
                      Call +91 90417-62820
                    </a>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  )
}
