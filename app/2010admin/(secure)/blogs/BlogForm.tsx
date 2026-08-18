'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBlog, updateBlog, uploadBlogImage, fetchInstagramData } from '@/lib/actions/blog'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Loader2, Save, Send } from 'lucide-react'

export function BlogForm({ initialData = null }: { initialData?: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    summary: initialData?.summary || '',
    content: initialData?.content || '',
    cover_image: initialData?.cover_image || '',
    category: initialData?.category || '',
    tags: initialData?.tags ? initialData.tags.join(', ') : '',
    author: initialData?.author || 'Shahi Boutique',
    reading_time: initialData?.reading_time || 5,
    is_featured: initialData?.is_featured || false,
    status: initialData?.status || 'DRAFT',
    seo_title: initialData?.seo_title || '',
    seo_description: initialData?.seo_description || '',
    meta_keywords: initialData?.meta_keywords || '',
    instagram_url: initialData?.instagram_url || '',
  })
  
  const [isUploading, setIsUploading] = useState(false)
  const [isFetchingInsta, setIsFetchingInsta] = useState(false)

  const handleFetchInstagram = async () => {
    if (!formData.instagram_url) {
      alert('Please enter an Instagram URL first.')
      return
    }
    
    setIsFetchingInsta(true)
    const result = await fetchInstagramData(formData.instagram_url)
    setIsFetchingInsta(false)

    if (result.success && result.imageUrl) {
      setFormData(prev => ({ 
        ...prev, 
        cover_image: result.imageUrl,
        summary: prev.summary || result.description || '',
      }))
    } else {
      alert(result.error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('image', file)
    
    const result = await uploadBlogImage(formData)
    setIsUploading(false)

    if (result.success && result.url) {
      setFormData(prev => ({ ...prev, cover_image: result.url }))
    } else {
      alert('Failed to upload image: ' + result.error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payload = {
      ...formData,
      tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    }

    let result
    if (initialData?.id) {
      result = await updateBlog(initialData.id, payload)
    } else {
      result = await createBlog(payload)
    }

    setIsSubmitting(false)

    if (result.success) {
      router.push('/2010admin/blogs')
      router.refresh()
    } else {
      alert('Failed to save blog: ' + result.error)
    }
  }

  const inputBase = "w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all"
  const labelBase = "block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-12 pb-24">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest text-gray-900">{initialData ? 'Edit Feed Post' : 'New Feed Post'}</h2>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value})}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold uppercase tracking-widest rounded-xl px-4 py-2"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-[#111111] text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#FF7A00] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Post
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title & Basic Info */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div>
              <label className={labelBase}>Post Title (Internal / SEO) *</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className={`${inputBase} text-lg font-bold`}
                placeholder="e.g. Summer Lehenga Collection 2026"
              />
            </div>
            
            <div>
              <label className={labelBase}>Caption (Main Feed Text)</label>
              <textarea 
                rows={3}
                value={formData.summary}
                onChange={e => setFormData({...formData, summary: e.target.value})}
                className={inputBase}
                placeholder="Write a captivating caption for your social feed..."
              />
            </div>

          </div>

          {/* SEO Metadata */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-4 mb-6">SEO Configuration</h3>
            
            <div>
              <label className={labelBase}>Custom URL Slug (Optional)</label>
              <input 
                type="text" 
                value={formData.slug}
                onChange={e => setFormData({...formData, slug: e.target.value})}
                className={inputBase}
                placeholder="Leave empty to auto-generate from title"
              />
            </div>

            <div>
              <label className={labelBase}>SEO Meta Title</label>
              <input 
                type="text" 
                value={formData.seo_title}
                onChange={e => setFormData({...formData, seo_title: e.target.value})}
                className={inputBase}
                placeholder="Optimal length 50-60 characters"
              />
            </div>

            <div>
              <label className={labelBase}>SEO Meta Description</label>
              <textarea 
                rows={2}
                value={formData.seo_description}
                onChange={e => setFormData({...formData, seo_description: e.target.value})}
                className={inputBase}
                placeholder="Optimal length 150-160 characters"
              />
            </div>

            <div>
              <label className={labelBase}>Meta Keywords</label>
              <input 
                type="text" 
                value={formData.meta_keywords}
                onChange={e => setFormData({...formData, meta_keywords: e.target.value})}
                className={inputBase}
                placeholder="bridal, luxury fashion, punjabi suits"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-8">
          
          {/* Instagram Link Integration */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-3">Instagram Integration</h3>
            <div>
              <label className={labelBase}>Instagram Post URL</label>
              <div className="flex gap-2">
                <input 
                  type="url" 
                  value={formData.instagram_url}
                  onChange={e => setFormData({...formData, instagram_url: e.target.value})}
                  className={inputBase}
                  placeholder="https://instagram.com/p/..."
                />
                <button 
                  type="button" 
                  onClick={handleFetchInstagram}
                  disabled={isFetchingInsta || !formData.instagram_url}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {isFetchingInsta ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch Photo'}
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-medium">Link will be used to redirect users on the feed page. Fetch photo attempts to automatically pull the post image.</p>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-3">Cover Media</h3>
            
            {formData.cover_image ? (
              <div className="relative group rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3]">
                {formData.cover_image.match(/\.(mp4|webm|mov)$/i) ? (
                  <video src={formData.cover_image} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                ) : (
                  <img src={formData.cover_image} alt="Cover" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-xl">
                    Change Media
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Upload Media</span>
                  </>
                )}
                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
              </label>
            )}
          </div>

          {/* Organization */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-3">Organization</h3>
            
            <div>
              <label className={labelBase}>Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className={inputBase}
              >
                <option value="">Select Category</option>
                <option value="Fashion Trends">Fashion Trends</option>
                <option value="Bridal Collection">Bridal Collection</option>
                <option value="Boutique Updates">Boutique Updates</option>
                <option value="Styling Tips">Styling Tips</option>
                <option value="Behind The Scenes">Behind The Scenes</option>
                <option value="Customer Stories">Customer Stories</option>
                <option value="Announcements">Announcements</option>
              </select>
            </div>

            <div>
              <label className={labelBase}>Hashtags</label>
              <input 
                type="text" 
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
                className={inputBase}
                placeholder="lehenga, fashion, trending"
              />
            </div>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input 
                type="checkbox" 
                checked={formData.is_featured}
                onChange={e => setFormData({...formData, is_featured: e.target.checked})}
                className="w-5 h-5 accent-[#FF7A00]"
              />
              <span className="text-sm font-bold uppercase tracking-widest text-gray-900">Featured Article</span>
            </label>
          </div>

          {/* Metadata */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-3">Post Meta</h3>
            
            <div>
              <label className={labelBase}>Author</label>
              <input 
                type="text" 
                value={formData.author}
                onChange={e => setFormData({...formData, author: e.target.value})}
                className={inputBase}
              />
            </div>

            <div>
              <label className={labelBase}>Reading Time (minutes)</label>
              <input 
                type="number" 
                min="1"
                value={formData.reading_time}
                onChange={e => setFormData({...formData, reading_time: parseInt(e.target.value) || 5})}
                className={inputBase}
              />
            </div>
          </div>

        </div>
      </div>
    </form>
  )
}
