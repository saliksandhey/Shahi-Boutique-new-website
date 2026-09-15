import Image from 'next/image'
import Link from 'next/link'
import { PriceDisplay } from '@/components/storefront/PriceDisplay'

interface Sibling {
  color_name: string
  products: {
    id: string
    name: string
    slug: string
    price: number
    price_inr: number | null
    sale_price: number | null
    sale_price_inr: number | null
    product_images: { url: string; is_primary: boolean; position: number }[]
  }
}

export function ColorGroupVariants({ siblings }: { siblings: Sibling[] }) {
  if (!siblings || siblings.length === 0) return null

  function getPrimaryImage(product: Sibling['products']) {
    const sorted = [...(product.product_images || [])].sort((a, b) => (a.position || 0) - (b.position || 0))
    return sorted.find(i => i.is_primary)?.url || sorted[0]?.url || ''
  }

  function getPrice(product: Sibling['products']) {
    return product.sale_price_inr || product.sale_price || product.price_inr || product.price || 0
  }

  return (
    <div className="mb-8">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
        More Colours
      </p>
      <div className="flex gap-3 flex-wrap">
        {siblings.map((sibling) => {
          const img = getPrimaryImage(sibling.products)
          const price = getPrice(sibling.products)

          return (
            <Link
              key={sibling.products.id}
              href={`/product/${sibling.products.slug}`}
              className="group flex flex-col items-center gap-1.5 cursor-pointer"
            >
              {/* Product Image Card */}
              <div className="relative w-[72px] h-[72px] rounded-2xl overflow-hidden border-2 border-gray-100 group-hover:border-[#FF7A00] transition-all duration-200 bg-gray-50 shadow-sm">
                {img ? (
                  <Image
                    src={img}
                    alt={sibling.color_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="72px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              {/* Color Name */}
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 group-hover:text-[#FF7A00] transition-colors text-center max-w-[72px] leading-tight">
                {sibling.color_name}
              </span>
              {/* Price */}
              <span className="text-[10px] font-bold text-gray-400">
                <PriceDisplay amount={price} />
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
