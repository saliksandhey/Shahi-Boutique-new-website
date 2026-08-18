'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveReview(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('reviews').update({ approved: true }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/2010admin/reviews')
  return { success: true }
}

export async function rejectReview(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('reviews').update({ approved: false }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/2010admin/reviews')
  return { success: true }
}

export async function deleteReview(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/2010admin/reviews')
  return { success: true }
}
