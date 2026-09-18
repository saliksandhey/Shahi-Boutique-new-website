'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import deliveredCreations from '@/data/delivered-creations.json'

export function HomeFeedSection({ blogs = [] }: { blogs?: any[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const items = deliveredCreations && deliveredCreations.length > 0 ? deliveredCreations : []
  // Double list for infinite continuous loop
  const infiniteList = [...items, ...items]

  // Manual scroll with side arrow buttons
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = window.innerWidth < 640 ? 260 : 360
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  // Smooth continuous auto-scroll ticker (runs continuously, never stops unless hovered)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let animationFrameId: number
    const speed = 0.75 // slow, relaxing glide speed

    const scrollStep = () => {
      if (!isPaused && lightboxIndex === null && el) {
        el.scrollLeft += speed
        // When scrolled halfway (first set completed), seamlessly loop back to start
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0
        }
      }
      animationFrameId = requestAnimationFrame(scrollStep)
    }

    animationFrameId = requestAnimationFrame(scrollStep)
    return () => cancelAnimationFrame(animationFrameId)
  }, [isPaused, lightboxIndex])

  // Keyboard navigation for Lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (lightboxIndex === null) return
    if (e.key === 'Escape') setLightboxIndex(null)
    if (e.key === 'ArrowLeft') {
      setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : items.length - 1))
    }
    if (e.key === 'ArrowRight') {
      setLightboxIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : 0))
    }
  }, [lightboxIndex, items.length])

  useEffect(() => {
    if (lightboxIndex !== null) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [lightboxIndex, handleKeyDown])

  if (items.length === 0) return null

  return (
    <section className="pt-10 sm:pt-14 md:pt-16 pb-6 sm:pb-8 md:pb-10 bg-white relative overflow-hidden">
      <div className="w-full">
        
        {/* Brand Header */}
        <div className="text-center max-w-3xl mx-auto px-4 sm:px-6 mb-8 sm:mb-12 relative z-10">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-2.5">
            <span className="w-8 h-[1px] bg-[#FF7A00]" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#FF7A00]">
              BEHIND THE ATELIER
            </span>
            <span className="w-8 h-[1px] bg-[#FF7A00]" />
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl md:text-5xl font-sans font-black text-gray-900 mb-3 tracking-tighter uppercase">
            DELIVERED <span className="text-[#FF7A00]">ENSEMBLES</span>
          </h2>

          {/* Subtitle */}
          <p className="text-gray-500 text-sm md:text-lg font-medium max-w-xl mx-auto leading-relaxed">
            Custom-tailored & hand-embroidered bespoke suits delivered to our clients worldwide.
          </p>
        </div>

        {/* Carousel Container with Side Navigation Arrows */}
        <div 
          className="relative w-full group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setTimeout(() => setIsPaused(false), 2500)}
        >
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-[#FF7A00] text-gray-900 hover:text-white flex items-center justify-center shadow-lg border border-gray-200/80 hover:border-[#FF7A00] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-[#FF7A00] text-gray-900 hover:text-white flex items-center justify-center shadow-lg border border-gray-200/80 hover:border-[#FF7A00] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </button>

          {/* Smooth Continuous Marquee Scroll Track */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar py-4 px-4 sm:px-6 cursor-grab active:cursor-grabbing select-none"
            style={{ scrollBehavior: 'auto' }}
          >
            {infiniteList.map((suit, idx) => {
              const realIndex = idx % items.length
              return (
                <div
                  key={`${suit.id}-${idx}`}
                  onClick={() => setLightboxIndex(realIndex)}
                  className="w-[220px] sm:w-[260px] md:w-[290px] lg:w-[320px] aspect-[3/4] flex-shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-gray-100 border border-gray-200/60 cursor-pointer group/card relative"
                >
                  {/* Clean High-Resolution Suit Image (100% Text-Free) */}
                  <Image
                    src={suit.image}
                    alt="Custom Stitched Boutique Suit"
                    fill
                    className="object-cover object-center group-hover/card:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 640px) 220px, (max-width: 1024px) 290px, 320px"
                  />
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Full-Screen Lightbox on Click */}
      {lightboxIndex !== null && items[lightboxIndex] && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10 max-w-5xl mx-auto w-full">
            <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-gray-300">
              {lightboxIndex + 1} / {items.length}
            </span>
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Full-Screen Image */}
          <div className="relative flex-1 flex items-center justify-center my-auto w-full max-w-4xl mx-auto">
            <div className="relative aspect-[3/4] w-full max-h-[78vh] rounded-2xl overflow-hidden shadow-2xl bg-[#111]">
              <Image
                src={items[lightboxIndex].image}
                alt="Client Stitched Suit"
                fill
                className="object-contain object-center"
                priority
                sizes="100vw"
              />
            </div>

            {/* Previous Arrow */}
            <button
              type="button"
              onClick={() => setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : items.length - 1)}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-lg cursor-pointer"
              title="Previous Suit"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={() => setLightboxIndex(lightboxIndex < items.length - 1 ? lightboxIndex + 1 : 0)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-lg cursor-pointer"
              title="Next Suit"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10 max-w-4xl mx-auto w-full hide-scrollbar">
            {items.map((suit, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className={`relative w-12 h-14 sm:w-14 sm:h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                  lightboxIndex === idx ? 'border-[#FF7A00] scale-105' : 'border-white/20 opacity-50 hover:opacity-100'
                }`}
              >
                <Image src={suit.image} alt="Thumbnail" fill className="object-cover" sizes="60px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
