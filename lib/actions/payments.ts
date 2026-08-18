'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markOrderAsPaid(orderId: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('orders')
    .update({ payment_status: 'PAID' })
    .eq('id', orderId)
    
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/2010admin/payments')
  revalidatePath(`/2010admin/orders/${orderId}`)
  
  return { success: true }
}
