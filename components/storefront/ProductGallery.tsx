'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ZoomIn, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'

export function ProductGallery({ images }: { images: any[] }) {
  const sortedImages = [...images].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
  const [activeImage, setActiveImage] = useState(sortedImages[0]?.url || '/placeholder.png')
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0)

  // Desktop Hover Zoom State (Flipkart / Amazon style)
  const [isHovered, setIsHovered] = useState(false)
  const [lensPos, setLensPos] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 })
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // Full-Screen Lightbox Modal State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const activeIndex = sortedImages.findIndex(img => img.url === activeImage)
  const currentIdx = activeIndex >= 0 ? activeIndex : 0

  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft
    const width = e.currentTarget.offsetWidth
    const newIndex = Math.round(scrollLeft / width)
    if (newIndex !== mobileActiveIndex && newIndex >= 0 && newIndex < sortedImages.length) {
      setMobileActiveIndex(newIndex)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return
    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Lens dimension (proportional 4:5 ratio)
    const lensW = Math.min(160, rect.width * 0.35)
    const lensH = Math.min(200, rect.height * 0.35)

    // Constrain lens inside container boundaries
    const clampedX = Math.max(0, Math.min(x - lensW / 2, rect.width - lensW))
    const clampedY = Math.max(0, Math.min(y - lensH / 2, rect.height - lensH))

    setLensPos({ x: clampedX, y: clampedY, w: lensW, h: lensH })

    // Zoom background position percentage
    const maxX = rect.width - lensW
    const maxY = rect.height - lensH
    const percentX = maxX > 0 ? (clampedX / maxX) * 100 : 0
    const percentY = maxY > 0 ? (clampedY / maxY) * 100 : 0

    setZoomPos({ x: percentX, y: percentY })
  }

  // Keyboard navigation for Lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (lightboxIndex === null) return
    if (e.key === 'Escape') setLightboxIndex(null)
    if (e.key === 'ArrowLeft') {
      setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : sortedImages.length - 1))
    }
    if (e.key === 'ArrowRight') {
      setLightboxIndex((prev) => (prev !== null && prev < sortedImages.length - 1 ? prev + 1 : 0))
    }
  }, [lightboxIndex, sortedImages.length])

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

  return (
    <div className="w-full select-none relative">
      {/* Mobile Gallery (Carousel with 4:5 Aspect Ratio & Dots) */}
      <div className="lg:hidden relative">
        <div 
          onScroll={handleMobileScroll}
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full rounded-2xl overflow-hidden shadow-xs border border-gray-100 bg-[#F8F9FA]"
        >
          {sortedImages.length > 0 ? (
            sortedImages.map((img, idx) => (
              <div 
                key={img.id || idx} 
                onClick={() => setLightboxIndex(idx)}
                className="relative aspect-[4/5] w-full flex-shrink-0 snap-center bg-[#F8F9FA] cursor-pointer"
              >
                <Image
                  src={img.url}
                  alt={`Product image ${idx + 1}`}
                  fill
                  className="object-cover object-center"
                  priority={idx === 0}
                  sizes="100vw"
                />
              </div>
            ))
          ) : (
            <div className="relative aspect-[4/5] w-full flex items-center justify-center bg-gray-50">
              <span className="font-sans font-bold text-gray-400 text-xs tracking-widest uppercase">No Image</span>
            </div>
          )}
        </div>

        {/* Mobile Dot Indicators */}
        {sortedImages.length > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-3">
            {sortedImages.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  mobileActiveIndex === idx ? 'w-5 bg-[#FF7A00]' : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Gallery */}
      <div className="hidden lg:flex flex-row gap-3.5 items-start w-full relative">
        {/* Thumbnails on the left */}
        {sortedImages.length > 1 && (
          <div className="flex flex-col gap-2.5 overflow-y-auto w-16 xl:w-20 flex-shrink-0 hide-scrollbar max-h-[480px] xl:max-h-[530px]">
            {sortedImages.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setActiveImage(img.url)}
                className={`relative aspect-[4/5] w-full flex-shrink-0 bg-[#F8F9FA] rounded-xl overflow-hidden transition-all duration-200 cursor-pointer border ${
                  activeImage === img.url 
                    ? 'border-[#FF7A00] ring-2 ring-[#FF7A00] ring-offset-1 scale-[0.98] shadow-xs' 
                    : 'border-gray-200/80 opacity-70 hover:opacity-100 hover:border-gray-400'
                }`}
              >
                <Image src={img.url} alt="Thumbnail" fill className="object-cover object-center" sizes="80px" />
              </button>
            ))}
          </div>
        )}

        {/* Main Product Image Container with Zoom Lens */}
        <div 
          ref={imageContainerRef}
          onMouseEnter={() => activeImage !== '/placeholder.png' && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
          onClick={() => activeImage !== '/placeholder.png' && setLightboxIndex(currentIdx)}
          className="relative aspect-[4/5] w-full max-h-[480px] xl:max-h-[530px] bg-[#F8F9FA] rounded-2xl overflow-hidden flex-1 group shadow-xs border border-gray-100/90 cursor-crosshair"
        >
          {activeImage !== '/placeholder.png' ? (
            <>
              <Image
                src={activeImage}
                alt="Product image"
                fill
                className="object-cover object-center"
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
              />

              {/* Lens Box on Hover */}
              {isHovered && (
                <div 
                  style={{
                    left: `${lensPos.x}px`,
                    top: `${lensPos.y}px`,
                    width: `${lensPos.w}px`,
                    height: `${lensPos.h}px`,
                  }}
                  className="absolute pointer-events-none border-2 border-[#FF7A00] bg-[#FF7A00]/10 backdrop-blur-[0.5px] rounded-lg shadow-sm z-30"
                />
              )}

              {/* Hover Guide Hint Badge */}
              <div className={`absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-800 flex items-center gap-1.5 shadow-sm border border-gray-200/80 pointer-events-none transition-opacity duration-200 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                <ZoomIn className="w-3.5 h-3.5 text-[#FF7A00]" />
                <span>Hover to zoom • Click to expand</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <span className="font-sans font-bold text-gray-400 text-xs tracking-widest uppercase">No Image</span>
            </div>
          )}
        </div>

        {/* Flipkart/Amazon-Style Side Zoom Preview Window (Identical height & width, perfectly aligned in 1 screen) */}
        {isHovered && activeImage !== '/placeholder.png' && (
          <div className="hidden lg:block absolute left-[calc(100%+16px)] top-0 h-full aspect-[4/5] z-50 bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-gray-200 overflow-hidden pointer-events-none animate-in fade-in duration-150">
            {/* Opaque Solid White Background Container */}
            <div 
              style={{
                backgroundImage: `url('${activeImage}')`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundSize: '280% 280%',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#ffffff',
              }}
              className="w-full h-full bg-white"
            />
            {/* Top Zoom Badge */}
            <div className="absolute top-3.5 left-3.5 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-lg border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-pulse" />
              <span>3x Ultra HD Zoom</span>
            </div>
          </div>
        )}
      </div>

      {/* Full-Screen Lightbox Modal on Click */}
      {lightboxIndex !== null && sortedImages[lightboxIndex] && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10">
            <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-gray-300">
              {lightboxIndex + 1} / {sortedImages.length}
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

          {/* Main Full-Screen Image Container */}
          <div className="relative flex-1 flex items-center justify-center my-auto w-full max-w-4xl mx-auto">
            <div className="relative aspect-[4/5] w-full max-h-[78vh] rounded-2xl overflow-hidden shadow-2xl bg-[#111]">
              <Image
                src={sortedImages[lightboxIndex].url}
                alt="Full screen product view"
                fill
                className="object-contain object-center"
                priority
                sizes="100vw"
              />
            </div>

            {/* Previous Arrow */}
            {sortedImages.length > 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : sortedImages.length - 1)}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-lg cursor-pointer"
                title="Previous Image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Arrow */}
            {sortedImages.length > 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex(lightboxIndex < sortedImages.length - 1 ? lightboxIndex + 1 : 0)}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-lg cursor-pointer"
                title="Next Image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {sortedImages.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10">
              {sortedImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={`relative w-12 h-14 sm:w-14 sm:h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    lightboxIndex === idx ? 'border-[#FF7A00] scale-105' : 'border-white/20 opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt="Thumbnail" fill className="object-cover" sizes="60px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
