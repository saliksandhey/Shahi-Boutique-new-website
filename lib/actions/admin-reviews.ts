'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveReview(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('reviews').update({ approved: true }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/2010admin/reviews')
  revalidatePath('/')
  return { success: true }
}

export async function rejectReview(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('reviews').update({ approved: false }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/2010admin/reviews')
  revalidatePath('/')
  return { success: true }
}

export async function toggleFeatureReview(id: string, isFeatured: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('reviews').update({ is_featured_home: isFeatured }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/2010admin/reviews')
  revalidatePath('/')
  return { success: true }
}

export async function replyToReview(id: string, replyText: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('reviews').update({
    admin_reply: replyText.trim() || null,
    admin_reply_at: replyText.trim() ? new Date().toISOString() : null
  }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/2010admin/reviews')
  return { success: true }
}

export async function deleteReview(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/2010admin/reviews')
  revalidatePath('/')
  return { success: true }
}

export async function createAdminReview(formData: FormData) {
  try {
    const supabase = createAdminClient()
    const productId = formData.get('productId') as string || null
    const rating = parseInt(formData.get('rating') as string || '5', 10)
    const title = (formData.get('title') as string || '').trim()
    const comment = (formData.get('comment') as string || '').trim()
    const customerName = (formData.get('customerName') as string || 'Client').trim()
    const customerEmail = (formData.get('customerEmail') as string || '').trim().toLowerCase()
    const customerCountry = (formData.get('customerCountry') as string || 'IN').toUpperCase()
    const customerCity = (formData.get('customerCity') as string || '').trim()
    const isVerifiedBuyer = formData.get('isVerifiedBuyer') === 'true'
    const isFeaturedHome = formData.get('isFeaturedHome') === 'true'
    const approved = formData.get('approved') !== 'false'

    if (!comment) {
      return { success: false, error: 'Review text is required.' }
    }

    // Photo uploads
    const photoUrls: string[] = []
    const imageFiles = formData.getAll('photos') as File[]
    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        if (file && file.size > 0) {
          try {
            const fileExt = file.name.split('.').pop() || 'jpg'
            const fileName = `reviews/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            const { error: uploadErr } = await supabase.storage
              .from('product-images')
              .upload(fileName, buffer, {
                contentType: file.type || 'image/jpeg',
                upsert: true
              })
            if (!uploadErr) {
              const { data: pubData } = supabase.storage.from('product-images').getPublicUrl(fileName)
              if (pubData?.publicUrl) photoUrls.push(pubData.publicUrl)
            }
          } catch (e) {
            console.error('Admin photo upload error:', e)
          }
        }
      }
    }

    const { error: insertErr } = await supabase.from('reviews').insert({
      product_id: productId || null,
      rating,
      title: title || null,
      comment,
      customer_name: customerName,
      customer_email: customerEmail || null,
      customer_country: customerCountry,
      customer_city: customerCity || null,
      photos: photoUrls,
      is_verified_buyer: isVerifiedBuyer,
      is_featured_home: isFeaturedHome,
      approved,
      review_type: productId ? 'PRODUCT' : 'STORE',
      created_at: new Date().toISOString()
    })

    if (insertErr) return { success: false, error: insertErr.message }

    revalidatePath('/2010admin/reviews')
    revalidatePath('/')
    if (productId) revalidatePath(`/product/${productId}`)

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create review' }
  }
}
