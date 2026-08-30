'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { getRazorpayInstance } from '@/lib/razorpay'
import crypto from 'crypto'
import { sendOrderConfirmationEmail } from '@/lib/actions/emails'

export async function getPublicCoupons() {
  const supabase = await createAdminClient()
  const { data } = await supabase.from('coupons').select('*').eq('active', true).eq('is_public', true)
  return data || []
}

export type CartInputItem = {
  productId: string
  variantId?: string | null
  quantity: number
}

// 1. Calculate Server Totals
export async function calculateOrderTotal(items: CartInputItem[], shippingMethod: string, couponCode?: string, country: string = "IN") {
  if (country === "India") country = "IN";
  const supabase = await createAdminClient()
  
  let subtotal = 0
  let discount = 0
  let shipping = 0;
  
  try {
    const { data: zone } = await supabase.from('shipping_zones').select('shipping_fee_inr').eq('country_code', country).single();
    if (zone) {
      shipping = zone.shipping_fee_inr;
    } else {
      // Fallback if not found or table doesn't exist yet
      const fallbacks: any = { 'IN': 0, 'US': 3000, 'GB': 2500, 'CA': 3200, 'AE': 1500, 'AU': 3500 };
      shipping = fallbacks[country] !== undefined ? fallbacks[country] : 4000;
    }
  } catch (e) {
    console.error("SHIPPING FETCH ERROR:", e);
    const fallbacks: any = { 'IN': 0, 'US': 3000, 'GB': 2500, 'CA': 3200, 'AE': 1500, 'AU': 3500 };
    shipping = fallbacks[country] !== undefined ? fallbacks[country] : 4000;
  }

  const validatedItems = []

  for (const item of items) {
    const { data: product } = await supabase.from('products').select('price, sale_price, name, stock').eq('id', item.productId).single()
    if (!product) throw new Error(`Product not found: ${item.productId}`)
    
    let price = product.sale_price || product.price
    let availableStock = product.stock

    let variantNameStr = ''

    if (availableStock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}${variantNameStr}`)
    }

    subtotal += price * item.quantity
    validatedItems.push({
      productId: item.productId,
      variantId: item.variantId || null,
      quantity: item.quantity,
      price: price,
      name: product.name + variantNameStr,
    })
  }

  // Free shipping over $150
  // Free shipping logic removed

  let couponId = null
  let appliedDiscountText = ''
  if (couponCode) {
    const { data: coupon } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase()).eq('active', true).single()
    if (coupon) {
       const isNotExpired = coupon.expiry_date ? new Date(coupon.expiry_date) > new Date() : true
       const meetsMinimum = subtotal >= (coupon.min_order_amount || 0)
       if (isNotExpired && meetsMinimum) {
         discount = coupon.discount_type === 'PERCENTAGE' 
           ? (subtotal * coupon.discount_value) / 100 
           : coupon.discount_value
         couponId = coupon.id
         appliedDiscountText = coupon.code
       }
    }
  }

  const total = subtotal + shipping - discount

  return {
    subtotal,
    shipping,
    discount,
    total: Math.max(0, total),
    validatedItems,
    couponId,
    appliedDiscountText,
    couponApplied: !!couponId,
    isFreeGift: couponId && discount === 0 // If it's applied but discount is 0, it's a free gift
  }
}

// 2. Create Concierge Order
export async function createConciergeOrderAction(
  address: any,
  items: CartInputItem[],
  shippingMethod: string,
  couponCode?: string
) {
  try {
    return await createFinalOrder(items, address, shippingMethod, 'PENDING', 'COD', null, null, couponCode)
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Internal function to create the actual order records and deduct stock
async function createFinalOrder(
  items: CartInputItem[], 
  address: any, 
  shippingMethod: string, 
  paymentStatus: string, 
  paymentMethod: string,
  razorpayOrderId?: string | null,
  razorpayPaymentId?: string | null,
  couponCode?: string
) {
  const supabaseAdmin = await createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("You must be logged in to place an order.")
  }
  
  // 1. Recalculate and validate again
  const totals = await calculateOrderTotal(items, shippingMethod, couponCode)

  // 2. Generate Order Number
  const orderNumber = `SHAHI-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

  // 3. Auto-create or update customer profile
  const fullName = `${address.firstName} ${address.lastName}`.trim()
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

  // 3.5 Save or update default address
  const { data: existingAddress } = await supabaseAdmin
    .from('addresses')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const addressData = {
    user_id: user.id,
    full_name: fullName,
    phone: address.phone,
    address_line1: address.street,
    city: address.city,
    state: address.state,
    postal_code: address.zip,
    country: address.country || 'India',
    is_default: true
  }

  if (existingAddress) {
    await supabaseAdmin.from('addresses').update(addressData).eq('id', existingAddress.id)
  } else {
    await supabaseAdmin.from('addresses').insert(addressData)
  }

  // 4. Insert Order (Flat schema)
  const { data: order, error: orderError } = await supabaseAdmin.from('orders').insert({
    order_number: orderNumber,
    customer_name: fullName,
    customer_email: address.email,
    customer_phone: address.phone,
    shipping_address: address.street,
    city: address.city,
    state: address.state,
    postal_code: address.zip,
    country: address.country || 'India',
    total_amount: totals.total,
    subtotal: totals.subtotal,
    shipping_cost: totals.shipping,
    discount_amount: totals.discount,
    coupon_id: totals.couponId,
    order_status: 'CONFIRMED',
    payment_status: paymentStatus,
    payment_method: paymentMethod,
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
  }).select().single()

  if (orderError) throw new Error("Failed to create order record: " + orderError.message)

  // Insert initial timeline event
  await supabaseAdmin.from('order_timeline').insert({
    order_id: order.id,
    event_type: 'Order Placed',
    description: `Order successfully placed via ${paymentMethod}.`
  })

  // 5. Insert Order Items and Deduct Stock
  for (const item of totals.validatedItems) {
    const { error: itemError } = await supabaseAdmin.from('order_items').insert({
      order_id: order.id,
      product_id: item.productId,
      price: item.price,
      quantity: item.quantity,
    })

    if (itemError) {
      console.error("Failed to insert order item:", itemError)
      throw new Error("Failed to create order items: " + itemError.message)
    }

    const { data: pData } = await supabaseAdmin.from('products').select('stock').eq('id', item.productId).single()
    if (pData) await supabaseAdmin.from('products').update({ stock: pData.stock - item.quantity }).eq('id', item.productId)
  }

  // 6. Send Order Confirmation Email
  try {
    const fullAddress = `${address.street}, ${address.city}, ${address.state} ${address.zip}, ${address.country || 'IN'}`
    await sendOrderConfirmationEmail(
      address.email,
      fullName,
      orderNumber,
      totals.validatedItems,
      totals,
      fullAddress
    )
  } catch (e) {
    console.error("SHIPPING FETCH ERROR:", e);
    console.error("Failed to trigger order confirmation email", e)
  }

  return { success: true, orderId: order.id, orderNumber }
}
