'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function saveAddress(formData: FormData) {
  try {
    const user = await requireAuth()
    const supabase = createAdminClient()

    const id = formData.get('id') as string | null
    
    const addressData = {
      user_id: user.id,
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      address_line1: formData.get('address_line1') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      postal_code: formData.get('postal_code') as string,
      country: formData.get('country') as string || 'US',
      is_default: true
    }

    if (id) {
      const { error } = await supabase
        .from('addresses')
        .update(addressData)
        .eq('id', id)
        .eq('user_id', user.id)
        
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('addresses')
        .insert(addressData)
        
      if (error) throw error
    }

    revalidatePath('/account/addresses')
    revalidatePath('/checkout')
    return { success: true }
  } catch (error: any) {
    console.error('Error saving address:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteAddress(id: string) {
  try {
    const user = await requireAuth()
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/account/addresses')
    revalidatePath('/checkout')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting address:', error)
    return { success: false, error: error.message }
  }
}
