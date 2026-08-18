'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const couponSchema = z.object({
  code: z.string().min(1, "Code is required").toUpperCase(),
  discount_type: z.enum(['PERCENTAGE', 'FIXED']),
  discount_value: z.coerce.number().min(0),
  min_order_amount: z.coerce.number().min(0).default(0),
  expiry_date: z.string().optional().nullable(),
  active: z.boolean().default(true),
  is_public: z.boolean().default(false)
})

export async function createCoupon(formData: FormData) {
  const supabase = createAdminClient()
  
  const rawData = {
    code: formData.get('code'),
    discount_type: formData.get('discount_type'),
    discount_value: formData.get('discount_value'),
    min_order_amount: formData.get('min_order_amount') || 0,
    expiry_date: formData.get('expiry_date') || null,
    active: formData.get('active') === 'on' || formData.get('active') === 'true',
    is_public: formData.get('is_public') === 'on' || formData.get('is_public') === 'true'
  }

  const validated = couponSchema.safeParse(rawData)
  if (!validated.success) return { error: (validated as any).error.errors[0].message }

  const dataToInsert = {
    ...validated.data,
    expiry_date: validated.data.expiry_date ? new Date(validated.data.expiry_date).toISOString() : null
  }

  const { error } = await supabase.from('coupons').insert([dataToInsert])
  if (error) return { error: error.message }

  revalidatePath('/2010admin/coupons')
  redirect('/2010admin/coupons')
}

export async function updateCoupon(id: string, formData: FormData) {
  const supabase = createAdminClient()
  
  const rawData = {
    code: formData.get('code'),
    discount_type: formData.get('discount_type'),
    discount_value: formData.get('discount_value'),
    min_order_amount: formData.get('min_order_amount') || 0,
    expiry_date: formData.get('expiry_date') || null,
    active: formData.get('active') === 'on' || formData.get('active') === 'true',
    is_public: formData.get('is_public') === 'on' || formData.get('is_public') === 'true'
  }

  const validated = couponSchema.safeParse(rawData)
  if (!validated.success) return { error: (validated as any).error.errors[0].message }

  const dataToUpdate = {
    ...validated.data,
    expiry_date: validated.data.expiry_date ? new Date(validated.data.expiry_date).toISOString() : null
  }

  const { error } = await supabase.from('coupons').update(dataToUpdate).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/2010admin/coupons')
  redirect('/2010admin/coupons')
}

export async function deleteCoupon(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('coupons').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/2010admin/coupons')
  return { success: true }
}
