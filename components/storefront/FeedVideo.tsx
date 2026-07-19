'use client'

import { useRef, useEffect, useState } from 'react'

export function FeedVideo({ src, className }: { src: string, className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <video 
      ref={videoRef}
      src={src}
      className={className}
      loop
      muted
      playsInline
      preload="metadata"
    />
  )
}
