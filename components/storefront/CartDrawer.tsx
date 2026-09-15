'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart-store'
import { X, Trash2, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getUpsellProducts } from '@/lib/actions/products'
import { Clock } from 'lucide-react'
import { PriceDisplay } from '@/components/storefront/PriceDisplay'

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal, addItem } = useCartStore()
  const router = useRouter()
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
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.preventDefault()
    closeCart()
    router.push('/checkout')
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm uppercase tracking-widest">Your cart is empty</p>
                <p className="text-xs text-gray-400 mt-1">Discover our collection and find something you love.</p>
              </div>
              <button 
                onClick={closeCart}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-[#1C1C1C] text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-[#FF7A00] transition-colors shadow-md"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart Items List */}
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                    {/* Image */}
                    <div className="relative w-20 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                      {item.image ? (
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          fill 
                          className="object-cover object-center" 
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider line-clamp-1">
                            {item.name}
                          </h3>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {(item.color || item.size) && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {[item.color, item.size].filter(Boolean).join(' / ')}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-1">
                          {item.salePrice ? (
                            <>
                              <span className="font-black text-xs text-[#FF7A00]">
                                <PriceDisplay amount={item.salePrice} />
                              </span>
                              <span className="text-[10px] text-gray-400 line-through">
                                <PriceDisplay amount={item.price} />
                              </span>
                            </>
                          ) : (
                            <span className="font-black text-xs text-gray-900">
                              <PriceDisplay amount={item.price} />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity selector */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-gray-200 rounded-full h-7">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="px-2.5 h-full text-gray-500 hover:text-gray-900 text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2.5 h-full text-gray-500 hover:text-gray-900 text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* In-Cart Flash Sale / Upsell Section */}
              {displayUpsells.length > 0 && (
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-pulse" />
                      <h3 className="font-sans font-black text-xs uppercase tracking-widest text-gray-900">
                        {upsellPhase === 'flash' ? 'Exclusive Cart Offer (10% Off)' : upsellPhase === 'last-chance' ? 'Last Chance Deal!' : 'Offer Ended'}
                      </h3>
                    </div>
                    {countdown && upsellPhase !== 'expired' && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#FF7A00] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                        <Clock className="w-3 h-3" />
                        <span>{countdown}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {displayUpsells.map((upsell) => (
                      <div key={upsell.id} className={`rounded-xl border bg-white overflow-hidden transition-all duration-300 ${
                        upsellPhase === 'expired' ? 'border-gray-100 pointer-events-none opacity-50' : 'border-gray-200 group hover:border-[#FF7A00]'
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
                                  <PriceDisplay amount={upsell.salePrice} />
                                </span>
                                <span className="text-[9px] text-gray-400 line-through font-medium">
                                  <PriceDisplay amount={upsell.price} />
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
              <span className="font-black text-xl"><PriceDisplay amount={getSubtotal()} /></span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Shipping and taxes calculated at checkout.</p>
            <button 
              onClick={handleCheckoutClick}
              className="flex w-full items-center justify-center rounded-full bg-[#1C1C1C] text-white h-12 font-bold uppercase tracking-widest text-xs hover:bg-[#FF7A00] transition-colors shadow-md mt-1"
            >
              Proceed to Checkout
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
