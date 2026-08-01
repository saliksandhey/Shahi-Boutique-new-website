'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Play, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { FeedVideo } from './FeedVideo'

export function HomeFeedSection({ blogs }: { blogs: any[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  const isVideoPost = (blog: any) => {
    const cover = blog.cover_image || ''
    return cover.match(/\.(mp4|webm|mov)$/i)
  }

  if (!blogs || blogs.length === 0) return null

  return (
    <section className="py-6 md:py-12 relative bg-[#0A0A0A] mt-6 mb-6">
      {/* Decorative Highlight Background (contained) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#FF7A00]/[0.05] blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#FF7A00]/[0.03] blur-[120px] rounded-full" />
      </div>

      {/* Top Zig-Zag Pattern */}
      <div 
        className="absolute left-0 right-0 h-[20px] md:h-[40px] z-20"
        style={{
          top: '-19px',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 L20 0 L40 20 Z' fill='%230A0A0A'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 100%'
        }}
      />

      {/* Bottom Zig-Zag Pattern */}
      <div 
        className="absolute left-0 right-0 h-[20px] md:h-[40px] z-20"
        style={{
          bottom: '-19px',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 L20 20 L40 0 Z' fill='%230A0A0A'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 100%'
        }}
      />
      
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-6">
          <div className="text-left">
            <h2 className="text-4xl md:text-6xl font-heading font-black text-white mb-4 tracking-tight uppercase">
              The <span className="text-[#FF7A00]">Journal</span>
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-medium max-w-md leading-relaxed">
              Discover style inspiration, behind the scenes, and our latest updates from the atelier.
            </p>
          </div>
          <div className="flex items-center gap-4 mx-auto md:mx-0">
            <Link 
              href="/feed"
              className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-black text-sm font-bold uppercase tracking-widest rounded-full hover:bg-[#FF7A00] hover:text-white hover:shadow-[0_0_30px_rgba(255,122,0,0.3)] transition-all shrink-0 w-max"
            >
              <span>Explore Feed</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Scroll Buttons for Desktop */}
            <div className="hidden sm:flex items-center gap-3">
              <button 
                onClick={() => scroll('left')}
                className="p-3 rounded-full border border-gray-800 text-gray-400 hover:text-white hover:border-white transition-all focus:outline-none"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="p-3 rounded-full border border-gray-800 text-gray-400 hover:text-white hover:border-white transition-all focus:outline-none"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-6 pb-8 overflow-x-auto snap-x snap-mandatory hide-scrollbar"
        >
          {blogs.map((blog, idx) => {
            const hasVideo = isVideoPost(blog)
            
            return (
              <motion.div
                key={blog.id}
                className="w-[75vw] sm:w-[50vw] md:w-[35vw] lg:w-[25vw] flex-none snap-start"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <Link 
                  href={`/feed/${blog.slug}`}
                  className="group relative block w-full aspect-[4/5] bg-[#1A1A1A] rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl"
                >
                  {hasVideo ? (
                    <FeedVideo 
                      src={blog.cover_image}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />
                  ) : (
                    <img 
                      src={blog.cover_image || '/placeholder-image.jpg'}
                      alt={blog.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                      loading="lazy"
                    />
                  )}
                  
                  {/* Overlay for readability - Always present on mobile, enhanced on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 md:opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
                  
                  {/* Video Indicator */}
                  {hasVideo && (
                    <div className="absolute top-4 right-4 w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                      <Play className="w-4 h-4 ml-0.5" />
                    </div>
                  )}

                  {/* Content (Always visible on mobile, animates on hover for desktop) */}
                  <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-end">
                    <div className="transform md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <span className="inline-block px-3 py-1.5 bg-[#FF7A00] text-[#111111] text-[9px] font-black uppercase tracking-widest rounded-full w-max mb-4 shadow-lg">
                        {blog.category || 'Editorial'}
                      </span>
                      <h3 className="text-white font-heading font-black text-lg md:text-2xl uppercase tracking-widest line-clamp-3 leading-tight shadow-sm drop-shadow-md">
                        {blog.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
