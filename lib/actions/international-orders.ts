'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { CartInputItem } from '@/lib/actions/checkout'
import { sendInternationalOrderRequestEmail, sendInternationalQuoteEmail } from '@/lib/actions/emails'

export interface InternationalOrderFilter {
  status?: string
  country?: string
  searchQuery?: string
}

// 1. Submit International Order Request from Checkout
export async function submitInternationalOrderRequest(
  address: {
    firstName: string
    lastName: string
    email: string
    phone: string
    country: string
    street: string
    apartment?: string
    city: string
    state: string
    zip: string
  },
  items: CartInputItem[],
  currency: string = 'USD',
  customNotes?: string,
  couponCode?: string
) {
  try {
    const supabaseAdmin = createAdminClient()
    const supabase = await createClient()

    let user: any = null
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user || null
    } catch {
      user = null
    }

    if (!items || items.length === 0) {
      return { success: false, error: 'Your bag is empty.' }
    }

    // 1. Calculate and validate items
    let subtotal = 0
    const validatedItems: any[] = []

    for (const item of items) {
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('id, name, price, sale_price, stock, product_images(url, is_primary)')
        .eq('id', item.productId)
        .single()

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`)
      }

      const itemPrice = product.sale_price || product.price || 0
      subtotal += itemPrice * item.quantity

      const primaryImg = product.product_images?.find((img: any) => img.is_primary)?.url || 
                         product.product_images?.[0]?.url || '/placeholder.png'

      validatedItems.push({
        productId: product.id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        image: primaryImg,
        variantId: item.variantId || null
      })
    }

    // Discount handling (if any coupon applied)
    let discount = 0
    let couponId: string | null = null
    if (couponCode) {
      const { data: coupon } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('active', true)
        .single()

      if (coupon) {
        couponId = coupon.id
        if (coupon.discount_type === 'PERCENTAGE') {
          discount = Math.round((subtotal * coupon.discount_value) / 100)
          if (coupon.max_discount_amount) {
            discount = Math.min(discount, coupon.max_discount_amount)
          }
        } else {
          discount = Math.min(coupon.discount_value, subtotal)
        }
      }
    }

    const totalAmount = Math.max(0, subtotal - discount)
    const orderNumber = `INT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
    const fullName = `${address.firstName} ${address.lastName}`.trim()

    // 2. Customer profile update
    const { data: existingProfile } = await supabaseAdmin
      .from('customer_profiles')
      .select('id')
      .eq('email', address.email)
      .single()

    if (existingProfile) {
      await supabaseAdmin.from('customer_profiles').update({
        name: fullName,
        phone: address.phone,
        updated_at: new Date().toISOString()
      }).eq('id', existingProfile.id)
    } else {
      await supabaseAdmin.from('customer_profiles').insert({
        email: address.email,
        name: fullName,
        phone: address.phone
      })
    }

    // 3. Insert into dedicated `international_orders` table
    const orderPayload = {
      user_id: user?.id || null,
      order_number: orderNumber,
      customer_name: fullName,
      customer_email: address.email,
      customer_phone: address.phone,
      country: address.country,
      currency: currency,
      shipping_address: `${address.street}${address.apartment ? `, ${address.apartment}` : ''}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`,
      shipping_address_line1: address.street,
      shipping_address_line2: address.apartment || null,
      city: address.city,
      state: address.state,
      postal_code: address.zip,
      subtotal: subtotal,
      discount_amount: discount,
      shipping_cost: 0,
      total_amount: totalAmount,
      order_status: 'PENDING_REVIEW',
      payment_status: 'PENDING_QUOTE',
      courier_name: 'DHL Express Worldwide',
      staff_notes: null,
      custom_notes: customNotes || null,
      coupon_id: couponId,
      coupon_code: couponCode || null,
      raw_items: validatedItems
    }

    const { data: createdOrder, error: orderErr } = await supabaseAdmin
      .from('international_orders')
      .insert([orderPayload])
      .select('id')
      .single()

    if (orderErr || !createdOrder) {
      console.error('Error creating international order row:', orderErr)
      throw new Error(orderErr?.message || 'Failed to create international order request.')
    }

    // 4. Insert dedicated items
    const itemsToInsert = validatedItems.map(item => ({
      international_order_id: createdOrder.id,
      product_id: item.productId,
      variant_id: item.variantId,
      product_name: item.name,
      product_image: item.image,
      quantity: item.quantity,
      price: item.price
    }))

    const { error: itemsErr } = await supabaseAdmin
      .from('international_order_items')
      .insert(itemsToInsert)

    if (itemsErr) {
      console.error('Error inserting international_order_items:', itemsErr)
    }

    // 5. Insert Timeline Event
    await supabaseAdmin.from('international_order_timeline').insert([{
      international_order_id: createdOrder.id,
      event_type: 'International Request Created',
      description: `International order request #${orderNumber} submitted for ${address.country} (${currency}). Awaiting shipping quote.`
    }])

    // 6. Generate WhatsApp Concierge Link
    const itemsSummary = validatedItems.map(i => `• ${i.name} (x${i.quantity}) - ₹${i.price * i.quantity}`).join('\n')
    const waText = `👑 *NEW INTERNATIONAL ORDER INQUIRY*
Ref: #${orderNumber}
Destination: ${address.city}, ${address.country} (${address.zip})
-------------------------------------
*Items Requested:*
${itemsSummary}
-------------------------------------
*Subtotal:* ₹${totalAmount}
*Customer:* ${fullName}
*Phone:* ${address.phone}
*Email:* ${address.email}
${customNotes ? `*Notes:* ${customNotes}\n` : ''}
Please calculate express international shipping and share payment details.`

    const whatsappUrl = `https://wa.me/919041762820?text=${encodeURIComponent(waText)}`

    // 7. Dispatch luxury confirmation email in background
    sendInternationalOrderRequestEmail(
      address.email,
      fullName,
      orderNumber,
      validatedItems,
      {
        subtotal,
        shipping: 0,
        discount,
        total: totalAmount
      },
      `${address.street}${address.apartment ? `, ${address.apartment}` : ''}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`,
      address.country,
      currency,
      customNotes
    ).catch(e => console.error('Error dispatching international order email:', e))

    revalidatePath('/2010admin/international-orders')

    return {
      success: true,
      orderNumber,
      orderId: createdOrder.id,
      totalAmount,
      currency,
      whatsappUrl
    }
  } catch (err: any) {
    console.error('submitInternationalOrderRequest error:', err)
    return { success: false, error: err.message || 'Something went wrong while submitting request.' }
  }
}

// 2. Fetch International Orders for Admin Dashboard
export async function getInternationalOrders(filters?: InternationalOrderFilter) {
  try {
    const supabaseAdmin = createAdminClient()

    let query = supabaseAdmin
      .from('international_orders')
      .select(`
        *,
        international_order_items (
          id,
          quantity,
          price,
          product_id,
          product_name,
          product_image,
          products (
            id,
            name,
            slug,
            price,
            sale_price,
            product_images (url, is_primary)
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (filters?.status && filters.status !== 'ALL') {
      query = query.eq('order_status', filters.status)
    }

    if (filters?.country && filters.country !== 'ALL') {
      query = query.eq('country', filters.country)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('getInternationalOrders error:', error)
      return { success: false, orders: [] }
    }

    let filtered = orders || []

    if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim()
      filtered = filtered.filter((o: any) => 
        o.order_number?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_email?.toLowerCase().includes(q) ||
        o.customer_phone?.toLowerCase().includes(q) ||
        o.city?.toLowerCase().includes(q) ||
        o.country?.toLowerCase().includes(q)
      )
    }

    return { success: true, orders: filtered }
  } catch (err: any) {
    console.error('getInternationalOrders catch:', err)
    return { success: false, orders: [] }
  }
}

// 3. Update International Quote & Shipping Information (Admin Action)
export async function updateInternationalOrderQuote(
  orderId: string,
  formData: {
    shippingCost: number
    courierName: string
    trackingNumber?: string
    trackingUrl?: string
    paymentLink?: string
    orderStatus: string
    paymentStatus: string
    staffNotes?: string
  }
) {
  try {
    const supabaseAdmin = createAdminClient()

    // 1. Fetch current order with items
    const { data: currentOrder, error: fetchErr } = await supabaseAdmin
      .from('international_orders')
      .select(`
        *,
        international_order_items (
          id, quantity, price, product_name, product_image
        )
      `)
      .eq('id', orderId)
      .single()

    if (fetchErr || !currentOrder) {
      return { success: false, error: 'Order not found.' }
    }

    const newTotal = (currentOrder.subtotal || 0) - (currentOrder.discount_amount || 0) + Number(formData.shippingCost || 0)

    const updatePayload: any = {
      shipping_cost: Number(formData.shippingCost || 0),
      total_amount: Math.max(0, newTotal),
      courier_name: formData.courierName || null,
      tracking_number: formData.trackingNumber || null,
      tracking_url: formData.trackingUrl || null,
      payment_link: formData.paymentLink || null,
      order_status: formData.orderStatus,
      payment_status: formData.paymentStatus,
      staff_notes: formData.staffNotes || null,
      updated_at: new Date().toISOString()
    }

    const { error: updateErr } = await supabaseAdmin
      .from('international_orders')
      .update(updatePayload)
      .eq('id', orderId)

    if (updateErr) {
      return { success: false, error: updateErr.message }
    }

    // Insert timeline record
    await supabaseAdmin.from('international_order_timeline').insert([{
      international_order_id: orderId,
      event_type: 'Quote / Status Updated',
      description: `Quote Updated: Shipping ₹${formData.shippingCost} (${formData.courierName || 'Unspecified'}), Status: ${formData.orderStatus}, Payment: ${formData.paymentStatus}`
    }])

    // Send customer quote email in background
    const itemsList = (currentOrder.international_order_items || []).map((i: any) => ({
      name: i.product_name || 'Bespoke Garment',
      quantity: i.quantity,
      price: i.price
    }))

    sendInternationalQuoteEmail(
      currentOrder.customer_email,
      currentOrder.customer_name,
      currentOrder.order_number,
      itemsList,
      {
        subtotal: currentOrder.subtotal || 0,
        shipping: Number(formData.shippingCost || 0),
        discount: currentOrder.discount_amount || 0,
        total: Math.max(0, newTotal)
      },
      currentOrder.shipping_address,
      formData.courierName,
      formData.paymentLink,
      currentOrder.country,
      currentOrder.currency,
      formData.trackingNumber,
      formData.trackingUrl
    ).catch(e => console.error('Error sending quote email:', e))

    revalidatePath('/2010admin/international-orders')

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update quote.' }
  }
}

// 4. Delete / Archive International Request
export async function deleteInternationalOrder(orderId: string) {
  try {
    const supabaseAdmin = createAdminClient()

    await supabaseAdmin.from('international_order_timeline').delete().eq('international_order_id', orderId)
    await supabaseAdmin.from('international_order_items').delete().eq('international_order_id', orderId)
    const { error } = await supabaseAdmin.from('international_orders').delete().eq('id', orderId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/2010admin/international-orders')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete order.' }
  }
}
