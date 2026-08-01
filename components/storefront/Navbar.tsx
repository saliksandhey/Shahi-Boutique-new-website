'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Search, ShoppingBag, Menu, X, ChevronRight, ChevronDown, User, ArrowLeft } from 'lucide-react'
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
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] flex lg:hidden">
          {/* Dark Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          
          {/* Menu Drawer - Premium Aesthetic */}
          <div className="relative flex h-full w-full max-w-[85%] sm:max-w-sm flex-col overflow-x-hidden bg-white shadow-2xl animate-in slide-in-from-left duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]">
            
            {/* Drawer Header */}
            <div className="flex h-[80px] px-6 items-center relative border-b border-gray-100 shrink-0">
              {mobileMenuScreen !== 'main' ? (
                <button
                  type="button"
                  className="absolute left-6 flex items-center gap-2 text-gray-500 hover:text-[#111111] transition-all font-heading uppercase tracking-[0.1em] text-xs font-bold"
                  onClick={() => setMobileMenuScreen('main')}
                >
                  <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  className="absolute left-6 p-2 -ml-2 text-[#111111] hover:opacity-60 transition-opacity"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setTimeout(() => setMobileMenuScreen('main'), 300)
                  }}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-7 w-7" strokeWidth={1.25} />
                </button>
              )}
              
              <div className="flex-1 flex justify-center items-center w-full h-full py-4 relative">
                <div className="relative w-[140px] h-full max-h-[40px]">
                  <Image 
                    src="/logo.png" 
                    alt="SHAHI BOUTIQUE" 
                    fill 
                    className="object-contain object-center"
                    quality={100}
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* Sliding Content Area */}
            <div className="flex-1 relative overflow-hidden bg-white">
              <div 
                className={cn(
                  "absolute inset-0 w-full h-full flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
                  mobileMenuScreen === 'main' ? "translate-x-0" : "-translate-x-full"
                )}
              >
                {/* Main Links */}
                <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
                  {mobileLinks.map((link, index) => (
                    <Link 
                      key={link.name}
                      href={link.href} 
                      className="flex items-center justify-between text-2xl font-heading font-medium text-[#111111] uppercase tracking-[0.1em] py-5 border-b border-gray-100 transition-opacity active:opacity-50" 
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span>{link.name}</span>
                    </Link>
                  ))}

                  {/* Quick Links Button */}
                  <button 
                    onClick={() => setMobileMenuScreen('quicklinks')}
                    className="flex items-center justify-between text-2xl font-heading font-medium text-[#111111] uppercase tracking-[0.1em] py-5 border-b border-gray-100 transition-opacity active:opacity-50 w-full" 
                  >
                    <span>Quick Links</span>
                    <ChevronRight className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Mobile Quick Links (Nested) */}
              <div 
                className={cn(
                  "absolute inset-0 w-full h-full flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] bg-white",
                  mobileMenuScreen === 'quicklinks' ? "translate-x-0" : "translate-x-full"
                )}
              >
                <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
                  <h3 className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-4">Help & Information</h3>
                  
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
                      className="flex items-center justify-between text-lg font-heading text-gray-600 uppercase tracking-[0.1em] py-4 border-b border-gray-100 transition-opacity active:opacity-50" 
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Drawer Footer */}
            <div className="shrink-0 px-6 py-8 bg-[#111111] text-white">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-4">Client Services</p>
              <a href="mailto:contact.shahiboutique@gmail.com" className="text-sm font-medium tracking-wide hover:text-[#FF7A00] transition-colors flex items-center gap-2 mb-3">
                contact.shahiboutique@gmail.com
              </a>
              <a href="tel:+919217890060" className="text-sm font-medium tracking-wide hover:text-[#FF7A00] transition-colors flex items-center gap-2">
                +91 9217890060
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
