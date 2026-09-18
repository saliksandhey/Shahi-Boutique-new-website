'use client'

import { useState, useTransition } from 'react'
import { 
  Check, X, Trash2, Star, MessageSquare, Plus, Search, Filter, 
  Sparkles, CheckCircle2, ShieldCheck, Image as ImageIcon, Send, ChevronDown
} from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  approveReview, rejectReview, toggleFeatureReview, 
  replyToReview, deleteReview, createAdminReview 
} from '@/lib/actions/admin-reviews'

interface AdminReviewsManagerProps {
  initialReviews: any[]
  products: { id: string; name: string }[]
}

const COUNTRIES = [
  { code: 'IN', name: 'India', flag: 'in' },
  { code: 'CA', name: 'Canada', flag: 'ca' },
  { code: 'US', name: 'United States', flag: 'us' },
  { code: 'GB', name: 'United Kingdom', flag: 'gb' },
  { code: 'AU', name: 'Australia', flag: 'au' },
  { code: 'NZ', name: 'New Zealand', flag: 'nz' },
  { code: 'AE', name: 'United Arab Emirates', flag: 'ae' },
  { code: 'SG', name: 'Singapore', flag: 'sg' },
]

export function AdminReviewsManager({ initialReviews, products }: AdminReviewsManagerProps) {
  const [reviews, setReviews] = useState<any[]>(initialReviews)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'FEATURED' | 'STORE'>('ALL')
  const [isPending, startTransition] = useTransition()
  
  // Add Review Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addRating, setAddRating] = useState(5)
  const [addTitle, setAddTitle] = useState('')
  const [addComment, setAddComment] = useState('')
  const [addCustomerName, setAddCustomerName] = useState('')
  const [addCustomerEmail, setAddCustomerEmail] = useState('')
  const [addCountry, setAddCountry] = useState('IN')
  const [addCity, setAddCity] = useState('')
  const [addProductId, setAddProductId] = useState('')
  const [addVerified, setAddVerified] = useState(true)
  const [addFeatured, setAddFeatured] = useState(false)
  const [addApproved, setAddApproved] = useState(true)
  const [addPhotoFiles, setAddPhotoFiles] = useState<File[]>([])
  const [addPhotoPreviews, setAddPhotoPreviews] = useState<string[]>([])
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  // Reply State
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  // Lightbox
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)

  // Counts
  const totalCount = reviews.length
  const pendingCount = reviews.filter((r) => !r.approved).length
  const approvedCount = reviews.filter((r) => r.approved).length
  const featuredCount = reviews.filter((r) => r.is_featured_home).length
  const storeCount = reviews.filter((r) => r.review_type === 'STORE' || !r.product_id).length

  // Actions
  const handleApprove = (id: string) => {
    startTransition(async () => {
      await approveReview(id)
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, approved: true } : r))
    })
  }

  const handleReject = (id: string) => {
    startTransition(async () => {
      await rejectReview(id)
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, approved: false } : r))
    })
  }

  const handleToggleFeature = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleFeatureReview(id, !current)
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, is_featured_home: !current, approved: true } : r))
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this review permanently?')) return
    startTransition(async () => {
      await deleteReview(id)
      setReviews((prev) => prev.filter((r) => r.id !== id))
    })
  }

  const handleSaveReply = (id: string) => {
    startTransition(async () => {
      await replyToReview(id, replyText)
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, admin_reply: replyText.trim() || null } : r))
      setReplyingId(null)
      setReplyText('')
    })
  }

  const handleAddPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const valid = files.slice(0, 3 - addPhotoFiles.length)
    setAddPhotoFiles((prev) => [...prev, ...valid])
    const newPrev = valid.map((f) => URL.createObjectURL(f))
    setAddPhotoPreviews((prev) => [...prev, ...newPrev])
  }

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError('')
    if (!addComment.trim()) {
      setAddError('Review comment is required.')
      return
    }
    setAddLoading(true)

    try {
      const formData = new FormData()
      if (addProductId) formData.append('productId', addProductId)
      formData.append('rating', addRating.toString())
      formData.append('title', addTitle.trim())
      formData.append('comment', addComment.trim())
      formData.append('customerName', addCustomerName.trim() || 'Valued Client')
      formData.append('customerEmail', addCustomerEmail.trim())
      formData.append('customerCountry', addCountry)
      formData.append('customerCity', addCity.trim())
      formData.append('isVerifiedBuyer', addVerified ? 'true' : 'false')
      formData.append('isFeaturedHome', addFeatured ? 'true' : 'false')
      formData.append('approved', addApproved ? 'true' : 'false')

      addPhotoFiles.forEach((f) => formData.append('photos', f))

      const res = await createAdminReview(formData)
      if (!res.success) {
        setAddError(res.error || 'Failed to save review')
        setAddLoading(false)
        return
      }

      // Reset form
      setIsAddModalOpen(false)
      setAddTitle('')
      setAddComment('')
      setAddCustomerName('')
      setAddCustomerEmail('')
      setAddCity('')
      setAddProductId('')
      setAddPhotoFiles([])
      setAddPhotoPreviews([])
      setAddLoading(false)
      window.location.reload()
    } catch (err: any) {
      setAddError(err.message || 'Failed')
      setAddLoading(false)
    }
  }

  // Filtered reviews
  const filtered = reviews.filter((r) => {
    if (activeTab === 'PENDING' && r.approved) return false
    if (activeTab === 'APPROVED' && !r.approved) return false
    if (activeTab === 'FEATURED' && !r.is_featured_home) return false
    if (activeTab === 'STORE' && r.product_id && r.review_type !== 'STORE') return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const name = (r.customer_name || (r.profiles as any)?.full_name || '').toLowerCase()
      const email = (r.customer_email || (r.profiles as any)?.email || '').toLowerCase()
      const prod = (r.products?.name || '').toLowerCase()
      const comment = (r.comment || '').toLowerCase()
      return name.includes(q) || email.includes(q) || prod.includes(q) || comment.includes(q)
    }
    return true
  })

  return (
    <div className="space-y-6 pb-24 lg:pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-5xl font-heading font-black tracking-widest text-gray-900 uppercase">
            Reviews & Ratings
          </h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest">
            Moderate customer feedback, manage homepage muses, and add client testimonials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#1C1C1C] hover:bg-[#FF7A00] text-white text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Client Review
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div 
          onClick={() => setActiveTab('ALL')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'ALL' ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'bg-white text-gray-900 border-gray-100 hover:border-gray-200'
          }`}
        >
          <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${activeTab === 'ALL' ? 'text-gray-300' : 'text-gray-400'}`}>
            Total Reviews
          </span>
          <span className="text-2xl sm:text-3xl font-black">{totalCount}</span>
        </div>

        <div 
          onClick={() => setActiveTab('PENDING')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'PENDING' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-900 border-gray-100 hover:border-orange-200'
          }`}
        >
          <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${activeTab === 'PENDING' ? 'text-orange-100' : 'text-orange-500'}`}>
            Pending Moderation
          </span>
          <span className="text-2xl sm:text-3xl font-black text-orange-600 group-hover:text-orange-700">
            {pendingCount}
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('APPROVED')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'APPROVED' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-gray-900 border-gray-100 hover:border-emerald-200'
          }`}
        >
          <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${activeTab === 'APPROVED' ? 'text-emerald-100' : 'text-emerald-600'}`}>
            Approved Active
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700">
            {approvedCount}
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('FEATURED')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'FEATURED' ? 'bg-[#FF7A00] text-white border-[#FF7A00]' : 'bg-white text-gray-900 border-gray-100 hover:border-[#FF7A00]/30'
          }`}
        >
          <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${activeTab === 'FEATURED' ? 'text-orange-100' : 'text-[#FF7A00]'}`}>
            Featured On Home
          </span>
          <span className="text-2xl sm:text-3xl font-black text-[#FF7A00]">
            {featuredCount}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 sm:p-4 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto hide-scrollbar">
          {(['ALL', 'PENDING', 'APPROVED', 'FEATURED', 'STORE'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                activeTab === tab
                  ? 'bg-[#1C1C1C] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab === 'ALL' && `All (${totalCount})`}
              {tab === 'PENDING' && `Pending (${pendingCount})`}
              {tab === 'APPROVED' && `Approved (${approvedCount})`}
              {tab === 'FEATURED' && `Featured (${featuredCount})`}
              {tab === 'STORE' && `Store (${storeCount})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer, product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#FF7A00] transition-colors"
          />
        </div>
      </div>

      {/* Review Cards List */}
      <div className="space-y-3">
        {filtered.map((rev) => {
          const customerName = rev.customer_name || (rev.profiles as any)?.full_name || 'Client'
          const customerEmail = rev.customer_email || (rev.profiles as any)?.email || ''
          const countryCode = rev.customer_country || 'IN'
          const photos: string[] = Array.isArray(rev.photos)
            ? rev.photos
            : typeof rev.photos === 'string'
            ? JSON.parse(rev.photos || '[]')
            : []

          const isReplying = replyingId === rev.id

          return (
            <div
              key={rev.id}
              className={`bg-white rounded-2xl p-4 sm:p-6 border transition-all ${
                !rev.approved
                  ? 'border-orange-200 bg-orange-50/10'
                  : rev.is_featured_home
                  ? 'border-[#FF7A00]/40 shadow-xs'
                  : 'border-gray-100 hover:shadow-xs'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left Customer & Product Info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-sm tracking-tight uppercase">
                      {customerName}
                    </h3>
                    {countryCode && (
                      <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-600 uppercase">
                        {countryCode}
                      </span>
                    )}
                    {rev.is_verified_buyer && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                        <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                      </span>
                    )}
                    {rev.is_featured_home && (
                      <span className="inline-flex items-center gap-1 bg-orange-50 text-[#FF7A00] border border-orange-200 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                        <Sparkles className="w-3 h-3" /> Featured on Home
                      </span>
                    )}
                    <Badge 
                      variant="outline" 
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        rev.approved 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-orange-50 text-orange-600 border-orange-200'
                      }`}
                    >
                      {rev.approved ? 'Approved' : 'Pending Review'}
                    </Badge>
                  </div>

                  {customerEmail && (
                    <p className="text-[11px] text-gray-400 font-medium">{customerEmail}</p>
                  )}

                  {/* Target Product / Store Type */}
                  <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5 pt-0.5">
                    <span className="text-gray-400 font-normal">Target:</span>
                    <span className="text-[#FF7A00] uppercase tracking-wide">
                      {rev.products?.name || (rev.review_type === 'STORE' ? 'Boutique Store / Service' : 'General Testimonial')}
                    </span>
                  </div>
                </div>

                {/* Center Star Rating & Time */}
                <div className="flex lg:flex-col lg:items-end items-center justify-between shrink-0 gap-1">
                  <div className="flex text-[#FF7A00]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (rev.rating || 5)
                            ? 'text-[#FF7A00] fill-[#FF7A00]'
                            : 'text-gray-200 fill-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-medium text-gray-400">
                    {new Date(rev.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 self-end lg:self-center pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 w-full lg:w-auto justify-end">
                  
                  {/* Approve / Reject */}
                  {!rev.approved ? (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(rev.id)}
                      disabled={isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[10px] font-black uppercase tracking-wider h-8 px-3"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Approve
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReject(rev.id)}
                      disabled={isPending}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full text-[10px] font-black uppercase tracking-wider h-8 px-3"
                    >
                      <X className="w-3.5 h-3.5 mr-1" /> Unapprove
                    </Button>
                  )}

                  {/* Feature on Home Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleFeature(rev.id, !!rev.is_featured_home)}
                    disabled={isPending}
                    className={`rounded-full h-8 px-2.5 text-[10px] font-black uppercase tracking-wider ${
                      rev.is_featured_home
                        ? 'bg-orange-50 text-[#FF7A00] border border-orange-200'
                        : 'text-gray-500 hover:text-[#FF7A00] hover:bg-orange-50'
                    }`}
                    title={rev.is_featured_home ? 'Remove from Homepage' : 'Pin to Homepage'}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    {rev.is_featured_home ? 'Featured' : 'Feature'}
                  </Button>

                  {/* Reply Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setReplyingId(isReplying ? null : rev.id)
                      setReplyText(rev.admin_reply || '')
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full h-8 w-8"
                    title="Official Reply"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(rev.id)}
                    disabled={isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full h-8 w-8"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

              </div>

              {/* Review Text Body */}
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                {rev.title && (
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide">
                    {rev.title}
                  </h4>
                )}
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                  {rev.comment}
                </p>

                {/* Uploaded Photos Thumbnails */}
                {photos.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    {photos.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightboxImg(url)}
                        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-gray-200 hover:border-[#FF7A00] transition-colors cursor-pointer"
                      >
                        <Image src={url} alt="Review" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Existing Reply Display */}
              {rev.admin_reply && !isReplying && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-gray-800 uppercase tracking-wider text-[10px] block text-[#FF7A00]">
                      Your Official Reply:
                    </span>
                    <p className="italic mt-0.5">"{rev.admin_reply}"</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingId(rev.id)
                      setReplyText(rev.admin_reply || '')
                    }}
                    className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer shrink-0"
                  >
                    Edit
                  </button>
                </div>
              )}

              {/* Reply Input Box */}
              {isReplying && (
                <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-900 block">
                    Write Official Response from Shahi Boutique
                  </label>
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Thank you for your valuable feedback..."
                    className="w-full p-2.5 bg-white rounded-lg border border-blue-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReplyingId(null)}
                      className="text-xs h-7 rounded-full"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveReply(rev.id)}
                      disabled={isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 rounded-full px-4"
                    >
                      Save Reply
                    </Button>
                  </div>
                </div>
              )}

            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              No reviews match this filter.
            </p>
          </div>
        )}
      </div>

      {/* Add Client Review Modal for Admin */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#FAFAFA]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00]">
                  Admin Direct Entry
                </span>
                <h3 className="text-lg font-sans font-black text-gray-900 uppercase tracking-tight">
                  Add Client Review / Testimonial
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="overflow-y-auto p-6 space-y-4 flex-1 hide-scrollbar">
              {addError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium">
                  {addError}
                </div>
              )}

              {/* Product Selection */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-1">
                  Product Association
                </label>
                <select
                  value={addProductId}
                  onChange={(e) => setAddProductId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white"
                >
                  <option value="">General Store / Bespoke Stitching Service Testimonial</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-1">
                  Star Rating
                </label>
                <div className="flex gap-1 text-[#FF7A00]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAddRating(s)}
                      className="p-1 cursor-pointer"
                    >
                      <Star className={`w-6 h-6 ${s <= addRating ? 'fill-[#FF7A00]' : 'text-gray-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Client Name & Country */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Simran Kaur"
                    value={addCustomerName}
                    onChange={(e) => setAddCustomerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    value={addCountry}
                    onChange={(e) => setAddCountry(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Review Headline & Comment */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-1">
                  Review Headline (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flawless fitting & delivery to Toronto!"
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-1">
                  Review Content *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Client review text from WhatsApp / Instagram / In-store..."
                  value={addComment}
                  onChange={(e) => setAddComment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs resize-none"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-1">
                  Attach Client Photos (Max 3)
                </label>
                <div className="flex gap-2 items-center">
                  {addPhotoPreviews.map((url, i) => (
                    <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border">
                      <Image src={url} alt="Photo" fill className="object-cover" />
                    </div>
                  ))}
                  {addPhotoPreviews.length < 3 && (
                    <label className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#FF7A00] flex flex-col items-center justify-center text-gray-400 hover:text-[#FF7A00] cursor-pointer">
                      <Plus className="w-5 h-5" />
                      <input type="file" accept="image/*" multiple onChange={handleAddPhotoChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={addVerified}
                    onChange={(e) => setAddVerified(e.target.checked)}
                    className="w-4 h-4 text-[#FF7A00] rounded"
                  />
                  Mark as "Verified Buyer"
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={addFeatured}
                    onChange={(e) => setAddFeatured(e.target.checked)}
                    className="w-4 h-4 text-[#FF7A00] rounded"
                  />
                  Feature on Homepage ("Words From Our Muses")
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={addApproved}
                    onChange={(e) => setAddApproved(e.target.checked)}
                    className="w-4 h-4 text-[#FF7A00] rounded"
                  />
                  Approve Immediately (Make Public)
                </label>
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={addLoading}
                  className="w-full bg-[#1C1C1C] hover:bg-[#FF7A00] text-white py-3 rounded-full text-xs font-black uppercase tracking-wider"
                >
                  {addLoading ? 'Saving...' : 'Publish Client Review'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div 
          className="fixed inset-0 z-[130] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImg(null)}
            className="absolute top-4 right-4 p-2 text-white bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-2xl max-h-[85vh] w-full aspect-square">
            <Image src={lightboxImg} alt="Photo" fill className="object-contain" />
          </div>
        </div>
      )}

    </div>
  )
}
