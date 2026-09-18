'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ProductPayload = {
  id?: string
  name: string
  slug: string
  category_id: string | null
  short_description?: string
  description?: string
  price: number
  sale_price: number | null
  stock: number
  featured: boolean
  status: string
  is_enquiry_only?: boolean
  // Per-country pricing
  price_inr?: number | null
  price_cad?: number | null
  price_aud?: number | null
  price_nzd?: number | null
  price_usd?: number | null
  sale_price_inr?: number | null
  sale_price_cad?: number | null
  sale_price_aud?: number | null
  sale_price_nzd?: number | null
  sale_price_usd?: number | null
  // Specs & Details
  sku?: string
  product_type?: string
  age_group?: string
  fabric?: string
  material?: string
  color?: string
  work?: string
  closure?: string
  handle?: string
  craft?: string
  occasion?: string
  country_of_origin?: string
  weight?: number | null
  dimensions?: string
  height_cm?: number | null
  length_cm?: number | null
  // Shipping details
  processing_time?: string
  estimated_delivery?: string
  shipping_availability?: string
  free_shipping_threshold?: string
  international_shipping?: string
  package_includes?: string
  packaging_type?: string
  // Returns & Exchange
  return_policy?: string
  exchange_policy?: string
  damaged_policy?: string
  return_window?: string
  personalized_policy?: string
  // Care Instructions
  care_instructions?: string
  // Attributes / Metadata JSON
  attributes?: Record<string, any>
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
  
  // Package extended attributes inside JSON for maximum safety and compatibility
  const packedAttributes = {
    ...(data.attributes || {}),
    product_type: data.product_type,
    sku: data.sku,
    age_group: data.age_group,
    color: data.color,
    work: data.work,
    closure: data.closure,
    handle: data.handle,
    craft: data.craft,
    occasion: data.occasion,
    processing_time: data.processing_time,
    estimated_delivery: data.estimated_delivery,
    shipping_availability: data.shipping_availability,
    free_shipping_threshold: data.free_shipping_threshold,
    international_shipping: data.international_shipping,
    package_includes: data.package_includes,
    packaging_type: data.packaging_type,
    return_policy: data.return_policy,
    exchange_policy: data.exchange_policy,
    damaged_policy: data.damaged_policy,
    return_window: data.return_window,
    personalized_policy: data.personalized_policy,
  }

  const fullPayload = {
    ...data,
    attributes: packedAttributes
  }

  // Attempt direct update/insert first
  if (data.id) {
    let updateResult = await supabase.from('products').update(fullPayload).eq('id', data.id)
    
    // If schema cache lacks any new column, gracefully fallback by stripping unmigrated fields
    if (updateResult.error && updateResult.error.message.includes('column of \'products\' in the schema cache')) {
      const corePayload: any = {
        name: data.name,
        slug: data.slug,
        category_id: data.category_id,
        short_description: data.short_description,
        description: data.description,
        price: data.price,
        sale_price: data.sale_price,
        stock: data.stock,
        featured: data.featured,
        status: data.status,
        fabric: data.fabric,
        material: data.material,
        care_instructions: data.care_instructions,
        country_of_origin: data.country_of_origin,
        weight: data.weight,
        dimensions: data.dimensions,
        height_cm: data.height_cm,
        length_cm: data.length_cm,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        keywords: data.keywords,
        canonical_url: data.canonical_url,
      }
      updateResult = await supabase.from('products').update(corePayload).eq('id', data.id)
    }

    if (updateResult.error) {
      if (updateResult.error.message.includes('products_slug_key')) {
        return { error: 'A product with this slug already exists. Please choose a different slug.' }
      }
      return { error: updateResult.error.message }
    }
    revalidatePath('/2010admin/products')
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
    
    const insertPayload = { ...fullPayload, slug: uniqueSlug }
    let insertResult = await supabase.from('products').insert([insertPayload]).select('id').single()

    // Graceful fallback if schema cache lacks new columns
    if (insertResult.error && insertResult.error.message.includes('column of \'products\' in the schema cache')) {
      const coreInsertPayload: any = {
        name: data.name,
        slug: uniqueSlug,
        category_id: data.category_id,
        short_description: data.short_description,
        description: data.description,
        price: data.price,
        sale_price: data.sale_price,
        stock: data.stock,
        featured: data.featured,
        status: data.status,
        fabric: data.fabric,
        material: data.material,
        care_instructions: data.care_instructions,
        country_of_origin: data.country_of_origin,
        weight: data.weight,
        dimensions: data.dimensions,
        height_cm: data.height_cm,
        length_cm: data.length_cm,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        keywords: data.keywords,
        canonical_url: data.canonical_url,
      }
      insertResult = await supabase.from('products').insert([coreInsertPayload]).select('id').single()
    }

    if (insertResult.error) return { error: insertResult.error.message }
    
    revalidatePath('/2010admin/products')
    revalidatePath(`/product/${uniqueSlug}`)
    revalidatePath('/shop')
    revalidatePath('/')
    return { success: true, id: insertResult.data.id }
  }
}

export async function deleteProduct(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/2010admin/products')
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
  
  revalidatePath(`/2010admin/products/${productId}/edit`)
  return { success: true }
}

export async function deleteSizeGuide(id: string, productId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('product_size_guides').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/2010admin/products/${productId}/edit`)
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
  
  revalidatePath(`/2010admin/products/${productId}/edit`)
  revalidatePath('/shop')
  return { success: true }
}

export async function deleteVariant(id: string, productId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('product_variants').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/2010admin/products/${productId}/edit`)
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

  revalidatePath(`/2010admin/products/${productId}/edit`)
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
  
  revalidatePath(`/2010admin/products/${productId}/edit`)
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
  
  revalidatePath(`/2010admin/products/${productId}/edit`)
  return { success: true }
}
