'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart-store'
import { ShoppingBag, Heart, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export function AddToCart({ product, variants = [] }: { product: any, variants?: any[] }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>('')
  
  // Extract unique colors and sizes if variants are used
  const uniqueColors = Array.from(new Set(variants.filter(v => v.color).map(v => v.color)))
  const [selectedColor, setSelectedColor] = useState<string>(uniqueColors[0] || '')

  // Find the selected variant based on color and size (if applicable)
  const selectedVariant = variants.find(v => {
    const colorMatch = v.color ? v.color === selectedColor : true;
    const sizeMatch = v.size ? v.size === selectedSize : true;
    return colorMatch && sizeMatch;
  }) || variants.find(v => v.color === selectedColor) || null;

  const addItem = useCartStore(state => state.addItem)
  const openCart = useCartStore(state => state.openCart)

  const currentStock = selectedVariant ? (selectedVariant.stock || 0) : product.stock
  const outOfStock = product.status === 'OUT_OF_STOCK' || (currentStock <= 0 && !product.is_enquiry_only)
  const hasSizes = product.product_size_guides && product.product_size_guides.length > 0

  const handleAddToCart = () => {
    if (outOfStock) return
    if (hasSizes && !selectedSize) {
      alert('Please select a size')
      return
    }
    if (uniqueColors.length > 0 && !selectedColor) {
      alert('Please select a color')
      return
    }
    
    let finalPrice = product.sale_price || product.price
    if (selectedVariant && selectedVariant.price_override) {
      finalPrice = selectedVariant.price_override
    }

    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id + (selectedSize ? `-${selectedSize}` : ''),
      productId: product.id,
      variantId: selectedVariant?.id || null,
      quantity: quantity,
      name: product.name,
      color: selectedColor || null,
      size: selectedSize || null,
      price: finalPrice,
      image: product.product_images?.find((img: any) => img.is_primary)?.url || product.product_images?.[0]?.url || '/placeholder.png'
    })
    
    // Open cart drawer immediately
    openCart()
  }

  // Predefined color hex mapping for common colors
  const getColorHex = (colorName: string) => {
    const map: Record<string, string> = {
      'red': '#ef4444', 'blue': '#3b82f6', 'green': '#22c55e', 
      'black': '#000000', 'white': '#ffffff', 'yellow': '#eab308',
      'royal blue': '#4169e1', 'gold': '#ffd700', 'silver': '#c0c0c0',
      'pink': '#ec4899', 'purple': '#a855f7', 'orange': '#f97316',
      'gray': '#6b7280', 'grey': '#6b7280', 'brown': '#8b4513'
    }
    return map[colorName.toLowerCase()] || '#e5e7eb' // Default gray
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {uniqueColors.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Select Color <span className="text-gray-500 font-normal ml-2">{selectedColor}</span></h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {uniqueColors.map((color: any) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                title={color}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  selectedColor === color 
                    ? 'ring-2 ring-offset-2 ring-[#FF7A00] scale-110 shadow-md' 
                    : 'ring-1 ring-gray-200 hover:ring-[#FF7A00] hover:scale-105'
                }`}
              >
                <span 
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-100 shadow-inner"
                  style={{ backgroundColor: getColorHex(color) }}
                ></span>
              </button>
            ))}
          </div>
        </div>
      )}

      {hasSizes && (
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Select Size</h3>
            <button type="button" className="text-xs font-bold text-gray-400 underline uppercase tracking-widest hover:text-[#FF7A00] transition-colors">Size Guide</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.product_size_guides.map((g: any) => (
              <button
                key={g.id}
                onClick={() => setSelectedSize(g.size_name)}
                className={`min-w-[3.25rem] px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${
                  selectedSize === g.size_name 
                    ? 'border-[#FF7A00] bg-[#FF7A00] text-white shadow-md' 
                    : 'border border-gray-200 bg-white text-gray-900 hover:border-[#FF7A00] hover:text-[#FF7A00]'
                }`}
              >
                {g.size_name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="fixed lg:static bottom-0 inset-x-0 bg-white/95 backdrop-blur-md lg:bg-transparent px-3 py-2.5 sm:p-4 lg:p-0 border-t lg:border-none border-gray-200/80 z-40 lg:z-auto shadow-[0_-10px_30px_rgba(0,0,0,0.06)] lg:shadow-none flex flex-row items-center gap-2 sm:gap-3 lg:pt-2 w-full pb-[max(0.625rem,env(safe-area-inset-bottom))]">
        {!product.is_enquiry_only && (
          <>
            {/* Quantity Selector */}
            <div className="flex items-center justify-between rounded-full border border-gray-200 h-11 sm:h-12 w-20 sm:w-28 bg-gray-50 px-1 shrink-0">
              <button 
                type="button" 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={outOfStock || quantity <= 1}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex justify-center items-center text-gray-500 hover:text-[#FF7A00] hover:bg-white disabled:opacity-30 transition-colors text-sm sm:text-base font-bold"
              >
                -
              </button>
              <span className="text-xs sm:text-sm font-bold text-gray-900 w-4 sm:w-6 text-center">{quantity}</span>
              <button 
                type="button" 
                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                disabled={outOfStock || quantity >= currentStock}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex justify-center items-center text-gray-500 hover:text-[#FF7A00] hover:bg-white disabled:opacity-30 transition-colors text-sm sm:text-base font-bold"
              >
                +
              </button>
            </div>

            {/* Wishlist Button */}
            <button 
              type="button"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border border-gray-200 hover:border-[#FF7A00] hover:text-[#FF7A00] hover:bg-[#FF7A00]/5 transition-colors bg-white text-gray-500 shadow-xs shrink-0"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
              <span className="sr-only">Add to Wishlist</span>
            </button>
          </>
        )}

        {/* Action Button */}
        {product.is_enquiry_only ? (
          <Link
            href={`/product/${product.slug}/enquiry`}
            className="flex-1 rounded-full bg-[#1C1C1C] text-white h-11 sm:h-12 flex items-center justify-center text-[11px] sm:text-xs font-black uppercase tracking-wider hover:bg-[#D4AF37] hover:text-[#1C1C1C] transition-colors duration-300 shadow-sm px-3 whitespace-nowrap"
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 shrink-0" />
            <span>Enquire Now</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="flex-1 rounded-full bg-[#1C1C1C] text-white h-11 sm:h-12 flex items-center justify-center text-[11px] sm:text-xs font-black uppercase tracking-wider hover:bg-[#FF7A00] transition-colors duration-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm px-3 whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 shrink-0" />
            <span>{outOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        )}
      </div>

      {outOfStock && !product.is_enquiry_only && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-700">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0"></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Currently Out of Stock</p>
            <p className="text-[11px] font-medium text-red-600 mt-0.5">This item is temporarily unavailable for purchase.</p>
          </div>
        </div>
      )}

      {!outOfStock && currentStock > 0 && currentStock <= 5 && (
        <p className="text-xs text-red-500 font-bold tracking-widest uppercase flex items-center justify-center sm:justify-start gap-2 pt-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Only {currentStock} pieces remaining
        </p>
      )}
    </div>
  )
}
