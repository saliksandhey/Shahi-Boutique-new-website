'use client'
import { CurrencyDropdown } from '@/components/storefront/CurrencyDropdown'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Search, ShoppingBag, Menu, X, ChevronRight, ChevronDown, User, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { useSearchStore } from '@/store/search-store'

export function Navbar({ categories }: { categories: any[] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileMenuScreen, setMobileMenuScreen] = useState<'main' | 'categories' | 'quicklinks'>('main')
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  const cartItems = useCartStore(state => state.items)
  const openCart = useCartStore(state => state.openCart)
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const openSearch = useSearchStore(state => state.openSearch)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const hideOnScroll = pathname === '/feed' && isScrolled
  const navClasses = cn(
    "sticky top-0 w-full z-[100] transition-all duration-700 ease-in-out border-b",
    hideOnScroll ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100",
    isScrolled 
      ? "bg-white/90 backdrop-blur-md py-2 shadow-sm border-gray-100" 
      : "bg-transparent py-5 md:py-6 border-transparent"
  )

  const leftLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'Services', href: '/services' },
    { 
      name: 'More', 
      isDropdown: true,
      dropdownItems: [
        { name: 'Stores', href: '/stores' },
        { name: 'Feed', href: '/feed' }
      ]
    },
  ]

  const mobileLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Services', href: '/services' },
    { name: 'Stores', href: '/stores' },
    { name: 'Feed', href: '/feed' },
    { name: 'My Account', href: '/account' },
  ]

  return (
    <>
      <header className={navClasses}>
      <div className="mx-auto px-6 md:px-12 w-full max-w-[1800px] flex items-center justify-between">
        
        {/* MOBILE: Menu Toggle (Left) */}
        <div className="flex flex-1 lg:hidden justify-start">
          <button
            type="button"
            className="p-2 -ml-2 text-[#111111] hover:opacity-60 transition-opacity"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <Menu className="h-6 w-6" strokeWidth={1.25} />
          </button>
        </div>

        {/* DESKTOP: Left Navigation */}
        <nav className="hidden lg:flex flex-1 items-center justify-start gap-10">
          {leftLinks.map((link) => (
            link.isDropdown ? (
              <div key={link.name} className="group relative overflow-visible py-2 cursor-pointer">
                <span className="text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 flex items-center gap-1 text-gray-500 group-hover:text-[#111111]">
                  {link.name}
                  <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
                </span>
                
                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 pt-6 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-[110]">
                  <div className="bg-white border border-gray-100 shadow-xl min-w-[200px] py-4">
                    {link.dropdownItems?.map(item => (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        className="group/item block px-8 py-3"
                      >
                        <span className="relative inline-block overflow-hidden pb-1">
                          <span className={cn(
                            "text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300",
                            pathname === item.href ? "text-[#111111]" : "text-gray-500 group-hover/item:text-[#111111]"
                          )}>
                            {item.name}
                          </span>
                          <span className={cn(
                            "absolute bottom-0 left-0 w-full h-[1px] bg-[#111111] transform origin-left transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
                            pathname === item.href ? "scale-x-100" : "scale-x-0 group-hover/item:scale-x-100"
                          )}></span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link 
                key={link.name} 
                href={link.href!} 
                className="group relative overflow-hidden py-2"
              >
                <span className={cn(
                  "text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300",
                  pathname === link.href ? "text-[#111111]" : "text-gray-500 group-hover:text-[#111111]"
                )}>
                  {link.name}
                </span>
                <span className={cn(
                  "absolute bottom-0 left-0 w-full h-[1px] bg-[#111111] transform origin-left transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
                  pathname === link.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )}></span>
              </Link>
            )
          ))}
        </nav>

        {/* CENTER: Logo */}
        <div className="flex flex-shrink-0 justify-center">
          <Link href="/" className="group relative flex items-center justify-center">
            <div className={cn(
              "relative transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105",
              isScrolled ? "w-[130px] md:w-[150px] h-[35px] md:h-[45px]" : "w-[160px] md:w-[200px] h-[45px] md:h-[55px]"
            )}>
              <Image 
                src="/logo.png" 
                alt="SHAHI BOUTIQUE" 
                fill 
                className="object-contain object-center"
                quality={100}
                unoptimized
                priority
              />
            </div>
          </Link>
        </div>

        {/* DESKTOP: Right Navigation & Icons */}
        <div className="flex flex-1 items-center justify-end gap-6 xl:gap-8">
          
          <div className="flex items-center gap-5">
            <div className="hidden md:block mr-2"><CurrencyDropdown /></div>
            <button onClick={openSearch} className="text-[#111111] hover:opacity-60 transition-opacity p-1 outline-none">
              <span className="sr-only">Search</span>
              <Search className="h-5 w-5" strokeWidth={1.25} />
            </button>

            <Link href="/account" className="hidden lg:flex text-[#111111] hover:opacity-60 transition-opacity p-1">
              <span className="sr-only">Account</span>
              <User className="h-5 w-5" strokeWidth={1.25} />
            </Link>

            <button onClick={openCart} className="group relative flex items-center p-1 text-[#111111] hover:opacity-60 transition-opacity cursor-pointer outline-none">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.25} />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#111111] text-white text-[9px] font-bold">
                  {cartCount}
                </span>
              )}
              <span className="sr-only">items in cart, view bag</span>
            </button>
          </div>
        </div>
      </div>

      </header>

      {/* MOBILE: Full Screen Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[200] flex lg:hidden bg-white"
          >
            {/* Menu Drawer - Ultra Premium Aesthetic */}
            <div className="relative flex h-full w-full flex-col overflow-x-hidden">
              
              {/* Drawer Header */}
              <div className="flex h-[90px] px-8 items-center justify-between shrink-0">
                <div className="relative w-[140px] h-[35px]">
                  <Image 
                    src="/logo.png" 
                    alt="SHAHI BOUTIQUE" 
                    fill 
                    className="object-contain object-left"
                    quality={100}
                    unoptimized
                  />
                </div>

                {mobileMenuScreen !== 'main' ? (
                  <button
                    type="button"
                    className="flex items-center gap-2 text-[#111111] hover:opacity-60 transition-all font-sans uppercase tracking-[0.2em] text-xs font-bold"
                    onClick={() => setMobileMenuScreen('main')}
                  >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                    BACK
                  </button>
                ) : (
                  <button
                    type="button"
                    className="p-2 -mr-2 text-[#111111] hover:opacity-60 transition-opacity"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setTimeout(() => setMobileMenuScreen('main'), 400)
                    }}
                  >
                    <span className="sr-only">Close menu</span>
                    <X className="h-8 w-8" strokeWidth={1} />
                  </button>
                )}
              </div>

              {/* Sliding Content Area */}
              <div className="flex-1 relative overflow-hidden">
                <div 
                  className={cn(
                    "absolute inset-0 w-full h-full flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]",
                    mobileMenuScreen === 'main' ? "translate-x-0" : "-translate-x-full"
                  )}
                >
                  {/* Main Links */}
                  <div className="flex-1 overflow-y-auto px-8 pt-10 pb-20 flex flex-col gap-6">
                    {mobileLinks.map((link, index) => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05, duration: 0.5 }}
                        key={link.name}
                      >
                        <Link 
                          href={link.href} 
                          className="group inline-flex items-center text-3xl font-sans font-light text-[#111111] uppercase tracking-[0.15em] transition-opacity active:opacity-50" 
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span className="relative">
                            {link.name}
                            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#111111] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out"></span>
                          </span>
                        </Link>
                      </motion.div>
                    ))}

                    {/* Quick Links Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + mobileLinks.length * 0.05, duration: 0.5 }}
                        className="mt-4"
                    >
                      <button 
                        onClick={() => setMobileMenuScreen('quicklinks')}
                        className="group inline-flex items-center gap-4 text-3xl font-sans font-light text-[#111111] uppercase tracking-[0.15em] transition-opacity active:opacity-50" 
                      >
                        <span className="relative">
                          QUICK LINKS
                          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#111111] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out"></span>
                        </span>
                        <ChevronRight className="w-6 h-6 text-[#111111] font-light" strokeWidth={1} />
                      </button>
                    </motion.div>
                  </div>
                </div>

                {/* Mobile Quick Links (Nested) */}
                <div 
                  className={cn(
                    "absolute inset-0 w-full h-full flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] bg-white",
                    mobileMenuScreen === 'quicklinks' ? "translate-x-0" : "translate-x-full"
                  )}
                >
                  <div className="flex-1 overflow-y-auto px-8 pt-10 pb-20 flex flex-col gap-5">
                    <h3 className="text-xs text-[#FF7A00] font-bold uppercase tracking-[0.2em] mb-4">Help & Info</h3>
                    
                    {[
                      { name: 'Our Story', href: '/about' },
                      { name: 'Contact Us', href: '/contact' },
                      { name: 'FAQ', href: '/faq' },
                      { name: 'Shipping', href: '/shipping' },
                      { name: 'Returns', href: '/returns' },
                      { name: 'Privacy Policy', href: '/privacy' },
                      { name: 'Terms of Service', href: '/terms' },
                    ].map((link, index) => (
                      <Link 
                        key={link.name}
                        href={link.href} 
                        className="inline-flex items-center text-xl font-sans font-light text-gray-500 hover:text-[#111111] uppercase tracking-[0.1em] transition-colors active:opacity-50" 
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Drawer Footer */}
                <div className="shrink-0 px-8 py-10 bg-[#f9f9f9] border-t border-gray-100 flex flex-col items-center text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-4">Client Services</p>
                <a href="mailto:contact.shahiboutique@gmail.com" className="text-[11px] text-[#111111] font-medium tracking-[0.1em] hover:text-[#FF7A00] transition-colors uppercase mb-2">
                  contact.shahiboutique@gmail.com
                </a>
                <a href="tel:+919217890060" className="text-[11px] text-[#111111] font-medium tracking-[0.1em] hover:text-[#FF7A00] transition-colors uppercase">
                  +91 92178 90060
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


