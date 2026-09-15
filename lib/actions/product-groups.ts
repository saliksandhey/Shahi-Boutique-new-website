'use server'

import { createAdminClient, createPublicClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getProductGroups() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('product_groups')
    .select('*, product_group_items(id)')
    .order('created_at', { ascending: false })
  return data || []
}

export async function getProductGroup(id: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('product_groups')
    .select('*, product_group_items(*, products(id, name, slug, price, price_inr, sale_price, sale_price_inr, product_images(url, is_primary, position)))')
    .eq('id', id)
    .single()
  return data
}

export async function getAllProductsForPicker() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('products')
    .select('id, name, slug, price, price_inr, product_images(url, is_primary, position)')
    .in('status', ['ACTIVE', 'OUT_OF_STOCK'])
    .order('name', { ascending: true })
  return data || []
}

export async function saveProductGroup(formData: FormData) {
  const supabase = createAdminClient()

  const id = formData.get('id') as string | null
  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Group name is required' }

  // Parse items JSON
  const itemsJson = formData.get('items') as string
  let items: { product_id: string; color_name: string }[] = []
  try {
    items = JSON.parse(itemsJson || '[]')
  } catch {
    return { error: 'Invalid items data' }
  }

  if (items.length < 2) return { error: 'At least 2 products are required in a group' }

  let groupId = id

  if (id) {
    // Update existing group name
    const { error } = await supabase.from('product_groups').update({ name }).eq('id', id)
    if (error) return { error: error.message }
    // Delete old items
    await supabase.from('product_group_items').delete().eq('group_id', id)
  } else {
    // Create new group
    const { data, error } = await supabase.from('product_groups').insert({ name }).select('id').single()
    if (error) return { error: error.message }
    groupId = data.id
  }

  // Insert new items
  const { error: itemsError } = await supabase.from('product_group_items').insert(
    items.map(item => ({ group_id: groupId, product_id: item.product_id, color_name: item.color_name }))
  )
  if (itemsError) return { error: itemsError.message }

  revalidatePath('/2010admin/product-groups')
  revalidatePath('/', 'layout')
  redirect('/2010admin/product-groups')
}

export async function deleteProductGroup(id: string) {
  const supabase = createAdminClient()
  await supabase.from('product_group_items').delete().eq('group_id', id)
  const { error } = await supabase.from('product_groups').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/2010admin/product-groups')
  return { success: true }
}

// Storefront: get color siblings for a product (excludes current product)
export async function getColorSiblings(productId: string) {
  const supabase = createPublicClient()

  // Find which group this product belongs to
  const { data: item } = await supabase
    .from('product_group_items')
    .select('group_id')
    .eq('product_id', productId)
    .single()

  if (!item) return []

  // Get all OTHER items in the same group
  const { data: siblings } = await supabase
    .from('product_group_items')
    .select('color_name, products(id, name, slug, price, price_inr, sale_price, sale_price_inr, product_images(url, is_primary, position))')
    .eq('group_id', item.group_id)
    .neq('product_id', productId)

  return siblings || []
}
