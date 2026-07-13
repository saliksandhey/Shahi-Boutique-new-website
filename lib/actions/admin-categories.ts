'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required")
})

export async function createCategory(formData: FormData) {
  const supabase = createAdminClient()
  
  const rawData = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
  }

  const validated = categorySchema.safeParse(rawData)
  if (!validated.success) return { error: (validated as any).error.errors[0].message }
  
  let imageUrl = null;
  const imageFile = formData.get('imageFile') as File;
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.includes('.') ? imageFile.name.split('.').pop() : 'jpg'
    const filePath = `categories/${validated.data.slug}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, buffer, { contentType: imageFile.type || 'image/jpeg', upsert: true })
    if (uploadError) return { error: uploadError.message }
    const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath)
    imageUrl = publicUrlData.publicUrl
  }

  const { error } = await supabase.from('categories').insert([{ ...validated.data, image: imageUrl }])
  if (error) return { error: error.message }

  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = createAdminClient()
  
  const rawData = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
  }

  const validated = categorySchema.safeParse(rawData)
  if (!validated.success) return { error: (validated as any).error.errors[0].message }
  
  let updateData: any = { ...validated.data }
  const imageFile = formData.get('imageFile') as File;
  
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.includes('.') ? imageFile.name.split('.').pop() : 'jpg'
    const filePath = `categories/${validated.data.slug}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, buffer, { contentType: imageFile.type || 'image/jpeg', upsert: true })
    if (uploadError) return { error: uploadError.message }
    const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath)
    updateData.image = publicUrlData.publicUrl
  }

  const { error } = await supabase.from('categories').update(updateData).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}
