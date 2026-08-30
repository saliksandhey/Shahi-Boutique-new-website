'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { HeroSlider, Slide } from './HeroSlider'

export function HeroLuxury({ 
  heroBannerUrl, 
  heroBannerMobileUrl,
  marqueeContent,
  marqueeSpeed,
  slides,
  intervalSecs
}: { 
  heroBannerUrl?: string, 
  heroBannerMobileUrl?: string,
  marqueeContent?: string,
  marqueeSpeed?: string,
  slides?: Slide[],
  intervalSecs?: number
}) {
  const currentDesktopBanner = heroBannerUrl || '/Hero_sec.jpeg'
  const currentMobileBanner = heroBannerMobileUrl || currentDesktopBanner
  
  const displayMarquee = marqueeContent || '✦ Shop the Exclusive Bridal Collection ✦ Free Worldwide Shipping ✦'
  const displaySpeed = marqueeSpeed || '25'
  
  // If we have slides from settings, use the slider.
  // Otherwise fallback to the static images (with the exact aspect ratios).
  const hasSlides = slides && slides.length > 0;

  return (
    <>
      <div className="w-full bg-[#F8F9FA]">
        {hasSlides ? (
          <HeroSlider slides={slides} intervalSecs={intervalSecs || 5} />
        ) : (
          <>
            {/* Desktop Banner (2.75:1 Aspect Ratio) */}
            <div className="relative w-full overflow-hidden aspect-[2.75/1] hidden md:block">
              <Image 
                src={currentDesktopBanner} 
                alt="Shahi Boutique Desktop" 
                fill
                priority
                unoptimized={!!heroBannerUrl}
                sizes="100vw"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Mobile Banner (3:2 Aspect Ratio) */}
            <div className="relative w-full overflow-hidden aspect-[3/2] block md:hidden">
              <Image 
                src={currentMobileBanner} 
                alt="Shahi Boutique Mobile" 
                fill
                priority
                unoptimized={!!heroBannerMobileUrl || !!heroBannerUrl}
                sizes="100vw"
                className="w-full h-full object-cover"
              />
            </div>
          </>
        )}
      </div>

      {/* Announcement Marquee */}
      <div className="relative w-full bg-[#5E1218] border-y border-[#4A0D11] overflow-hidden py-1.5 z-20">
        <div 
          className="flex whitespace-nowrap"
          style={{ animation: `marquee ${displaySpeed}s linear infinite` }}
        >
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center mx-6">
              <span className="text-white text-xs font-medium tracking-wider">
                {displayMarquee}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CSS for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </>
  )
}
