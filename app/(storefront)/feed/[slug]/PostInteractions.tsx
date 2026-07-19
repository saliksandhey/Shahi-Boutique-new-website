'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react'

export function PostInteractions({ title, url }: { title: string, url: string }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: 'Check out this post from Shahi Boutique!',
          url: url
        })
      } catch (err) {
        console.log('Error sharing', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url)
      setToastMsg('Link copied to clipboard!')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  return (
    <>
      <div className="p-6 sm:px-8 border-b border-gray-50 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className={`transition-transform hover:scale-110 ${isLiked ? 'text-red-500' : 'text-gray-900 hover:text-red-500'}`}
            >
              <Heart className="w-7 h-7" fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button className="text-gray-900 hover:text-blue-500 transition-transform hover:scale-110">
              <MessageCircle className="w-7 h-7" />
            </button>
            <button 
              onClick={handleShare}
              className="text-gray-900 hover:text-green-500 transition-transform hover:scale-110"
            >
              <Share2 className="w-7 h-7" />
            </button>
          </div>
          <button 
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`transition-transform hover:scale-110 ${isBookmarked ? 'text-[#FF7A00]' : 'text-gray-900 hover:text-[#FF7A00]'}`}
          >
            <Bookmark className="w-7 h-7" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        <div className="text-sm font-bold text-gray-900 mb-1">
          {isLiked ? 'Liked by you and thousands of fashion lovers' : 'Liked by thousands of fashion lovers'}
        </div>

        {/* Simple Toast Notification */}
        {showToast && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mt-4 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-full shadow-lg z-50 animate-fade-in-up">
            {toastMsg}
          </div>
        )}
      </div>
    </>
  )
}
