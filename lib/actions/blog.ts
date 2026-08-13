'use server'

import { createAdminClient, createClient, createPublicClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBlog(data: any) {
  const supabase = createAdminClient()
  
  // Ensure slug is unique by always appending a random string
  const rawSlug = data.slug || data.title
  const baseSlug = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  const randomSuffix = Math.random().toString(36).substring(2, 6)
  const finalSlug = `${baseSlug}-${randomSuffix}`

  // Handle published_at if status is PUBLISHED
  const payload = { ...data, slug: finalSlug }
  if (payload.status === 'PUBLISHED' && !payload.published_at) {
    payload.published_at = new Date().toISOString()
  }

  const { data: blog, error } = await supabase
    .from('blogs')
    .insert([payload])
    .select()
    .single()

  if (error) {
    console.error('Failed to create blog:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/blogs')
  revalidatePath('/feed')
  return { success: true, data: blog }
}

export async function updateBlog(id: string, data: any) {
  const supabase = createAdminClient()
  
  const payload = { ...data }
  if (payload.status === 'PUBLISHED' && !payload.published_at) {
    // We would ideally check the current record, but if we just set it now it's fine
    payload.published_at = new Date().toISOString()
  }

  const { data: blog, error } = await supabase
    .from('blogs')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update blog:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/blogs')
  revalidatePath('/feed')
  revalidatePath(`/feed/${blog.slug}`)
  return { success: true, data: blog }
}

export async function deleteBlog(id: string) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/blogs')
  revalidatePath('/feed')
  return { success: true }
}

export async function getAdminBlogs() {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, data: [] }
  }

  return { success: true, data }
}

export async function getPublicBlogs(category?: string, limit?: number) {
  const supabase = createPublicClient()
  
  let query = supabase
    .from('blogs')
    .select('*')
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false })

  if (category && category !== 'All') {
    query = query.eq('category', category)
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    return { success: false, data: [] }
  }

  return { success: true, data }
}

export async function getBlogBySlug(slug: string) {
  const supabase = createPublicClient()
  
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    return { success: false, data: null }
  }

  return { success: true, data }
}

export async function uploadBlogImage(formData: FormData) {
  const supabase = createAdminClient()
  const file = formData.get('image') as File
  
  if (!file || file.size === 0) {
    return { error: 'No file provided' }
  }

  const fileExt = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const filePath = `blog-images/${Math.random().toString(36).substring(2, 15)}.${fileExt}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Note: We use product-images bucket to avoid needing to create a new one, 
  // but we store them in a blog-images/ folder.
  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: true
    })

  if (uploadError) {
    return { success: false, error: uploadError.message }
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return { success: true, url: publicUrlData.publicUrl }
}

export async function fetchInstagramData(url: string) {
  try {
    // 1. Fetch Microlink data for title, description, and fallback image
    const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
    const data = await response.json()
    
    if (data.status === 'success' && data.data?.image?.url) {
      let imageUrl = data.data.image.url
      let videoUrl = data.data.video?.url

      // 2. Try to fetch the uncropped full-resolution media from Instagram's embed endpoint
      try {
        const cleanUrl = url.split('?')[0].replace(/\/$/, '')
        const embedResponse = await fetch(`${cleanUrl}/embed`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })
        if (embedResponse.ok) {
          const embedHtml = await embedResponse.text()
          const imgMatch = embedHtml.match(/class=\"EmbeddedMediaImage\"[^>]+src=\"([^\"]+)\"/)
          
          if (imgMatch && imgMatch[1]) {
            // Instagram embed image (high quality, uncropped)
            imageUrl = imgMatch[1].replace(/&amp;/g, '&')
          }
        }
      } catch (e) {
        console.error('Failed to fetch from embed endpoint', e)
      }

      return { 
        success: true, 
        imageUrl: videoUrl || imageUrl, // Prefer video if available
        title: data.data.title, 
        description: data.data.description 
      }
    }
    return { success: false, error: 'Could not extract image from Instagram link. Please upload manually.' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
