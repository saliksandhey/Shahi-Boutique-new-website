'use client'

import Link from 'next/link'
import Image from 'next/image'

export function AppointmentBanner() {
  return (
    <section className="relative w-full pt-2 sm:pt-4 md:pt-6 pb-12 sm:pb-16 md:pb-20 bg-white">
      <div className="mx-auto max-w-[1400px] px-3.5 sm:px-6 lg:px-8">
        <Link 
          href="/book-appointment"
          className="group block relative w-full rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-gray-200/70 bg-[#FAFAFA]"
          title="Book Your Consultation - Shahi Boutique"
        >
          {/* Mobile View Banner (Custom 2.5:1 ratio for smartphones with sleek subtle corners) */}
          <div className="block sm:hidden">
            <Image
              src="/booking-section-mobile.png"
              alt="Book Your Consultation - Shahi Boutique"
              width={1653}
              height={664}
              className="w-full h-auto block group-hover:scale-[1.01] transition-transform duration-500 ease-out"
              sizes="100vw"
            />
          </div>

          {/* Tablet & Desktop View Banner (Ultra-wide 4.6:1 panoramic banner) */}
          <div className="hidden sm:block">
            <Image
              src="/booking-section.png"
              alt="Book Your Consultation - Shahi Boutique"
              width={2079}
              height={450}
              className="w-full h-auto block group-hover:scale-[1.01] transition-transform duration-700 ease-out"
              sizes="(min-width: 1440px) 1400px, 100vw"
            />
          </div>
        </Link>
      </div>
    </section>
  )
}
