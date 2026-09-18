'use client'

import { useEffect, useState } from 'react'
import { Star, Quote, CheckCircle2, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import { WriteReviewModal } from './WriteReviewModal'

export function CustomerReviews({ dbReviews = [] }: { dbReviews?: any[] }) {
  // Only display real, approved database reviews
  const reviews = dbReviews && dbReviews.length > 0 ? dbReviews : []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Responsive items per view: Mobile: 1, Tablet: 2, Desktop: 3
  const [itemsPerView, setItemsPerView] = useState(3)

  useEffect(() => {
    const updateItems = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 768) setItemsPerView(1)
        else if (window.innerWidth < 1024) setItemsPerView(2)
        else setItemsPerView(3)
      }
    }
    updateItems()
    window.addEventListener('resize', updateItems)
    return () => window.removeEventListener('resize', updateItems)
  }, [])

  // Auto slide every 6 seconds if multiple reviews exist
  useEffect(() => {
    if (reviews.length <= itemsPerView) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIdx = Math.max(0, reviews.length - itemsPerView)
        return prev >= maxIdx ? 0 : prev + 1
      })
    }, 6000)
    return () => clearInterval(timer)
  }, [reviews.length, itemsPerView])

  const maxIndex = Math.max(0, reviews.length - itemsPerView)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0))
  }

  const getCountryFlagUrl = (code: string) => {
    if (!code) return null
    return `https://flagcdn.com/${code.toLowerCase()}.svg`
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#F8F9FA] relative overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-2.5">
            <span className="w-8 h-[1px] bg-[#FF7A00]" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#FF7A00]">
              WHY CLIENTS LOVE US
            </span>
            <span className="w-8 h-[1px] bg-[#FF7A00]" />
          </div>
          <h2 className="text-3xl md:text-5xl font-sans font-black text-gray-900 mb-2 tracking-tighter uppercase">
            Words From <span className="text-[#FF7A00]">Our Muses</span>
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm md:text-base font-medium max-w-lg mx-auto mb-5">
            Authentic reflections from clients who trusted us with their special ensembles.
          </p>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-full bg-[#1C1C1C] hover:bg-[#FF7A00] text-white text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            Share Your Experience
          </button>
        </div>

        {reviews.length > 0 ? (
          /* Slider Container */
          <div className="relative group">
            
            {/* Left / Right Navigation Arrows (if more than items per view) */}
            {reviews.length > itemsPerView && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-[#FF7A00] text-gray-900 hover:text-white flex items-center justify-center shadow-lg border border-gray-200/80 transition-all cursor-pointer"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-[#FF7A00] text-gray-900 hover:text-white flex items-center justify-center shadow-lg border border-gray-200/80 transition-all cursor-pointer"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </>
            )}

            {/* Cards Track */}
            <div className="overflow-hidden px-1 sm:px-2 py-2">
              <div 
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
              >
                {reviews.map((rev, idx) => {
                  const customerName = rev.customer_name || (rev.profiles as any)?.full_name || 'Verified Client'
                  const countryCode = rev.customer_country || 'IN'
                  const photos: string[] = Array.isArray(rev.photos) 
                    ? rev.photos 
                    : (typeof rev.photos === 'string' ? JSON.parse(rev.photos || '[]') : [])
                  const purchasedItem = rev.products?.name || rev.title || 'Bespoke Couture Stitching'

                  return (
                    <div 
                      key={rev.id || idx} 
                      className="flex-shrink-0 px-2.5 sm:px-3.5"
                      style={{ width: `${100 / itemsPerView}%` }}
                    >
                      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 h-full flex flex-col relative group/card hover:shadow-md transition-shadow duration-300 shadow-xs border border-gray-100">
                        
                        {/* Background Quote Icon */}
                        <Quote className="absolute top-5 right-5 w-10 h-10 text-gray-100 transition-all duration-300" strokeWidth={1} />
                        
                        {/* Customer Info Header */}
                        <div className="flex items-center gap-3.5 mb-5 relative z-10">
                          {photos.length > 0 ? (
                            <div className="w-12 h-12 rounded-full overflow-hidden shadow-xs shrink-0 relative border border-gray-200">
                              <Image src={photos[0]} alt={customerName} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-[#1C1C1C] text-white font-black text-sm flex items-center justify-center uppercase shadow-xs shrink-0">
                              {customerName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-gray-900 text-sm tracking-tight">{customerName}</h4>
                              {rev.is_verified_buyer && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              )}
                            </div>
                            {countryCode && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {getCountryFlagUrl(countryCode) && (
                                  <img 
                                    src={getCountryFlagUrl(countryCode)!} 
                                    alt={countryCode} 
                                    className="w-3.5 h-2.5 object-cover rounded-xs" 
                                  />
                                )}
                                <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{countryCode}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Star Rating */}
                        <div className="flex gap-1 mb-3 relative z-10 text-[#FF7A00]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < (rev.rating || 5) ? 'fill-[#FF7A00]' : 'text-gray-200 fill-gray-100'}`} />
                          ))}
                        </div>

                        {/* Purchased Item Tag */}
                        <div className="mb-3 relative z-10">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Purchased: </span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF7A00]">{purchasedItem}</span>
                        </div>

                        {/* Review Text */}
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-medium flex-grow relative z-10 italic">
                          "{rev.comment}"
                        </p>

                        {/* Uploaded photo thumbnail if any */}
                        {photos.length > 0 && (
                          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                            {photos.map((pUrl: string, pIdx: number) => (
                              <div key={pIdx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                                <Image src={pUrl} alt="Client outfit" fill className="object-cover" sizes="60px" />
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Dots Navigation */}
            {reviews.length > itemsPerView && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      currentIndex === idx 
                        ? 'bg-[#FF7A00] w-6' 
                        : 'bg-gray-300 hover:bg-gray-400 w-2'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}

          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-white rounded-3xl border border-gray-100 max-w-md mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-[#FF7A00] flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-tight">
              Be Our First Muse
            </h4>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              Have you ordered a custom suit or potli from us? Share your experience with our global community!
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#1C1C1C] hover:bg-[#FF7A00] text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              Write First Review
            </button>
          </div>
        )}
      </div>

      {/* Write Review Modal for General Store Testimonials */}
      <WriteReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  )
}


