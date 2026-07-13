'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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

  const hideOnScroll = pathname === '/feed' && isScrolled
  const navClasses = cn(
    "fixed top-0 w-full z-[100] transition-all duration-700 ease-in-out border-b",
    hideOnScroll ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100",
    isScrolled 
      ? "bg-white/90 backdrop-blur-md py-2 shadow-sm border-gray-100" 
      : "bg-transparent py-5 md:py-6 border-transparent"
  )

  const leftLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'Services', href: '/services' },
    { name: 'Stores', href: '/stores' },
  ]

  const mobileLinks = [
    { name: 'Home', href: '/' },
    ...leftLinks,
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
            <Link 
              key={link.name} 
              href={link.href} 
              className="group relative overflow-hidden pb-1"
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
          ))}
        </nav>

        {/* CENTER: Logo */}
        <div className="flex flex-shrink-0 justify-center">
          <Link href="/" className="group relative flex items-center justify-center overflow-hidden">
            <span className={cn(
              "font-heading font-black tracking-[0.25em] uppercase text-[#111111] transition-all duration-700 group-hover:scale-105",
              isScrolled ? "text-xl md:text-2xl" : "text-3xl md:text-4xl"
            )}>
              SHAHI
            </span>
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
          {/* Light Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          
          {/* Menu Drawer - White Aesthetic */}
          <div className="relative flex h-full w-full max-w-[85%] sm:max-w-sm flex-col overflow-x-hidden bg-white shadow-2xl animate-in slide-in-from-left duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]">
            
            {/* Drawer Header */}
            <div className="flex px-8 py-8 justify-between items-center relative border-b border-gray-100 shrink-0">
              {mobileMenuScreen !== 'main' ? (
                <button
                  type="button"
                  className="flex items-center gap-2 text-gray-500 hover:text-[#111111] transition-all font-heading uppercase tracking-[0.15em] text-sm"
                  onClick={() => setMobileMenuScreen('main')}
                >
                  <ArrowLeft className="h-5 w-5" strokeWidth={1.25} />
                  Back
                </button>
              ) : (
                <span className="font-heading text-2xl tracking-[0.2em] font-black text-[#111111] uppercase relative z-10">
                  SHAHI
                </span>
              )}
              
              <button
                type="button"
                className="p-2 -mr-2 text-gray-400 hover:text-[#111111] transition-all rounded-full hover:bg-gray-50"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setTimeout(() => setMobileMenuScreen('main'), 300)
                }}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" strokeWidth={1.25} />
              </button>
            </div>

            {/* Sliding Content Area */}
            <div className="flex-1 relative overflow-hidden">
              <div 
                className={cn(
                  "absolute inset-0 w-full h-full flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
                  mobileMenuScreen === 'main' ? "translate-x-0" : "-translate-x-full"
                )}
              >
                {/* Mobile Navigation Links (Main) */}
                <div className="flex-1 overflow-y-auto px-8 py-10 flex flex-col gap-6">
                  {/* Home */}
                  <Link 
                    href="/" 
                    className="group flex items-center justify-between text-lg font-heading text-gray-500 uppercase tracking-[0.15em] pb-3 border-b border-gray-100 hover:text-[#111111] transition-all duration-300" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="transform group-hover:translate-x-2 transition-transform duration-300">Home</span>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 transition-all duration-300 text-[#111111]" />
                  </Link>
                  
                  {/* Categories Button Removed */}
                  {leftLinks.map((link, index) => (
                    <Link 
                      key={link.name}
                      href={link.href} 
                      className="group flex items-center justify-between text-lg font-heading text-gray-500 uppercase tracking-[0.15em] pb-3 border-b border-gray-100 hover:text-[#111111] transition-all duration-300" 
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="transform group-hover:translate-x-2 transition-transform duration-300">{link.name}</span>
                      <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 transition-all duration-300 text-[#111111]" />
                    </Link>
                  ))}

                  {/* My Account */}
                  <Link 
                    href="/account" 
                    className="group flex items-center justify-between text-lg font-heading text-gray-500 uppercase tracking-[0.15em] pb-3 border-b border-gray-100 hover:text-[#111111] transition-all duration-300" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="transform group-hover:translate-x-2 transition-transform duration-300">My Account</span>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 transition-all duration-300 text-[#111111]" />
                  </Link>

                  {/* Quick Links Button */}
                  <button 
                    onClick={() => setMobileMenuScreen('quicklinks')}
                    className="group flex items-center justify-between text-lg font-heading text-gray-500 uppercase tracking-[0.15em] pb-3 border-b border-gray-100 hover:text-[#111111] transition-all duration-300 w-full" 
                  >
                    <span className="transform group-hover:translate-x-2 transition-transform duration-300">Quick Links</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#111111] transition-all duration-300" />
                  </button>
                </div>
              </div>

              {/* Mobile Categories Links (Nested) */}
              <div 
                className={cn(
                  "absolute inset-0 w-full h-full flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] bg-white",
                  mobileMenuScreen === 'categories' ? "translate-x-0" : "translate-x-full"
                )}
              >
                <div className="flex-1 overflow-y-auto px-8 py-10 flex flex-col gap-6">
                  <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2">Shop By Category</h3>
                  
                  <Link 
                    href="/shop" 
                    className="group flex items-center justify-between text-lg font-heading text-gray-500 uppercase tracking-[0.15em] pb-3 border-b border-gray-100 hover:text-[#111111] transition-all duration-300" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="transform group-hover:translate-x-2 transition-transform duration-300">All Products</span>
                  </Link>
                  
                  {categories?.map((c, index) => (
                    <Link 
                      key={c.id}
                      href={`/shop?category=${c.id}`} 
                      className="group flex items-center justify-between text-lg font-heading text-gray-500 uppercase tracking-[0.15em] pb-3 border-b border-gray-100 hover:text-[#111111] transition-all duration-300" 
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="transform group-hover:translate-x-2 transition-transform duration-300">{c.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Quick Links (Nested) */}
              <div 
                className={cn(
                  "absolute inset-0 w-full h-full flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] bg-white",
                  mobileMenuScreen === 'quicklinks' ? "translate-x-0" : "translate-x-full"
                )}
              >
                <div className="flex-1 overflow-y-auto px-8 py-10 flex flex-col gap-6">
                  <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2">Help & Information</h3>
                  
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
                      className="group flex items-center justify-between text-lg font-heading text-gray-500 uppercase tracking-[0.15em] pb-3 border-b border-gray-100 hover:text-[#111111] transition-all duration-300" 
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="transform group-hover:translate-x-2 transition-transform duration-300">{link.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Drawer Footer */}
            <div className="shrink-0 px-8 py-10 bg-gray-50 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-4">Client Services</p>
              <a href="mailto:contact.shahiboutique@gmail.com" className="text-xs font-medium tracking-wide text-gray-600 hover:text-[#111111] transition-colors flex items-center gap-2 mb-3">
                contact.shahiboutique@gmail.com
              </a>
              <a href="tel:+919217890060" className="text-xs font-medium tracking-wide text-gray-600 hover:text-[#111111] transition-colors flex items-center gap-2">
                +91 9217890060
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
