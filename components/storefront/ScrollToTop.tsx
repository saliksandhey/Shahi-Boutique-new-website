'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  if (!isVisible || pathname?.startsWith('/product')) {
    return null
  }

  const isProductOrShop = pathname === '/shop' || pathname?.startsWith('/product')
  const bottomClass = isProductOrShop ? 'bottom-20 sm:bottom-6 right-4 sm:right-6' : 'bottom-6 right-4 sm:right-6'

  return (
    <button
      onClick={scrollToTop}
      className={`fixed ${bottomClass} z-30 p-2.5 sm:p-3 rounded-full bg-[#1C1C1C]/90 backdrop-blur-md text-white shadow-lg hover:bg-[#FF7A00] transition-all duration-300 focus:outline-none`}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  )
}
