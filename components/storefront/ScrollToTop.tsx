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

  if (!isVisible) {
    return null
  }

  const isShop = pathname === '/shop'
  const bottomClass = isShop ? 'bottom-24 lg:bottom-6' : 'bottom-6'

  return (
    <button
      onClick={scrollToTop}
      className={`fixed ${bottomClass} right-4 sm:right-6 z-50 p-3 rounded-full bg-[#1C1C1C] text-white shadow-lg hover:bg-[#FF7A00] transition-colors duration-300 focus:outline-none`}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  )
}
