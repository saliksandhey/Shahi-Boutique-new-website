import { PriceDisplay } from '@/components/storefront/PriceDisplay';
import { createPublicClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductGallery } from '@/components/storefront/ProductGallery'
import { AddToCart } from '@/components/storefront/AddToCart'
import { DeliveryChecker } from '@/components/storefront/DeliveryChecker'
import { ProductGrid } from '@/components/storefront/ProductGrid'
import { ProductReviewsSection } from '@/components/storefront/ProductReviewsSection'
import { PotliShowcase } from '@/components/storefront/PotliShowcase'
import { ColorGroupVariants } from '@/components/storefront/ColorGroupVariants'
import { ProductRichDetails } from '@/components/storefront/ProductRichDetails'
import { getColorSiblings } from '@/lib/actions/product-groups'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { slug } = await params
  const supabase = createPublicClient()
  const { data: product } = await supabase.from('products').select('name, description, meta_title, meta_description, keywords, canonical_url, og_image').eq('slug', slug).single()
  
  if (!product) return {}

  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.description?.substring(0, 160) || `Buy ${product.name} at our Boutique.`,
    keywords: product.keywords,
    alternates: {
      canonical: product.canonical_url,
    },
    openGraph: {
      title: product.meta_title || product.name,
      description: product.meta_description || product.description?.substring(0, 160),
      images: product.og_image ? [{ url: product.og_image }] : [],
    }
  }
}

export const revalidate = 60

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createPublicClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, product_images(*), categories(name, slug), product_size_guides(*)')
    .eq('slug', slug)
    .single()

  if (!product || product.status === 'DRAFT' || product.status === 'ARCHIVED') {
    notFound()
  }

  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', product.id)

  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*, product_images(url, is_primary)')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .in('status', ['ACTIVE', 'OUT_OF_STOCK'])
    .limit(4)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(full_name)')
    .eq('product_id', product.id)
    .eq('approved', true)
    .order('created_at', { ascending: false })

  // Color group siblings (other products in same group, excluding current)
  const colorSiblings = await getColorSiblings(product.id)

  // Sort images safely by position
  const sortedImages = (product.product_images || []).sort((a: any, b: any) => (a.position || 0) - (b.position || 0))

  const isOutOfStock = product.status === 'OUT_OF_STOCK' || (typeof product.stock === 'number' && product.stock <= 0 && !product.is_enquiry_only)

  return (
    <div className="bg-white pt-4 sm:pt-6 md:pt-8 pb-16 sm:pb-24">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10">
        
        <nav className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 sm:mb-6 pb-1 sm:pb-0">
          <ol className="flex items-center flex-wrap gap-y-1">
            <li><a href="/" className="hover:text-[#FF7A00] transition-colors">Home</a></li>
            <li><span className="mx-2 text-gray-300">/</span></li>
            <li><a href="/shop" className="hover:text-[#FF7A00] transition-colors">Shop</a></li>
            {product.categories && (
              <>
                <li><span className="mx-2 text-gray-300">/</span></li>
                <li><a href={`/category/${product.categories.slug}`} className="hover:text-[#FF7A00] transition-colors">{product.categories.name}</a></li>
              </>
            )}
            <li><span className="mx-2 text-gray-300">/</span></li>
            <li className="text-gray-900 line-clamp-1 break-all sm:break-normal">{product.name}</li>
          </ol>
        </nav>

        {/* 2-Column Product Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-6 lg:gap-8 xl:gap-10">
          
          {/* Left Column: Image Gallery (Anchored with self-start, sticky, and z-30 for zoom flyout) */}
          <div className="lg:col-span-6 xl:col-span-6 self-start lg:sticky lg:top-24 relative z-30">
            <ProductGallery images={sortedImages} />
          </div>

          {/* Right Column: Product info & Actions */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-4 sm:space-y-4.5">
            {/* Product JSON-LD Schema — for Google Shopping & Rich Results */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Product",
                  "name": product.name,
                  "image": sortedImages.map((img: any) => img.url),
                  "description": product.meta_description || product.description?.substring(0, 5000) || `Buy ${product.name} at Shahi Boutique`,
                  "sku": product.sku || product.id,
                  "brand": { "@type": "Brand", "name": "Shahi Boutique" },
                  "seller": { "@type": "Organization", "name": "Shahi Boutique", "url": process.env.NEXT_PUBLIC_SITE_URL },
                  ...(product.material ? { "material": product.material } : {}),
                  ...(product.categories ? { "category": product.categories.name } : {}),
                  "offers": {
                    "@type": "Offer",
                    "url": `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`,
                    "priceCurrency": "INR",
                    "price": product.sale_price || product.price,
                    ...(product.sale_price ? {
                      "priceSpecification": [
                        { "@type": "PriceSpecification", "price": product.sale_price, "priceCurrency": "INR" },
                        { "@type": "PriceSpecification", "price": product.price, "priceCurrency": "INR", "priceType": "https://schema.org/ListPrice" }
                      ]
                    } : {}),
                    "itemCondition": "https://schema.org/NewCondition",
                    "availability": isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
                    "seller": { "@type": "Organization", "name": "Shahi Boutique" },
                    "shippingDetails": {
                      "@type": "OfferShippingDetails",
                      "shippingRate": { "@type": "MonetaryAmount", "value": 0, "currency": "INR" },
                      "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "IN" },
                      "deliveryTime": {
                        "@type": "ShippingDeliveryTime",
                        "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY" },
                        "transitTime": { "@type": "QuantitativeValue", "minValue": 3, "maxValue": 7, "unitCode": "DAY" }
                      }
                    },
                    "hasMerchantReturnPolicy": {
                      "@type": "MerchantReturnPolicy",
                      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                      "merchantReturnDays": 7,
                      "returnMethod": "https://schema.org/ReturnByMail",
                      "returnFees": "https://schema.org/FreeReturn"
                    }
                  },
                  ...(reviews && reviews.length > 0 ? {
                    "aggregateRating": {
                      "@type": "AggregateRating",
                      "ratingValue": (reviews.reduce((sum: number, r: any) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1),
                      "reviewCount": reviews.length,
                      "bestRating": 5,
                      "worstRating": 1
                    },
                    "review": reviews.slice(0, 5).map((r: any) => ({
                      "@type": "Review",
                      "reviewRating": { "@type": "Rating", "ratingValue": r.rating || 5, "bestRating": 5 },
                      "author": { "@type": "Person", "name": r.profiles?.full_name || "Verified Buyer" },
                      "reviewBody": r.comment || ""
                    }))
                  } : {})
                })
              }}
            />
            
            {/* Header: Category, SKU & Out of Stock */}
            <div className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span className="text-[#FF7A00] font-black">{product.categories?.name || 'Exclusive Collection'}</span>
              <div className="flex items-center gap-3">
                {product.sku && <span>SKU: {product.sku}</span>}
                {isOutOfStock && (
                  <span className="bg-red-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-black tracking-tight text-gray-900 uppercase leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Artisan & Craft Badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
              {(product.craft || product.attributes?.craft) && (
                <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-[#1C1C1C] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  ✨ {product.craft || product.attributes?.craft}
                </span>
              )}
              {(product.product_type || product.attributes?.product_type) && (
                <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-orange-50 text-[#FF7A00] border border-orange-200/60 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                  👜 {product.product_type || product.attributes?.product_type}
                </span>
              )}
              {(product.occasion || product.attributes?.occasion) && (
                <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                  🎉 {product.occasion || product.attributes?.occasion}
                </span>
              )}
              {(product.color || product.attributes?.color) && (
                <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-800 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                  🎨 {product.color || product.attributes?.color}
                </span>
              )}
            </div>

            {/* Pricing Section with Real-Time Discount & Savings */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F9FA] border border-gray-100">
              <div className="flex items-baseline flex-wrap gap-2 sm:gap-3">
                {product.is_enquiry_only ? (
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Starting from</span>
                    <p className="text-2xl sm:text-3xl font-black text-gray-900"><PriceDisplay amount={product.price} /></p>
                  </div>
                ) : product.sale_price && Number(product.sale_price) < Number(product.price) ? (
                  <>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1C1C1C]">
                      <PriceDisplay amount={product.sale_price} />
                    </p>
                    <p className="text-base sm:text-lg font-bold text-gray-400 line-through decoration-2">
                      <PriceDisplay amount={product.price} />
                    </p>
                    <span className="bg-[#FF7A00] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs">
                      {Math.round(((Number(product.price) - Number(product.sale_price)) / Number(product.price)) * 100)}% OFF
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                      Save ₹{(Number(product.price) - Number(product.sale_price)).toLocaleString('en-IN')}
                    </span>
                  </>
                ) : (
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900">
                    <PriceDisplay amount={product.price} />
                  </p>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] font-medium text-gray-400 block mt-1.5 sm:mt-2">
                Inclusive of all taxes • Free standard delivery on prepaid orders across India
              </span>
            </div>

            {/* Short Description */}
            {(product.short_description || product.description) && (
              <div className="text-sm text-gray-600 leading-relaxed font-normal">
                {product.short_description || (
                  <p className="line-clamp-3">{product.description}</p>
                )}
              </div>
            )}

            {/* Actions: Variants & Add to Cart */}
            <div className="space-y-4">
              <ColorGroupVariants siblings={colorSiblings as any} />
              <AddToCart product={product} variants={variants || []} />
            </div>

            {/* Delivery Pincode Checker */}
            <DeliveryChecker />

            {/* Rich Specifications, Shipping, Returns & Care Details */}
            <ProductRichDetails product={product} />

            {/* Size Guide Table (if sizes defined) */}
            {product.product_size_guides && product.product_size_guides.length > 0 && (
              <div className="mt-6 bg-[#F8F9FA] rounded-2xl p-4 sm:p-6 border border-gray-100">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Size Specifications</h3>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white text-gray-900 uppercase text-[10px] font-bold tracking-widest border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3">Size</th>
                        <th className="px-4 py-3">Chest</th>
                        <th className="px-4 py-3">Length</th>
                        <th className="px-4 py-3">Shoulder</th>
                        <th className="px-4 py-3">Sleeve</th>
                        <th className="px-4 py-3">Waist</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-medium text-gray-500 divide-y divide-gray-200">
                      {product.product_size_guides.map((g: any, idx: number) => (
                        <tr key={idx} className="bg-white hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-bold text-gray-900 uppercase">{g.size_name}</td>
                          <td className="px-4 py-3">{g.chest || '-'}</td>
                          <td className="px-4 py-3">{g.length || '-'}</td>
                          <td className="px-4 py-3">{g.shoulder || '-'}</td>
                          <td className="px-4 py-3">{g.sleeve || '-'}</td>
                          <td className="px-4 py-3">{g.waist || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Full-Width Sections Below Main Grid */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-sans font-black uppercase tracking-tight text-gray-900 mb-6 md:mb-8">
              You May Also Like
            </h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
        
        {/* Patron Reviews Section */}
        <ProductReviewsSection product={product} initialReviews={reviews || []} />

      </div>
    </div>
  )
}
