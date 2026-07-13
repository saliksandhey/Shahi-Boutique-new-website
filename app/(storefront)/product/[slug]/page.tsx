import { createPublicClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductGallery } from '@/components/storefront/ProductGallery'
import { AddToCart } from '@/components/storefront/AddToCart'
import { ProductGrid } from '@/components/storefront/ProductGrid'
import { ReviewCarousel } from '@/components/storefront/ReviewCarousel'
import { PotliShowcase } from '@/components/storefront/PotliShowcase'
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

  if (!product || product.status !== 'ACTIVE') {
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
    .eq('status', 'ACTIVE')
    .limit(4)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(full_name)')
    .eq('product_id', product.id)
    .eq('approved', true)
    .order('created_at', { ascending: false })

  // Sort images safely by position
  const sortedImages = (product.product_images || []).sort((a: any, b: any) => (a.position || 0) - (b.position || 0))

  return (
    <div className="bg-white pt-16 md:pt-24 pb-40 md:pb-32">
      <div className="mx-auto max-w-[1400px] px-0 lg:px-12">
        
        <nav className="px-6 sm:px-8 lg:px-0 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 md:mb-12 pb-2 sm:pb-0">
          <ol className="flex items-center flex-wrap gap-y-2">
            <li><a href="/" className="hover:text-[#FF7A00] transition-colors">Home</a></li>
            <li><span className="mx-2">/</span></li>
            <li><a href="/shop" className="hover:text-[#FF7A00] transition-colors">Shop</a></li>
            {product.categories && (
              <>
                <li><span className="mx-2">/</span></li>
                <li><a href={`/category/${product.categories.slug}`} className="hover:text-[#FF7A00] transition-colors">{product.categories.name}</a></li>
              </>
            )}
            <li><span className="mx-2">/</span></li>
            <li className="text-gray-900 line-clamp-1 break-all sm:break-normal">{product.name}</li>
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-16 xl:gap-x-24">
          
          {/* Image Gallery */}
          <div className="flex flex-col-reverse lg:sticky lg:top-32">
            <ProductGallery images={sortedImages} />
          </div>

          {/* Product info */}
          <div className="mt-6 md:mt-12 lg:mt-0 px-6 sm:px-8 lg:px-0">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-sans font-black tracking-tighter text-gray-900 uppercase mb-3 md:mb-4 leading-none">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-8">
              {product.is_enquiry_only ? (
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Starting from</span>
                  <p className="text-3xl font-black text-gray-900">₹{product.price.toFixed(2)}</p>
                </div>
              ) : product.sale_price ? (
                <>
                  <p className="text-3xl font-black text-[#FF7A00]">₹{product.sale_price.toFixed(2)}</p>
                  <p className="text-xl font-bold text-gray-400 line-through decoration-2">₹{product.price.toFixed(2)}</p>
                </>
              ) : (
                <p className="text-3xl font-black text-gray-900">₹{product.price.toFixed(2)}</p>
              )}
            </div>

            <div className="mb-8 md:mb-10">
              <h3 className="sr-only">Description</h3>
              <div className="text-sm md:text-base text-gray-500 leading-relaxed font-medium whitespace-pre-wrap">
                {product.description}
              </div>
            </div>

            <div className="py-8">
              <AddToCart product={product} variants={variants || []} />
            </div>

            <div className="mt-8 md:mt-12 bg-[#F8F9FA] rounded-[2rem] p-6 md:p-8 border border-gray-100">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6">Details & Care</h3>
              <ul className="text-sm text-gray-500 space-y-4 font-medium grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <li><span className="font-bold text-gray-400 block uppercase tracking-widest text-[10px] mb-1">Category</span> {product.categories?.name || 'Uncategorized'}</li>
                {product.sku && <li><span className="font-bold text-gray-400 block uppercase tracking-widest text-[10px] mb-1">SKU</span> {product.sku}</li>}
                {product.fabric && <li><span className="font-bold text-gray-400 block uppercase tracking-widest text-[10px] mb-1">Fabric</span> {product.fabric}</li>}
                {product.material && <li><span className="font-bold text-gray-400 block uppercase tracking-widest text-[10px] mb-1">Material</span> {product.material}</li>}
                {product.country_of_origin && <li><span className="font-bold text-gray-400 block uppercase tracking-widest text-[10px] mb-1">Origin</span> {product.country_of_origin}</li>}
                {product.weight && <li><span className="font-bold text-gray-400 block uppercase tracking-widest text-[10px] mb-1">Weight</span> {product.weight}g</li>}
                {product.dimensions && <li className="sm:col-span-2"><span className="font-bold text-gray-400 block uppercase tracking-widest text-[10px] mb-1">Dimensions</span> {product.dimensions}</li>}
                {product.care_instructions && <li className="sm:col-span-2"><span className="font-bold text-gray-400 block uppercase tracking-widest text-[10px] mb-1">Care Instructions</span> {product.care_instructions}</li>}
              </ul>
            </div>
            
            {product.product_size_guides && product.product_size_guides.length > 0 && (
              <div className="mt-6 md:mt-8 bg-[#F8F9FA] rounded-[2rem] p-6 md:p-8 border border-gray-100">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6">Size Specifications</h3>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white text-gray-900 uppercase text-[10px] font-bold tracking-widest border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4">Size</th>
                        <th className="px-6 py-4">Chest</th>
                        <th className="px-6 py-4">Length</th>
                        <th className="px-6 py-4">Shoulder</th>
                        <th className="px-6 py-4">Sleeve</th>
                        <th className="px-6 py-4">Waist</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-medium text-gray-500 divide-y divide-gray-200">
                      {product.product_size_guides.map((g: any, idx: number) => (
                        <tr key={idx} className="bg-white hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900 uppercase">{g.size_name}</td>
                          <td className="px-6 py-4">{g.chest || '-'}</td>
                          <td className="px-6 py-4">{g.length || '-'}</td>
                          <td className="px-6 py-4">{g.shoulder || '-'}</td>
                          <td className="px-6 py-4">{g.sleeve || '-'}</td>
                          <td className="px-6 py-4">{g.waist || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <div className="mt-24 md:mt-32 pt-12 md:pt-16 px-6 sm:px-8 lg:px-0">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-sans font-black tracking-tighter text-gray-900 uppercase mb-4 leading-none">
                CLIENT REVIEWS
              </h2>
            </div>
            <ReviewCarousel reviews={reviews} />
          </div>
        )}

        {/* Potli Showcase for Potli category products */}
        {product.categories?.slug === 'potli' && (
          <div className="mt-16 md:mt-24 pt-12 md:pt-16 border-t border-gray-100">
            <PotliShowcase hideHeader={true} />
          </div>
        )}

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-24 md:mt-32 pt-12 md:pt-16 border-t border-gray-100 px-6 sm:px-8 lg:px-0">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-sans font-black tracking-tighter text-gray-900 uppercase mb-4 leading-none">
                YOU MAY ALSO LIKE
              </h2>
            </div>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  )
}
