'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart-store'
import { X, Trash2, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal } = useCartStore()
  const router = useRouter()
  const [showLoginSheet, setShowLoginSheet] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // Prevent background scrolling when cart is open
  useEffect(() => {
    if (isOpen || showLoginSheet) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen, showLoginSheet])

  const handleCheckoutClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsCheckingAuth(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    setIsCheckingAuth(false)
    
    if (session) {
      closeCart()
      router.push('/checkout')
    } else {
      setShowLoginSheet(true)
    }
  }

  const handleGoogleLogin = async () => {
    setLoginError(null)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/checkout&mode=popup`,
        skipBrowserRedirect: true
      }
    })
    
    if (error) {
      setLoginError(error.message)
      return
    }

    if (data?.url) {
      // Open a popup "card" for Google Login
      const width = 500
      const height = 600
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2
      const popup = window.open(
        data.url,
        'Google Login',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
      )

      // Listen for the success message from the popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        if (event.data === 'auth_success') {
          window.removeEventListener('message', handleMessage)
          setShowLoginSheet(false)
          closeCart()
          router.push('/checkout')
          router.refresh()
        }
      }
      window.addEventListener('message', handleMessage)

      // Check periodically if user closed popup manually
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
        }
      }, 1000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-black font-sans tracking-tighter uppercase text-gray-900">Your Cart</h2>
          <button 
            onClick={closeCart}
            className="p-2 -mr-2 text-gray-400 hover:text-[#FF7A00] transition-colors rounded-full hover:bg-gray-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-sm text-gray-500 font-medium">Looks like you haven't added anything yet.</p>
              </div>
              <button 
                onClick={closeCart}
                className="px-8 py-4 bg-[#1C1C1C] text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#FF7A00] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-24 h-32 bg-gray-50 rounded-2xl overflow-hidden shrink-0">
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm leading-tight pr-4">{item.name}</h3>
                          {(item.color || item.size) && (
                            <p className="text-xs text-gray-500 mt-1 capitalize">
                              {item.color} {item.color && item.size && '|'} {item.size}
                            </p>
                          )}
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm font-black text-[#FF7A00] mt-1">
                        ₹{(item.salePrice || item.price).toFixed(2)}
                      </p>
                    </div>
                    
                    {/* Quantity Control */}
                    <div className="flex items-center justify-between rounded-full border border-gray-200 h-10 w-28 bg-gray-50 px-1">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 rounded-full flex justify-center items-center text-gray-500 hover:text-[#FF7A00] hover:bg-white transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full flex justify-center items-center text-gray-500 hover:text-[#FF7A00] hover:bg-white transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-white space-y-6">
            <div className="flex justify-between items-center text-gray-900">
              <span className="font-bold uppercase tracking-widest text-xs">Subtotal</span>
              <span className="font-black text-2xl">₹{getSubtotal().toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400 font-medium">Shipping and taxes calculated at checkout.</p>
            <button 
              onClick={handleCheckoutClick}
              disabled={isCheckingAuth}
              className="flex w-full items-center justify-center rounded-full bg-[#1C1C1C] text-white h-14 font-bold uppercase tracking-widest text-xs hover:bg-[#FF7A00] transition-colors shadow-lg disabled:opacity-50"
            >
              {isCheckingAuth ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        )}

      </div>

      {/* Mobile Login Bottom Sheet */}
      {showLoginSheet && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginSheet(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-[2rem] p-8 pb-12 animate-in slide-in-from-bottom-full duration-300 shadow-2xl">
            <button 
              onClick={() => setShowLoginSheet(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mt-4 mb-8">
              <h3 className="text-2xl font-black font-sans uppercase tracking-tighter text-gray-900">Sign in to Checkout</h3>
              <p className="text-sm text-gray-500 font-medium mt-2">Sign in to access your saved addresses and faster checkout.</p>
            </div>
            
            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-white text-gray-900 border border-gray-300 rounded-full h-14 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/>
                <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"/>
                <path d="M5.26498 14.2949C5.02498 13.5699 4.87998 12.7999 4.87998 12.0049C4.87998 11.2099 5.01998 10.4399 5.26498 9.71497L1.275 6.61997C0.465 8.22997 0 10.0599 0 12.0049C0 13.9499 0.465 15.7799 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"/>
                <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.87037 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.31037 24.0001 12.0004 24.0001Z" fill="#34A853"/>
              </svg>
              <span className="font-bold tracking-widest text-xs uppercase">Continue with Google</span>
            </button>
            
            {loginError && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200 mt-4 text-center">{loginError}</p>}
          </div>
        </div>
      )}

    </div>
  )
}
