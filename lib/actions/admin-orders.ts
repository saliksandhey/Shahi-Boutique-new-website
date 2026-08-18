'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendOrderStatusEmail } from '@/lib/actions/emails'

export async function updateOrderStatus(orderId: string, newStatus: string, description: string) {
  const supabase = createAdminClient()

  const { error: updateError } = await supabase.from('orders').update({ order_status: newStatus }).eq('id', orderId)
  if (updateError) return { error: updateError.message }

  // Add timeline event
  await supabase.from('order_timeline').insert([{
    order_id: orderId,
    event_type: 'Status Changed',
    description: `Order status updated to ${newStatus.toUpperCase()}: ${description}`
  }])

  // trigger email here based on newStatus
  try {
    const { data: order } = await supabase.from('orders').select('customer_email, customer_name, order_number, tracking_number, tracking_url').eq('id', orderId).single()
    if (order && order.customer_email) {
      await sendOrderStatusEmail(
        order.customer_email,
        order.customer_name || 'Customer',
        order.order_number,
        newStatus,
        order.tracking_number,
        order.tracking_url
      )
    }
  } catch (e) {
    console.error("Failed to send status update email", e)
  }

  revalidatePath(`/2010admin/orders/${orderId}`)
  revalidatePath('/2010admin/orders')
  return { success: true }
}

export async function updateShippingDetails(orderId: string, formData: FormData) {
  const supabase = createAdminClient()
  
  const courier_name = formData.get('courier_name') as string
  const tracking_number = formData.get('tracking_number') as string
  const tracking_url = formData.get('tracking_url') as string
  const shipment_notes = formData.get('shipment_notes') as string

  const { error } = await supabase.from('orders').update({
    courier_name,
    tracking_number,
    tracking_url,
    shipment_notes
  }).eq('id', orderId)

  if (error) return { error: error.message }

  await supabase.from('order_timeline').insert([{
    order_id: orderId,
    event_type: 'Tracking Updated',
    description: `Shipping details updated: ${courier_name} (${tracking_number})`
  }])

  try {
    const { data: order } = await supabase.from('orders').select('customer_email, customer_name, order_number, order_status').eq('id', orderId).single()
    if (order && order.customer_email && order.order_status !== 'CONFIRMED') {
      await sendOrderStatusEmail(
        order.customer_email,
        order.customer_name || 'Customer',
        order.order_status, // Keep same status
        tracking_number,
        tracking_url
      )
    }
  } catch(e) {
    console.error("Failed to send tracking update email", e)
  }

  revalidatePath(`/2010admin/orders/${orderId}`)
  return { success: true }
}

export async function addTimelineEvent(orderId: string, eventType: string, description: string) {
  const supabase = createAdminClient()
  
  const { error } = await supabase.from('order_timeline').insert([{
    order_id: orderId,
    event_type: eventType,
    description
  }])

  if (error) return { error: error.message }

  revalidatePath(`/2010admin/orders/${orderId}`)
  return { success: true }
}

export async function saveStaffNotes(orderId: string, staff_notes: string, tags: string[]) {
  const supabase = createAdminClient()
  
  const { error } = await supabase.from('orders').update({
    staff_notes,
    tags
  }).eq('id', orderId)

  if (error) return { error: error.message }

  await addTimelineEvent(orderId, 'Internal Note Added', 'Staff notes or tags were updated.')
  
  revalidatePath(`/2010admin/orders/${orderId}`)
  return { success: true }
}

export async function processRefund(orderId: string, items: {id: string, qty: number, product_id: string}[], amount: number, restock: boolean) {
  const supabase = createAdminClient()
  
  // Create refund record
  const { error: refundError } = await supabase.from('order_refunds').insert([{
    order_id: orderId,
    amount,
    reason: 'Customer requested refund',
    restocked: restock
  }])

  if (refundError) return { error: refundError.message }

  // Update order items refunded quantities & restock inventory
  for (const item of items) {
    if (item.qty > 0) {
      // get current refunded qty
      const { data: currentItem } = await supabase.from('order_items').select('refunded_quantity').eq('id', item.id).single()
      const newRefundedQty = (currentItem?.refunded_quantity || 0) + item.qty
      
      await supabase.from('order_items').update({ refunded_quantity: newRefundedQty }).eq('id', item.id)

      if (restock) {
        // fetch current stock from products
        const { data: product } = await supabase.from('products').select('stock').eq('id', item.product_id).single()
        if (product) {
          await supabase.from('products').update({ stock: product.stock + item.qty }).eq('id', item.product_id)
        }
      }
    }
  }

  await supabase.from('orders').update({ order_status: 'REFUNDED' }).eq('id', orderId)
  await addTimelineEvent(orderId, 'Refund Processed', `Refund of $${amount} processed for ${items.filter(i => i.qty > 0).length} items. Restocked: ${restock ? 'Yes' : 'No'}.`)

  try {
    const { data: order } = await supabase.from('orders').select('customer_email, customer_name, order_number').eq('id', orderId).single()
    if (order && order.customer_email) {
      await sendOrderStatusEmail(
        order.customer_email,
        order.customer_name || 'Customer',
        order.order_number,
        'REFUNDED'
      )
    }
  } catch (e) {
    console.error("Failed to send refund email", e)
  }

  revalidatePath(`/2010admin/orders/${orderId}`)
  return { success: true }
}

export async function updateOrderShippingAddress(orderId: string, address: any) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('orders').update({ 
    shipping_address: address.shipping_address,
    city: address.city,
    state: address.state,
    postal_code: address.postal_code,
    country: address.country,
    customer_name: address.customer_name,
    customer_phone: address.customer_phone
  }).eq('id', orderId)
  if (error) return { error: error.message }
  
  await addTimelineEvent(orderId, 'Address Updated', 'Shipping address was manually updated by staff.')
  revalidatePath(`/2010admin/orders/${orderId}`)
  return { success: true }
}

