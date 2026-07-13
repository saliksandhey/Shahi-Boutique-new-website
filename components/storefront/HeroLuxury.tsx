'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export function HeroLuxury({ 
  heroBannerUrl, 
  heroBannerMobileUrl,
  marqueeContent,
  marqueeSpeed
}: { 
  heroBannerUrl?: string, 
  heroBannerMobileUrl?: string,
  marqueeContent?: string,
  marqueeSpeed?: string
}) {
  const currentDesktopBanner = heroBannerUrl || '/Hero_sec.jpeg'
  const currentMobileBanner = heroBannerMobileUrl || currentDesktopBanner
  
  const displayMarquee = marqueeContent || '✦ Shop the Exclusive Bridal Collection ✦ Free Worldwide Shipping ✦'
  const displaySpeed = marqueeSpeed || '25'

  return (
    <>
      {/* Desktop Banner (2.75:1 Aspect Ratio) */}
      <div className="relative w-full mt-[72px] md:mt-[88px] bg-[#F8F9FA] overflow-hidden aspect-[2.75/1] hidden md:block">
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
      <div className="relative w-full mt-[72px] bg-[#F8F9FA] overflow-hidden aspect-[3/2] block md:hidden">
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

      {/* Announcement Marquee */}
      <div className="relative w-full bg-[#5E1218] border-y border-[#4A0D11] overflow-hidden py-3 z-20">
        <div 
          className="flex whitespace-nowrap"
          style={{ animation: `marquee ${displaySpeed}s linear infinite` }}
        >
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center mx-6">
              <span className="text-white text-sm font-medium tracking-wider">
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
