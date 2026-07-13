'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from './ProductCard'

export function FeaturedCollection({ products }: { products: any[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // Take exactly 8 products and duplicate for infinite scroll effect
  const baseFeatured = products?.slice(0, 8) || []
  const featured = [...baseFeatured, ...baseFeatured, ...baseFeatured]

  useEffect(() => {

    const interval = setInterval(() => {
      // Only auto-scroll on desktop (md breakpoint is 768px in Tailwind)
      if (window.innerWidth < 768) return

      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
        // If we reached the end, scroll back to start instantly
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollContainerRef.current.classList.remove('scroll-smooth')
          scrollContainerRef.current.scrollTo({ left: 0 })
          
          requestAnimationFrame(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.classList.add('scroll-smooth')
              scrollContainerRef.current.scrollBy({ left: 350, behavior: 'smooth' })
            }
          })
        } else {
          // scroll by one product width roughly (350px)
          scrollContainerRef.current.scrollBy({ left: 350, behavior: 'smooth' })
        }
      }
    }, 3500) // 3.5 seconds

    return () => clearInterval(interval)
  }, [])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -350, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 350, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-12 md:py-20 bg-white relative group/section">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12 relative">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-8 md:mb-16 gap-6 text-center md:text-left">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-sans font-black text-gray-900 mb-3 tracking-tighter uppercase">
              Potli <span className="text-[#FF7A00]">Purse</span>
            </h2>
            <p className="text-gray-500 text-sm md:text-lg font-medium">
              Explore our exclusive and dynamic collection of beautifully handcrafted potli purses.
            </p>
          </div>
          
          <Link 
            href="/category/potli" 
            className="inline-flex items-center justify-center px-8 py-4 bg-[#FF7A00] text-white text-xs font-bold tracking-widest uppercase rounded-full hover:bg-[#e66a00] transition-colors shrink-0"
          >
            View More
          </Link>
        </div>

        {/* Scroll Buttons (visible primarily on desktop) */}
        <div className="hidden md:block">
          <button 
            onClick={scrollLeft}
            className="absolute left-4 lg:left-8 top-[60%] -translate-y-1/2 w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg text-black hover:bg-[#FF7A00] hover:text-white hover:border-[#FF7A00] transition-all z-10 opacity-0 group-hover/section:opacity-100"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={scrollRight}
            className="absolute right-4 lg:right-8 top-[60%] -translate-y-1/2 w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg text-black hover:bg-[#FF7A00] hover:text-white hover:border-[#FF7A00] transition-all z-10 opacity-0 group-hover/section:opacity-100"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Products Horizontal Scroll */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-x-4 sm:gap-x-6 xl:gap-x-8 pb-8 snap-x snap-mandatory scroll-smooth" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {featured.map((product, index) => (
            <div key={`${product.id}-${index}`} className="min-w-[50vw] sm:min-w-[320px] lg:min-w-[350px] shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
