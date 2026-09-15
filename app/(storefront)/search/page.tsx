import { createPublicClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/storefront/ProductGrid'
import { SearchBar } from '@/components/storefront/SearchBar'

export const revalidate = 60

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const params = await searchParams;
  const q = params.q || ''
  const supabase = createPublicClient()

  let products: any[] = []
  
  if (q) {
    const { data } = await supabase
      .from('products')
      .select('*, product_images(url, is_primary)')
      .in('status', ['ACTIVE', 'OUT_OF_STOCK'])
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,slug.ilike.%${q}%`)
      .limit(40)
    
    if (data) products = data
  }

  return (
    <div className="bg-white min-h-[70vh] py-24">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <div className="bg-[#F8F9FA] py-24 px-6 sm:px-8 lg:px-12 text-center rounded-[3rem] shadow-sm border border-gray-100 mb-16">
          <span className="text-xs font-bold text-[#FF7A00] uppercase tracking-[0.2em] mb-4 block">
            Explore
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-sans font-black tracking-tighter text-gray-900 uppercase mb-10 leading-none">
            SEARCH
          </h1>
          <div className="max-w-2xl mx-auto">
            <SearchBar initialQuery={q} />
          </div>
        </div>
        
        {q && (
          <div className="mt-12">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-12 text-center border-b border-gray-200 pb-6">
              {products.length} {products.length === 1 ? 'Result' : 'Results'} for "{q}"
            </h2>
            <ProductGrid products={products} />
          </div>
        )}
      </div>
    </div>
  )
}
