'use server'

import { createAdminClient } from '@/lib/supabase/server'

export interface OrderItemDetail {
  id: string
  name: string
  slug?: string
  price: number
  quantity: number
  image: string
}

export interface OrderTimelineItem {
  id: string
  eventType: string
  description: string
  createdAt: string
}

export interface TrackedOrderData {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  city: string
  state: string
  postalCode: string
  country: string
  currency?: string
  totalAmount: number
  subtotal: number
  shippingCost: number
  discountAmount: number
  orderStatus: string
  paymentStatus: string
  paymentMethod: string
  courierName?: string | null
  trackingNumber?: string | null
  trackingUrl?: string | null
  paymentLink?: string | null
  shipmentNotes?: string | null
  customNotes?: string | null
  isInternational?: boolean
  createdAt: string
  updatedAt: string
  items: OrderItemDetail[]
  timeline: OrderTimelineItem[]
}

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)
}

export async function trackOrderAction(orderQuery: string): Promise<{ success: boolean; order?: TrackedOrderData; error?: string }> {
  try {
    if (!orderQuery || !orderQuery.trim()) {
      return { success: false, error: 'Please enter a valid Order Number or Order ID.' }
    }

    const clean = orderQuery.trim().replace(/^#/, '') // remove leading '#' if entered
    const supabase = await createAdminClient()

    // 1. Try fetching from domestic `orders` table first
    let query = supabase
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

    if (isValidUUID(clean)) {
      query = query.eq('id', clean)
    } else {
      query = query.ilike('order_number', clean)
    }

    const { data: domesticOrders } = await query.limit(1)

    if (domesticOrders && domesticOrders.length > 0) {
      return formatDomesticOrderResponse(supabase, domesticOrders[0])
    }

    // 2. If not found in domestic, search in dedicated `international_orders` table!
    let intlQuery = supabase
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

    if (isValidUUID(clean)) {
      intlQuery = intlQuery.eq('id', clean)
    } else {
      intlQuery = intlQuery.ilike('order_number', clean)
    }

    const { data: intlOrders } = await intlQuery.limit(1)

    if (intlOrders && intlOrders.length > 0) {
      return formatInternationalOrderResponse(supabase, intlOrders[0])
    }

    // 3. Partial / Fuzzy Fallback Search for both tables
    // A. Domestic partial search
    const { data: fallbackDomestic } = await supabase
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
      .ilike('order_number', `%${clean}%`)
      .limit(1)

    if (fallbackDomestic && fallbackDomestic.length > 0) {
      return formatDomesticOrderResponse(supabase, fallbackDomestic[0])
    }

    // B. International partial search
    const { data: fallbackIntl } = await supabase
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
      .ilike('order_number', `%${clean}%`)
      .limit(1)

    if (fallbackIntl && fallbackIntl.length > 0) {
      return formatInternationalOrderResponse(supabase, fallbackIntl[0])
    }

    return { 
      success: false, 
      error: `No order or inquiry found matching "${clean}". Please verify your Order Number (e.g. SHAHI-2026-XXXXXX or INT-2026-XXXXX) from your confirmation email.` 
    }
  } catch (err: any) {
    console.error('Unexpected error in trackOrderAction:', err)
    return { success: false, error: err.message || 'An unexpected error occurred while tracking your order.' }
  }
}

// Helper: Format Domestic Orders
async function formatDomesticOrderResponse(supabase: any, rawOrder: any) {
  let timelineItems: OrderTimelineItem[] = []
  try {
    const { data: timelineData } = await supabase
      .from('order_timeline')
      .select('*')
      .eq('order_id', rawOrder.id)
      .order('created_at', { ascending: true })

    if (timelineData && timelineData.length > 0) {
      timelineItems = timelineData.map((t: any) => ({
        id: t.id,
        eventType: t.event_type,
        description: t.description,
        createdAt: t.created_at,
      }))
    }
  } catch (tErr) {
    console.warn('Could not load timeline for domestic order:', tErr)
  }

  const items: OrderItemDetail[] = (rawOrder.order_items || []).map((item: any) => {
    const product = item.products
    const primaryImg = product?.product_images?.find((i: any) => i.is_primary)?.url
      || product?.product_images?.[0]?.url
      || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=300&auto=format&fit=crop'

    return {
      id: item.id,
      name: product?.name || 'Boutique Garment',
      slug: product?.slug,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      image: primaryImg,
    }
  })

  const formatted: TrackedOrderData = {
    id: rawOrder.id,
    orderNumber: rawOrder.order_number,
    customerName: rawOrder.customer_name || 'Valued Customer',
    customerEmail: rawOrder.customer_email || '',
    customerPhone: rawOrder.customer_phone || '',
    shippingAddress: rawOrder.shipping_address || '',
    city: rawOrder.city || '',
    state: rawOrder.state || '',
    postalCode: rawOrder.postal_code || '',
    country: rawOrder.country || 'India',
    totalAmount: Number(rawOrder.total_amount || 0),
    subtotal: Number(rawOrder.subtotal || rawOrder.total_amount || 0),
    shippingCost: Number(rawOrder.shipping_cost || 0),
    discountAmount: Number(rawOrder.discount_amount || 0),
    orderStatus: (rawOrder.order_status || 'CONFIRMED').toUpperCase(),
    paymentStatus: (rawOrder.payment_status || 'PENDING').toUpperCase(),
    paymentMethod: (rawOrder.payment_method || 'ONLINE').toUpperCase(),
    courierName: rawOrder.courier_name || null,
    trackingNumber: rawOrder.tracking_number || null,
    trackingUrl: rawOrder.tracking_url || null,
    shipmentNotes: rawOrder.shipment_notes || null,
    isInternational: false,
    createdAt: rawOrder.created_at,
    updatedAt: rawOrder.updated_at || rawOrder.created_at,
    items,
    timeline: timelineItems,
  }

  return { success: true, order: formatted }
}

// Helper: Format International Orders
async function formatInternationalOrderResponse(supabase: any, rawOrder: any) {
  let timelineItems: OrderTimelineItem[] = []
  try {
    const { data: timelineData } = await supabase
      .from('international_order_timeline')
      .select('*')
      .eq('international_order_id', rawOrder.id)
      .order('created_at', { ascending: true })

    if (timelineData && timelineData.length > 0) {
      timelineItems = timelineData.map((t: any) => ({
        id: t.id,
        eventType: t.event_type,
        description: t.description,
        createdAt: t.created_at,
      }))
    }
  } catch (tErr) {
    console.warn('Could not load timeline for international order:', tErr)
  }

  const rawItems = rawOrder.international_order_items || rawOrder.raw_items || []
  const items: OrderItemDetail[] = rawItems.map((item: any) => {
    const product = item.products
    const primaryImg = item.product_image 
      || product?.product_images?.find((i: any) => i.is_primary)?.url
      || product?.product_images?.[0]?.url
      || item.image
      || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=300&auto=format&fit=crop'

    return {
      id: item.id || item.productId || item.product_id,
      name: item.product_name || product?.name || item.name || 'Bespoke Item',
      slug: product?.slug,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      image: primaryImg,
    }
  })

  const formatted: TrackedOrderData = {
    id: rawOrder.id,
    orderNumber: rawOrder.order_number,
    customerName: rawOrder.customer_name || 'Valued Customer',
    customerEmail: rawOrder.customer_email || '',
    customerPhone: rawOrder.customer_phone || '',
    shippingAddress: rawOrder.shipping_address || '',
    city: rawOrder.city || '',
    state: rawOrder.state || '',
    postalCode: rawOrder.postal_code || '',
    country: rawOrder.country || 'International',
    currency: rawOrder.currency || 'USD',
    totalAmount: Number(rawOrder.total_amount || 0),
    subtotal: Number(rawOrder.subtotal || rawOrder.total_amount || 0),
    shippingCost: Number(rawOrder.shipping_cost || 0),
    discountAmount: Number(rawOrder.discount_amount || 0),
    orderStatus: (rawOrder.order_status || 'PENDING_REVIEW').toUpperCase(),
    paymentStatus: (rawOrder.payment_status || 'PENDING_QUOTE').toUpperCase(),
    paymentMethod: 'INTERNATIONAL_CONCIERGE',
    courierName: rawOrder.courier_name || null,
    trackingNumber: rawOrder.tracking_number || null,
    trackingUrl: rawOrder.tracking_url || null,
    paymentLink: rawOrder.payment_link || null,
    customNotes: rawOrder.custom_notes || rawOrder.staff_notes || null,
    isInternational: true,
    createdAt: rawOrder.created_at,
    updatedAt: rawOrder.updated_at || rawOrder.created_at,
    items,
    timeline: timelineItems,
  }

  return { success: true, order: formatted }
}
