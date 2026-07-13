'use client'

import { useRef, useEffect, useState } from 'react'

export function FeedVideo({ src, className }: { src: string, className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Intersection Observer for mobile auto-play
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Detect if mobile (simple check based on hover capability)
    const isMobile = window.matchMedia('(hover: none)').matches

    if (isMobile) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            video.play().catch(() => {})
          } else {
            video.pause()
          }
        })
      }, {
        threshold: 0.6 // Play when 60% visible
      })
      
      observer.observe(video)
      return () => observer.disconnect()
    }
  }, [])

  // Desktop Hover logic
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    
    const isMobile = window.matchMedia('(hover: none)').matches
    if (isMobile) return // Hover logic only for desktop

    if (isHovered) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [isHovered])

  return (
    <video 
      ref={videoRef}
      src={src}
      className={className}
      loop
      muted // Always muted in feed for auto-play policy
      playsInline
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    />
  )
}
