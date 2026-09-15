import { getProductGroup, getAllProductsForPicker } from '@/lib/actions/product-groups'
import { ProductGroupForm } from '@/components/admin/ProductGroupForm'
import { notFound } from 'next/navigation'

export default async function EditProductGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [group, allProducts] = await Promise.all([
    getProductGroup(id),
    getAllProductsForPicker(),
  ])

  if (!group) notFound()

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-2xl md:text-4xl font-heading font-black tracking-widest text-gray-900 uppercase">Edit Group</h1>
        <p className="mt-1 text-xs text-gray-500 font-bold uppercase tracking-widest">Update color variants for this group.</p>
      </div>
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
        <ProductGroupForm allProducts={allProducts as any} group={group as any} />
      </div>
    </div>
  )
}
