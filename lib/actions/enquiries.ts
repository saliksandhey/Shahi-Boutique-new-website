'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type EnquiryPayload = {
  product_id: string
  user_id?: string
  full_name: string
  country: string
  state: string
  phone_number: string
  message?: string
}

export async function submitProductEnquiry(data: EnquiryPayload) {
  const supabase = createAdminClient()
  
  const { error } = await supabase.from('product_enquiries').insert([data])
  
  if (error) {
    return { error: error.message }
  }
  
  // Optionally you could send an email via Resend here.
  
  return { success: true }
}

export async function updateEnquiryStatus(id: string, status: string) {
  const supabase = createAdminClient()
  
  const { error } = await supabase.from('product_enquiries').update({ status }).eq('id', id)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/enquiries')
  return { success: true }
}

export async function deleteEnquiry(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('product_enquiries').delete().eq('id', id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/admin/enquiries')
  return { success: true }
}
