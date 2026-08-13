'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Search, Heart, MessageCircle, Share2, Play, LayoutGrid, Image as ImageIcon, Film, ExternalLink } from 'lucide-react'
import { FeedVideo } from '@/components/storefront/FeedVideo'

const categories = [
  'All',
  'Fashion Trends',
  'Bridal Collection',
  'Boutique Updates',
  'Styling Tips',
  'Behind The Scenes',
  'Customer Stories',
  'Announcements'
]

export function BlogClient({ initialBlogs }: { initialBlogs: any[] }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeMediaType, setActiveMediaType] = useState('All') // All, Images, Videos
  const [searchQuery, setSearchQuery] = useState('')
  const [shuffledBlogs, setShuffledBlogs] = useState<any[]>([])

  const isVideoPost = (blog: any) => {
    const cover = blog.cover_image || ''
    const text = blog.content || ''
    return cover.match(/\.(mp4|webm|mov)$/i) || text.includes('youtube.com') || text.includes('vimeo.com')
  }

  // Shuffle when 'All' is selected or initialBlogs loads
  useEffect(() => {
    if (activeMediaType === 'All') {
      const newArr = [...initialBlogs]
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]]
      }
      setShuffledBlogs(newArr)
    }
  }, [activeMediaType, initialBlogs])

  // Filter Blogs
  const filteredBlogs = useMemo(() => {
    const baseList = activeMediaType === 'All' && shuffledBlogs.length > 0 ? shuffledBlogs : initialBlogs

    return baseList.filter((blog: any) => {
      // 1. Search filter
      const searchString = `${blog.title} ${blog.summary} ${blog.tags?.join(' ')}`.toLowerCase()
      const matchesSearch = searchQuery === '' || searchString.includes(searchQuery.toLowerCase())
      
      // 2. Category filter
      const matchesCategory = activeCategory === 'All' || blog.category === activeCategory
      
      // 3. Media Type filter
      let matchesMedia = true
      if (activeMediaType === 'Images') matchesMedia = !isVideoPost(blog)
      if (activeMediaType === 'Videos') matchesMedia = isVideoPost(blog)

      return matchesSearch && matchesCategory && matchesMedia
    })
  }, [initialBlogs, shuffledBlogs, activeCategory, searchQuery, activeMediaType])

  return (
    <div className="w-full">
      {/* 1. BRANDING HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-widest text-gray-900 uppercase">
          Shahi Feed
        </h1>
        <p className="mt-3 text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest">
          The Official Media Journal
        </p>
      </div>

      {/* 2. MEDIA TYPE & SEARCH FILTERS (Sticky) */}
      <section className="mx-auto max-w-[1400px] px-2 sm:px-6 lg:px-8 mb-8 sticky top-4 md:top-6 z-[60]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white/90 md:bg-white/80 backdrop-blur-2xl p-2 md:p-2 rounded-[2rem] md:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100/50">
          
          {/* Media Type Tabs */}
          <div className="flex items-center gap-1 w-full md:w-auto p-1 bg-gray-50 rounded-full">
            {[
              { id: 'All', icon: LayoutGrid, label: 'Feed' },
              { id: 'Images', icon: ImageIcon, label: 'Photos' },
              { id: 'Videos', icon: Film, label: 'Reels' },
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setActiveMediaType(type.id)}
                className={`relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors flex-1 md:flex-none ${
                  activeMediaType === type.id ? 'text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {activeMediaType === type.id && (
                  <motion.div
                    layoutId="activeMediaTab"
                    className="absolute inset-0 bg-[#111111] rounded-full shadow-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <type.icon className="relative z-10 w-3.5 h-3.5" />
                <span className="relative z-10 hidden sm:inline-block">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72 lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#FF7A00] transition-colors" />
            <input 
              type="text" 
              placeholder="Search captions or hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-0 rounded-full pl-11 pr-4 py-3 text-sm font-medium focus:outline-none transition-all placeholder:text-gray-400"
            />
          </div>
        </div>
      </section>

      {/* 3. CATEGORY FILTERS (Scrollable) */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 hide-scrollbar mask-linear-fade">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                activeCategory === category 
                ? 'border-gray-900 bg-gray-900 text-white shadow-lg' 
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-0 sm:px-6 lg:px-8">
        {/* 4. MASONRY FEED */}
        {filteredBlogs.length > 0 ? (
          <div className="columns-2 lg:columns-3 xl:columns-4 gap-3 sm:gap-6 space-y-3 sm:space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredBlogs.map((blog, idx) => {
                const hasVideo = isVideoPost(blog)
                
                return (
                  <motion.div
                    key={blog.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, delay: (idx % 10) * 0.05 }}
                    className="break-inside-avoid border-b sm:border-none border-gray-100 pb-6 sm:pb-0 mb-6 sm:mb-0"
                  >
                    <Link 
                      href={`/feed/${blog.slug}`}
                      className="group block bg-white md:bg-transparent sm:rounded-3xl md:rounded-none overflow-hidden shadow-none sm:shadow-sm md:shadow-none hover:shadow-2xl md:hover:shadow-none transition-all duration-500 sm:border border-gray-100 md:border-none cursor-pointer"
                    >
                      
                      {/* Media Container */}
                      <div className="relative overflow-hidden bg-gray-100">
                        {blog.cover_image?.match(/\.(mp4|webm|mov)$/i) ? (
                          <FeedVideo 
                            src={blog.cover_image}
                            className="w-full h-auto min-h-[250px] object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <img 
                            src={blog.cover_image || '/placeholder-image.jpg'} 
                            alt={blog.title}
                            className="w-full h-auto min-h-[250px] object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                            loading="lazy"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/5 md:bg-transparent group-hover:bg-transparent transition-colors duration-500" />
                        
                        {/* Video / Carousel Indicator */}
                        {hasVideo && (
                          <div className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                            <Play className="w-4 h-4 ml-0.5" />
                          </div>
                        )}

                        <div className="absolute top-4 left-4 md:hidden">
                          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-gray-900 text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                            {blog.category}
                          </span>
                        </div>

                        {/* Hover Overlay for clicking */}
                        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-gray-900 text-xs font-black uppercase tracking-widest rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300 flex items-center gap-2">
                            {blog.instagram_url ? (
                              <>
                                <ExternalLink className="w-4 h-4" />
                                Open Instagram
                              </>
                            ) : (
                              'Quick View'
                            )}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-widest text-gray-900 mb-2">No Feed Posts Found</h3>
            <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
              Try adjusting your search or media filters.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
