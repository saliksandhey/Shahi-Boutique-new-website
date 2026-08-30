'use client'

import { useCartStore } from '@/store/cart-store'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { PriceDisplay } from '@/components/storefront/PriceDisplay';

export function CartClient() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="text-center py-32 bg-muted border border-border">
        <h2 className="text-3xl font-serif text-foreground tracking-widest uppercase mb-6">Your cart is empty</h2>
        <p className="text-muted-foreground mb-10 font-light leading-relaxed">Explore our collections and add something beautiful to your cart.</p>
        <Link href="/shop" className="inline-block bg-primary text-primary-foreground px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent hover:text-accent-foreground transition-colors duration-300">
          Continue Shopping
        </Link>
      </div>
    )
  }

  const subtotal = getSubtotal()

  return (
    <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-16">
      <section aria-labelledby="cart-heading" className="lg:col-span-8">
        <h2 id="cart-heading" className="sr-only">Items in your shopping cart</h2>

        <ul role="list" className="divide-y divide-border border-t border-b border-border">
          {items.map((item) => (
            <li key={item.id} className="flex py-10">
              <div className="flex-shrink-0 relative w-28 h-40 sm:w-40 sm:h-56 bg-muted overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover object-center"
                />
              </div>

              <div className="ml-6 flex flex-1 flex-col justify-between sm:ml-10">
                <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                  <div>
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-sm">
                          <Link href={`/product/${item.productId}`} className="font-semibold text-foreground hover:text-accent uppercase tracking-[0.15em] transition-colors">
                            {item.name}
                          </Link>
                        </h3>
                        {(item.color || item.size) && (
                          <p className="mt-1 text-xs text-muted-foreground capitalize">
                            {item.color} {item.color && item.size && '|'} {item.size}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex text-xs text-muted-foreground uppercase tracking-widest font-light">
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <p className="mt-4 text-sm font-medium text-foreground tracking-wide">
                      ₹{item.salePrice ? item.salePrice.toFixed(2) : item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-6 sm:mt-0 sm:pr-9 flex flex-col items-start sm:items-end justify-between">
                    <div className="flex items-center border border-border rounded-none h-10 w-24 bg-transparent mb-4 sm:mb-0">
                      <button 
                        type="button" 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-full flex justify-center items-center text-muted-foreground hover:text-accent transition-colors"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        readOnly 
                        value={item.quantity} 
                        className="w-8 h-full text-center border-none focus:ring-0 text-sm font-medium p-0 m-0 bg-transparent text-foreground"
                      />
                      <button 
                        type="button" 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-full flex justify-center items-center text-muted-foreground hover:text-accent transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <div className="absolute right-0 top-0 sm:relative sm:mt-auto">
                      <button 
                        onClick={() => removeItem(item.id)}
                        type="button" 
                        className="text-muted-foreground hover:text-destructive transition-colors flex items-center text-xs uppercase tracking-widest"
                      >
                        <Trash2 className="h-4 w-4 sm:mr-2" aria-hidden="true" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Order summary */}
      <section
        aria-labelledby="summary-heading"
        className="mt-16 bg-muted p-8 lg:col-span-4 lg:mt-0 lg:p-10 border border-border sticky top-32"
      >
        <h2 id="summary-heading" className="text-xs font-semibold text-foreground uppercase tracking-[0.2em] mb-8 border-b border-border pb-6">
          Order Summary
        </h2>

        <dl className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-muted-foreground font-light tracking-wide">Subtotal</dt>
            <dd className="text-sm font-medium text-foreground tracking-wide"><PriceDisplay amount={subtotal} /></dd>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-6">
            <dt className="flex items-center text-sm text-muted-foreground font-light tracking-wide">
              <span>Shipping Estimate</span>
            </dt>
            <dd className="text-sm font-medium text-foreground tracking-wide">Calculated at checkout</dd>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-6">
            <dt className="text-base font-serif tracking-widest uppercase text-foreground">Order Total</dt>
            <dd className="text-base font-medium text-foreground tracking-wide"><PriceDisplay amount={subtotal} /></dd>
          </div>
        </dl>

        <div className="mt-10">
          <Link
            href="/checkout"
            className="w-full bg-primary text-primary-foreground py-4 flex items-center justify-center text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent hover:text-accent-foreground transition-colors duration-300"
          >
            Proceed to Checkout
          </Link>
        </div>
      </section>
    </div>
  )
}
