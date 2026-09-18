'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Globe, 
  Search, 
  RefreshCw, 
  Plane, 
  MessageCircle, 
  Eye, 
  X, 
  Check, 
  Copy, 
  Truck, 
  Clock, 
  CheckCircle2, 
  User,
  MapPin,
  Package,
  FileText,
  Trash2,
  Send,
  ExternalLink
} from 'lucide-react'
import { updateInternationalOrderQuote, deleteInternationalOrder } from '@/lib/actions/international-orders'
import { useRouter } from 'next/navigation'

const COUNTRY_FLAGS: Record<string, string> = {
  IN: '🇮🇳',
  US: '🇺🇸',
  GB: '🇬🇧',
  CA: '🇨🇦',
  AU: '🇦🇺',
  AE: '🇦🇪',
  SA: '🇸🇦',
  SG: '🇸🇬',
  NZ: '🇳🇿',
  DE: '🇪🇺',
  QA: '🇶🇦',
  KW: '🇰🇼',
  MY: '🇲🇾',
  OTHER: '🌐'
}

const COURIER_OPTIONS = [
  'DHL Express Worldwide',
  'FedEx International Priority',
  'FedEx International Economy',
  'Aramex Global Express',
  'India Post EMS Speed Post',
  'Boutique Hand Carry / VIP Concierge',
  'Other / Self Arranged'
]

const DEFAULT_STATUS_BADGE = { label: 'Pending Review', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' }

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  PENDING_REVIEW: { label: 'Pending Review', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  PENDING: { label: 'Pending Review', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  QUOTE_SENT: { label: 'Quote Sent', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  CONFIRMED: { label: 'Confirmed & Paid', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  PROCESSING: { label: 'In Tailoring / Prep', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  PACKED: { label: 'In Tailoring / Prep', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  SHIPPED: { label: 'Dispatched / In Transit', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  DELIVERED: { label: 'Delivered', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  CANCELLED: { label: 'Cancelled / Expired', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
  RETURNED: { label: 'Returned', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
}

const getStatusBadge = (statusStr?: string) => {
  if (!statusStr) return DEFAULT_STATUS_BADGE
  return STATUS_CONFIG[statusStr] || DEFAULT_STATUS_BADGE
}

export function AdminInternationalOrdersManager({ initialOrders = [] }: { initialOrders: any[] }) {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>(initialOrders)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedCountry, setSelectedCountry] = useState('ALL')
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  
  // Drawer / Modal Form State
  const [shippingCost, setShippingCost] = useState<number>(0)
  const [courierName, setCourierName] = useState<string>('DHL Express Worldwide')
  const [trackingNumber, setTrackingNumber] = useState<string>('')
  const [trackingUrl, setTrackingUrl] = useState<string>('')
  const [paymentLink, setPaymentLink] = useState<string>('')
  const [orderStatus, setOrderStatus] = useState<string>('PENDING_REVIEW')
  const [paymentStatus, setPaymentStatus] = useState<string>('PENDING_QUOTE')
  const [staffNotes, setStaffNotes] = useState<string>('')
  
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copiedWA, setCopiedWA] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Open Drawer and Populate Form
  const handleOpenOrder = (order: any) => {
    setSelectedOrder(order)
    setShippingCost(order.shipping_cost || 0)
    setCourierName(order.courier_name || 'DHL Express Worldwide')
    setTrackingNumber(order.tracking_number || '')
    setTrackingUrl(order.tracking_url || '')
    setPaymentLink(order.payment_link || '')
    setOrderStatus(order.order_status || 'PENDING_REVIEW')
    setPaymentStatus(order.payment_status || 'PENDING_QUOTE')
    setStaffNotes(order.staff_notes || '')
    setSaveSuccess(false)
    setErrorMessage(null)
  }

  // Handle Quote / Status Update
  const handleSaveQuote = async () => {
    if (!selectedOrder) return
    setSaving(true)
    setErrorMessage(null)
    setSaveSuccess(false)

    try {
      const res = await updateInternationalOrderQuote(selectedOrder.id, {
        shippingCost: Number(shippingCost) || 0,
        courierName,
        trackingNumber,
        trackingUrl,
        paymentLink,
        orderStatus,
        paymentStatus,
        staffNotes
      })

      if (!res.success) {
        throw new Error(res.error || 'Failed to update quote.')
      }

      // Update local state
      const updatedList = orders.map(o => {
        if (o.id === selectedOrder.id) {
          const newTotal = (o.subtotal || 0) - (o.discount_amount || 0) + (Number(shippingCost) || 0)
          return {
            ...o,
            shipping_cost: Number(shippingCost) || 0,
            total_amount: newTotal,
            courier_name: courierName,
            tracking_number: trackingNumber,
            tracking_url: trackingUrl,
            payment_link: paymentLink,
            order_status: orderStatus,
            payment_status: paymentStatus,
            staff_notes: staffNotes
          }
        }
        return o
      })

      setOrders(updatedList)
      setSelectedOrder((prev: any) => prev ? {
        ...prev,
        shipping_cost: Number(shippingCost) || 0,
        total_amount: (prev.subtotal || 0) - (prev.discount_amount || 0) + (Number(shippingCost) || 0),
        courier_name: courierName,
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
        payment_link: paymentLink,
        order_status: orderStatus,
        payment_status: paymentStatus,
        staff_notes: staffNotes
      } : null)

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      router.refresh()
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating order.')
    } finally {
      setSaving(false)
    }
  }

  // Handle Delete / Archive Order
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this international order inquiry? This action cannot be undone.')) return
    setIsDeleting(true)
    try {
      const res = await deleteInternationalOrder(orderId)
      if (res.success) {
        setOrders(prev => prev.filter(o => o.id !== orderId))
        setSelectedOrder(null)
        router.refresh()
      } else {
        alert(res.error || 'Failed to delete order.')
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting order.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Generate Pre-Filled WhatsApp Quote Text
  const generateWhatsAppQuoteText = (order: any, quotedShipping: number, courier: string, link: string) => {
    const rawItems = order.international_order_items || order.order_items || order.raw_items || []
    const itemsList = rawItems.map((item: any) => {
      const pName = item.product_name || item.products?.name || item.name || 'Bespoke Item'
      const pPrice = item.price || 0
      const pQty = item.quantity || 1
      return `• ${pName} (Qty: ${pQty}) - ₹${pPrice * pQty}`
    }).join('\n') || '• Tailored Couture Items'

    const subtotal = order.subtotal || 0
    const discount = order.discount_amount || 0
    const finalTotal = subtotal - discount + (Number(quotedShipping) || 0)

    return `👑 *SHAHI BOUTIQUE — INTERNATIONAL ORDER QUOTE*
Hello ${order.customer_name || 'Valued Customer'},

Thank you for your international inquiry with Shahi Boutique!
Here is the official itemized quote for your delivery to *${order.city || ''}, ${order.country || ''}*:

-------------------------------------
*Requested Items:*
${itemsList}
-------------------------------------
*Items Subtotal:* ₹${subtotal}
${discount > 0 ? `*Discount Applied:* -₹${discount}\n` : ''}*Express Shipping (${courier || 'DHL/FedEx'}):* ₹${quotedShipping}
*Total Payable:* ₹${finalTotal}
-------------------------------------
${link ? `💳 *Secure Payment Link:* ${link}\n\n` : ''}Once payment is completed, your order will be tailored, quality inspected, and dispatched with live international tracking.

Feel free to reply to this message with any bespoke fitting requests!`
  }

  // Filter Orders
  const filteredOrders = orders.filter(o => {
    const matchesStatus = selectedStatus === 'ALL' || o.order_status === selectedStatus
    const matchesCountry = selectedCountry === 'ALL' || o.country === selectedCountry
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch = !q || (
      o.order_number?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_email?.toLowerCase().includes(q) ||
      o.customer_phone?.toLowerCase().includes(q) ||
      o.city?.toLowerCase().includes(q) ||
      o.country?.toLowerCase().includes(q)
    )
    return matchesStatus && matchesCountry && matchesSearch
  })

  // KPI Calculations
  const totalInquiries = orders.length
  const pendingQuotes = orders.filter(o => o.order_status === 'PENDING_REVIEW' || o.order_status === 'PENDING').length
  const quotesSent = orders.filter(o => o.order_status === 'QUOTE_SENT').length
  const confirmedOrders = orders.filter(o => o.order_status === 'CONFIRMED' || o.payment_status === 'PAID').length
  const inTailoringOrders = orders.filter(o => o.order_status === 'PROCESSING' || o.order_status === 'PACKED').length
  const shippedOrders = orders.filter(o => o.order_status === 'SHIPPED').length
  const totalPipelineValue = orders.reduce((sum, o) => sum + (o.total_amount || o.subtotal || 0), 0)

  // Extract unique countries
  const uniqueCountries = Array.from(new Set(orders.map(o => o.country).filter(Boolean)))

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#FF7A00]/10 text-[#FF7A00]">
              <Globe className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#09090B]">
              International Orders &amp; Concierge
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            Dedicated portal for overseas checkout inquiries. Calculate DHL/FedEx shipping quotes and send 1-click WhatsApp customer invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold uppercase tracking-wider text-gray-700 hover:border-[#FF7A00] hover:text-[#FF7A00] transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Inquiries</p>
          <p className="text-xl sm:text-2xl font-black text-gray-900">{totalInquiries}</p>
          <p className="text-[10px] text-gray-500 font-medium">All overseas requests</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100 bg-amber-50/20 shadow-xs space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Needs Quote
          </p>
          <p className="text-xl sm:text-2xl font-black text-amber-900">{pendingQuotes}</p>
          <p className="text-[10px] text-amber-700/80 font-medium">Awaiting courier rate</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-100 bg-blue-50/20 shadow-xs space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-700 flex items-center gap-1">
            <Send className="w-3 h-3" />
            Quotes Sent
          </p>
          <p className="text-xl sm:text-2xl font-black text-blue-900">{quotesSent}</p>
          <p className="text-[10px] text-blue-700/80 font-medium">Awaiting payment</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 bg-emerald-50/20 shadow-xs space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Confirmed &amp; Paid
          </p>
          <p className="text-xl sm:text-2xl font-black text-emerald-900">{confirmedOrders}</p>
          <p className="text-[10px] text-emerald-700/80 font-medium">Ready for tailoring</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-indigo-100 bg-indigo-50/20 shadow-xs space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-700 flex items-center gap-1">
            <Package className="w-3 h-3" />
            In Tailoring
          </p>
          <p className="text-xl sm:text-2xl font-black text-indigo-900">{inTailoringOrders}</p>
          <p className="text-[10px] text-indigo-700/80 font-medium">Garments in prep</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-100 bg-purple-50/20 shadow-xs space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-purple-700 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            Dispatched
          </p>
          <p className="text-xl sm:text-2xl font-black text-purple-900">{shippedOrders}</p>
          <p className="text-[10px] text-purple-700/80 font-medium">In transit worldwide</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order #, Customer name, Phone, Email, Destination city..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] focus:border-[#FF7A00] transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-48 shrink-0">
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] focus:border-[#FF7A00] transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="QUOTE_SENT">Quote Sent</option>
            <option value="CONFIRMED">Confirmed &amp; Paid</option>
            <option value="PROCESSING">In Tailoring / Prep</option>
            <option value="SHIPPED">Shipped / Dispatched</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Country Filter */}
        <div className="w-full sm:w-48 shrink-0">
          <select
            value={selectedCountry}
            onChange={e => setSelectedCountry(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] focus:border-[#FF7A00] transition-colors"
          >
            <option value="ALL">All Countries</option>
            {uniqueCountries.map(c => (
              <option key={c} value={c}>{COUNTRY_FLAGS[c] || '🌐'} {c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List: Desktop Table */}
      <div className="hidden lg:block bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <th className="py-4 px-6">Reference &amp; Date</th>
              <th className="py-4 px-6">Customer Details</th>
              <th className="py-4 px-6">Destination</th>
              <th className="py-4 px-6">Items &amp; Total</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {filteredOrders.map(order => {
              const status = getStatusBadge(order.order_status)
              const flag = COUNTRY_FLAGS[order.country] || '🌐'
              const dateStr = new Date(order.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
              const itemCount = (order.international_order_items || order.order_items || order.raw_items || []).length || 1

              return (
                <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Ref & Date */}
                  <td className="py-4 px-6">
                    <span className="font-mono font-bold text-gray-900 block text-xs">
                      #{order.order_number}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium mt-0.5 block">
                      {dateStr}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-900">{order.customer_name || 'Guest User'}</p>
                    <p className="text-[11px] text-gray-500 font-medium">{order.customer_email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-gray-500 font-medium">{order.customer_phone}</span>
                      {order.customer_phone && (
                        <a
                          href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 p-1 hover:bg-emerald-50 rounded transition-colors"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Destination */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <span className="text-base">{flag}</span>
                      <span>{order.country}</span>
                    </div>
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      {order.city}{order.state ? `, ${order.state}` : ''}
                    </span>
                  </td>

                  {/* Items & Total */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-gray-900 text-sm">
                        ₹{(order.total_amount || order.subtotal || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 block mt-0.5">
                      {itemCount} Item(s) · {order.shipping_cost ? `Ship: ₹${order.shipping_cost}` : 'Ship: Unquoted'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${status.bg} ${status.text} ${status.border}`}>
                      {status.label}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleOpenOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1C1C1C] hover:bg-[#FF7A00] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Manage &amp; Quote</span>
                    </button>
                  </td>
                </tr>
              )
            })}

            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  <Globe className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-bold text-gray-600">No international order inquiries found.</p>
                  <p className="text-xs text-gray-400 mt-1">International order requests submitted from the checkout page will appear here.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Orders List: Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {filteredOrders.map(order => {
          const status = getStatusBadge(order.order_status)
          const flag = COUNTRY_FLAGS[order.country] || '🌐'
          const dateStr = new Date(order.created_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })

          return (
            <div key={order.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{dateStr}</span>
                  <p className="font-mono font-bold text-gray-900 text-sm">#{order.order_number}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${status.bg} ${status.text} ${status.border}`}>
                  {status.label}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">{order.customer_name || 'Guest User'}</span>
                  <span className="font-bold text-gray-900">{flag} {order.country}</span>
                </div>
                <p className="text-gray-500">{order.customer_email} · {order.customer_phone}</p>
                <p className="text-gray-500">{order.city}{order.state ? `, ${order.state}` : ''}</p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</span>
                  <p className="font-black text-[#FF7A00] text-base">
                    ₹{(order.total_amount || order.subtotal || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  onClick={() => handleOpenOrder(order)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C1C1C] hover:bg-[#FF7A00] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Manage</span>
                </button>
              </div>
            </div>
          )
        })}

        {filteredOrders.length === 0 && (
          <div className="py-12 text-center bg-white rounded-2xl border border-gray-200 p-6 text-gray-400">
            <Globe className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-bold text-gray-600">No international order inquiries found.</p>
          </div>
        )}
      </div>

      {/* Interactive Detail & Quote Modal / Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-[#FF7A00]/10 text-[#FF7A00] flex items-center justify-center font-bold">
                    <Globe className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-black text-gray-900">
                        Order #{selectedOrder.order_number}
                      </h2>
                      <span className="text-sm">
                        {COUNTRY_FLAGS[selectedOrder.country] || '🌐'} {selectedOrder.country}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                      Submitted on {new Date(selectedOrder.created_at).toLocaleString('en-GB')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
                {/* Section 1: Customer & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Card */}
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-2">
                      <User className="w-3.5 h-3.5" />
                      <span>Customer Details</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-gray-900 text-sm">{selectedOrder.customer_name || 'Guest User'}</p>
                      <p className="text-gray-600">{selectedOrder.customer_email}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-gray-600 font-semibold">{selectedOrder.customer_phone}</span>
                        {selectedOrder.customer_phone && (
                          <a
                            href={`https://wa.me/${selectedOrder.customer_phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full hover:bg-emerald-200 transition-colors"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Destination Card */}
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Shipping Destination</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p className="font-semibold text-gray-900">{selectedOrder.shipping_address}</p>
                      <p>{selectedOrder.city}, {selectedOrder.state} {selectedOrder.postal_code}</p>
                      <p className="font-bold text-gray-900">{COUNTRY_FLAGS[selectedOrder.country] || '🌐'} {selectedOrder.country}</p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Requested Items Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
                    <Package className="w-3.5 h-3.5" />
                    <span>Requested Items</span>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
                    {(selectedOrder.international_order_items || selectedOrder.order_items || selectedOrder.raw_items || []).map((item: any, idx: number) => {
                      const name = item.product_name || item.products?.name || item.name || 'Bespoke Item'
                      const img = item.product_image || item.products?.product_images?.find((i: any) => i.is_primary)?.url || item.products?.product_images?.[0]?.url || item.image || '/placeholder.png'
                      const price = item.price || 0
                      const qty = item.quantity || 1

                      return (
                        <div key={item.id || idx} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/50">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-16 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                              <img src={img} alt={name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">{name}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                Unit Price: ₹{price} · Qty: {qty}
                              </p>
                            </div>
                          </div>
                          <span className="font-black text-xs text-gray-900">
                            ₹{(price * qty).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )
                    })}

                    {/* Summary row */}
                    <div className="p-4 bg-gray-50/80 space-y-1.5 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Items Subtotal</span>
                        <span className="font-bold text-gray-900">₹{(selectedOrder.subtotal || 0).toLocaleString('en-IN')}</span>
                      </div>
                      {selectedOrder.discount_amount > 0 && (
                        <div className="flex justify-between text-[#FF7A00]">
                          <span>Discount Applied</span>
                          <span className="font-bold">-₹{selectedOrder.discount_amount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Customer Bespoke Notes */}
                {(selectedOrder.custom_notes || selectedOrder.staff_notes) && (
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Customer &amp; Fitting Notes</span>
                    </p>
                    <p className="text-xs text-amber-950 whitespace-pre-wrap leading-relaxed">
                      {selectedOrder.custom_notes || selectedOrder.staff_notes}
                    </p>
                  </div>
                )}

                {/* Section 4: Concierge Shipping & Quote Calculator */}
                <div className="p-6 rounded-3xl bg-gray-50 border-2 border-gray-200/80 space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-900">
                      <Plane className="w-4 h-4 text-[#FF7A00]" />
                      <span>International Shipping Quote &amp; Dispatch Settings</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Control</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Courier Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        Courier Partner
                      </label>
                      <select
                        value={courierName}
                        onChange={e => setCourierName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-900 focus:ring-1 focus:ring-[#FF7A00] outline-none"
                      >
                        {COURIER_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    {/* Shipping Fee */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        Quoted Shipping Fee (₹ INR) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={shippingCost}
                        onChange={e => setShippingCost(Number(e.target.value))}
                        placeholder="e.g. 2400"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-black text-gray-900 focus:ring-1 focus:ring-[#FF7A00] outline-none"
                      />
                    </div>

                    {/* Calculated Total Card */}
                    <div className="sm:col-span-2 p-4 rounded-2xl bg-white border border-gray-200 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Quoted Order Value</p>
                        <p className="text-xs text-gray-500 mt-0.5">Subtotal (₹{selectedOrder.subtotal}) - Discount (₹{selectedOrder.discount_amount || 0}) + Shipping (₹{shippingCost || 0})</p>
                      </div>
                      <span className="text-xl font-black text-[#FF7A00]">
                        ₹{((selectedOrder.subtotal || 0) - (selectedOrder.discount_amount || 0) + Number(shippingCost || 0)).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Order Status */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        Order Status
                      </label>
                      <select
                        value={orderStatus}
                        onChange={e => setOrderStatus(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-900 focus:ring-1 focus:ring-[#FF7A00] outline-none"
                      >
                        <option value="PENDING_REVIEW">Pending Review</option>
                        <option value="QUOTE_SENT">Quote Sent</option>
                        <option value="CONFIRMED">Confirmed &amp; Paid</option>
                        <option value="PROCESSING">In Tailoring / Prep</option>
                        <option value="SHIPPED">Shipped / Dispatched</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>

                    {/* Payment Status */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        Payment Status
                      </label>
                      <select
                        value={paymentStatus}
                        onChange={e => setPaymentStatus(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-900 focus:ring-1 focus:ring-[#FF7A00] outline-none"
                      >
                        <option value="PENDING_QUOTE">Pending Shipping Quote</option>
                        <option value="QUOTE_SENT">Quote Sent to Customer</option>
                        <option value="PAID">Payment Completed</option>
                        <option value="REFUNDED">Refunded</option>
                      </select>
                    </div>

                    {/* Payment Link (Optional for sending via WhatsApp) */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        Payment Link URL (Stripe / Razorpay / PayPal Link) <span className="text-gray-400 normal-case font-normal">(optional)</span>
                      </label>
                      <input
                        type="url"
                        value={paymentLink}
                        onChange={e => setPaymentLink(e.target.value)}
                        placeholder="https://buy.stripe.com/... or https://rzp.io/..."
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-medium text-gray-900 focus:ring-1 focus:ring-[#FF7A00] outline-none"
                      />
                    </div>

                    {/* Tracking Number */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        Tracking Number
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={e => setTrackingNumber(e.target.value)}
                        placeholder="e.g. DHL94827103"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-medium text-gray-900 focus:ring-1 focus:ring-[#FF7A00] outline-none"
                      />
                    </div>

                    {/* Tracking URL */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        Tracking URL
                      </label>
                      <input
                        type="url"
                        value={trackingUrl}
                        onChange={e => setTrackingUrl(e.target.value)}
                        placeholder="https://dhl.com/track/..."
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-medium text-gray-900 focus:ring-1 focus:ring-[#FF7A00] outline-none"
                      />
                    </div>

                    {/* Staff Internal Notes */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        Internal Staff Notes
                      </label>
                      <textarea
                        rows={2}
                        value={staffNotes}
                        onChange={e => setStaffNotes(e.target.value)}
                        placeholder="Staff remarks, weight estimate, custom measurement confirmations..."
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-medium text-gray-900 focus:ring-1 focus:ring-[#FF7A00] outline-none"
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold text-center">
                      {errorMessage}
                    </div>
                  )}

                  {saveSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Quote &amp; Order details saved successfully!</span>
                    </div>
                  )}

                  {/* Save Button */}
                  <button
                    onClick={handleSaveQuote}
                    disabled={saving}
                    className="w-full py-3.5 rounded-xl bg-[#1C1C1C] hover:bg-[#FF7A00] text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save &amp; Update Order</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Section 5: 1-Click WhatsApp Quote Generator */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-2 border-emerald-500/30 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-900">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>1-Click WhatsApp Quote Generator</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Send the customer their itemized bill, quoted shipping fee, and secure payment link directly over WhatsApp.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <a
                      href={`https://wa.me/${selectedOrder.customer_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(
                        generateWhatsAppQuoteText(selectedOrder, shippingCost, courierName, paymentLink)
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Send Quote via WhatsApp</span>
                    </a>

                    <button
                      onClick={() => {
                        const msg = generateWhatsAppQuoteText(selectedOrder, shippingCost, courierName, paymentLink)
                        navigator.clipboard.writeText(msg)
                        setCopiedWA(true)
                        setTimeout(() => setCopiedWA(false), 2000)
                      }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-300 bg-white hover:border-gray-400 text-gray-700 font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                    >
                      {copiedWA ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedWA ? 'Copied!' : 'Copy Quote Text'}</span>
                    </button>
                  </div>
                </div>

                {/* Section 6: Delete Inquiry */}
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Request</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
