import { createPublicClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/storefront/ProductGrid'
import { FilterSidebar } from '@/components/storefront/FilterSidebar'
import { SortSelect } from '@/components/storefront/SortSelect'
import { Pagination } from '@/components/storefront/Pagination'
import { notFound } from 'next/navigation'

import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params
  const supabase = createPublicClient()
  
  const { data: category } = await supabase.from('categories').select('*').eq('slug', slug).single()
  
  if (!category) return {}

  const description = category.description?.substring(0, 160) || `Shop the latest ${category.name} collection at Shahi Boutique.`

  return {
    title: `${category.name} Collection`,
    description: description,
    openGraph: {
      title: `${category.name} | Shahi Boutique`,
      description: description,
      url: `/category/${category.slug}`,
    }
  }
}

export const revalidate = 60

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { slug } = await params;
  const sParams = await searchParams;
  const supabase = createPublicClient()

  const { data: category } = await supabase.from('categories').select('*').eq('slug', slug).single()

  if (!category) {
    notFound()
  }

  const sort = typeof sParams.sort === 'string' ? sParams.sort : 'newest'
  const page = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1
  const limit = 12
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase.from('products')
    .select('*, product_images(url, is_primary), categories(name)', { count: 'exact' })
    .eq('status', 'ACTIVE')
    .eq('category_id', category.id)

  if (sort === 'price-asc') {
    query = query.order('price', { ascending: true })
  } else if (sort === 'price-desc') {
    query = query.order('price', { ascending: false })
  } else if (sort === 'featured') {
    query = query.eq('is_featured', true).order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  if (sParams.min_price) query = query.gte('price', parseFloat(sParams.min_price as string))
  if (sParams.max_price) query = query.lte('price', parseFloat(sParams.max_price as string))

  query = query.range(from, to)

  const { data: products, count } = await query
  const totalPages = count ? Math.ceil(count / limit) : 0

  return (
    <div className="bg-white min-h-screen pb-32 pt-24">
      
      {/* Category Banner */}
      <div className="bg-[#F8F9FA] py-24 px-6 sm:px-8 lg:px-12 text-center rounded-[3rem] mx-4 sm:mx-6 lg:mx-8 mb-16 shadow-sm border border-gray-100">
        <span className="text-xs font-bold text-[#FF7A00] uppercase tracking-[0.2em] mb-4 block">
          Category
        </span>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-sans font-black tracking-tighter text-gray-900 uppercase mb-6 leading-none">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-6 text-gray-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-12">
          <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Showing {products?.length || 0} {products?.length === 1 ? 'Result' : 'Results'}
          </p>
          <div className="flex items-center">
            <SortSelect currentSort={sort} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="w-full lg:w-72 flex-shrink-0">
            <FilterSidebar />
          </div>
          <div className="flex-1 min-h-[50vh]">
            <ProductGrid products={products || []} />
            {totalPages > 1 && (
              <div className="mt-20 pt-10 border-t border-gray-200">
                <Pagination currentPage={page} totalPages={totalPages} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
