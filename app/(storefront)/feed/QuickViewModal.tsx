'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, ZoomOut, Heart, MessageCircle, Share2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function QuickViewModal({ post, onClose }: { post: any, onClose: () => void }) {
  const [isZoomed, setIsZoomed] = useState(false)

  if (!post) return null

  const isVideo = post.cover_image?.match(/\.(mp4|webm|mov)$/i)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center text-gray-800 transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image/Video Section */}
          <div className={`relative w-full md:w-3/5 ${isVideo ? 'bg-black' : 'bg-gray-100'} flex items-center justify-center overflow-hidden group min-h-[40vh] md:min-h-[70vh]`}>
            <motion.div
              className={`relative w-full h-full ${!isVideo ? (isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in') : ''} flex items-center justify-center transition-all duration-300`}
              onClick={() => {
                if (!isVideo) {
                  setIsZoomed(!isZoomed)
                }
              }}
              animate={{ scale: isZoomed && !isVideo ? 1.5 : 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {isVideo ? (
                <>
                  {/* Blurred Background to fill blank space */}
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <video 
                      src={post.cover_image}
                      className="w-full h-full object-cover blur-3xl opacity-50 scale-[1.2]"
                      autoPlay loop muted playsInline
                    />
                  </div>
                  {/* Main Video */}
                  <video 
                    src={post.cover_image}
                    className="relative z-10 w-full h-full object-contain"
                    autoPlay loop playsInline controls
                  />
                </>
              ) : (
                <>
                  {/* Blurred Background to fill blank space */}
                  <div className="absolute inset-0 z-0 overflow-hidden bg-gray-100">
                    <img 
                      src={post.cover_image || '/placeholder-image.jpg'}
                      className="w-full h-full object-cover blur-3xl opacity-40 scale-[1.2]"
                      alt=""
                    />
                  </div>
                  {/* Main Image */}
                  <img
                    src={post.cover_image || '/placeholder-image.jpg'}
                    alt={post.title}
                    className="relative z-10 w-full h-full object-contain"
                  />
                </>
              )}
            </motion.div>
            
            {/* Zoom Hint Icon */}
            {!isZoomed && !post.cover_image?.match(/\.(mp4|webm|mov)$/i) && (
              <div className="absolute bottom-4 right-4 w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ZoomIn className="w-5 h-5" />
              </div>
            )}
            {isZoomed && !post.cover_image?.match(/\.(mp4|webm|mov)$/i) && (
              <div className="absolute bottom-4 right-4 w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ZoomOut className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="w-full md:w-2/5 flex flex-col bg-white overflow-y-auto">
            {/* Header (Author) */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF7A00] to-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-sm font-heading">S</span>
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Shahi Boutique</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-6 flex-1">
              <h3 className="font-heading font-black text-gray-900 text-xl uppercase tracking-widest mb-4">
                {post.title}
              </h3>
              
              <p className="text-sm text-gray-700 font-medium leading-relaxed mb-6 whitespace-pre-wrap">
                <span className="font-bold text-gray-900 mr-2">shahiboutique</span>
                {post.summary}
              </p>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag: string, i: number) => (
                    <span key={i} className="text-[#FF7A00] text-xs font-bold hover:underline">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 mt-auto sticky bottom-0">
              <div className="flex items-center gap-6 mb-6">
                <button className="text-gray-900 hover:text-red-500 transition-transform hover:scale-110">
                  <Heart className="w-6 h-6" />
                </button>
                <button className="text-gray-900 hover:text-blue-500 transition-transform hover:scale-110">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button className="text-gray-900 hover:text-green-500 transition-transform hover:scale-110">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
              
              <Link 
                href={`/feed/${post.slug}`}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 hover:bg-[#FF7A00] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg"
              >
                Read Full Article
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
