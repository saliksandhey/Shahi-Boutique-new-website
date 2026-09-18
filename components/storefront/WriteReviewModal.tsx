'use client'

import { useState, useRef } from 'react'
import { Star, X, Upload, CheckCircle2, Image as ImageIcon, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { submitProductReview } from '@/lib/actions/reviews'

interface WriteReviewModalProps {
  productId?: string
  productName?: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
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
  { code: 'MY', name: 'Malaysia', flag: 'my' },
]

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Exceptional Quality',
}

export function WriteReviewModal({
  productId,
  productName,
  isOpen,
  onClose,
  onSuccess
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerCountry, setCustomerCountry] = useState('IN')
  const [customerCity, setCustomerCity] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const validFiles: File[] = []
    const newPreviews: string[] = []

    files.slice(0, 3 - selectedFiles.length).forEach((file) => {
      if (file.type.startsWith('image/')) {
        validFiles.push(file)
        newPreviews.push(URL.createObjectURL(file))
      }
    })

    setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, 3))
    setPreviewUrls((prev) => [...prev, ...newPreviews].slice(0, 3))
  }

  const removePhoto = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMsg('Please write at least a few words about your experience.')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      if (productId) formData.append('productId', productId)
      formData.append('rating', rating.toString())
      formData.append('title', title.trim())
      formData.append('comment', comment.trim())
      formData.append('customerName', customerName.trim())
      formData.append('customerEmail', customerEmail.trim())
      formData.append('customerCountry', customerCountry)
      formData.append('customerCity', customerCity.trim())
      formData.append('isAnonymous', isAnonymous ? 'true' : 'false')

      selectedFiles.forEach((file) => {
        formData.append('photos', file)
      })

      const res = await submitProductReview(formData)

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to submit review.')
        setLoading(false)
        return
      }

      setSubmitted(true)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 border-b border-gray-100 bg-[#FAFAFA]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Atelier Feedback
            </span>
            <h3 className="text-base sm:text-lg font-sans font-black text-gray-900 uppercase tracking-tight">
              {productName ? `Review "${productName}"` : 'Share Your Experience'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto px-5 sm:px-8 py-5 sm:py-6 flex-1 hide-scrollbar">
          {submitted ? (
            <div className="text-center py-10 sm:py-14 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-xl font-sans font-black text-gray-900 uppercase tracking-tight">
                Review Submitted!
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                Thank you for sharing your feedback with Shahi Boutique. Your review has been submitted for moderation and will appear publicly once verified.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-full bg-[#1C1C1C] text-white text-xs font-black uppercase tracking-wider hover:bg-[#FF7A00] transition-colors"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Star Rating Picker */}
              <div className="text-center bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100">
                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">
                  Overall Rating
                </label>
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 sm:p-1.5 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            active
                              ? 'text-[#FF7A00] fill-[#FF7A00]'
                              : 'text-gray-200 fill-gray-100'
                          }`}
                        />
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs font-bold text-[#FF7A00] uppercase tracking-wider mt-2">
                  {RATING_LABELS[hoverRating || rating]}
                </p>
              </div>

              {/* Review Headline */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-700 mb-1">
                  Review Headline <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stunning hand embroidery & perfect fitting!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FF7A00] transition-colors"
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-700 mb-1">
                  Your Review / Experience <span className="text-[#FF7A00]">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details about the fabric quality, stitching, embroidery, or delivery experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1500}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FF7A00] transition-colors resize-none"
                />
              </div>

              {/* Photo Upload (Up to 3 Photos) */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-700 mb-1.5">
                  Add Photos <span className="text-gray-400 font-normal">(Optional, max 3 photos)</span>
                </label>
                
                <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 group">
                      <Image src={url} alt="Preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {previewUrls.length < 3 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#FF7A00] hover:bg-orange-50/50 transition-colors flex flex-col items-center justify-center text-gray-400 hover:text-[#FF7A00] cursor-pointer"
                    >
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Add Photo</span>
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Customer Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-1">
                    Your Name <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={isAnonymous}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FF7A00] transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-1">
                    Country / Region
                  </label>
                  <select
                    value={customerCountry}
                    onChange={(e) => setCustomerCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#FF7A00] transition-colors cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="anonymousCheckbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#FF7A00] focus:ring-[#FF7A00] cursor-pointer"
                />
                <label htmlFor="anonymousCheckbox" className="text-xs text-gray-600 font-medium cursor-pointer select-none">
                  Display my name as <span className="font-bold text-gray-800">Anonymous / Verified Patron</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-[#1C1C1C] hover:bg-[#FF7A00] text-white text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="inline-block animate-spin">⏳</span>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
