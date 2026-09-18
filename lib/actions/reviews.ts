'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ReviewSubmissionData {
  productId?: string
  rating: number
  title?: string
  comment: string
  customerName?: string
  customerEmail?: string
  customerCountry?: string
  customerCity?: string
  isAnonymous?: boolean
}

export async function submitProductReview(formData: FormData) {
  try {
    const supabase = createAdminClient()
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()

    const productId = formData.get('productId') as string | null
    const rating = parseInt(formData.get('rating') as string || '5', 10)
    const title = (formData.get('title') as string || '').trim()
    const comment = (formData.get('comment') as string || '').trim()
    let customerName = (formData.get('customerName') as string || '').trim()
    let customerEmail = (formData.get('customerEmail') as string || '').trim().toLowerCase()
    const customerCountry = (formData.get('customerCountry') as string || 'IN').toUpperCase()
    const customerCity = (formData.get('customerCity') as string || '').trim()
    const isAnonymous = formData.get('isAnonymous') === 'true'

    if (!comment || comment.length < 3) {
      return { success: false, error: 'Please write a review comment.' }
    }

    if (rating < 1 || rating > 5) {
      return { success: false, error: 'Please select a rating between 1 and 5 stars.' }
    }

    // Auto-populate from logged-in user profile if available
    let userId = null
    if (user) {
      userId = user.id
      if (!customerEmail) customerEmail = user.email || ''
      if (!customerName) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        customerName = profile?.full_name || user.user_metadata?.full_name || ''
      }
    }

    // If anonymous or blank name, use default friendly label
    if (isAnonymous || !customerName) {
      customerName = isAnonymous ? 'Shahi Patron (Anonymous)' : 'Verified Customer'
    }

    // Check if verified buyer (if customer ordered this product)
    let isVerifiedBuyer = false
    if (productId && (customerEmail || userId)) {
      try {
        const query = supabase.from('orders').select('id, items, status').in('status', ['DELIVERED', 'COMPLETED', 'PROCESSING', 'SHIPPED'])
        if (userId) query.eq('user_id', userId)
        else if (customerEmail) query.eq('customer_email', customerEmail)
        
        const { data: orders } = await query.limit(10)
        if (orders && orders.length > 0) {
          for (const order of orders) {
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])
            if (Array.isArray(items) && items.some((item: any) => item.product_id === productId || item.id === productId)) {
              isVerifiedBuyer = true
              break
            }
          }
        }
      } catch (e) {
        console.error('Verified buyer check error:', e)
      }
    }

    // Handle photo uploads (up to 3 photos)
    const photoUrls: string[] = []
    const imageFiles = formData.getAll('photos') as File[]
    
    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < Math.min(imageFiles.length, 3); i++) {
        const file = imageFiles[i]
        if (file && file.size > 0 && file.size <= 8 * 1024 * 1024) { // max 8MB per image
          try {
            const fileExt = file.name.split('.').pop() || 'jpg'
            const fileName = `reviews/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            const { error: uploadError } = await supabase.storage
              .from('product-images')
              .upload(fileName, buffer, {
                contentType: file.type || 'image/jpeg',
                upsert: true
              })

            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName)
              if (publicUrlData?.publicUrl) {
                photoUrls.push(publicUrlData.publicUrl)
              }
            }
          } catch (uploadErr) {
            console.error('Review photo upload error:', uploadErr)
          }
        }
      }
    }

    // Insert Review
    const { error: insertError } = await supabase.from('reviews').insert({
      product_id: productId || null,
      user_id: userId,
      rating,
      title: title || null,
      comment,
      customer_name: customerName,
      customer_email: customerEmail || null,
      customer_country: customerCountry || 'IN',
      customer_city: customerCity || null,
      photos: photoUrls,
      is_verified_buyer: isVerifiedBuyer,
      approved: false, // moderated by default
      review_type: productId ? 'PRODUCT' : 'STORE',
      created_at: new Date().toISOString()
    })

    if (insertError) {
      console.error('Review insert error:', insertError)
      return { success: false, error: 'Could not submit review. Please try again.' }
    }

    if (productId) {
      revalidatePath(`/product/${productId}`)
    }
    revalidatePath('/2010admin/reviews')
    revalidatePath('/')

    return { 
      success: true, 
      message: 'Thank you for your review! It has been submitted and will be live once verified by our team.' 
    }
  } catch (err: any) {
    console.error('submitProductReview unexpected error:', err)
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}

export async function getProductReviewsSummary(productId: string) {
  const supabase = createAdminClient()
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('approved', true)
    .order('created_at', { ascending: false })

  const list = reviews || []
  const total = list.length
  if (total === 0) {
    return {
      total: 0,
      average: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      reviews: []
    }
  }

  const sum = list.reduce((acc, r) => acc + (r.rating || 5), 0)
  const average = Number((sum / total).toFixed(1))

  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  list.forEach((r) => {
    const star = Math.min(5, Math.max(1, r.rating || 5))
    distribution[star] = (distribution[star] || 0) + 1
  })

  return {
    total,
    average,
    distribution,
    reviews: list
  }
}

export async function getFeaturedHomeReviews() {
  const supabase = createAdminClient()
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, products(name, product_images(url))')
    .eq('approved', true)
    .eq('is_featured_home', true)
    .order('created_at', { ascending: false })
    .limit(10)

  return reviews || []
}
