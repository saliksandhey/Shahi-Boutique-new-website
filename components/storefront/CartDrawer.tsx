'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart-store'
import { X, Trash2, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getUpsellProducts } from '@/lib/actions/products'
import { Clock } from 'lucide-react'
import { loginOrSignupWithPhone } from '@/lib/actions/auth-phone'

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal, addItem } = useCartStore()
  const router = useRouter()
  const [showLoginSheet, setShowLoginSheet] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [upsellItems, setUpsellItems] = useState<any[]>([])
  const [countdown, setCountdown] = useState<string>('')
  const [upsellPhase, setUpsellPhase] = useState<'flash' | 'last-chance' | 'expired'>('flash')

  // Fetch real products for upsell
  useEffect(() => {
    if (isOpen && upsellItems.length === 0) {
      getUpsellProducts().then(data => {
        if (data && data.length > 0) {
          // Filter out items already in cart
          const cartProductIds = items.map(item => item.productId)
          const availableUpsells = data.filter((p: any) => !cartProductIds.includes(p.id))
          
          // Use the start time to pseudo-randomly pick products so it changes per session
          let startTime = localStorage.getItem('upsell_start_time')
          let seed = startTime ? parseInt(startTime) : Date.now()
          const maxStart = Math.max(0, availableUpsells.length - 2)
          const startIndex = seed % (maxStart + 1)
          
          // Select 2 products based on the seed
          const selected = availableUpsells.slice(startIndex, startIndex + 2).map((p: any) => {
            const primaryImage = p.product_images?.find((img: any) => img.is_primary)?.url || p.product_images?.[0]?.url || ''
            const salePrice = p.sale_price ? Number(p.sale_price) : 0
            const regularPrice = p.price ? Number(p.price) : 0
            const basePrice = salePrice > 0 ? salePrice : regularPrice
            return {
              id: p.id,
              productId: p.id,
              name: p.name,
              price: basePrice,
              salePrice: basePrice * 0.9, // 10% off the offer price
              image: primaryImage,
              quantity: 1,
              color: p.fabric || 'Special',
            }
          })
          setUpsellItems(selected)
        }
      }).catch(() => {})
    }
  }, [isOpen, items])

  // Countdown timer logic
  useEffect(() => {
    if (items.length === 0) {
      localStorage.removeItem('upsell_start_time')
      setCountdown('10:00')
      setUpsellPhase('flash')
      return
    }

    let startTime = localStorage.getItem('upsell_start_time')
    const now = Date.now()

    // Reset if no start time OR if > 24 hours have passed (86400000 ms)
    if (!startTime || (now - parseInt(startTime) > 86400000)) {
      startTime = now.toString()
      localStorage.setItem('upsell_start_time', startTime)
    }

    const updateTimer = () => {
      const now = Date.now()
      const elapsed = now - parseInt(startTime!)
      const phase1Duration = 10 * 60 * 1000 // 10 mins
      const phase2Duration = 1 * 60 * 1000 // 1 min

      if (elapsed < phase1Duration) {
        // Flash Phase
        const diff = phase1Duration - elapsed
        const m = Math.floor(diff / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        setCountdown(`${m}:${s.toString().padStart(2, '0')}`)
        setUpsellPhase('flash')
      } else if (elapsed < phase1Duration + phase2Duration) {
        // Last Chance Phase
        const diff = (phase1Duration + phase2Duration) - elapsed
        const m = Math.floor(diff / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        setCountdown(`${m}:${s.toString().padStart(2, '0')}`)
        setUpsellPhase('last-chance')
      } else {
        // Expired Phase
        setCountdown('0:00')
        setUpsellPhase('expired')
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [items.length])

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

  const displayUpsells = upsellItems.filter(ui => !items.some(ci => ci.productId === ui.productId))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div 
        data-lenis-prevent
        className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 shrink-0">
          <h2 className="text-2xl font-black font-sans tracking-tighter uppercase text-gray-900">Your Cart</h2>
          <button 
            onClick={closeCart}
            className="p-2 -mr-2 text-gray-400 hover:text-[#FF7A00] transition-colors rounded-full hover:bg-gray-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6" data-lenis-prevent>
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
              {/* Actual Cart Items */}
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

              {/* End of Cart Items */}

              {/* Upsell Cards in Scrollable Area */}
              {displayUpsells.length > 0 && (
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xs font-black uppercase tracking-widest ${upsellPhase === 'expired' ? 'text-gray-400' : 'text-gray-900'}`}>
                      {upsellPhase === 'flash' ? 'Flash Offer: 10% OFF' : upsellPhase === 'last-chance' ? 'Last Chance: 10% OFF' : 'Offer Expired'}
                    </h3>
                    <div className={`flex items-center gap-1.5 text-white px-2 py-1 rounded text-[10px] font-bold ${
                      upsellPhase === 'flash' ? 'bg-[#FF7A00]' : upsellPhase === 'last-chance' ? 'bg-red-600 animate-pulse' : 'bg-gray-400'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>{countdown}</span>
                    </div>
                  </div>
                  
                  <div className={`grid grid-cols-2 gap-3 transition-all duration-700 ${upsellPhase === 'expired' ? 'opacity-50 grayscale' : ''}`}>
                    {displayUpsells.map((upsell) => (
                      <div key={upsell.id} className={`border rounded-xl relative overflow-hidden bg-white transition-colors ${
                        upsellPhase === 'expired' ? 'border-gray-100 pointer-events-none' : 'border-gray-200 group hover:border-[#FF7A00]'
                      }`}>
                        <div className="flex flex-col p-2 h-full">
                          <div className="relative w-full aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100 mb-2">
                            <Image src={upsell.image} alt={upsell.name} fill className="object-cover object-center" sizes="(max-width: 768px) 50vw, 33vw" />
                          </div>
                          <div className="flex flex-col flex-1 justify-between">
                            <h4 className="font-bold text-gray-900 text-[11px] leading-tight line-clamp-2 min-h-[30px]">{upsell.name}</h4>
                            <div className="flex flex-col gap-2 mt-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm leading-none flex items-center ${
                                  upsellPhase === 'expired' ? 'bg-gray-400' : upsellPhase === 'last-chance' ? 'bg-red-600' : 'bg-[#FF7A00]'
                                }`}>
                                  ₹{upsell.salePrice.toFixed(0)}
                                </span>
                                <span className="text-[9px] text-gray-400 line-through font-medium">
                                  ₹{upsell.price.toFixed(0)}
                                </span>
                              </div>
                              <button
                                onClick={() => addItem(upsell)}
                                disabled={upsellPhase === 'expired'}
                                className={`w-full text-[10px] font-bold uppercase tracking-widest text-white py-1.5 px-2 rounded-full transition-colors ${
                                  upsellPhase === 'expired' ? 'bg-gray-300' : 'bg-[#111111] hover:bg-[#FF7A00]'
                                }`}
                              >
                                {upsellPhase === 'expired' ? 'Expired' : 'Add'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-4 bg-white space-y-3 shrink-0">
            <div className="flex justify-between items-center text-gray-900">
              <span className="font-bold uppercase tracking-widest text-xs">Subtotal</span>
              <span className="font-black text-xl">₹{getSubtotal().toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Shipping and taxes calculated at checkout.</p>
            <button 
              onClick={handleCheckoutClick}
              disabled={isCheckingAuth}
              className="flex w-full items-center justify-center rounded-full bg-[#1C1C1C] text-white h-12 font-bold uppercase tracking-widest text-xs hover:bg-[#FF7A00] transition-colors shadow-md disabled:opacity-50 mt-1"
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
            
            <form 
              onSubmit={async (e) => {
                e.preventDefault()
                setIsCheckingAuth(true)
                setLoginError(null)
                const formData = new FormData(e.currentTarget)
                
                const phone = formData.get('phone') as string
                if (!phone.startsWith('+')) {
                  formData.set('phone', '+91' + phone)
                }

                try {
                  const res = await loginOrSignupWithPhone(formData)
                  if (res.error) {
                    setLoginError(res.error)
                  } else {
                    setShowLoginSheet(false)
                    closeCart()
                    router.push('/checkout')
                    router.refresh()
                  }
                } catch(err) {
                  setLoginError("An unexpected error occurred.")
                } finally {
                  setIsCheckingAuth(false)
                }
              }}
              className="space-y-4 mb-6"
            >
              <div className="space-y-2">
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-full border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-xs font-bold">
                    +91
                  </span>
                  <input 
                    name="phone" 
                    type="tel" 
                    required 
                    className="flex h-12 w-full rounded-r-full border border-l-0 border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#111111]"
                    placeholder="Phone Number" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-end">
                  <Link 
                    href="/forgot-password" 
                    onClick={closeCart}
                    className="text-[10px] font-bold uppercase tracking-widest text-[#FF7A00] hover:text-[#111111] transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <input 
                  name="password" 
                  type="password" 
                  required 
                  className="flex h-12 w-full rounded-full border border-gray-200 bg-white px-6 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#111111]" 
                  placeholder="Password" 
                />
              </div>
              <button 
                type="submit" 
                disabled={isCheckingAuth} 
                className="w-full rounded-full h-12 bg-[#111111] hover:bg-gray-800 text-white font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-md"
              >
                {isCheckingAuth ? 'Continuing...' : 'Continue'}
              </button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                <span className="bg-white px-4 text-gray-400">Or</span>
              </div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-white text-gray-900 border border-gray-300 rounded-full h-12 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/>
                <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"/>
                <path d="M5.26498 14.2949C5.02498 13.5699 4.87998 12.7999 4.87998 12.0049C4.87998 11.2099 5.01998 10.4399 5.26498 9.71497L1.275 6.61997C0.465 8.22997 0 10.0599 0 12.0049C0 13.9499 0.465 15.7799 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"/>
                <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.87037 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.31037 24.0001 12.0004 24.0001Z" fill="#34A853"/>
              </svg>
              <span className="font-bold tracking-widest text-xs uppercase">Google</span>
            </button>
            
            {loginError && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200 mt-4 text-center">{loginError}</p>}
          </div>
        </div>
      )}

    </div>
  )
}
