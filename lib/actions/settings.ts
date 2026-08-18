'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getStoreSettings() {
  const supabase = await createAdminClient()
  
  const { data, error } = await supabase
    .from('store_settings')
    .select('key, value')
    
  if (error) {
    console.error('Error fetching settings:', error)
    return {}
  }
  
  // Convert array of {key, value} to an object
  return data.reduce((acc, item) => {
    acc[item.key] = item.value
    return acc
  }, {} as Record<string, string>)
}

export async function updateStoreSettings(formData: FormData) {
  const supabase = await createAdminClient()
  
  const razorpayKeyId = formData.get('razorpay_key_id') as string
  const razorpayKeySecret = formData.get('razorpay_key_secret') as string
  const codEnabled = formData.get('cod_enabled') as string
  const marqueeContent = formData.get('marquee_content') as string
  const marqueeSpeed = formData.get('marquee_speed') as string
  const heroSliderInterval = formData.get('hero_slider_interval') as string
  const heroSliderSlides = formData.get('hero_slider_slides') as string
  
  const updates = [
    { key: 'razorpay_key_id', value: razorpayKeyId },
    { key: 'razorpay_key_secret', value: razorpayKeySecret },
    { key: 'cod_enabled', value: codEnabled },
    { key: 'marquee_content', value: marqueeContent },
    { key: 'marquee_speed', value: marqueeSpeed },
    { key: 'hero_slider_interval', value: heroSliderInterval },
    { key: 'hero_slider_slides', value: heroSliderSlides }
  ]
  
  for (const item of updates) {
    if (item.value !== null && item.value !== undefined) {
      const { error } = await supabase
        .from('store_settings')
        .upsert(
          { key: item.key, value: item.value },
          { onConflict: 'key' }
        )
        
      if (error) {
        return { success: false, error: `Failed to update ${item.key}: ${error.message}` }
      }
    }
  }
  
  revalidatePath('/2010admin/settings')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateBannerSettings(formData: FormData) {
  const supabase = await createAdminClient()
  
  const heroSliderInterval = formData.get('hero_slider_interval') as string
  const heroSliderSlides = formData.get('hero_slider_slides') as string
  
  const updates = [
    { key: 'hero_slider_interval', value: heroSliderInterval },
    { key: 'hero_slider_slides', value: heroSliderSlides }
  ]
  
  for (const item of updates) {
    if (item.value !== null && item.value !== undefined) {
      const { error } = await supabase
        .from('store_settings')
        .upsert(
          { key: item.key, value: item.value },
          { onConflict: 'key' }
        )
        
      if (error) {
        return { success: false, error: `Failed to update ${item.key}: ${error.message}` }
      }
    }
  }
  
  revalidatePath('/2010admin/banners')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function uploadHeroBanner(formData: FormData) {
  const supabase = await createAdminClient()
  const file = formData.get('hero_banner') as File
  const bannerType = formData.get('type') as string || 'desktop' // 'desktop' or 'mobile'
  
  if (!file || file.size === 0) {
    return { error: 'No file provided' }
  }

  const fileExt = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const filePath = `hero-banner/${bannerType}-${Math.random().toString(36).substring(2)}.${fileExt}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Upload to product-images bucket (reusing existing bucket)
  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: true
    })

  if (uploadError) {
    console.error('SUPABASE UPLOAD ERROR:', JSON.stringify(uploadError, null, 2))
    return { error: uploadError.message }
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  // Update store settings
  const settingKey = bannerType === 'mobile' ? 'hero_banner_mobile_image' : 'hero_banner_image'
  
  const { error: dbError } = await supabase
    .from('store_settings')
    .upsert(
      { key: settingKey, value: publicUrlData.publicUrl },
      { onConflict: 'key' }
    )

  if (dbError) {
    return { error: dbError.message }
  }

  revalidatePath('/')
  revalidatePath('/2010admin/settings')
  return { success: true, url: publicUrlData.publicUrl }
}

export async function uploadImage(formData: FormData) {
  const supabase = await createAdminClient()
  const file = formData.get('image') as File
  
  if (!file || file.size === 0) {
    return { error: 'No file provided' }
  }

  const fileExt = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const filePath = `uploads/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: true
    })

  if (uploadError) {
    return { error: uploadError.message }
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return { success: true, url: publicUrlData.publicUrl }
}

export async function updateAppointmentTimeSlots(times: string[]) {
  const supabase = await createAdminClient()
  
  const value = times.join(',')
  
  const { error } = await supabase
    .from('store_settings')
    .upsert(
      { key: 'appointment_time_slots', value },
      { onConflict: 'key' }
    )
    
  if (error) {
    console.error('Failed to update time slots:', error)
    return { success: false, error: 'Failed to update time slots' }
  }
  
  revalidatePath('/2010admin/appointments')
  revalidatePath('/book-appointment')
  
  return { success: true }
}

export async function updateAdminPin(formData: FormData) {
  const supabase = await createAdminClient()
  const newPin = formData.get('admin_pin') as string

  if (!newPin || !/^\d{4}$/.test(newPin)) {
    return { error: 'PIN must be exactly 4 digits.' }
  }

  const { error } = await supabase
    .from('store_settings')
    .upsert(
      { key: 'admin_pin', value: newPin },
      { onConflict: 'key' }
    )

  if (error) {
    console.error('Failed to update admin PIN:', error)
    return { error: 'Failed to update Admin PIN.' }
  }

  return { success: true }
}
