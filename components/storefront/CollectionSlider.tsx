'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/storefront/ProductCard'

interface CollectionSliderProps {
  products: any[]
}

export function CollectionSlider({ products }: CollectionSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth
      
      scrollContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      })
    }
  }

  if (!products || products.length === 0) return null

  return (
    <section className="py-10 md:py-16 bg-white">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-sans font-black text-gray-900 mb-3 tracking-tighter uppercase">
              Our <span className="text-[#FF7A00]">Collection</span>
            </h2>
            <p className="text-gray-500 text-sm md:text-lg font-medium">
              Discover all our handcrafted additions.
            </p>
          </div>
          
          {/* Scroll Buttons - Hidden on small mobile, visible on tablet/desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <button 
              onClick={() => scroll('left')}
              className="p-3 rounded-full border border-gray-200 text-gray-600 hover:text-[#111111] hover:border-[#111111] hover:bg-gray-50 transition-all focus:outline-none"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-3 rounded-full border border-gray-200 text-gray-600 hover:text-[#111111] hover:border-[#111111] hover:bg-gray-50 transition-all focus:outline-none"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 lg:gap-6 w-full overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth hide-scrollbar relative" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-[70vw] sm:min-w-[45vw] md:min-w-[30vw] lg:min-w-[22vw] shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
          
          {/* View More Card */}
          <div className="min-w-[70vw] sm:min-w-[45vw] md:min-w-[30vw] lg:min-w-[22vw] shrink-0 snap-start flex items-stretch">
            <a 
              href="/shop" 
              className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-gray-50 hover:bg-[#FF7A00]/5 rounded-[2rem] border-2 border-dashed border-gray-200 hover:border-[#FF7A00] transition-all duration-300 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-md">
                <ChevronRight className="w-8 h-8 text-gray-400 group-hover:text-[#FF7A00] transition-colors" />
              </div>
              <span className="text-lg font-bold text-gray-900 group-hover:text-[#FF7A00] transition-colors uppercase tracking-widest">
                View All
              </span>
              <span className="text-sm text-gray-500 mt-2 font-medium">
                Explore entire collection
              </span>
            </a>
          </div>
        </div>
        
      </div>
    </section>
  )
}
