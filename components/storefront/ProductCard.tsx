'use client'
import { PriceDisplay } from '@/components/storefront/PriceDisplay';

import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, MessageCircle } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useRouter } from 'next/navigation'

export function ProductCard({ product, variant = 'vertical' }: { product: any, variant?: 'vertical' | 'horizontal' }) {
  const router = useRouter()
  const { addItem, openCart } = useCartStore()
  
  const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.url || product.product_images?.[0]?.url || '/placeholder.png'
  const secondaryImage = product.product_images?.find((img: any) => img.url !== primaryImage)?.url || primaryImage

  return (
    <Link href={`/product/${product.slug}`} className={`group flex flex-col h-full bg-white transition-all duration-300 ${variant === 'horizontal' ? 'flex-row gap-4' : ''}`}>
      {/* Image Container */}
      <div className={`relative aspect-[4/5] w-full overflow-hidden rounded-xl sm:rounded-2xl mb-3 sm:mb-4 bg-gray-50 border border-gray-100 ${variant === 'horizontal' ? 'w-[40%] mb-0 shrink-0' : ''}`}>
        {primaryImage !== '/placeholder.png' ? (
          <>
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover object-center transition-opacity duration-700 ease-in-out group-hover:opacity-0"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            />
            {/* Secondary image on hover */}
            <Image
              src={secondaryImage}
              alt={product.name}
              fill
              className="object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
             <span className="font-sans font-bold text-gray-400 text-sm tracking-widest uppercase">No Image</span>
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 flex justify-between items-start z-10 pointer-events-none">
          {/* Left Badge */}
          <div>
            {product.sale_price ? (
              <span className="bg-[#6B46C1] text-white text-[8px] sm:text-[10px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wider">
                Sale
              </span>
            ) : product.is_enquiry_only ? (
               <span className="bg-black text-white text-[8px] sm:text-[10px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wider">
                Pre-Order
              </span>
            ) : null}
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 md:translate-y-4 md:group-hover:translate-y-0">
           <button 
             onClick={(e) => {
               e.preventDefault();
               if (product.is_enquiry_only) {
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
                 openCart()
               }
             }}
             className="bg-white text-gray-900 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:scale-110 transition-transform"
             title={product.is_enquiry_only ? "Enquire Now" : "Add to Cart"}
           >
             {product.is_enquiry_only ? (
               <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
             ) : (
               <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
             )}
           </button>
        </div>
      </div>

      {/* Content */}
      <div className={`px-1 text-center flex flex-col flex-1 ${variant === 'horizontal' ? 'justify-center text-left px-4' : ''}`}>
        
        {/* Title */}
        <h3 className={`text-[12px] sm:text-[14px] font-semibold text-gray-900 leading-snug mb-1.5 sm:mb-2 line-clamp-2 ${variant === 'horizontal' ? 'text-[14px] sm:text-[16px]' : ''}`}>
          {product.name}
        </h3>
        
        <div className="mt-auto">
          {/* Price */}
          <div className="mb-1">
            {product.is_enquiry_only ? (
              <span className="text-[13px] sm:text-[15px] font-black text-[#FF7A00]">
                Starting from <PriceDisplay amount={product.price} />
              </span>
            ) : product.sale_price ? (
              <div className={`flex flex-wrap items-center justify-center gap-x-2 ${variant === 'horizontal' ? 'justify-start' : ''}`}>
                <span className="text-[13px] sm:text-[15px] font-black text-[#FF7A00]"><PriceDisplay amount={product.sale_price} /></span>
                <span className="text-[11px] sm:text-[12px] font-medium text-gray-400 line-through"><PriceDisplay amount={product.price} /></span>
              </div>
            ) : (
              <span className="text-[13px] sm:text-[15px] font-black text-[#FF7A00]"><PriceDisplay amount={product.price} /></span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
