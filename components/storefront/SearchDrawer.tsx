'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchStore } from '@/store/search-store'
import { X, Search as SearchIcon, ShoppingBag, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cart-store'
import { useRouter } from 'next/navigation'
import { PriceDisplay } from '@/components/storefront/PriceDisplay';

export function SearchDrawer() {
  const router = useRouter()
  const { addItem, openCart } = useCartStore()
  const { isOpen, closeSearch } = useSearchStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Prevent background scrolling when search is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setSearchTerm('')
      setResults([])
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchTerm.trim()) {
        setResults([])
        return
      }

      setIsSearching(true)
      const supabase = createClient()
      
      const { data } = await supabase
        .from('products')
        .select('*, product_images(url, is_primary)')
        .ilike('name', `%${searchTerm}%`)
        .eq('status', 'ACTIVE')
        .limit(10)

      setResults(data || [])
      setIsSearching(false)
    }

    const debounceTimer = setTimeout(fetchResults, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={closeSearch}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-black font-sans tracking-tighter uppercase text-gray-900">Search</h2>
          <button 
            onClick={closeSearch}
            className="p-2 -mr-2 text-gray-400 hover:text-[#FF7A00] transition-colors rounded-full hover:bg-gray-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-full focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all font-medium text-sm text-gray-900"
              autoFocus
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {!searchTerm.trim() ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
              <SearchIcon className="w-12 h-12 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">Type something to search</p>
            </div>
          ) : isSearching ? (
             <div className="flex justify-center py-10">
               <div className="w-6 h-6 border-2 border-[#FF7A00] border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : results.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-medium text-gray-500">No products found for "{searchTerm}"</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((product) => {
                const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.url || product.product_images?.[0]?.url || '/placeholder.png'
                
                return (
                  <Link 
                    key={product.id} 
                    href={`/product/${product.slug}`}
                    onClick={closeSearch}
                    className="flex gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="relative w-20 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                      {primaryImage !== '/placeholder.png' ? (
                        <Image 
                          src={primaryImage} 
                          alt={product.name} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-gray-400 uppercase">No Image</div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center flex-1 relative pr-10">
                      <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-[#FF7A00] transition-colors">{product.name}</h3>
                      {product.sale_price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-gray-900"><PriceDisplay amount={product.sale_price} /></span>
                          <span className="text-xs text-gray-400 line-through"><PriceDisplay amount={product.price} /></span>
                        </div>
                      ) : (
                        <span className="text-sm font-black text-gray-900">
                          {product.is_enquiry_only ? `Starting from ₹${product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : `₹${product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                        </span>
                      )}
                      
                      {/* Action Button */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2">
                         <button 
                           onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             if (product.is_enquiry_only) {
                               closeSearch();
                               router.push(`/product/${product.slug}/enquiry`)
                             } else {
                               addItem({
                                 id: product.id,
                                 productId: product.id,
                                 name: product.name,
                                 price: product.price,
                                 salePrice: product.sale_price,
                                 quantity: 1,
                                 image: primaryImage
                               })
                               closeSearch()
                               openCart()
                             }
                           }}
                           className="bg-white border border-gray-200 text-gray-900 w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#111111] hover:text-white hover:scale-110 transition-all shadow-sm"
                           title={product.is_enquiry_only ? "Enquire Now" : "Add to Cart"}
                         >
                           {product.is_enquiry_only ? (
                             <MessageCircle className="w-3.5 h-3.5" />
                           ) : (
                             <ShoppingBag className="w-3.5 h-3.5" />
                           )}
                         </button>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
