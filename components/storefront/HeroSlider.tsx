'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type Slide = {
  id: string;
  desktopUrl: string;
  mobileUrl: string;
  link: string;
}

interface HeroSliderProps {
  slides: Slide[];
  intervalSecs: number;
}

const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity
}

export function HeroSlider({ slides, intervalSecs }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const nextSlide = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1))
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1))
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1 || isHovered) return

    const intervalId = setInterval(nextSlide, intervalSecs * 1000)
    return () => clearInterval(intervalId)
  }, [slides.length, intervalSecs, isHovered, nextSlide])

  if (!slides || slides.length === 0) {
    return null // Return null or a fallback banner if no slides exist
  }

  const slideVariants: Variants = {
    initial: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
    }),
  }

  return (
    <div 
      className="relative w-full overflow-hidden bg-[#F8F9FA]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full aspect-[3/2] md:aspect-[2.75/1]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x)

              if (swipe < -swipeConfidenceThreshold) {
                nextSlide()
              } else if (swipe > swipeConfidenceThreshold) {
                prevSlide()
              }
            }}
            className="absolute inset-0 w-full h-full touch-pan-y"
          >
            {slides[currentIndex].link ? (
              <Link href={slides[currentIndex].link} className="block w-full h-full relative cursor-pointer">
                <picture className="w-full h-full block">
                  {/* Mobile Image */}
                  <source media="(max-width: 768px)" srcSet={slides[currentIndex].mobileUrl || slides[currentIndex].desktopUrl} />
                  {/* Desktop Image */}
                  <img 
                    src={slides[currentIndex].desktopUrl || slides[currentIndex].mobileUrl} 
                    alt={`Slide ${currentIndex + 1}`} 
                    className="w-full h-full object-cover object-center pointer-events-none"
                  />
                </picture>
              </Link>
            ) : (
              <div className="w-full h-full relative">
                <picture className="w-full h-full block">
                  <source media="(max-width: 768px)" srcSet={slides[currentIndex].mobileUrl || slides[currentIndex].desktopUrl} />
                  <img 
                    src={slides[currentIndex].desktopUrl || slides[currentIndex].mobileUrl} 
                    alt={`Slide ${currentIndex + 1}`} 
                    className="w-full h-full object-cover object-center pointer-events-none"
                  />
                </picture>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows (Desktop Only) */}
        {slides.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className={`hidden md:block absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/70 text-black p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all duration-300 z-10 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <button 
              onClick={nextSlide}
              className={`hidden md:block absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/70 text-black p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all duration-300 z-10 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Slide Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 rounded-full h-1.5 sm:h-2 ${currentIndex === index ? 'w-6 sm:w-8 bg-white' : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/80'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
