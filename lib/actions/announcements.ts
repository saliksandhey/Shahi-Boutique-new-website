'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getActiveAnnouncements() {
  const supabase = createAdminClient()
  
  const now = new Date().toISOString()

  // Fetch active announcements that match date criteria
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)

  if (error) {
    console.error("Error fetching announcements:", error)
    return []
  }

  return data
}

export async function getAllAnnouncements() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { announcements: data }
}

export async function createAnnouncement(formData: FormData) {
  const supabase = createAdminClient()
  
  const announcement = {
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    image_url: formData.get('image_url') as string || null,
    action_text: formData.get('action_text') as string || null,
    action_link: formData.get('action_link') as string || null,
    display_type: formData.get('display_type') as string,
    is_active: formData.get('is_active') === 'true',
    start_date: formData.get('start_date') ? new Date(formData.get('start_date') as string).toISOString() : null,
    end_date: formData.get('end_date') ? new Date(formData.get('end_date') as string).toISOString() : null,
  }

  const { error } = await supabase
    .from('announcements')
    .insert([announcement])

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  revalidatePath('/2010admin/announcements')
  return { success: true }
}

export async function updateAnnouncement(id: string, formData: FormData) {
  const supabase = createAdminClient()
  
  const announcement = {
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    image_url: formData.get('image_url') as string || null,
    action_text: formData.get('action_text') as string || null,
    action_link: formData.get('action_link') as string || null,
    display_type: formData.get('display_type') as string,
    is_active: formData.get('is_active') === 'true',
    start_date: formData.get('start_date') ? new Date(formData.get('start_date') as string).toISOString() : null,
    end_date: formData.get('end_date') ? new Date(formData.get('end_date') as string).toISOString() : null,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('announcements')
    .update(announcement)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  revalidatePath('/2010admin/announcements')
  return { success: true }
}

export async function deleteAnnouncement(id: string) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  revalidatePath('/2010admin/announcements')
  return { success: true }
}
