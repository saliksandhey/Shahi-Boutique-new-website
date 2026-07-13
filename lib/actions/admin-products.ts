'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ProductPayload = {
  id?: string
  name: string
  slug: string
  category_id: string | null
  short_description: string
  description: string
  price: number
  sale_price: number | null
  stock: number
  featured: boolean
  status: string
  is_enquiry_only?: boolean
  // Details
  fabric?: string
  material?: string
  care_instructions?: string
  country_of_origin?: string
  weight?: number
  dimensions?: string
  // SEO
  meta_title?: string
  meta_description?: string
  og_image?: string
  keywords?: string
  canonical_url?: string
}



export type SizeGuidePayload = {
  id?: string
  size_name: string
  chest?: string
  length?: string
  shoulder?: string
  sleeve?: string
  waist?: string
}

export async function saveProductDetails(data: ProductPayload) {
  const supabase = createAdminClient()
  
  if (data.id) {
    const { error } = await supabase.from('products').update(data).eq('id', data.id)
    if (error) {
      if (error.message.includes('products_slug_key')) {
        return { error: 'A product with this slug already exists. Please choose a different slug.' }
      }
      return { error: error.message }
    }
    revalidatePath('/admin/products')
    revalidatePath(`/product/${data.slug}`)
    revalidatePath('/shop')
    revalidatePath('/')
    return { success: true, id: data.id }
  } else {
    // Generate unique slug if creating new
    let uniqueSlug = data.slug
    let isUnique = false
    let counter = 1
    
    while (!isUnique) {
      const { data: existing } = await supabase.from('products').select('id').eq('slug', uniqueSlug).single()
      if (!existing) {
        isUnique = true
      } else {
        uniqueSlug = `${data.slug}-${Math.random().toString(36).substring(2, 6)}`
        counter++
      }
    }
    
    const payload = { ...data, slug: uniqueSlug }
    const { data: newProd, error } = await supabase.from('products').insert([payload]).select('id').single()
    if (error) return { error: error.message }
    
    revalidatePath('/admin/products')
    revalidatePath(`/product/${uniqueSlug}`)
    revalidatePath('/shop')
    revalidatePath('/')
    return { success: true, id: newProd.id }
  }
}

export async function deleteProduct(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/products')
  return { success: true }
}



export type VariantPayload = {
  id?: string
  color?: string
  size?: string
  stock?: number
  sku?: string
  price_override?: number | null
}

// Size Guides
export async function saveSizeGuides(productId: string, guides: SizeGuidePayload[]) {
  const supabase = createAdminClient()
  
  const toUpsert = guides.map(g => ({
    id: g.id || undefined,
    product_id: productId,
    size_name: g.size_name,
    chest: g.chest,
    length: g.length,
    shoulder: g.shoulder,
    sleeve: g.sleeve,
    waist: g.waist
  }))

  const { error } = await supabase.from('product_size_guides').upsert(toUpsert, { onConflict: 'id' })
  if (error) return { error: error.message }
  
  revalidatePath(`/admin/products/${productId}/edit`)
  return { success: true }
}

export async function deleteSizeGuide(id: string, productId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('product_size_guides').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/admin/products/${productId}/edit`)
  return { success: true }
}

// Variants
export async function saveVariants(productId: string, variants: VariantPayload[]) {
  const supabase = createAdminClient()
  
  const toUpsert = variants.map(v => ({
    id: v.id || undefined,
    product_id: productId,
    color: v.color,
    size: v.size,
    stock: v.stock || 0,
    sku: v.sku,
    price_override: v.price_override
  }))

  const { error } = await supabase.from('product_variants').upsert(toUpsert, { onConflict: 'id' })
  if (error) return { error: error.message }
  
  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath('/shop')
  return { success: true }
}

export async function deleteVariant(id: string, productId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('product_variants').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath('/shop')
  return { success: true }
}

// Media
export async function uploadProductImages(productId: string, formData: FormData) {
  const supabase = createAdminClient()
  const files = formData.getAll('images') as File[]
  
  if (!files || files.length === 0) return { error: 'No files provided' }

  for (const file of files) {
    if (file.size === 0) continue
    const fileExt = file.name.split('.').pop()
    const filePath = `${productId}/${Math.random()}.${fileExt}`

    // Convert Next.js File object to Buffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, buffer, {
      contentType: file.type,
      upsert: true
    })
    if (uploadError) return { error: uploadError.message }

    const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath)

    const { error: dbError } = await supabase.from('product_images').insert([{
      product_id: productId,
      url: publicUrlData.publicUrl,
      position: 0 // Default, can be reordered later
    }])
    if (dbError) return { error: dbError.message }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  return { success: true }
}

export async function updateImagePosition(id: string, position: number) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('product_images').update({ position }).eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function setPrimaryImage(id: string, productId: string) {
  const supabase = createAdminClient()
  // Unset all
  await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId)
  // Set primary
  const { error } = await supabase.from('product_images').update({ is_primary: true }).eq('id', id)
  if (error) return { error: error.message }
  
  revalidatePath(`/admin/products/${productId}/edit`)
  return { success: true }
}

export async function deleteProductImage(id: string, productId: string) {
  const supabase = createAdminClient()
  const { data: img } = await supabase.from('product_images').select('url').eq('id', id).single()
  
  if (img) {
    const urlParts = img.url.split('/product-images/')
    if (urlParts.length > 1) {
      await supabase.storage.from('product-images').remove([urlParts[1]])
    }
  }

  const { error } = await supabase.from('product_images').delete().eq('id', id)
  if (error) return { error: error.message }
  
  revalidatePath(`/admin/products/${productId}/edit`)
  return { success: true }
}
