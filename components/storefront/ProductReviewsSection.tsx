'use client'

import { useState } from 'react'
import { Star, CheckCircle, MessageSquare, Image as ImageIcon, Sparkles, ChevronLeft, ChevronRight, X, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import { WriteReviewModal } from './WriteReviewModal'

interface ProductReviewsSectionProps {
  product: any
  initialReviews?: any[]
}

export function ProductReviewsSection({ product, initialReviews = [] }: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<any[]>(initialReviews)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'ALL' | '5' | '4' | '3' | 'PHOTOS'>('ALL')
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null)

  // Calculate statistics
  const total = reviews.length
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0)
  const average = total > 0 ? (sum / total).toFixed(1) : '5.0'

  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let photoCount = 0

  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, r.rating || 5))
    counts[star] = (counts[star] || 0) + 1
    const photos = Array.isArray(r.photos) ? r.photos : (typeof r.photos === 'string' ? JSON.parse(r.photos || '[]') : [])
    if (photos.length > 0) photoCount++
  })

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === '5') return r.rating === 5
    if (activeFilter === '4') return r.rating === 4
    if (activeFilter === '3') return r.rating === 3
    if (activeFilter === 'PHOTOS') {
      const photos = Array.isArray(r.photos) ? r.photos : (typeof r.photos === 'string' ? JSON.parse(r.photos || '[]') : [])
      return photos.length > 0
    }
    return true
  })

  const getCountryFlagUrl = (code: string) => {
    if (!code) return null
    return `https://flagcdn.com/${code.toLowerCase()}.svg`
  }

  return (
    <section className="mt-12 sm:mt-16 md:mt-20 pt-10 sm:pt-14 border-t border-gray-100">
      
      {/* Section Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-[1px] bg-[#FF7A00]" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#FF7A00]">
              AUTHENTIC REVIEWS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-black text-gray-900 tracking-tight uppercase">
            PATRON <span className="text-[#FF7A00]">REVIEWS</span>
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1">
            Real feedback from clients who purchased this handcrafted piece.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-[#1C1C1C] hover:bg-[#FF7A00] text-white text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          Write a Review
        </button>
      </div>

      {/* Ratings Summary Card */}
      <div className="bg-[#F8F9FA] rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border border-gray-100 mb-8 sm:mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center">
          
          {/* Overall Score */}
          <div className="flex flex-col items-center justify-center text-center md:border-r md:border-gray-200/80 md:pr-8">
            <span className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tighter leading-none">
              {average}
            </span>
            <div className="flex text-[#FF7A00] my-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(Number(average))
                      ? 'text-[#FF7A00] fill-[#FF7A00]'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Based on {total} {total === 1 ? 'Review' : 'Reviews'}
            </p>
          </div>

          {/* 5-Star Distribution Bars */}
          <div className="space-y-2 md:col-span-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = counts[star] || 0
              const percent = total > 0 ? Math.round((count / total) * 100) : (star === 5 ? 100 : 0)
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-10 font-bold text-gray-700 flex items-center gap-1 shrink-0">
                    {star} <Star className="w-3.5 h-3.5 text-[#FF7A00] fill-[#FF7A00]" />
                  </span>
                  <div className="flex-1 h-2.5 bg-gray-200/80 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#FF7A00] rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-medium text-gray-400 text-[11px] shrink-0">
                    {percent}%
                  </span>
                </div>
              )
            })}
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-col justify-center space-y-3 md:border-l md:border-gray-200/80 md:pl-8 text-xs text-gray-600">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="font-bold text-gray-800 uppercase tracking-tight text-[11px]">
                100% Authentic Customer Reviews
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-orange-100 text-[#FF7A00] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-gray-800 uppercase tracking-tight text-[11px]">
                Verified Purchase Protection
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Filter Tabs */}
      {total > 0 && (
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-6 hide-scrollbar">
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-[#1C1C1C] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({total})
          </button>

          {counts[5] > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter('5')}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === '5'
                  ? 'bg-[#1C1C1C] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              5 Star ({counts[5]})
            </button>
          )}

          {counts[4] > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter('4')}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === '4'
                  ? 'bg-[#1C1C1C] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              4 Star ({counts[4]})
            </button>
          )}

          {photoCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter('PHOTOS')}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'PHOTOS'
                  ? 'bg-[#1C1C1C] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              With Photos ({photoCount})
            </button>
          )}
        </div>
      )}

      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {filteredReviews.map((rev) => {
            const photos: string[] = Array.isArray(rev.photos)
              ? rev.photos
              : typeof rev.photos === 'string'
              ? JSON.parse(rev.photos || '[]')
              : []

            const formattedDate = new Date(rev.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })

            const customerName = rev.customer_name || (rev.profiles as any)?.full_name || 'Verified Customer'
            const countryCode = rev.customer_country || 'IN'

            return (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-5 sm:p-7 border border-gray-100 shadow-xs hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  
                  {/* Customer Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1C1C1C] text-white font-black text-xs sm:text-sm flex items-center justify-center uppercase shadow-xs shrink-0">
                      {customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900 text-sm tracking-tight">
                          {customerName}
                        </h4>
                        {countryCode && (
                          <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-600 uppercase">
                            <img
                              src={getCountryFlagUrl(countryCode) || ''}
                              alt={countryCode}
                              className="w-3.5 h-2.5 object-cover rounded-xs"
                            />
                            <span>{countryCode}</span>
                          </div>
                        )}
                        {rev.is_verified_buyer && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                            <CheckCircle className="w-3 h-3" /> Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-400 font-medium block mt-0.5">
                        {formattedDate}
                      </span>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex text-[#FF7A00] shrink-0">
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

                </div>

                {/* Review Title & Content */}
                <div className="space-y-2 mt-3">
                  {rev.title && (
                    <h5 className="font-bold text-gray-900 text-sm tracking-tight">
                      {rev.title}
                    </h5>
                  )}
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-normal">
                    {rev.comment}
                  </p>
                </div>

                {/* Customer Uploaded Photos */}
                {photos.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 mt-4 pt-3 border-t border-gray-100">
                    {photos.map((imgUrl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightboxPhoto(imgUrl)}
                        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 hover:border-[#FF7A00] hover:scale-105 transition-all cursor-pointer group/thumb"
                      >
                        <Image
                          src={imgUrl}
                          alt="Customer review photo"
                          fill
                          className="object-cover"
                          sizes="100px"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Official Boutique Reply */}
                {rev.admin_reply && (
                  <div className="mt-4 p-4 rounded-xl bg-[#F8F9FA] border-l-3 border-[#FF7A00] text-xs text-gray-700 space-y-1">
                    <span className="font-black text-gray-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-[#FF7A00]">
                      <Sparkles className="w-3.5 h-3.5" /> Response from Shahi Boutique
                    </span>
                    <p className="text-gray-600 leading-relaxed italic">
                      "{rev.admin_reply}"
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-[#FF7A00] flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h4 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-tight">
            No Reviews Yet
          </h4>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mt-1 mb-5">
            Be the first to share your thoughts on this bespoke handcrafted ensemble!
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 rounded-full bg-[#1C1C1C] hover:bg-[#FF7A00] text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            Write The First Review
          </button>
        </div>
      )}

      {/* Write Review Modal */}
      <WriteReviewModal
        productId={product?.id}
        productName={product?.name}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Lightbox Modal for Review Photo */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-3xl max-h-[85vh] w-full aspect-[3/4] sm:aspect-square">
            <Image
              src={lightboxPhoto}
              alt="Client review photo"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}

    </section>
  )
}
