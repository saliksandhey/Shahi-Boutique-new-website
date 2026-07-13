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
  const outOfStock = currentStock <= 0
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
    <div className="space-y-8">
      {uniqueColors.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Select Color <span className="text-gray-500 font-normal ml-2">{selectedColor}</span></h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {uniqueColors.map((color: any) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                title={color}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  selectedColor === color 
                    ? 'ring-2 ring-offset-2 ring-[#FF7A00] scale-110 shadow-md' 
                    : 'ring-1 ring-gray-200 hover:ring-[#FF7A00] hover:scale-105'
                }`}
              >
                <span 
                  className="w-8 h-8 rounded-full border border-gray-100 shadow-inner"
                  style={{ backgroundColor: getColorHex(color) }}
                ></span>
              </button>
            ))}
          </div>
        </div>
      )}

      {hasSizes && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Select Size</h3>
            <button type="button" className="text-xs font-bold text-gray-400 underline uppercase tracking-widest hover:text-[#FF7A00] transition-colors">Size Guide</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {product.product_size_guides.map((g: any) => (
              <button
                key={g.id}
                onClick={() => setSelectedSize(g.size_name)}
                className={`min-w-[3.5rem] px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${
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

      <div className="fixed lg:static bottom-0 inset-x-0 bg-white lg:bg-transparent p-3 sm:p-6 lg:p-0 border-t lg:border-none border-gray-200 z-50 lg:z-auto shadow-[0_-10px_40px_rgba(0,0,0,0.08)] lg:shadow-none flex flex-row items-center gap-2 sm:gap-3 lg:pt-4 w-full">
        {!product.is_enquiry_only && (
          <div className="flex shrink-0 gap-2 sm:gap-3">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between rounded-full border border-gray-200 h-12 sm:h-14 w-[100px] sm:w-36 bg-gray-50 px-1 sm:px-2">
              <button 
                type="button" 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex justify-center items-center text-gray-500 hover:text-[#FF7A00] hover:bg-white transition-colors text-lg sm:text-xl shadow-sm border border-transparent hover:border-gray-100"
              >
                -
              </button>
              <span className="text-xs sm:text-sm font-bold text-gray-900 w-6 sm:w-8 text-center">{quantity}</span>
              <button 
                type="button" 
                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                disabled={outOfStock || quantity >= currentStock}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex justify-center items-center text-gray-500 hover:text-[#FF7A00] hover:bg-white disabled:opacity-30 transition-colors text-lg sm:text-xl shadow-sm border border-transparent hover:border-gray-100"
              >
                +
              </button>
            </div>

            {/* Wishlist Button */}
            <button className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border border-gray-200 hover:border-[#FF7A00] hover:text-[#FF7A00] hover:bg-[#FF7A00]/5 transition-colors bg-white text-gray-500 shadow-sm">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
              <span className="sr-only">Add to Wishlist</span>
            </button>
          </div>
        )}

        {/* Action Button */}
        {product.is_enquiry_only ? (
          <Link
            href={`/product/${product.slug}/enquiry`}
            className="flex-1 rounded-full bg-[#1C1C1C] text-white h-12 sm:h-14 flex items-center justify-center text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#1C1C1C] transition-colors duration-300 shadow-sm px-2"
          >
            <MessageSquare className="w-4 h-4 sm:mr-3 mr-2 shrink-0" />
            <span className="truncate">Enquire Now</span>
          </Link>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="flex-1 rounded-full bg-[#1C1C1C] text-white h-12 sm:h-14 flex items-center justify-center text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-[#FF7A00] transition-colors duration-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm px-2"
          >
            <ShoppingBag className="w-4 h-4 sm:mr-3 mr-2 shrink-0" />
            <span className="truncate">{outOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        )}
      </div>

      {currentStock > 0 && currentStock <= 5 && (
        <p className="text-xs text-red-500 font-bold tracking-widest uppercase flex items-center justify-center sm:justify-start gap-2 pt-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Only {currentStock} pieces remaining
        </p>
      )}
    </div>
  )
}
